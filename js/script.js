// Проверка offline и standalone
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

// Тема
const themeBtnHeader = document.getElementById("toggle-theme");
const themeSwitch = document.getElementById("toggle-theme-switch");

function toggleTheme() {
  document.body.classList.toggle("dark");
  const theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);

  if (themeBtnHeader) {
    themeBtnHeader.innerText = theme === "dark" ? "☀️" : "🌙";
  }
  if (themeSwitch) themeSwitch.checked = document.body.classList.contains("dark");
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

if (themeBtnHeader) {
  themeBtnHeader.addEventListener("click", toggleTheme);
}
if (themeSwitch) {
  themeSwitch.checked = document.body.classList.contains("dark");
  themeSwitch.addEventListener("change", toggleTheme);
}

// Форматирование числа
function formatNumber(n) {
  return (n % 1 === 0) ? n.toFixed(0) : n.toFixed(1);
}


// Массив зон ожидания вверх по течению
const waitingSectionsUpstream = [
  // Мохач - Будапешт
  { from: 1471.1, to: 1475.0, display: 1468.3 }, //1471.0
  { from: 1479.0, to: 1481.0, display: 1478.2 },
  { from: 1552.8, to: 1553.2, display: 1552.0 },
  { from: 1554.5, to: 1555.8, display: 1554.0 },
  { from: 1556.8, to: 1558.0, display: 1556.0 },
  { from: 1558.6, to: 1562.0, display: 1558.5 },
  { from: 1563.5, to: 1570.0, display: 1563.0 },
  { from: 1614.0, to: 1616.5, display: 1613.0 },
  { from: 1617.0, to: 1620.0, display: 1616.8 },
  // Будапешт - Братислава
  { from: 1674.0, to: 1675.4, display: 1674.7 },
  { from: 1695.2, to: 1695.7, display: 1694 },
  { from: 1696.4, to: 1696.7, display: 1696.0 },
  { from: 1700.1, to: 1701.2, display: 1699.5 },
  { from: 1710.1, to: 1712.1, display: 1710.0, restricted: true },
  { from: 1716.1, to: 1716.5, display: 1716.0 },
  { from: 1732.1, to: 1732.8, display: 1732.0 },
  { from: 1733.4, to: 1735.2, display: 1733.0, restricted: true },
  { from: 1781.9, to: 1782.1, display: 1781.5 },
  { from: 1784.0, to: 1784.5, display: 1783.7 },
  { from: 1785.0, to: 1785.4, display: 1784.7 },
  { from: 1786.3, to: 1786.7, display: 1786.1 },
  { from: 1787.2, to: 1788.7, display: 1786.8 },
  { from: 1790.7, to: 1792.0, display: 1790.0 },
  { from: 1793.2, to: 1794.0, display: 1792.5 },
  { from: 1794.5, to: 1795.9, display: 1794.2, restricted: true }, //1795.0
  { from: 1796.1, to: 1797.8, display: 1796.0, restricted: true },
  { from: 1798.4, to: 1799.5, display: 1798.0 },
  { from: 1800.1, to: 1800.7, display: 1800.0 },
  { from: 1801.0, to: 1801.9, display: 1800.8 },
  { from: 1802.5, to: 1803.5, display: 1802.0 },
  { from: 1807.0, to: 1808.0, display: 1805.0 },
  { from: 1863.5, to: 1864.5, display: 1863.0 },
  // Братислава - Вена
{ from: 1870.7, to: 1871.3, display: 1870.5 },
{ from: 1874.2, to: 1876.0, display: 1873.8 },
{ from: 1877.3, to: 1878.2, display: 1877.2 },
{ from: 1879.5, to: 1882.0, display: 1879.2 },
{ from: 1884.2, to: 1887, display: 1884.0, restricted: true },
{ from: 1890.0, to: 1891.0, display: 1889.8 },
{ from: 1895.2, to: 1896.0, display: 1895.0 },
{ from: 1901.9, to: 1903.1, display: 1901.7 },
{ from: 1907.2, to: 1908.6, display: 1906.0 },
{ from: 1909.5, to: 1910.0, display: 1909.2 },
  // Вена - Линц 
{ from: 1974.0, to: 1975.0, display: 1973.5 },
{ from: 1975.2, to: 1977.0, display: 1975.0 },
{ from: 1999.5, to: 2000.5, display: 1999.0 },
{ from: 2003.3, to: 2003.8, display: 2003.2 },
{ from: 2008.9, to: 2009.3, display: 2008.5 },
{ from: 2010.0, to: 2011.0, display: 2009.7 },
{ from: 2015.8, to: 2017.0, display: 2015.5 },
{ from: 2017.5, to: 2018.5, display: 2017.2 },
{ from: 2019.4, to: 2020.5, display: 2019.2 },
{ from: 2020.7, to: 2023.0, display: 2020.5 },
{ from: 2026.6, to: 2029.0, display: 2026.5 },
{ from: 2031.7, to: 2032.7, display: 2031.5 },
{ from: 2034.3, to: 2035.0, display: 2034.0 },
{ from: 2055.2, to: 2056.2, display: 2055.0 },
{ from: 2074.8, to: 2076.3, display: 2074.5 },
{ from: 2077.5, to: 2078.5, display: 2077.0 },
{ from: 2080.6, to: 2081.3, display: 2080.0 },
{ from: 2084.0, to: 2085.0, display: 2083.5 },
{ from: 2087.0, to: 2088.0, display: 2086.5 },
{ from: 2116.2, to: 2117.5, display: 2116.0 },
{ from: 2132.2, to: 2134.0, display: 2131.5 },
];

