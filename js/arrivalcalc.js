// 1️⃣ Язык по умолчанию
// при загрузке страницы
// Используем window.lang из lang.js

// Функция для обновления расчетов при смене языка
function updateArrivalCalculations() {
  const startKm = parseFloat(document.getElementById("startKmArrival").value);
  const endKm = parseFloat(document.getElementById("endKmArrival").value);
  if (!isNaN(startKm) && !isNaN(endKm)) {
    calculateArrival(); // ✅ пересчёт после смены языка
  }
}


// 2️⃣ Функции перевода (удалены - теперь используются из lang.js)


function pluralizeHours(n) {
  const t = window.translations[window.lang || 'ru'] || {};
  n = Math.abs(n);
  
  if (window.lang === 'en') {
    return n === 1 ? t.hour || 'hour' : t.hours || 'hours';
  }
  
  // Для русского языка правильное склонение
  const integerPart = Math.floor(n);
  const decimalPart = n - integerPart;
  
  if (decimalPart > 0) {
    // Для дробных чисел используем специальные правила
    if (integerPart === 1) return t.hours || 'часа';  // 1.5 часа
    if (integerPart === 2) return t.hours || 'часа';  // 2.5 часа
    if (integerPart === 3) return t.hours || 'часа';  // 3.5 часа
    if (integerPart === 4) return t.hours || 'часа';  // 4.5 часа
    return t.hoursMany || 'часов';  // 5.5 часов, 6.5 часов и т.д.
  } else {
    // Для целых чисел обычная логика
    if (n % 10 === 1 && n % 100 !== 11) return t.hour || 'час';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return t.hours || 'часа';
    return t.hoursMany || 'часов';
  }
}

const locks = [
  { nameKey: "lockGabchikovo", km: [1818, 1819], delay: 1 },
  { nameKey: "lockIronGates2", km: [863, 864], delay: 1 },
  { nameKey: "lockIronGates1", km: [943, 944], delay: 2.5 },
  { nameKey: "lockFreudenau", km: [1919, 1920], delay: 1.5 },
  { nameKey: "lockGreifenstein", km: [1948, 1949], delay: 1 },
  { nameKey: "lockAltenworth", km: [1980, 1981], delay: 1 },
  { nameKey: "lockMelk", km: [2038, 2039], delay: 1 },
  { nameKey: "lockIbb", km: [2060, 2061], delay: 1 },
  { nameKey: "lockWallsee", km: [2095, 2096], delay: 1 },
  { nameKey: "lockAbwinden", km: [2119, 2120], delay: 1 },
  { nameKey: "lockOttensheim", km: [2147, 2148], delay: 1 },
  { nameKey: "lockAsah", km: [2163, 2164], delay: 1 }
];

const borderPoints = [
  { nameKey: "borderRomaniaGalati", km: 150, defaultDelay: 2 },
  { nameKey: "borderRomaniaGiurgiu", km: 497, defaultDelay: 0 },
  { nameKey: "borderBulgariaRuse", km: 495, defaultDelay: 0 },
  { nameKey: "borderRomaniaTurnu", km: 931, defaultDelay: 0 },
  { nameKey: "borderSerbiaVeliko", km: 1050, defaultDelay: 2 },
  { nameKey: "borderSerbiaBezdan", km: 1433, defaultDelay: 2 },
  { nameKey: "borderHungaryMohacs", km: 1446, defaultDelay: 4 },
  { nameKey: "borderCroatiaVukovar", km: 1385, defaultDelay: 0 },
  { nameKey: "borderAustriaVienna", km: 1930, defaultDelay: 0 },
];

let borderDelaysInitialized = false;
let prevStartKm = null;
let prevEndKm = null;

