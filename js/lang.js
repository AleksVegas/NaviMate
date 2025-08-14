const lang = {
  ru: {
    calcSectionTitle: "Расчёт встречи судов",
    arrivalCalcTitle: "Расчёт времени прибытия",
    startKm: "Начальный километр (км):",
    endKm: "Конечный километр (км):",
    speed: "Скорость (км/ч):",
    startTime: "Время начала движения:",
    workHours: "Длительность рабочего дня (часов):",
    calcBtn: "Рассчитать время прибытия",
    requiredSpeedBtn: "Рассчитать необходимую скорость 🚀",
    resultArrival: "⚠️ Пожалуйста, заполните все поля корректно.",
    invalidTime: "⚠️ Неверный формат времени.",
    arrivalTooEarly: "⚠️ Желаемое время прибытия должно быть позже времени начала движения.",
    tooSlow: "⚠️ Требуемая скорость слишком мала. Проверьте данные.",
    tooFast: "⚠️ Требуемая скорость слишком велика. Невозможно прибыть вовремя.",
    expectedArrival: "🚢 <strong>Ожидаемое прибытие:</strong>",
    totalDuration: "⏳ <strong>Общая продолжительность:</strong>",
    distance: "📍 <strong>Расстояние:</strong>",
    borderDelays: "🛃 Пограничные задержки:",
    lockDelay: "⚓ Учтён шлюз",
    hours: "ч"
  },
  en: {
    calcSectionTitle: "Ship Meeting Calculation",
    arrivalCalcTitle: "Arrival Time Calculation",
    startKm: "Start kilometer (km):",
    endKm: "End kilometer (km):",
    speed: "Speed (km/h):",
    startTime: "Start time:",
    workHours: "Workday duration (hours):",
    calcBtn: "Calculate arrival time",
    requiredSpeedBtn: "Calculate required speed 🚀",
    resultArrival: "⚠️ Please fill in all fields correctly.",
    invalidTime: "⚠️ Invalid time format.",
    arrivalTooEarly: "⚠️ Desired arrival time must be after start time.",
    tooSlow: "⚠️ Required speed too low. Check your data.",
    tooFast: "⚠️ Required speed too high. Cannot arrive on time.",
    expectedArrival: "🚢 <strong>Expected arrival:</strong>",
    totalDuration: "⏳ <strong>Total duration:</strong>",
    distance: "📍 <strong>Distance:</strong>",
    borderDelays: "🛃 Border delays:",
    lockDelay: "⚓ Lock accounted",
    hours: "h"
  }
};

// Текущий язык по умолчанию
let currentLang = 'ru';