function findNearestWaitingZone(meetingKm) {
  for (let i = waitingSectionsUpstream.length - 1; i >= 0; i--) {
    if (waitingSectionsUpstream[i].from <= meetingKm && meetingKm <= waitingSectionsUpstream[i].to) {
      return waitingSectionsUpstream[i];
    }
  }
  return null;
}

// Создание блока расчета
function createBlock(index) {
  const block = document.createElement('div');
  block.className = 'block';

  // Получаем переводы из глобального объекта
  const translations = window.translations || {};
  const lang = window.lang || 'ru';
  const t = translations[lang] || {};
  
  const enemyLabel = t.enemyLabel ? t.enemyLabel.replace("{n}", index + 1) : `Встречное судно ${index + 1}`;
  const ourLabel = t.ourLabel || 'Наше судно';
  const posLabel = t.posLabel || "Позиция (км):";
  const speedLabel = t.speedLabel || "Скорость (км/ч):";
  const copyPosText = t.copyPos || "Скопировать позицию из 1 блока";
  const copySpeedText = t.copySpeed || "Скопировать скорость из 1 блока";
  const calcBtnText = t.calcBtn || "Рассчитать";
  const clearBtnText = t.clearBtn || "Очистить";
  const phStartKm = t.phStartKm || "Например, 1640";
  const phSpeed = t.phSpeed || "Например, 12";

  block.innerHTML = `
    <label>${enemyLabel}: ${posLabel}</label>
    <input type="number" id="enemy_pos_${index}" step="0.1" placeholder="${phStartKm}">
    
    <label>${enemyLabel}: ${speedLabel}</label>
    <input type="number" id="enemy_speed_${index}" step="0.1" placeholder="${phSpeed}">
    
    <label>${ourLabel}: ${posLabel}</label>
    <input type="number" id="our_pos_${index}" step="0.1" placeholder="${phStartKm}">
    ${index > 0 ? `<button type="button" class="btn-copy" onclick="copyOurPos(${index})">${copyPosText}</button>` : ''}
    
    <label>${ourLabel}: ${speedLabel}</label>
    <input type="number" id="our_speed_${index}" step="0.1" placeholder="${phSpeed}">
    ${index > 0 ? `<button type="button" class="btn-copy" onclick="copyOurSpeed(${index})">${copySpeedText}</button>` : ''}
    
    <div style="margin-top:10px;">
      <button class="calc-btn" onclick="calculate(${index})">${calcBtnText}</button>
      <button class="btn-clear" onclick="clearFields(${index})">${clearBtnText}</button>
    </div>
    <div class="output" id="result_${index}"></div>
  `;

  return block;
}

