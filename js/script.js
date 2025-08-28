// Offline banner is handled in index.html via #offline-banner

// Тема и язык
const themeBtnHeader = document.getElementById("toggle-theme");
const themeSwitch = document.getElementById("toggle-theme-switch");
const headerLanguageSelect = document.getElementById("header-language-select");
const themeAuto = document.getElementById('theme-auto');

function toggleTheme() {
  document.body.classList.toggle("dark");
  document.documentElement.classList.toggle("dark");
  const theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);

  // Обновляем кнопку в header
  if (themeBtnHeader) {
    themeBtnHeader.innerText = theme === "dark" ? "☀️" : "🌙";
  }
  
  // Обновляем переключатель в настройках
  if (themeSwitch) {
    themeSwitch.value = document.body.classList.contains("dark") ? "dark" : "light";
  }
}

function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  if (themeBtnHeader) themeBtnHeader.innerText = isDark ? '☀️' : '🌙';
  if (themeSwitch) themeSwitch.value = isDark ? 'dark' : 'light';
}

function computeAutoTheme() {
  const now = new Date();
  const h = now.getHours();
  const autoDark = !(h >= 7 && h < 20); // с 20:00 до 06:59 — тёмная
  return autoDark;
}

function initTheme() {
  const auto = localStorage.getItem('theme_auto') === '1';
  if (themeAuto) themeAuto.checked = auto;

  if (auto) {
    const isDark = computeAutoTheme();
    applyTheme(isDark);
  } else {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') applyTheme(true);
    else if (stored === 'light') applyTheme(false);
    else applyTheme(false);
  }
}

if (localStorage.getItem("theme") === "dark") {
  // класс уже установлен ранним скриптом; ничего не меняем тут
  document.body.classList.add("dark");
  document.documentElement.classList.add("dark");
}

// Обновляем кнопку темы и переключатель при инициализации
if (themeBtnHeader) {
  const isDark = document.body.classList.contains("dark");
  themeBtnHeader.innerText = isDark ? "☀️" : "🌙";
}
if (themeSwitch) {
  const isDark = document.body.classList.contains("dark");
  themeSwitch.value = isDark ? "dark" : "light";
}

if (themeBtnHeader) {
  themeBtnHeader.addEventListener("click", toggleTheme);
}
if (themeSwitch) {
  themeSwitch.value = document.body.classList.contains("dark") ? "dark" : "light";
  themeSwitch.addEventListener("change", () => {
    const isDark = themeSwitch.value === "dark";
    if (isDark !== document.body.classList.contains("dark")) {
      toggleTheme();
    }
  });
}

if (themeAuto) {
  themeAuto.addEventListener('change', () => {
    const auto = themeAuto.checked;
    localStorage.setItem('theme_auto', auto ? '1' : '0');
    if (auto) {
      applyTheme(computeAutoTheme());
    }
  });
}

if (themeSwitch) {
  themeSwitch.addEventListener('change', () => {
    const isDark = themeSwitch.value === 'dark';
    localStorage.setItem('theme_auto', '0'); // ручной выбор отменяет авто
    applyTheme(isDark);
  });
}

// Функция переключения языка
function changeLanguage(newLang) {
  if (typeof setLanguage === 'function') {
    setLanguage(newLang);
  }
  
  // Обновляем селекторы языка
  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.value = newLang;
  }
  if (headerLanguageSelect) {
    headerLanguageSelect.value = newLang;
  }
}

if (headerLanguageSelect) {
  // Устанавливаем начальное состояние
  const currentLang = window.lang || 'ru';
  headerLanguageSelect.value = currentLang;
  headerLanguageSelect.addEventListener("change", (e) => {
    changeLanguage(e.target.value);
  });
}

// Форматирование числа
function formatNumber(n) {
  return (n % 1 === 0) ? n.toFixed(0) : n.toFixed(1);
}


