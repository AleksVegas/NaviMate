// Управление меню
const menuToggleBtn = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const navButtons = document.querySelectorAll('nav#sidebar button.nav-btn');
const sections = document.querySelectorAll('main .section');

menuToggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Переключение разделов
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-section');

    // Активная кнопка
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Показать секцию
    sections.forEach(sec => {
      if (sec.id === target) sec.classList.add('active');
      else sec.classList.remove('active');
    });

    // Закрыть меню (если мобильный)
    sidebar.classList.remove('open');
  });
});

// --- Вспомогательная функция форматирования чисел ---
function formatNumber(n) {
  return (n % 1 === 0) ? n.toFixed(0) : n.toFixed(1);
}

// Создаёт блок с формой для ввода данных судов
function createBlock(index) {
  const block = document.createElement('div');
  block.className = 'block';

  const enemyLabel = `Встречное судно ${index + 1}`;
  const ourLabel = 'Наше судно';

  block.innerHTML = `
    <label>${enemyLabel}: Позиция (км):</label>
    <input type="number" id="enemy_pos_${index}" step="0.1" placeholder="например: 2025">

    <label>${enemyLabel}: Скорость (км/ч):</label>
    <input type="number" id="enemy_speed_${index}" step="0.1" placeholder="например: 20.5">

    <label>${ourLabel}: Позиция (км):</label>
    <input type="number" id="our_pos_${index}" step="0.1" placeholder="например: 2008">
    ${index > 0 ? `<button type="button" class="btn-copy" onclick="copyOurPos(${index})">Скопировать позицию из 1 блока</button>` : ''}

    <label>${ourLabel}: Скорость (км/ч):</label>
    <input type="number" id="our_speed_${index}" step="0.1" placeholder="например: 12">
    ${index > 0 ? `<button type="button" class="btn-copy" onclick="copyOurSpeed(${index})">Скопировать скорость из 1 блока</button>` : ''}

    <div style="margin-top: 10px;">
      <button class="calc-btn" onclick="calculate(${index})">Рассчитать</button>
      <button class="btn-clear" onclick="clearFields(${index})" type="button">Очистить</button>
    </div>

    <div class="output" id="result_${index}"></div>
  `;

  return block;
}

// Основная функция расчёта встречи судов
function calculate(index) {
  const ep = parseFloat(document.getElementById(`enemy_pos_${index}`).value);
  const es = parseFloat(document.getElementById(`enemy_speed_${index}`).value);
  const op = parseFloat(document.getElementById(`our_pos_${index}`).value);
  const os = parseFloat(document.getElementById(`our_speed_${index}`).value);

  // Проверка на допустимые значения скорости
if (os <= 0 || os > 50 || es <= 0 || es > 50) {
  result.innerText = "⚠️ Скорость судов должна быть от 0.1 до 50 км/ч.";
  return;
}

  const result = document.getElementById(`result_${index}`);

  if (isNaN(ep) || isNaN(es) || isNaN(op) || isNaN(os)) {
    result.innerText = "Пожалуйста, введите все данные.";
    return;
  }

  if (es + os === 0) {
    result.innerText = "Суммарная скорость не может быть равна нулю.";
    return;
  }

  // Расчёт километра встречи
  const meeting_km = (op * es + ep * os) / (os + es);
  const distance_to_meeting = Math.abs(meeting_km - op);
  const time_to_meeting = Math.abs(ep - op) / (os + es) * 60; // минуты

  result.innerHTML = `
    <div>📍 Км встречи: <b>${formatNumber(meeting_km)}</b></div>
    <div>📏 Расстояние до встречи (км): <b>${formatNumber(distance_to_meeting)}</b></div>
    <div>⏱️ Время до встречи (мин): <b>${formatNumber(time_to_meeting)}</b></div>
  `;
}

// Очистка полей и результатов для конкретного блока
function clearFields(index) {
  document.getElementById(`enemy_pos_${index}`).value = '';
  document.getElementById(`enemy_speed_${index}`).value = '';
  document.getElementById(`our_pos_${index}`).value = '';
  document.getElementById(`our_speed_${index}`).value = '';
  document.getElementById(`result_${index}`).innerText = '';
}

// Копирование позиции нашего судна из первого блока в другие
function copyOurPos(index) {
  const pos = document.getElementById('our_pos_0').value;
  document.getElementById(`our_pos_${index}`).value = pos;
}

// Копирование скорости нашего судна из первого блока в другие
function copyOurSpeed(index) {
  const speed = document.getElementById('our_speed_0').value;
  document.getElementById(`our_speed_${index}`).value = speed;
}

// Инициализация: создаём 3 блока и навешиваем обработчик на кнопку очистки всего
const container = document.getElementById('blocks');
for (let i = 0; i < 3; i++) {
  container.appendChild(createBlock(i));
}

document.querySelector('.btn-clear-all').addEventListener('click', () => {
  for (let i = 0; i < 3; i++) clearFields(i);
});

// Уведомление о наличии интернета 
window.addEventListener('online', () => {
  console.log('Интернет появился, обновляем страницу');
  location.reload();
});

//отслеживание интернета и показ уведомления 
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

function showOfflineNotice() {
  const banner = document.createElement('div');
  banner.textContent = '⚠️ Связь с цивилизацией потеряна. Некоторые функции могут быть недоступны.';
  banner.style.position = 'fixed';
  banner.style.bottom = '0';
  banner.style.left = '0';
  banner.style.right = '0';
  banner.style.backgroundColor = '#d9534f';
  banner.style.color = 'white';
  banner.style.padding = '10px';
  banner.style.textAlign = 'center';
  banner.style.zIndex = '10000';
  document.body.appendChild(banner);
}

if (!navigator.onLine && !isStandalone()) {
  showOfflineNotice();
}

document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  // Можно сохранять в localStorage
});
