// main.js — исправленная версия с поддержкой ближайших мест ожидания и запретов

// Применить сохранённую тему при загрузке 
if (localStorage.getItem("theme") === "dark") { document.body.classList.add("dark"); }

const themeBtnHeader = document.getElementById("toggle-theme"); if (themeBtnHeader) { themeBtnHeader.innerText = localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"; }

// --- Места ожидания вверх по течению --- 
const waitingPlacesUpstream = [ { km: 1674.7 }, { km: 1693 }, { km: 1696 }, { km: 1699.5 }, { km: 1710 }, { km: 1716 }, { km: 1732 }, { km: 1733, restricted: true, restrictedFrom: 1733.5, restrictedTo: 1735 }, { km: 1781.5 }, { km: 1783.7 }, { km: 1784.7 }, { km: 1786.1 }, { km: 1786.8 }, { km: 1790 }, { km: 1792.5 }, { km: 1794.5 }, { km: 1796 }, { km: 1798 }, { km: 1800 }, { km: 1802 }, { km: 1805 }, { km: 1863 } ];

function findNearestWaitingPlaceUpstream(km) { for (let i = waitingPlacesUpstream.length - 1; i >= 0; i--) { if (waitingPlacesUpstream[i].km <= km) return waitingPlacesUpstream[i]; } return null; }

function formatNumber(n) { return (n % 1 === 0) ? n.toFixed(0) : n.toFixed(1); }

function createBlock(index) { const block = document.createElement('div'); block.className = 'block';

const enemyLabel = Встречное судно ${index + 1}; const ourLabel = 'Наше судно';

block.innerHTML = ` <label>${enemyLabel}: Позиция (км):</label> <input type="number" id="enemy_pos_${index}" step="0.1" placeholder="например: 2025">

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

return block; }

function calculate(index) { const ep = parseFloat(document.getElementById(enemy_pos_${index}).value); const es = parseFloat(document.getElementById(enemy_speed_${index}).value); const op = parseFloat(document.getElementById(our_pos_${index}).value); const os = parseFloat(document.getElementById(our_speed_${index}).value);

const result = document.getElementById(result_${index});

if (os <= 0 || os > 50 || es <= 0 || es > 50) { result.innerText = "⚠️ Скорость судов должна быть от 0.1 до 50 км/ч."; return; }

if (isNaN(ep) || isNaN(es) || isNaN(op) || isNaN(os)) { result.innerText = "Пожалуйста, введите все данные."; return; }

const meeting_km = (op * es + ep * os) / (os + es); const distance_to_meeting = Math.abs(meeting_km - op); const time_to_meeting = Math.abs(ep - op) / (os + es) * 60;

let output = <div>📍 Км встречи: <b>${formatNumber(meeting_km)}</b></div> <div>📏 Расстояние до встречи (км): <b>${formatNumber(distance_to_meeting)}</b></div> <div>⏱️ Время до встречи (мин): <b>${formatNumber(time_to_meeting)}</b></div>;

if (op < ep) { const nearest = findNearestWaitingPlaceUpstream(meeting_km); if (nearest) { output += <div>📍 Ближайшее место ожидания: <b>${formatNumber(nearest.km)} км</b></div>; if (nearest.restricted) { output += <div>⚠️ На участке с ${nearest.restrictedFrom} по ${nearest.restrictedTo} км расход запрещён</div>; } } }

result.innerHTML = output; }

function clearFields(index) { document.getElementById(enemy_pos_${index}).value = ''; document.getElementById(enemy_speed_${index}).value = ''; document.getElementById(our_pos_${index}).value = ''; document.getElementById(our_speed_${index}).value = ''; document.getElementById(result_${index}).innerText = ''; }

function copyOurPos(index) { const pos = document.getElementById('our_pos_0').value; document.getElementById(our_pos_${index}).value = pos; }

function copyOurSpeed(index) { const speed = document.getElementById('our_speed_0').value; document.getElementById(our_speed_${index}).value = speed; }

//Инициализация 
                                                                                        const container = document.getElementById('blocks'); for (let i = 0; i < 3; i++) { container.appendChild(createBlock(i)); }

document.querySelector('.btn-clear-all').addEventListener('click', () => { for (let i = 0; i < 3; i++) clearFields(i); });