// Массив зон ожидания вверх по течению
const waitingSectionsUpstream = [
// Велико-Градиште - Мохач
  { from: 1196.5, to: 1202.0, display: 1196.0, restricted: true, side: 'left' },
  { from: 1227.5, to: 1231.0, display: 1227.0, side: 'left' },
  { from: 1244.0, to: 1248.0, display: 1243.5, side: 'right' },
  { from: 1254.0, to: 1256.9, display: 1253.0, restricted: true, side: 'left' },
  { from: 1264.5, to: 1268.0, display: 1264.0, side: 'left' },
  { from: 1281.2, to: 1282.5, display: 1281.0, side: 'right' },
  { from: 1283.0, to: 1285.0, display: 1282.7, side: 'right' },
  { from: 1307.0, to: 1311.9, display: 1307.0, restricted: true, side: 'right' },
  { from: 1336.5, to: 1340.0, display: 1336.0, side: 'right' },
  { from: 1354.0, to: 1356.2, display: 1353.0, side: 'right' },
  { from: 1364.5, to: 1368.5, display: 1363.0, side: 'left' },
  { from: 1370.1, to: 1372.0, display: 1370.0, side: 'left' },
  { from: 1372.5, to: 1377.0, display: 1372.2, side: 'right' },
  { from: 1385.5, to: 1387.5, display: 1385.0, side: 'right' },
  { from: 1389.0, to: 1390.9, display: 1388.0, side: 'right' },
  { from: 1392.0, to: 1393.9, display: 1391.0, side: 'right' }, // только для одиночных судов
  { from: 1394.5, to: 1396.9, display: 1394.0, side: 'right' },
  { from: 1398.8, to: 1401.7, display: 1398.5, side: 'left' },
  { from: 1402.0, to: 1403.0, display: 1401.8, side: 'left' },
  { from: 1416.5, to: 1421.0, display: 1416.0, side: 'left' },
  { from: 1423.5, to: 1425.5, display: 1423.0, side: 'right' },
  { from: 1427.5, to: 1430.5, display: 1427.0, side: 'left' },
  // Мохач - Будапешт
  { from: 1471.1, to: 1475.0, display: 1468.3, side: 'left' },
  { from: 1479.0, to: 1481.0, display: 1478.2, side: 'left' },
  { from: 1552.8, to: 1553.2, display: 1552.0, side: 'left' },
  { from: 1554.5, to: 1555.8, display: 1554.0, side: 'left' },
  { from: 1556.8, to: 1558.0, display: 1556.0, side: 'left' },
  { from: 1558.6, to: 1562.0, display: 1558.5, side: 'left' },
  { from: 1563.5, to: 1570.0, display: 1563.0, side: 'right' },
  { from: 1614.0, to: 1616.5, display: 1613.0, side: 'right' },
  { from: 1617.0, to: 1620.0, display: 1616.8, side: 'right' },
  { from: 1635.0, to: 1639.0, display: 1634.5, side: 'left' },
  // Будапешт - Братислава
  { from: 1669.5, to: 1672.0, display: 1669.0, side: 'right' },
  { from: 1674.0, to: 1675.4, display: 1674.7, side: 'left' },
  { from: 1678.0, to: 1680.5, display: 1677.5, side: 'right' },
  { from: 1695.0, to: 1695.7, display: 1694, side: 'left' },
  { from: 1696.2, to: 1697.2, display: 1696.0, side: 'right' },
  { from: 1697.7, to: 1699.0, display: 1697.5, side: 'right' }, //для одиночных
  { from: 1700.1, to: 1701.2, display: 1699.5, side: 'right' },
  { from: 1710.1, to: 1712.1, display: 1710.0, restricted: true, side: 'left' },
  { from: 1716.1, to: 1719.0, display: 1716.0, side: 'right' },
  { from: 1732.1, to: 1732.8, display: 1732.0, side: 'right' },
  { from: 1733.4, to: 1735.2, display: 1733.0, restricted: true, side: 'left' },
  { from: 1781.8, to: 1782.5, display: 1781.5, side: 'right' },
  { from: 1784.0, to: 1784.5, display: 1783.7, side: 'left' },
  { from: 1785.0, to: 1785.4, display: 1784.7, side: 'left' },
  { from: 1786.5, to: 1786.7, display: 1786.1, side: 'right' },
  { from: 1787.2, to: 1789.0, display: 1786.8, side: 'left' },
  { from: 1790.7, to: 1792.0, display: 1790.0, side: 'right' },
  { from: 1793.2, to: 1794.0, display: 1792.5, side: 'left' },
  { from: 1794.5, to: 1795.9, display: 1794.2, restricted: true, side: 'right' }, 
  { from: 1796.1, to: 1797.8, display: 1796.0, restricted: true, side: 'left' },
  { from: 1798.4, to: 1799.6, display: 1798.0, side: 'left' },
  { from: 1800.1, to: 1800.7, display: 1800.0, side: 'right' },
  { from: 1801.0, to: 1801.9, display: 1800.8, side: 'right' },
  { from: 1802.5, to: 1803.5, display: 1802.0, side: 'left' },
  { from: 1807.0, to: 1808.0, display: 1805.0, side: 'right' },
  { from: 1863.5, to: 1864.5, display: 1863.0, side: 'right' },
  // Братислава - Вена
  { from: 1870.7, to: 1871.3, display: 1870.5, side: 'right' },
  { from: 1872.7, to: 1873.5, display: 1872.5, side: 'left' },
  { from: 1874.2, to: 1876.0, display: 1873.8, side: 'right' },
  { from: 1877.3, to: 1878.2, display: 1877.2, side: 'left' },
  { from: 1879.5, to: 1882.0, display: 1879.0, side: 'right' },
  { from: 1884.1, to: 1887, display: 1884.0, restricted: true, side: 'right' },
  { from: 1890.0, to: 1891.0, display: 1889.7, side: 'right' },
  { from: 1895.2, to: 1897.0, display: 1895.0, side: 'right' },
  { from: 1901.9, to: 1903.1, display: 1901.7, side: 'left' },
  { from: 1907.2, to: 1908.6, display: 1906.0, side: 'left' },
  { from: 1909.5, to: 1910.0, display: 1909.2, side: 'left' },
  { from: 1914.0, to: 1914.7, display: 1913.0, side: 'left' },
  { from: 1915.2, to: 1916.0, display: 1915.0, side: 'right' },
  // Вена - Линц 
  { from: 1938.2, to: 1939.0, display: 1938.0, side: 'right' },
  { from: 1942.2, to: 1943.5, display: 1942.0, side: 'left' },
  { from: 1971.5, to: 1973.0, display: 1971.0, side: 'left' },
  { from: 1974.0, to: 1974.9, display: 1973.5, side: 'left' },
  { from: 1975.2, to: 1977.0, display: 1975.0, side: 'right' },
  { from: 1999.5, to: 2000.5, display: 1999.0, side: 'left' },
  { from: 2003.3, to: 2004.3, display: 2003.2, side: 'left' },
  { from: 2008.9, to: 2009.5, display: 2008.8, side: 'right' },
  { from: 2010.0, to: 2011.5, display: 2009.7, side: 'left' },
  { from: 2015.8, to: 2017.0, display: 2015.5, side: 'left' },
  { from: 2017.5, to: 2018.5, display: 2017.2, side: 'left' },
  { from: 2019.4, to: 2020.5, display: 2019.2, side: 'left' },
  { from: 2020.7, to: 2021.5, display: 2020.6, side: 'left' },
  { from: 2021.6, to: 2023.0, display: 2021.5, side: 'left' },
  { from: 2025.0, to: 2026.0, display: 2024.6, side: 'right' },
  { from: 2026.6, to: 2029.0, display: 2026.3, side: 'left' },
  { from: 2031.6, to: 2032.7, display: 2031.5, side: 'left' },
  { from: 2034.0, to: 2035.0, display: 2033.8, side: 'left' },
  { from: 2055.2, to: 2056.2, display: 2055.0, side: 'left' },
  { from: 2074.8, to: 2076.3, display: 2074.5, side: 'left' },
  { from: 2077.5, to: 2078.5, display: 2077.0 },
  { from: 2080.4, to: 2081.5, display: 2080.0, side: 'left' },
  { from: 2084.0, to: 2085.0, display: 2083.5, side: 'right' },
  { from: 2087.0, to: 2088.0, display: 2086.5, side: 'right' },
  { from: 2116.2, to: 2117.5, display: 2116.0, side: 'left' },
  { from: 2132.2, to: 2134.0, display: 2131.5, side: 'right' },
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
  const phEnemyPos = t.phEnemyPos || "например: 2025";
  const phEnemySpeed = t.phEnemySpeed || "например: 25";
  const phOurPos = t.phOurPos || "например: 2008";
  const phOurSpeed = t.phOurSpeed || "например: 12";

  block.innerHTML = `
    <label>${enemyLabel}: ${posLabel}</label>
    <input type="number" id="enemy_pos_${index}" step="0.1" placeholder="${phEnemyPos}" min="0" max="3000">
    
    <label>${enemyLabel}: ${speedLabel}</label>
    <input type="number" id="enemy_speed_${index}" step="0.1" placeholder="${phEnemySpeed}" min="0.1" max="70">
    
    <label>${ourLabel}: ${posLabel}</label>
    <input type="number" id="our_pos_${index}" step="0.1" placeholder="${phOurPos}" min="0" max="3000">
    ${index > 0 ? `<button type="button" class="btn-copy" onclick="copyOurPos(${index})">${copyPosText}</button>` : ''}
    
    <label>${ourLabel}: ${speedLabel}</label>
    <input type="number" id="our_speed_${index}" step="0.1" placeholder="${phOurSpeed}" min="0.1" max="70">
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
    return;
  }

  if (os <= 0.1 || os > 70 || es <= 0.1 || es > 70) {
    result.innerText = "⚠️ Скорость судов должна быть от 0.1 до 70 км/ч.";
    return;
  }

  if (ep < 0 || ep > 3000 || op < 0 || op > 3000) {
    result.innerText = "⚠️ Километры должны быть от 0 до 3000 км.";
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
  const time_to_meeting = Math.abs(ep - op) / (os + es); // в часах

  // Получаем переводы из глобального объекта
  const translations = window.translations || {};
  const lang = window.lang || 'ru';
  const t = translations[lang] || {};
  
  let output = `
    <div><b>${t.meetingKm || '📍 Км встречи:'}</b> <b>${formatNumber(meeting_km)}</b></div>
    <div><b>${t.distanceToMeeting || '📏 Расстояние до встречи (км):'}</b> <b>${formatNumber(distance_to_meeting)}</b></div>
    <div><b>${t.timeToMeeting || '⏱️ Время до встречи (ч):'}</b> <b>${formatNumber(time_to_meeting)}</b></div>
  `;

  const nearestZone = findNearestWaitingZone(meeting_km);
  if (nearestZone) {
    const kmUnit = t.kmUnit || (lang === 'en' ? ' km' : ' км');
    let waitingZoneText = `<b>${t.waitingZone || '⚠️ Ближайшее место ожидания:'}</b> <b>${nearestZone.display}</b> ${kmUnit}`;
    
    // Добавляем информацию о борте если есть
    if (nearestZone.side) {
      const sideIcon = nearestZone.side === 'left' ? '⬅️' : '➡️';
      const sideText = nearestZone.side === 'left' ? t.leftSide : t.rightSide;
      
      if (nearestZone.side === 'left') {
        // Левый борт: красный цвет, стрелка ПЕРЕД названием
        const leftColor = document.body.classList.contains('dark') ? '#ff6b6b' : '#d63031';
        waitingZoneText += ` | <span style="color: ${leftColor}; font-weight: 600; font-size: 1.1em;">${sideIcon} ${sideText}${nearestZone.solo ? ` • ${t.soloOnly}` : ''}</span>`;
      } else {
        // Правый борт: зеленый цвет, стрелка ПОСЛЕ названия
        const rightColor = document.body.classList.contains('dark') ? '#4CAF50' : '#16a085';
        waitingZoneText += ` | <span style="color: ${rightColor}; font-weight: 600; font-size: 1.1em;">${sideText}${nearestZone.solo ? ` • ${t.soloOnly}` : ''} ${sideIcon}</span>`;
      }
    }
    
    output += `<div>${waitingZoneText}</div>`;
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
  
  // Очищаем localStorage для этого блока
  ['enemy_pos_','enemy_speed_','our_pos_','our_speed_'].forEach(prefix => {
    localStorage.removeItem('meet_' + prefix + index);
  });
}

function copyOurPos(index) {
  document.getElementById(`our_pos_${index}`).value = document.getElementById('our_pos_0').value;
}

function copyOurSpeed(index) {
  document.getElementById(`our_speed_${index}`).value = document.getElementById('our_speed_0').value;
}

function saveMeetingInputs(index) {
  const ids = [`enemy_pos_${index}`,`enemy_speed_${index}`,`our_pos_${index}`,`our_speed_${index}`];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) localStorage.setItem('meet_' + id, el.value);
  });
}

function restoreMeetingInputs(index) {
  const ids = [`enemy_pos_${index}`,`enemy_speed_${index}`,`our_pos_${index}`,`our_speed_${index}`];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const v = localStorage.getItem('meet_' + id);
      if (v !== null) el.value = v;
    }
  });
}

// DOMContentLoaded один раз
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('blocks');
  if (container) container.style.visibility = 'hidden';

  const translations = window.translations || {};
  const lang = window.lang || 'ru';
  const t = translations[lang] || {};

  for (let i = 0; i < 3; i++) {
    const block = createBlock(i);
    container.appendChild(block);
    restoreMeetingInputs(i);
  }

  // Attach input save listeners (event delegation)
  container.addEventListener('input', (e) => {
    const id = e.target && e.target.id;
    if (!id) return;
    const m = id.match(/^(enemy_pos_|enemy_speed_|our_pos_|our_speed_)(\d+)$/);
    if (m) {
      localStorage.setItem('meet_' + id, e.target.value);
      
      // Автоперерасчет только если уже был расчет
      const index = parseInt(m[2]);
      const resultDiv = document.getElementById(`result_${index}`);
      if (resultDiv && resultDiv.innerHTML.trim() !== '') {
        calculate(index);
      }
    }
  });

  if (container) container.style.visibility = 'visible';

  // Применяем переводы к созданным блокам
  if (typeof updateMeetingBlocks === 'function') {
    updateMeetingBlocks();
  }

  const clearAllBtn = document.querySelector('.btn-clear-all');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      for (let i = 0; i < 3; i++) clearFields(i);
      // clear storage
      for (let i = 0; i < 3; i++) {
        ['enemy_pos_','enemy_speed_','our_pos_','our_speed_'].forEach(p => {
          localStorage.removeItem('meet_' + p + i);
        });
      }
    });
  }

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

  // Выполнить инициализацию темы после загрузки DOM
  initTheme();
});

// Перезагрузка при появлении интернета
window.addEventListener('online', () => location.reload());