function calculateArrival(fromButton){
  const t = window.translations[window.lang || 'ru'] || {};
  const startKm = parseFloat(document.getElementById("startKmArrival").value);
  const endKm = parseFloat(document.getElementById("endKmArrival").value);
  const speed = parseFloat(document.getElementById("speedArrival").value);
  const startTimeStr = document.getElementById("startTimeArrival").value;
  const workHours = parseFloat(document.getElementById("workHoursArrival").value);
  const resultDiv = document.getElementById("resultArrival");

  if (isNaN(startKm) || isNaN(endKm) || isNaN(speed) || !startTimeStr) {
    if (fromButton) {
      resultDiv.innerHTML = t.errorData;
    } else {
      // при автообновлениях молчим
      resultDiv.innerHTML = '';
    }
    return;
  }
  if (speed < 0.1 || speed > 70) {
    resultDiv.innerHTML = t.errorSpeed;
    return;
  }
  if (startKm < 0 || startKm > 3000 || endKm < 0 || endKm > 3000) {
    resultDiv.innerHTML = "⚠️ Километры должны быть от 0 до 3000 км.";
    return;
  }

  const startTime = new Date(startTimeStr);
  if (isNaN(startTime.getTime())) {
    resultDiv.innerHTML = t.errorData;
    return;
  }

  if (prevStartKm !== startKm || prevEndKm !== endKm) {
    borderDelaysInitialized = false;
    prevStartKm = startKm;
    prevEndKm = endKm;
  }

  const direction = endKm > startKm ? 1 : -1;
  const distance = Math.abs(endKm - startKm);
  let travelHours = distance / speed;

  let passedLocks = [];
  locks.forEach(lock => {
    const [km1, km2] = lock.km;
    if (
      (direction === 1 && startKm <= km2 && endKm >= km1) ||
      (direction === -1 && startKm >= km1 && endKm <= km2)
    ) {
      travelHours += lock.delay;
      const lockName = t[lock.nameKey] || lock.nameKey;
      passedLocks.push(`⚓ ${lockName} — ${lock.delay} ${pluralizeHours(lock.delay)}`);
    }
  });

  // Вена как пограничная задержка реализована ниже (не добавляем в шлюзы)

  // Используем значения из редактора задержек на границах
  let borderDelayTotal = 0;
  let passedBorders = [];

  const relevantBorders = borderPoints.filter(b =>
    (startKm < endKm && b.km >= startKm && b.km <= endKm) ||
    (startKm > endKm && b.km <= startKm && b.km >= endKm)
  );

  relevantBorders.forEach(border => {
    // Получаем значение из соответствующего input
    const inputId = border.nameKey;
    const input = document.getElementById(inputId);
    const saved = parseFloat(localStorage.getItem('bd_' + inputId));
    let delay = Number.isFinite(saved) ? saved : (input ? parseFloat(input.value) || 0 : border.defaultDelay);

    // Вена: +1 час при движении вверх (если не введено больше)
    if (border.nameKey === 'borderAustriaVienna' && direction === 1 && delay < 1) {
      delay = 1;
    }

    // Ограничение: максимум 9 часов
    if (delay > 9) delay = 9;
    
    if (delay > 0) {
      borderDelayTotal += delay;
      const borderName = t[border.nameKey] || border.nameKey;
      passedBorders.push(`${borderName} — ${delay} ${pluralizeHours(delay)}`);
    }
  });
  travelHours += borderDelayTotal;

  // Создаем редактируемые поля для задержек
  let bordersInfo = "";
  if (relevantBorders.length > 0) {
    bordersInfo = "<br><div class='border-delays-header'><strong>" + (t.borderDelays || 'Пограничные задержки') + ":</strong></div>";

    relevantBorders.forEach(border => {
      const inputId = border.nameKey;
      const input = document.getElementById(inputId);
      const saved = parseFloat(localStorage.getItem('bd_' + inputId));
      let delay = Number.isFinite(saved) ? saved : (input ? parseFloat(input.value) || 0 : border.defaultDelay);
      
      // Правило: Вена +1 час при движении вверх (если не введено больше)
      if (border.nameKey === 'borderAustriaVienna' && direction === 1 && delay < 1) {
        delay = 1;
      }
      
      // Ограничение: максимум 9 часов для всех портов
      if (delay > 9) {
        delay = 9;
      }

      const borderName = t[border.nameKey] || border.nameKey;
      bordersInfo += `<div class="border-delay-item">
        <span class="border-name">${borderName}</span>
        <input type="number" class="border-delay-input" data-border="${inputId}" value="${delay}" min="0" max="9" step="0.5">
        <span class="border-unit">${pluralizeHours(delay)}</span>
      </div>`;
    });
  }

  // Отдых по сменам будет учтён в computeArrivalWithShifts

  // Укладываем чистое время в смены
  function computeArrivalWithShifts(startDate, pureHours, workHours){
    // 24 часа — без ограничений
    if (workHours === 24) return new Date(startDate.getTime() + pureHours * 3600 * 1000);

    const block = document.getElementById('dayModeBlock');
    const custom = document.getElementById('dayModeCustomToggle')?.checked;
    // Используем значения из UI, если доступны; иначе дефолт 06:00 и конец = начало + workHours
    let startStr = '06:00';
    let endStr = null;
    const startEl = document.getElementById('dayModeStartTime');
    const endEl = document.getElementById('dayModeEndTime');
    const presetSel = document.getElementById('dayModePresetSelect');
    if (block) {
      if (custom && startEl && endEl) {
        startStr = startEl.value || '06:00';
        endStr = endEl.value || null;
      } else if (presetSel && presetSel.value) {
        const parts = presetSel.value.split('-');
        if (parts[0]) startStr = parts[0];
        if (parts[1]) endStr = parts[1];
      } else if (startEl) {
        startStr = startEl.value || '06:00';
      }
    }
    const [sh, sm] = startStr.split(':').map(v=>parseInt(v,10)||0);
    const [eh, em] = endStr ? endStr.split(':').map(v=>parseInt(v,10)||0) : [null,null];

    function shiftWindowFor(date){
      const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm, 0, 0);
      let d1;
      if (eh!==null){
        d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), eh, em, 0, 0);
        // если конец раньше начала — значит через полночь
        if (d1 <= d0) d1 = new Date(d1.getTime() + 24*3600*1000);
      } else {
        d1 = new Date(d0.getTime() + workHours*3600*1000);
      }
      return [d0, d1];
    }

    let remaining = pureHours;
    let cursor = new Date(startDate);

    while (remaining > 1e-9) {
      let [ws, we] = shiftWindowFor(cursor);
      if (cursor < ws) {
        cursor = ws;
      }
      const available = Math.max(0, (we - cursor) / 3600000);
      if (available <= 1e-9) {
        // move to next day's start
        cursor = new Date(ws.getTime() + 24*3600*1000);
        continue;
      }
      const take = Math.min(available, remaining);
      cursor = new Date(cursor.getTime() + take*3600*1000);
      remaining -= take;
      if (remaining > 1e-9) {
        // jump to next day's start
        cursor = new Date(ws.getTime() + 24*3600*1000);
      }
    }
    return cursor;
  }
  const arrivalTime = computeArrivalWithShifts(startTime, travelHours, workHours);
  const formattedArrival = arrivalTime.toLocaleString((window.lang || 'ru') === 'ru' ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const locksInfo = passedLocks.length > 0 ? "<br><strong>" + (t.lockDelays || 'Задержки на шлюзах') + ":</strong><br>" + passedLocks.join("<br>") : "";

resultDiv.innerHTML = `
<strong>${t.arrivalHeading || 'Расчёт времени прибытия'}:</strong> ${formattedArrival}<br>
⏳ <strong>${t.durationTransit || 'Длительность перехода'}:</strong> ${travelHours.toFixed(2)} ${t.hourUnit || 'ч'}<br>
📍 <strong>${t.distance || 'Расстояние'}:</strong> ${distance} ${t.kmUnit || 'км'}<br>
${locksInfo}${bordersInfo}
`;

  // Подготовим текст для шаринга
  const shareText = `Прибытие: ${formattedArrival}\nДлительность: ${travelHours.toFixed(2)} ${t.hourUnit || 'ч'}\nРасстояние: ${distance} ${t.kmUnit || 'км'}\nМаршрут: ${startKm}–${endKm} км`;
  const shareBtn = document.getElementById('btn-share-arrival');
  if (shareBtn) {
    shareBtn.onclick = async () => {
      try {
        if (navigator.share) {
          await navigator.share({ text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
          alert('Скопировано в буфер обмена');
        }
      } catch (e) {
        try {
          await navigator.clipboard.writeText(shareText);
          alert('Скопировано в буфер обмена');
        } catch {}
      }
    };
  }


  document.getElementById("desiredBlockArrival").style.display = "block";
  document.getElementById("requiredSpeedResultArrival").innerHTML = "";
}

function calculateRecommendedSpeed() {
  const t = window.translations[window.lang || 'ru'] || {};
  const startKm = parseFloat(document.getElementById("startKmArrival").value);
  const endKm = parseFloat(document.getElementById("endKmArrival").value);
  const startTimeStr = document.getElementById("startTimeArrival").value;
  const desiredArrivalStr = document.getElementById("desiredArrivalTimeArrival").value;
  const workHours = parseFloat(document.getElementById("workHoursArrival").value);
  const resultDiv = document.getElementById("requiredSpeedResultArrival");

  if (isNaN(startKm) || isNaN(endKm) || !startTimeStr || !desiredArrivalStr) {
    resultDiv.innerHTML = t.errorData;
    return;
  }
  if (startKm < 0 || startKm > 3000 || endKm < 0 || endKm > 3000) {
    resultDiv.innerHTML = "⚠️ Километры должны быть от 0 до 3000 км.";
    return;
  }

  const startTime = new Date(startTimeStr);
  const desiredArrival = new Date(desiredArrivalStr);
  if (isNaN(startTime.getTime()) || isNaN(desiredArrival.getTime())) {
    resultDiv.innerHTML = t.errorData;
    return;
  }
  if (desiredArrival <= startTime) {
    resultDiv.innerHTML = t.errorData;
    return;
  }

  const direction = endKm > startKm ? 1 : -1;
  const distance = Math.abs(endKm - startKm);

  let totalLockDelay = 0;
  locks.forEach(lock => {
    const [km1, km2] = lock.km;
    if (
      (direction === 1 && startKm <= km2 && endKm >= km1) ||
      (direction === -1 && startKm >= km1 && endKm <= km2)
    ) {
      totalLockDelay += lock.delay;
    }
  });

  // Границы (со скрытых полей) + Вена +1ч вверх и максимум 9ч
  let borderDelayTotal = 0;
  const relevantBorders = borderPoints.filter(b =>
    (startKm < endKm && b.km >= startKm && b.km <= endKm) ||
    (startKm > endKm && b.km <= startKm && b.km >= endKm)
  );
  relevantBorders.forEach(border => {
    const inputId = border.nameKey;
    const input = document.getElementById(inputId);
    let delay = input ? parseFloat(input.value) || 0 : border.defaultDelay;
    if (border.nameKey === 'borderAustriaVienna' && direction === 1 && delay < 1) delay = 1;
    if (delay > 9) delay = 9;
    if (delay > 0) borderDelayTotal += delay;
  });

  // Посчитаем доступные рабочие часы в интервале [startTime, desiredArrival]
  function computeWorkingHoursBetween(start, end, workHours) {
    if (workHours === 24) return (end - start) / 3600000;

    // Вычисляем окна как в computeArrivalWithShifts, используя текущие пресеты/кастом
    const block = document.getElementById('dayModeBlock');
    const custom = document.getElementById('dayModeCustomToggle')?.checked;
    let startStr = '06:00';
    let endStr = null;
    const startEl = document.getElementById('dayModeStartTime');
    const endEl = document.getElementById('dayModeEndTime');
    const presetSel = document.getElementById('dayModePresetSelect');
    if (block) {
      if (custom && startEl && endEl) {
        startStr = startEl.value || '06:00';
        endStr = endEl.value || null;
      } else if (presetSel && presetSel.value) {
        const parts = presetSel.value.split('-');
        if (parts[0]) startStr = parts[0];
        if (parts[1]) endStr = parts[1];
      } else if (startEl) {
        startStr = startEl.value || '06:00';
      }
    }
    const [sh, sm] = startStr.split(':').map(v=>parseInt(v,10)||0);
    const [eh, em] = endStr ? endStr.split(':').map(v=>parseInt(v,10)||0) : [null,null];

    function shiftWindowFor(date){
      const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm, 0, 0);
      let d1;
      if (eh!==null){
        d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), eh, em, 0, 0);
        if (d1 <= d0) d1 = new Date(d1.getTime() + 24*3600*1000);
      } else {
        d1 = new Date(d0.getTime() + workHours*3600*1000);
      }
      return [d0, d1];
    }

    let cursor = new Date(start);
    let sum = 0;
    while (cursor < end) {
      const [ws, we] = shiftWindowFor(cursor);
      if (cursor < ws) {
        // до начала окна — пропускаем ожидание
        cursor = ws;
      }
      const segmentEnd = we < end ? we : end;
      if (cursor < segmentEnd) {
        sum += (segmentEnd - cursor) / 3600000;
        cursor = segmentEnd;
      }
      if (cursor < end) {
        // переходим к началу смены следующего дня
        cursor = new Date(ws.getTime() + 24*3600*1000);
      }
    }
    return sum;
  }

  const availableHours = computeWorkingHoursBetween(startTime, desiredArrival, workHours);
  const effectiveTravelHours = availableHours - (totalLockDelay + borderDelayTotal);

  if (effectiveTravelHours <= 0) {
    resultDiv.innerHTML = t.errorData;
    return;
  }

  const requiredSpeed = distance / effectiveTravelHours;
  if (requiredSpeed < 0.1 || requiredSpeed > 100) {
    resultDiv.innerHTML = t.errorSpeed;
    return;
  }

  resultDiv.innerHTML = `
🚀 <strong>${t.btnSpeed}:</strong> ${requiredSpeed.toFixed(2)} км/ч
  `;
}





