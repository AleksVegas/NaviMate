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

if (!borderDelaysInitialized) {
    showBorderDelays(startKm, endKm);
    borderDelaysInitialized = true;
  }

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
      const delayText = t.delay || 'задержка';
      passedLocks.push(`⚓ ${lockName} — ${delayText} ${lock.delay} ${pluralizeHours(lock.delay)}`);
    }
  });

  const borderDelaysSection = document.getElementById("borderDelaysSection");
  let borderDelayTotal = 0;
  let passedBorders = [];

  if (borderDelaysSection) {
    const inputs = borderDelaysSection.querySelectorAll("input[type='number']");
    const labels = borderDelaysSection.querySelectorAll("td:first-child");
    inputs.forEach((input, i) => {
      const delay = parseFloat(input.value);
      if (!isNaN(delay) && delay > 0) {
        borderDelayTotal += delay;
        const name = labels[i] ? labels[i].textContent : `Граница ${i + 1}`;
        passedBorders.push(`${name.trim()} — ${delay} ${pluralizeHours(delay)}`);
      }
    });
    travelHours += borderDelayTotal;
  }

  const bordersInfo = passedBorders.length > 0
    ? "<br><strong>" + (t.borderDelays || 'Пограничные задержки') + ":</strong><br>" + passedBorders.join("<br>")
    : "";

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
⏳ <strong>${t.workHours || 'Длительность рабочего дня (часов)'}:</strong> ${travelHours.toFixed(2)} ${t.hourUnit || 'ч'}<br>
📍 <strong>${t.distance || 'Расстояние'}:</strong> ${distance} ${t.kmUnit || 'км'}${locksInfo}${bordersInfo}
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

  const borderDelaysSection = document.getElementById("borderDelaysSection");
  let borderDelayTotal = 0;
  if (borderDelaysSection) {
    const inputs = borderDelaysSection.querySelectorAll("input[type='number']");
    inputs.forEach(input => {
      const delay = parseFloat(input.value);
      if (!isNaN(delay) && delay > 0) {
        borderDelayTotal += delay;
      }
    });
  }

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


    function showBorderDelays(startKm, endKm) {
    const t = window.translations[window.lang || 'ru'] || {};
    const container = document.getElementById("borderDelaysSection");
    container.innerHTML = "";

    const relevantBorders = borderPoints.filter(b =>
    (startKm < endKm && b.km >= startKm && b.km <= endKm) ||
    (startKm > endKm && b.km <= startKm && b.km >= endKm)
  );


    if (relevantBorders.length === 0) return;
  
    const title = document.createElement("h3");
    title.textContent = "🛃 " + (t.borderDelays || 'Пограничные задержки');
    title.style.marginBottom = "8px";
    container.appendChild(title);
  
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "auto";
    table.style.maxWidth = "300px";
    table.style.marginLeft = "0";

    relevantBorders.forEach((border, i) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const borderName = t[border.nameKey] || border.nameKey;
    nameCell.textContent = borderName;
    nameCell.style.padding = "4px 8px 4px 0";
    nameCell.style.fontSize = "13px";
    nameCell.style.whiteSpace = "nowrap";
    nameCell.style.color = document.body.classList.contains('dark') ? "#eee" : "#222";

    const inputCell = document.createElement("td");

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "0.1";
    input.value = border.defaultDelay;
    input.id = `borderDelay_${i}`;

    // ✅ Универсальные стили под тёмную/светлую темы
    input.style.width = "40px";
    input.style.padding = "2px 4px";
    input.style.fontSize = "12px";
    input.style.borderRadius = "4px";
    input.style.border = "1px solid #ccc";
    input.style.backgroundColor = "#fff";
    input.style.color = "#000";
    input.style.caretColor = "auto";
    
    // Адаптация под темную тему
    if (document.body.classList.contains('dark')) {
      input.style.border = "1px solid #555";
      input.style.backgroundColor = "#1e1e1e";
      input.style.color = "#eee";
    }

    // Обработчики для всех событий изменения
    const updateCalculation = () => {
      setTimeout(() => calculateArrival(), 100);
    };
    
    input.addEventListener("input", updateCalculation);
    input.addEventListener("change", updateCalculation);
    input.addEventListener("blur", updateCalculation);
    input.addEventListener("keyup", updateCalculation);

    const label = document.createElement("span");
    const hourUnit = t.hourUnit || 'ч';
    label.textContent = hourUnit;
    label.style.fontSize = "12px";
    label.style.opacity = "0.7";
    label.style.marginLeft = "3px";
    label.style.color = document.body.classList.contains('dark') ? "#aaa" : "#666";

    inputCell.appendChild(input);
    inputCell.appendChild(label);

    row.appendChild(nameCell);
    row.appendChild(inputCell);
    table.appendChild(row);
  });

  container.appendChild(table);
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

  //блок обеспечивает пересчёт и обновление отображения, когда значения километров уже есть на странице.
  const startInput = document.getElementById("startKmArrival");
  const endInput = document.getElementById("endKmArrival");
  if (startInput && endInput) {
    const startKm = parseFloat(startInput.value);
    const endKm = parseFloat(endInput.value);
    if (!isNaN(startKm) && !isNaN(endKm)) {
      showBorderDelays(startKm, endKm);
      calculateArrival();
    }
  }
});

