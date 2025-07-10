// Применить сохранённую тему при загрузке
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

const themeBtnHeader = document.getElementById("toggle-theme");
if (themeBtnHeader) {
  themeBtnHeader.innerText = localStorage.getItem("theme") === "dark" ? "☀️" : "🌙";
}

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

function formatNumber(n) {
  return (n % 1 === 0) ? n.toFixed(0) : n.toFixed(1);
}

const waitingZonesUpstream = [
  { from: 1674, to: 1675.4, waitAt: 1674.7 },
  { from: 1693, to: 1695.8, waitAt: 1693 },
  { from: 1696.4, to: 1696.7, waitAt: 1696 },
  { from: 1700.1, to: 1701.2, waitAt: 1699.5 },
  { from: 1710.2, to: 1711.1, waitAt: 1710 },
  { from: 1716.1, to: 1716.5, waitAt: 1716 },
  { from: 1732.1, to: 1732.8, waitAt: 1732 },
  { from: 1733.5, to: 1735, waitAt: 1733, restricted: true },
  { from: 1781.9, to: 1782.1, waitAt: 1781.5 },
  { from: 1784, to: 1784.5, waitAt: 1783.7 },
  { from: 1785, to: 1785.4, waitAt: 1784.7 },
  { from: 1786.3, to: 1786.7, waitAt: 1786.1 },
  { from: 1787.2, to: 1788.7, waitAt: 1786.8 },
  { from: 1790.7, to: 1792, waitAt: 1790 },
  { from: 1793.2, to: 1794, waitAt: 1792.5 },
  { from: 1794.7, to: 1795.6, waitAt: 1794.5 },
  { from: 1796.4, to: 1797.4, waitAt: 1796 },
  { from: 1798.8, to: 1799.5, waitAt: 1798 },
  { from: 1801, to: 1801.7, waitAt: 1800 },
  { from: 1803, to: 1803.5, waitAt: 1802 },
  { from: 1807, to: 1808, waitAt: 1805 },
  { from: 1863.5, to: 1864.5, waitAt: 1863 },
];

function findWaitingZoneUpstream(km) {
  for (const zone of waitingZonesUpstream) {
    if (km >= zone.from && km <= zone.to) return zone;
  }
  return null;
}

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

  if (op < ep) {
    const zone = findWaitingZoneUpstream(meeting_km);
    if (zone) {
      output += `<div>📍 Ближайшее место ожидания: <b>${zone.waitAt} км</b></div>`;
      if (zone.restricted) {
        output += `<div>⚠️ Расхождение запрещено с ${zone.from} по ${zone.to} км</div>`;
      }
    }
  }

  result.innerHTML = output;
}
