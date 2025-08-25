// 1️⃣ Язык по умолчанию
// при загрузке страницы
// Используем window.lang из lang.js

// Функция для обновления расчетов при смене языка
function updateArrivalCalculations() {
  const startKm = parseFloat(document.getElementById("startKmArrival").value);
  const endKm = parseFloat(document.getElementById("endKmArrival").value);
  if (!isNaN(startKm) && !isNaN(endKm)) {
    showBorderDelays(startKm, endKm); // обновляем таблицу с новым языком
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
  if (Number.isInteger(n)) {
    if (n % 10 === 1 && n % 100 !== 11) return t.hour || 'час';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return t.hours || 'часа';
  }
  return t.hoursMany || 'часов';
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
  { nameKey: "borderHungaryMohacs", km: 1446, defaultDelay: 2 },
  { nameKey: "borderCroatiaVukovar", km: 1385, defaultDelay: 0 },
  { nameKey: "borderSlovakiaKomarno", km: 1795, defaultDelay: 0 },
  { nameKey: "borderAustriaVienna", km: 1930, defaultDelay: 0 },
];

let borderDelaysInitialized = false;
let prevStartKm = null;
let prevEndKm = null;

function calculateArrival() {
  const t = window.translations[window.lang || 'ru'] || {};
  const startKm = parseFloat(document.getElementById("startKmArrival").value);
  const endKm = parseFloat(document.getElementById("endKmArrival").value);
  const speed = parseFloat(document.getElementById("speedArrival").value);
  const startTimeStr = document.getElementById("startTimeArrival").value;
  const workHours = parseFloat(document.getElementById("workHoursArrival").value);
  const resultDiv = document.getElementById("resultArrival");

  // Проверяем, изменились ли значения
  if (prevStartKm === startKm && prevEndKm === endKm && borderDelaysInitialized) {
    // Если значения не изменились, но нужно пересчитать из-за других параметров
    if (speed && startTimeStr && workHours) {
      // Продолжаем расчет
    } else {
      return;
    }
  }

  prevStartKm = startKm;
  prevEndKm = endKm;
  borderDelaysInitialized = false;



  if (isNaN(startKm) || isNaN(endKm) || isNaN(speed) || !startTimeStr) {
    resultDiv.innerHTML = t.errorData;
    return;
  }
  if (speed < 0.1 || speed > 100) {
    resultDiv.innerHTML = t.errorSpeed;
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
    const delay = input ? parseFloat(input.value) || 0 : border.defaultDelay;
    
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
      const delay = input ? parseFloat(input.value) || 0 : border.defaultDelay;

      const borderName = t[border.nameKey] || border.nameKey;
      bordersInfo += `<div class="border-delay-item">
        <span>${borderName}</span>
        <input type="number" class="border-delay-input" data-border="${inputId}" value="${delay}" min="0" max="24" step="0.5">
        <span>${pluralizeHours(delay)}</span>
      </div>`;
    });
  }

  if (workHours < 24) {
    const fullShifts = Math.floor(travelHours / workHours);
    const restTime = fullShifts * (24 - workHours);
    travelHours += restTime;
  }

  const arrivalTime = new Date(startTime.getTime() + travelHours * 3600 * 1000);
  const formattedArrival = arrivalTime.toLocaleString((window.lang || 'ru') === 'ru' ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const locksInfo = passedLocks.length > 0 ? "<br><strong>" + (t.lockDelays || 'Задержки на шлюзах') + ":</strong><br>" + passedLocks.join("<br>") : "";

resultDiv.innerHTML = `
🚢 <strong>${t.arrivalHeading || 'Расчёт времени прибытия'}:</strong> ${formattedArrival}<br>
⏳ <strong>${t.workHours || 'Длительность перехода'}:</strong> ${travelHours.toFixed(2)} ${t.hourUnit || 'ч'}<br>
📍 <strong>${t.distance || 'Расстояние'}:</strong> ${distance} ${t.kmUnit || 'км'}<br>
${locksInfo}${bordersInfo}
`;


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

  // Используем значения из скрытых полей задержек
  let borderDelayTotal = 0;
  const relevantBorders = borderPoints.filter(b =>
    (startKm < endKm && b.km >= startKm && b.km <= endKm) ||
    (startKm > endKm && b.km <= startKm && b.km >= endKm)
  );

  relevantBorders.forEach(border => {
    const inputId = border.nameKey;
    const input = document.getElementById(inputId);
    const delay = input ? parseFloat(input.value) || 0 : border.defaultDelay;
    if (delay > 0) {
      borderDelayTotal += delay;
    }
  });

  const totalAvailableMs = desiredArrival - startTime;
  let totalAvailableHours = totalAvailableMs / (1000 * 60 * 60);

  if (workHours < 24) {
    const cycles = Math.floor(totalAvailableHours / 24);
    const remainder = totalAvailableHours % 24;
    totalAvailableHours = cycles * workHours + Math.min(remainder, workHours);
  }

  const totalDelay = totalLockDelay + borderDelayTotal;
  const effectiveTravelHours = totalAvailableHours - totalDelay;

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
🚀 <strong>${t.btnSpeed}:</strong> ${requiredSpeed.toFixed(2)} км/ч<br>
(${t.arrivalFeature2})
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


//Вызываем функцию после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
  // Применяем переводы к секции времени прибытия
  if (typeof updateArrivalSection === 'function') {
    updateArrivalSection();
  }

  // Добавляем обработчики для редактируемых полей задержек
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('border-delay-input')) {
      const borderId = e.target.getAttribute('data-border');
      const newValue = parseFloat(e.target.value) || 0;
      
      // Обновляем скрытое поле
      const hiddenInput = document.getElementById(borderId);
      if (hiddenInput) {
        hiddenInput.value = newValue;
      }
      
      // Обновляем склонение в тексте
      const spanElement = e.target.nextElementSibling;
      if (spanElement && spanElement.tagName === 'SPAN') {
        spanElement.textContent = ' ' + pluralizeHours(newValue);
      }
      
      // Пересчитываем результат
      const resultDiv = document.getElementById('resultArrival');
      if (resultDiv && resultDiv.innerHTML.trim() !== '') {
        calculateArrival();
      }
    }
  });

});

