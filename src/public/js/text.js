const statusEl = document.getElementById('status');
const executeIcon = document.querySelector('.fa-circle-down');
const beforeIcon = document.getElementById('day-before');
const afterIcon = document.getElementById('day-after');
const textDate = document.getElementById('text-date').textContent.trim();
let isAnalysisRunning = false;
let statusBlinkInterval;

function statusBlink(el, colourOff, colourOn) {
  el.style.color = colourOff;
  let on = false;

  statusBlinkInterval = setInterval(() => {
    if (on) {
      el.style.color = colourOff;
      on = false;
    } else {
      el.style.color = colourOn;
      on = true;
    }
  }, 300);
}

function clearStatusBlink(el) {
  clearInterval(statusBlinkInterval);
  el.style.color = '#fff';
}

const standardizeDate = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${year}/${month}/${day}`;
}

function jumpDate(isBefore) {
  const date = new Date(textDate);
  if (isBefore) date.setDate(date.getDate() - 1);
  else date.setDate(date.getDate() + 1);

  window.location.href = `/text?date=${standardizeDate(date)}`;
}

beforeIcon.addEventListener('click', () => jumpDate(true));
afterIcon.addEventListener('click', () => jumpDate(false));

document.getElementById('analyse-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const dateVal = urlParams.get('date');
  const date = dateVal ? dateVal : new Date();

  try {
    document.body.inert = true;
    isDebugRunning = true;
    statusBlink(executeIcon, '#fff', '#58acf1');
    statusEl.textContent = 'Getting Daily Text..';

    const res = await fetch(`/text/analyse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: date })
    });

    const data = await res.json();
    if (data.msg === 'Successfully analysed') window.location.reload();
    else statusEl.textContent = data.msg;

  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
  }

  isDebugRunning = false;
  clearStatusBlink(executeIcon);
  document.body.inert = false;
});