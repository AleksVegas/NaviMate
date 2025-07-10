// Применить сохранённую тему при загрузке
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

const themeBtnHeader = document.getElementById("toggle-theme");
if (themeBtnHeader) {
  themeBtnHeader.innerText = localStorage.getItem("theme") === "dark" ? "☀️" : "🌙";
}

// Управление меню
const menuToggleBtn = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const navButtons = document.querySelectorAll('nav#sidebar button.nav-btn');
const sections = document.querySelectorAll('main .section');

menuToggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

function toggleTheme() {
  document.body.classList.toggle("dark");
  const theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);

  const btnSettings = document.getElementById("toggle-theme-settings");
  if (btnSettings) {
    btnSettings.innerText = theme === "dark" ? "☀️ Светлая тема" : "🌙 Тёмная тема";
  }

  const btnHeader = document.getElementById("toggle-theme");
  if (btnHeader) {
    btnHeader.innerText = theme === "dark" ? "☀️" : "🌙";
  }
}

const savedTheme = localStorage.getItem("theme");
const btnSettings = document.getElementById("toggle-theme-settings");
if (btnSettings) {
  btnSettings.innerText = savedTheme === "dark" ? "☀️ Светлая тема" : "🌙 Тёмная тема";
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-section');
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sections.forEach(sec => {
      if (sec.id === target) sec.classList.add('active');
      else sec.classList.remove('active');
    });
    sidebar.classList.remove('open');
  });
});

// Форматирование чисел
function formatNumber(n) {
  return (n % 1 === 0) ? n.toFixed(0) : n.toFixed(1);
}

// Массив зон ожидания вверх по течению
const waitingSectionsUpstream = [
  { from: 1674.0, to: 1675.4, display: 1674.7 },
  { from: 1693.0, to: 1695.0, display: 1693.0 },
  { from: 1696.4, to: 1696.7, display: 1696.0 },
  { from: 1700.1, to: 1701.2, display: 1699.5 },
  { from: 1710.2, to: 1711.1, display: 1710.0 },
  { from: 1716.1, to: 1716.5, display: 1716.0 },
  { from: 1732.1, to: 1732.8, display: 1732.0 },
  { from: 1733.5, to: 1735.0, display: 1733.0, restricted: true },
  { from: 1781.9, to: 1782.1, display: 1781.5 },
  { from: 1784.0, to: 1784.5, display: 1783.7 },
  { from: 1785.0, to: 1785.4, display: 1784.7 },
  { from: 1786.3, to: 1786.7, display: 1786.1 },
  { from: 1787.2, to: 1788.7, display: 1786.8 },
  { from: 1790.7, to: 1792.0, display: 1790.0 },
  { from: 1793.2, to: 1794.0, display: 1792.5 },
  { from: 1794.7, to: 1795.6, display: 1794.5 },
  { from: 1796.4, to: 1797.4, display: 1796.0 },
  { from: 1798.8, to: 1799.5, display: 1798.0 },
  { from: 1801.0, to: 1801.7, display: 1800.0 },
  { from: 1803.0, to: 1803.5, display: 1802.0 },
  { from: 1807.0, to: 1808.0, display: 1805.0 },
  { from: 1863.5, to: 1864.5, display: 1863.0 },
];

function findNearestWaitingZone(meetingKm) {
  for (let i = waitingZonesUpstream.length - 1; i >= 0; i--) {
    if (waitingZonesUpstream[i].km <= meetingKm) {
      return waitingZonesUpstream[i];
    }
  }
  return null;
}

// Блок расчёта
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

// Основная функция расчёта
function calculate(index) {
  const ep = parseFloat(document.getElementById(`enemy_pos_${index}`).value);
  const es = parseFloat(document.getElementById(`enemy_speed_${index}`).value);
  const op = parseFloat(document.getElementById(`our_pos_${index}`).value);
  const os = parseFloat(document.getElementById(`our_speed_${index}`).value);
  const result = document.getElementById(`result_${index}`);

  if (os <= 0 || os > 50 || es <= 0 || es > 50) {
    result.innerText = "⚠️ Скорость судов должна быть от 0.1 до 50 км/ч.";
    return;
  }

  if (isNaN(ep) || isNaN(es) || isNaN(op) || isNaN(os)) {
    result.innerText = "Пожалуйста, введите все данные.";
    return;
  }

  if (es + os === 0) {
    result.innerText = "Суммарная скорость не может быть равна нулю.";
    return;
  }

  const meeting_km = (op * es + ep * os) / (os + es);
  const distance_to_meeting = Math.abs(meeting_km - op);
  const time_to_meeting = Math.abs(ep - op) / (os + es) * 60;

  let output = `
    <div>📍 Км встречи: <b>${formatNumber(meeting_km)}</b></div>
    <div>📏 Расстояние до встречи (км): <b>${formatNumber(distance_to_meeting)}</b></div>
    <div>⏱️ Время до встречи (мин): <b>${formatNumber(time_to_meeting)}</b></div>
  `;

  // Проверка направления и поиск места ожидания
if (op < ep) {
  const section = waitingSectionsUpstream.find(s => meeting_km >= s.from && meeting_km <= s.to);
  if (section) {
    output += `<div>⚠️ Ближайшее место ожидания: <b>${section.display} км</b></div>`;
    if (section.restricted) {
      output += `<div>⛔ Расхождение запрещено с ${section.from} по ${section.to} км</div>`;
    }
  }
}

  result.innerHTML = output;
}

function clearFields(index) {
  document.getElementById(`enemy_pos_${index}`).value = '';
  document.getElementById(`enemy_speed_${index}`).value = '';
  document.getElementById(`our_pos_${index}`).value = '';
  document.getElementById(`our_speed_${index}`).value = '';
  document.getElementById(`result_${index}`).innerText = '';
}

function copyOurPos(index) {
  const pos = document.getElementById('our_pos_0').value;
  document.getElementById(`our_pos_${index}`).value = pos;
}

function copyOurSpeed(index) {
  const speed = document.getElementById('our_speed_0').value;
  document.getElementById(`our_speed_${index}`).value = speed;
}

const container = document.getElementById('blocks');
for (let i = 0; i < 3; i++) {
  container.appendChild(createBlock(i));
}

document.querySelector('.btn-clear-all').addEventListener('click', () => {
  for (let i = 0; i < 3; i++) clearFields(i);
});

window.addEventListener('online', () => {
  console.log('Интернет появился, обновляем страницу');
  location.reload();
});

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

document.getElementById("toggle-theme").addEventListener("click", toggleTheme);
const themeBtnSettings = document.getElementById("toggle-theme-settings");
if (themeBtnSettings) {
  themeBtnSettings.addEventListener("click", toggleTheme);
}

const themeSwitch = document.getElementById("toggle-theme-switch");
if (themeSwitch) {
  themeSwitch.checked = localStorage.getItem("theme") === "dark";
  themeSwitch.addEventListener("change", () => {
    toggleTheme();
  });
}
