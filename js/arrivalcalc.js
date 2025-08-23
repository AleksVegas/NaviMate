// 1️⃣ Язык по умолчанию
let currentLang = 'ru';

// 2️⃣ Функции перевода
function translateElement(el) {
  const t = translations[currentLang];
  const key = el.getAttribute("data-i18n");
  if (!key || !t[key]) return;

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    el.placeholder = t[key];
  } else if (el.tagName === "OPTION") {
    el.textContent = t[key];
  } else {
    el.textContent = t[key];
  }
}

function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(translateElement);
}


function pluralizeHours(n) {
  n = Math.abs(n);
  if (Number.isInteger(n)) {
    if (n % 10 === 1 && n % 100 !== 11) return 'час';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'часа';
  }
  return 'часов';
}

const locks = [
  { name: "Габчиково", km: [1818, 1819], delay: 1 },
  { name: "Железные ворота II", km: [863, 864], delay: 1 },
  { name: "Железные ворота I", km: [943, 944], delay: 2.5 },
  { name: "Фройденау", km: [1919, 1920], delay: 1.5 },
  { name: "Грайфенштайн", km: [1948, 1949], delay: 1 },
  { name: "Альтенвёрт", km: [1980, 1981], delay: 1 },
  { name: "Мельк", km: [2038, 2039], delay: 1 },
  { name: "Иббс", km: [2060, 2061], delay: 1 },
  { name: "Валлзее", km: [2095, 2096], delay: 1 },
  { name: "Абвинден", km: [2119, 2120], delay: 1 },
  { name: "Оттенсхайм", km: [2147, 2148], delay: 1 },
  { name: "Ашах", km: [2163, 2164], delay: 1 }
];

const borderPoints = [
  { name: "Граница Румынии Галац", km: 150, defaultDelay: 2 },
  { name: "Граница Румынии Джурджу", km: 497, defaultDelay: 0 },
  { name: "Граница Болгарии Русе", km: 495, defaultDelay: 0 },
  { name: "Граница Румынии Турну - Северин", km: 931, defaultDelay: 0 },
  { name: "Граница Сербии Велико-Градиште", km: 1050, defaultDelay: 2 },
  { name: "Граница Сербии Бездан", km: 1433, defaultDelay: 2 },
  { name: "Граница Венгрии Мохач", km: 1446, defaultDelay: 2 },
];

let borderDelaysInitialized = false;
let prevStartKm = null;
let prevEndKm = null;

function calculateArrival() {
  const startKm = parseFloat(document.getElementById("startKmArrival").value);
  const endKm = parseFloat(document.getElementById("endKmArrival").value);
  const speed = parseFloat(document.getElementById("speedArrival").value);
  const startTimeStr = document.getElementById("startTimeArrival").value;
  const workHours = parseFloat(document.getElementById("workHoursArrival").value);
  const resultDiv = document.getElementById("resultArrival");

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

  if (!borderDelaysInitialized) {
    showBorderDelays(startKm, endKm);
    borderDelaysInitialized = true;
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
      passedLocks.push(`⚓ ${t.lockFeature1.replace('ключевые шлюзы', lock.name)} — задержка ${lock.delay} ${pluralizeHours(lock.delay)}`);
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
    ? "<br><strong>🛃 " + t.arrivalFeature2 + ":</strong><br>" + passedBorders.join("<br>")
    : "";

  if (workHours < 24) {
    const fullShifts = Math.floor(travelHours / workHours);
    const restTime = fullShifts * (24 - workHours);
    travelHours += restTime;
  }

  const arrivalTime = new Date(startTime.getTime() + travelHours * 3600 * 1000);
  const formattedArrival = arrivalTime.toLocaleString(currentLang === 'ru' ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const locksInfo = passedLocks.length > 0 ? "<br>" + passedLocks.join("<br>") : "";

  resultDiv.innerHTML = `
🚢 <strong>${t.arrivalHeading}:</strong> ${formattedArrival}<br>
⏳ <strong>${t.workHours}:</strong> ${travelHours.toFixed(2)} ч<br>
📍 <strong>Расстояние:</strong> ${distance} км${locksInfo}${bordersInfo}
  `;

  document.getElementById("desiredBlockArrival").style.display = "block";
  document.getElementById("requiredSpeedResultArrival").innerHTML = "";
}

function calculateRecommendedSpeed() {
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
    const container = document.getElementById("borderDelaysSection");
    container.innerHTML = "";

    const relevantBorders = borderPoints.filter(b =>
    (startKm < endKm && b.km >= startKm && b.km <= endKm) ||
    (startKm > endKm && b.km <= startKm && b.km >= endKm)
  );

    if (relevantBorders.length === 0) return;
  
    const title = document.createElement("h3");
    title.textContent = "🛃 " + t.arrivalFeature2; // вместо "Пограничные задержки:"
    title.style.marginBottom = "8px";
    container.appendChild(title);
  
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.maxWidth = "380px";

    relevantBorders.forEach((border, i) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = border.name.replace("Граница ", "");
    nameCell.style.padding = "4px 6px";
    nameCell.style.fontSize = "14px";
    nameCell.style.whiteSpace = "nowrap";
    nameCell.style.color = "var(--text-color, #222)";

    const inputCell = document.createElement("td");

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "0.1";
    input.value = border.defaultDelay;
    input.id = `borderDelay_${i}`;

    // ✅ Универсальные стили под тёмную/светлую темы
    input.style.width = "45px";
    input.style.padding = "3px 4px";
    input.style.fontSize = "13px";
    input.style.borderRadius = "4px";
    input.style.border = "1px solid var(--border-color, #888)";
    input.style.backgroundColor = "var(--input-bg, #fff)";
    input.style.color = "var(--text-color, #000)";
    input.style.caretColor = "auto";

    input.addEventListener("input", () => {
      calculateArrival();
    });

    const label = document.createElement("span");
    label.textContent = "ч";
    label.style.fontSize = "13px";
    label.style.opacity = "0.7";
    label.style.marginLeft = "4px";
    label.style.color = "var(--text-color, #aaa)";

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
  applyTranslations();       // переведёт все элементы на выбранный язык
});
