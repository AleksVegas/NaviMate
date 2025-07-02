const locks = [
  { name: "Габчиково", km: [1818, 1819], delay: 1 },
  { name: "Железные ворота II", km: [863, 864], delay: 1 },
  { name: "Железные ворота I", km: [943, 944], delay: 2.5 }
];

function calculateArrival() {
    const startKm = parseFloat(document.getElementById("startKm").value);
    const endKm = parseFloat(document.getElementById("endKm").value);
    const speed = parseFloat(document.getElementById("speed").value);
    const startTimeStr = document.getElementById("startTime").value;
    const workHours = parseFloat(document.getElementById("workHours").value);

    if (isNaN(startKm) || isNaN(endKm) || isNaN(speed) || !startTimeStr) {
      document.getElementById("result").innerHTML = "⚠️ Пожалуйста, заполните все поля корректно.";
      return;
    }

    const startTime = new Date(startTimeStr);
    if (isNaN(startTime.getTime())) {
      document.getElementById("result").innerHTML = "⚠️ Неверный формат времени начала движения.";
      return;
    }

    const direction = endKm > startKm ? 1 : -1;
    const distance = Math.abs(endKm - startKm);
    let travelHours = distance / speed;

    let passedLocks = [];

    locks.forEach(lock => {
      const [km1, km2] = lock.km;
      // Проверка пересечения маршрута со шлюзом
      if (
        (direction === 1 && startKm <= km2 && endKm >= km1) ||
        (direction === -1 && startKm >= km1 && endKm <= km2)
      ) {
        travelHours += lock.delay;
        passedLocks.push(`⚓ Учтён шлюз <strong>${lock.name}</strong> — задержка ${lock.delay} час${lock.delay > 1 ? 'а' : ''}`);
      }
    });

    // Учёт времени отдыха, если рабочий день меньше 24 часов
    if (workHours < 24) {
      const fullShifts = Math.floor(travelHours / workHours);
      const restTime = fullShifts * (24 - workHours);
      travelHours += restTime;
    }

    const arrivalTime = new Date(startTime.getTime() + travelHours * 60 * 60 * 1000);
    const formattedArrival = arrivalTime.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    let locksInfo = passedLocks.length > 0 ? "\n" + passedLocks.join("\n") : "";

    document.getElementById("result").innerHTML = `
🚢 <strong>Ожидаемое прибытие:</strong> ${formattedArrival}
⏳ <strong>Общая продолжительность:</strong> ${travelHours.toFixed(2)} ч
📍 <strong>Расстояние:</strong> ${distance} км${locksInfo}
    `;

    document.getElementById("desiredBlock").style.display = "block";
    document.getElementById("requiredSpeedResult").innerHTML = "";
  }

  function calculateRequiredSpeed() {
    const startKm = parseFloat(document.getElementById("startKm").value);
    const endKm = parseFloat(document.getElementById("endKm").value);
    const startTimeStr = document.getElementById("startTime").value;
    const desiredArrivalStr = document.getElementById("desiredArrivalTime").value;
    const workHours = parseFloat(document.getElementById("workHours").value);

    if (isNaN(startKm) || isNaN(endKm) || !startTimeStr || !desiredArrivalStr) {
      document.getElementById("requiredSpeedResult").innerHTML = "⚠️ Пожалуйста, заполните все поля корректно.";
      return;
    }

    const startTime = new Date(startTimeStr);
    const desiredArrival = new Date(desiredArrivalStr);

    if (isNaN(startTime.getTime()) || isNaN(desiredArrival.getTime())) {
      document.getElementById("requiredSpeedResult").innerHTML = "⚠️ Неверный формат времени.";
      return;
    }

    if (desiredArrival <= startTime) {
      document.getElementById("requiredSpeedResult").innerHTML = "⚠️ Желаемое время прибытия должно быть позже времени начала движения.";
      return;
    }

    const direction = endKm > startKm ? 1 : -1;
    const distance = Math.abs(endKm - startKm);

    // Рассчитаем общую задержку по шлюзам на маршруте
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

    // Рассчитаем общее доступное время в часах
    const totalAvailableMs = desiredArrival - startTime;
    let totalAvailableHours = totalAvailableMs / (1000 * 60 * 60);

    // Учёт рабочего графика (с перерывами)
    if (workHours < 24) {
      const cycles = Math.floor(totalAvailableHours / 24);
      const remainder = totalAvailableHours % 24;
      totalAvailableHours = cycles * workHours + Math.min(remainder, workHours);
    }

    // Вычитаем задержки по шлюзам
    const effectiveTravelHours = totalAvailableHours - totalLockDelay;

    if (effectiveTravelHours <= 0) {
      document.getElementById("requiredSpeedResult").innerHTML = "⚠️ Невозможно прибыть вовремя с учётом задержек.";
      return;
    }

    const requiredSpeed = distance / effectiveTravelHours;

    document.getElementById("requiredSpeedResult").innerHTML = `
🚀 <strong>Рекомендуемая скорость:</strong> ${requiredSpeed.toFixed(2)} км/ч
(учтены задержки шлюзов ⚓ и рабочий график)
    `;
  }

