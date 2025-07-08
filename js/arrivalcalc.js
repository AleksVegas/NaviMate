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
    resultDiv.innerHTML = "⚠️ Пожалуйста, заполните все поля корректно.";
    return;
  }
  if (speed < 0.1 || speed > 100) {
    resultDiv.innerHTML = "⚠️ Скорость должна быть от 0.1 до 100 км/ч.";
    return;
  }

  const startTime = new Date(startTimeStr);
  if (isNaN(startTime.getTime())) {
    resultDiv.innerHTML = "⚠️ Неверный формат времени начала движения.";
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
      passedLocks.push(`⚓ Учтён шлюз <strong>${lock.name}</strong> — задержка ${lock.delay} ${pluralizeHours(lock.delay)}`);
    }
  });

  const borderDelaysSection = document.getElementById("borderDelaysSection");
  let borderDelayTotal = 0;
  let passedBorders = [];

  if (borderDelaysSection) {
    const inputs = borderDelaysSection.querySelectorAll("input[type='number']");
    const labels = borderDelaysSection.querySelectorAll("label");
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
    ? "<br><strong>🛃 Пограничные задержки:</strong><br>" + passedBorders.join("<br>")
    : "";

  if (workHours < 24) {
    const fullShifts = Math.floor(travelHours / workHours);
    const restTime = fullShifts * (24 - workHours);
    travelHours += restTime;
  }

  const arrivalTime = new Date(startTime.getTime() + travelHours * 3600 * 1000);
  const formattedArrival = arrivalTime.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const locksInfo = passedLocks.length > 0 ? "<br>" + passedLocks.join("<br>") : "";

  resultDiv.innerHTML = `
🚢 <strong>Ожидаемое прибытие:</strong> ${formattedArrival}<br>
⏳ <strong>Общая продолжительность:</strong> ${travelHours.toFixed(2)} ч<br>
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
    resultDiv.innerHTML = "⚠️ Пожалуйста, заполните все поля корректно.";
    return;
  }

  const startTime = new Date(startTimeStr);
  const desiredArrival = new Date(desiredArrivalStr);
  if (isNaN(startTime.getTime()) || isNaN(desiredArrival.getTime())) {
    resultDiv.innerHTML = "⚠️ Неверный формат времени.";
    return;
  }
  if (desiredArrival <= startTime) {
    resultDiv.innerHTML = "⚠️ Желаемое время прибытия должно быть позже времени начала движения.";
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
    resultDiv.innerHTML = "⚠️ Невозможно прибыть вовремя с учётом задержек.";
    return;
  }

  const requiredSpeed = distance / effectiveTravelHours;
  if (requiredSpeed < 0.1) {
    resultDiv.innerHTML = "⚠️ Требуемая скорость слишком мала. Проверьте данные.";
    return;
  }
  if (requiredSpeed > 100) {
    resultDiv.innerHTML = "⚠️ Требуемая скорость слишком велика. Невозможно прибыть вовремя.";
    return;
  }

  resultDiv.innerHTML = `
🚀 <strong>Рекомендуемая скорость:</strong> ${requiredSpeed.toFixed(2)} км/ч<br>
(учтены задержки шлюзов ⚓, границ 🛃 и рабочий график 🕒)
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
  title.textContent = "🛃 Пограничные задержки:";
  container.appendChild(title);

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.maxWidth = "400px";

  relevantBorders.forEach((border, i) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const label = document.createElement("label");
    label.textContent = border.name.replace("Граница ", "");
    label.setAttribute("for", `borderDelay_${i}`);
    nameCell.appendChild(label);
    nameCell.style.padding = "6px";
    nameCell.style.fontWeight = "500";

    const inputCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "0.1";
    input.value = border.defaultDelay;
    input.id = `borderDelay_${i}`;
    input.style.width = "60px";
    input.style.marginRight = "6px";

    input.addEventListener("input", () => {
      calculateArrival();
    });

    inputCell.appendChild(input);
    inputCell.appendChild(document.createTextNode(" ч"));

    row.appendChild(nameCell);
    row.appendChild(inputCell);
    table.appendChild(row);
  });

  container.appendChild(table);
}