function calculate(index) {
  const ep = parseFloat(document.getElementById(`enemy_pos_${index}`).value);
  const es = parseFloat(document.getElementById(`enemy_speed_${index}`).value);
  const op = parseFloat(document.getElementById(`our_pos_${index}`).value);
  const os = parseFloat(document.getElementById(`our_speed_${index}`).value);
  const result = document.getElementById(`result_${index}`);

  // Проверяем существование элемента результата
  if (!result) {
    console.error('Элемент результата не найден для индекса:', index);
    return;
  }

  if (os <= 0.1 || os > 70 || es <= 0.1 || es > 70) {
    result.innerText = "⚠️ Скорость судов должна быть от 0.1 до 70 км/ч.";
    return;
  }

  if (isNaN(ep) || isNaN(es) || isNaN(op) || isNaN(os)) {
    result.innerText = "Пожалуйста, введите все данные.";
    return;
  }

  // Проверка на деление на ноль
  if (os + es === 0) {
    result.innerText = "Ошибка: суммарная скорость не может быть равна нулю.";
    return;
  }

  const meeting_km = (op * es + ep * os) / (os + es);
  const distance_to_meeting = Math.abs(meeting_km - op);
  const time_to_meeting = Math.abs(ep - op) / (os + es) * 60;

  // Получаем переводы из глобального объекта
  const translations = window.translations || {};
  const lang = window.lang || 'ru';
  const t = translations[lang] || {};
  
  let output = `
    <div>${t.meetingKm || '📍 Км встречи:'} <b>${formatNumber(meeting_km)}</b></div>
    <div>${t.distanceToMeeting || '📏 Расстояние до встречи (км):'} <b>${formatNumber(distance_to_meeting)}</b></div>
    <div>${t.timeToMeeting || '⏱️ Время до встречи (мин):'} <b>${formatNumber(time_to_meeting)}</b></div>
  `;

  const nearestZone = findNearestWaitingZone(meeting_km);
  if (nearestZone) {
    output += `<div>${t.waitingZone || '⚠️ Ближайшее место ожидания:'} <b>${nearestZone.display} км</b></div>`;
    if (nearestZone.restricted) {
      const restrictedText = t.restricted || '⛔ Расхождение и обгон запрещен с {from} по {to} км';
      output += `<div>${restrictedText.replace("{from}", nearestZone.from).replace("{to}", nearestZone.to)}</div>`;
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
  document.getElementById(`our_pos_${index}`).value = document.getElementById('our_pos_0').value;
}

function copyOurSpeed(index) {
  document.getElementById(`our_speed_${index}`).value = document.getElementById('our_speed_0').value;
}

// DOMContentLoaded один раз
document.addEventListener("DOMContentLoaded", () => {
  // Ждем загрузки переводов
  setTimeout(() => {
    const container = document.getElementById('blocks');
    for (let i = 0; i < 3; i++) container.appendChild(createBlock(i));

    // Применяем переводы к созданным блокам
    if (typeof updateMeetingBlocks === 'function') {
      updateMeetingBlocks();
    }

    const clearAllBtn = document.querySelector('.btn-clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        for (let i = 0; i < 3; i++) clearFields(i);
      });
    }
  }, 200);

  // Меню
  const menuToggleBtn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const navButtons = document.querySelectorAll('nav#sidebar button.nav-btn');
  const sections = document.querySelectorAll('main .section');

  // Восстанавливаем активную секцию
  const savedSection = localStorage.getItem('activeSection');
  if (savedSection) {
    const targetButton = document.querySelector(`[data-section="${savedSection}"]`);
    if (targetButton) {
      navButtons.forEach(b => b.classList.remove('active'));
      targetButton.classList.add('active');
      sections.forEach(sec => sec.id === savedSection ? sec.classList.add('active') : sec.classList.remove('active'));
    }
  }

  if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-section');
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sections.forEach(sec => sec.id === target ? sec.classList.add('active') : sec.classList.remove('active'));
      if (sidebar) sidebar.classList.remove('open');
      
      // Сохраняем активную секцию
      localStorage.setItem('activeSection', target);
    });
  });
});

// Перезагрузка при появлении интернета
window.addEventListener('online', () => location.reload());





