(function () {
  const style = document.createElement("style");
  style.innerHTML = `
    @media (prefers-color-scheme: dark) {
      #borderDelaysSection td {
        color: #eee !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

// Автоперерасчёт с дебаунсом
let arrivalDebounce;
function triggerAutoArrival() {
  clearTimeout(arrivalDebounce);
  arrivalDebounce = setTimeout(() => {
    try { calculateArrival(); } catch {}
  }, 250);
}


//Вызываем функцию после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
  // Применяем переводы к секции времени прибытия
  if (typeof updateArrivalSection === 'function') {
    updateArrivalSection();
  }

  // Восстановление сохранённых значений полей прибытия
  const mapIds = ['startKmArrival','endKmArrival','speedArrival','startTimeArrival','workHoursArrival'];
  mapIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const v = localStorage.getItem('arr_' + id);
      if (v !== null) el.value = v;
    }
  });

  // Пересчитать, если все основные поля заданы
  try { calculateArrival(); } catch(e) {}

  // Сохранение значений полей прибытия
  const watchIds = ['startKmArrival','endKmArrival','speedArrival','startTimeArrival','workHoursArrival'];
  watchIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      // Сохраняем при изменении
      el.addEventListener('input', (e) => {
        localStorage.setItem('arr_' + id, e.target.value);
        // Автоперерасчет только если уже был расчет
        const resultDiv = document.getElementById('resultArrival');
        if (resultDiv && resultDiv.innerHTML.trim() !== '') {
          triggerAutoArrival();
        }
      });
      el.addEventListener('change', (e) => {
        localStorage.setItem('arr_' + id, e.target.value);
      });
    }
  });

  // Обработчики для редактируемых полей задержек
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('border-delay-input')) {
      const borderId = e.target.getAttribute('data-border');
      let newValue = parseFloat(e.target.value) || 0;
      
      // Ограничение: максимум 9 часов для всех портов
      if (newValue > 9) {
        newValue = 9;
        e.target.value = '9';
      }

      const hiddenInput = document.getElementById(borderId);
      if (hiddenInput) hiddenInput.value = newValue;

      const spanElement = e.target.nextElementSibling;
      if (spanElement && spanElement.tagName === 'SPAN') {
        spanElement.textContent = ' ' + pluralizeHours(newValue);
      }

      // persist
      localStorage.setItem('bd_' + borderId, String(newValue));

      // Автоперерасчёт при изменении задержек
      triggerAutoArrival();
    }
  });
  
  // Автоперерасчёт при вводе в поля задержек (без ожидания change)
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('border-delay-input')) {
      const borderId = e.target.getAttribute('data-border');
      let newValue = parseFloat(e.target.value) || 0;
      
      // Ограничение: максимум 9 часов для всех портов
      if (newValue > 9) {
        newValue = 9;
        e.target.value = '9';
      }

      const hiddenInput = document.getElementById(borderId);
      if (hiddenInput) hiddenInput.value = newValue;

      const spanElement = e.target.nextElementSibling;
      if (spanElement && spanElement.tagName === 'SPAN') {
        spanElement.textContent = ' ' + pluralizeHours(newValue);
      }

      // Автоперерасчёт при вводе
      triggerAutoArrival();
    }
  });

  // Очистка задержек
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-clear-borders') {
      const inputs = document.querySelectorAll('.border-delay-input');
      inputs.forEach(inp => {
        inp.value = '0';
        const id = inp.getAttribute('data-border');
        if (id) localStorage.removeItem('bd_' + id);
        const span = inp.nextElementSibling;
        if (span && span.tagName === 'SPAN') span.textContent = ' ' + pluralizeHours(0);
        const hidden = document.getElementById(id);
        if (hidden) hidden.value = 0;
      });
      calculateArrival();
    }
    if (e.target && e.target.id === 'btn-clear-arrival') {
      // clear arrival fields
      ['startKmArrival','endKmArrival','speedArrival','startTimeArrival'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
        localStorage.removeItem('arr_' + id);
      });
      // reset work hours to default 24
      const wh = document.getElementById('workHoursArrival');
      if (wh) wh.value = '24';
      localStorage.setItem('arr_workHoursArrival', '24');
      // clear border delays
      const inputs = document.querySelectorAll('.border-delay-input');
      inputs.forEach(inp => {
        inp.value = '0';
        const id = inp.getAttribute('data-border');
        if (id) localStorage.removeItem('bd_' + id);
        const span = inp.nextElementSibling;
        if (span && span.tagName === 'SPAN') span.textContent = ' ' + pluralizeHours(0);
        const hidden = document.getElementById(id);
        if (hidden) hidden.value = 0;
      });
      // clear result
      const resultDiv = document.getElementById('resultArrival');
      if (resultDiv) resultDiv.innerHTML = '';
    }
  });
});

