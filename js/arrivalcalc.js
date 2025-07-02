const locks = [
  { name: "Габчиково", km: [1818, 1819], delay: 1 },
  { name: "Железные ворота II", km: [863, 864], delay: 1 },
  { name: "Железные ворота I", km: [943, 944], delay: 2.5 },

  // Австрийские шлюзы:
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

  const startTime = new Date(startTimeStr);
  if (isNaN(startTime.getTime())) {
    resultDiv.innerHTML = "⚠️ Неверный формат времени начала движения.";
    return;
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
      passedLocks.push(`⚓ Учтён шлюз <strong>${lock.name}</strong> — задержка ${lock.delay} час${lock.delay > 1 ? 'а' : ''}`);
    }
  });

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
📍 <strong>Расстояние:</strong> ${distance} км${locksInfo}
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

  const totalAvailableMs = desiredArrival - startTime;
  let totalAvailableHours = totalAvailableMs / (1000 * 60 * 60);

  if (workHours < 24) {
    const cycles = Math.floor(totalAvailableHours / 24);
    const remainder = totalAvailableHours % 24;
    totalAvailableHours = cycles * workHours + Math.min(remainder, workHours);
  }

  const effectiveTravelHours = totalAvailableHours - totalLockDelay;

  if (effectiveTravelHours <= 0) {
    resultDiv.innerHTML = "⚠️ Невозможно прибыть вовремя с учётом задержек.";
    return;
  }

  const requiredSpeed = distance / effectiveTravelHours;

  resultDiv.innerHTML = `
🚀 <strong>Рекомендуемая скорость:</strong> ${requiredSpeed.toFixed(2)} км/ч<br>
(учтены задержки шлюзов ⚓ и рабочий график)
  `;
}

