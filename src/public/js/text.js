// const statusEl = document.getElementById('status');
// const executeIcon = document.querySelector('.fa-circle-down');
const beforeIcon = document.getElementById('day-before');
const afterIcon = document.getElementById('day-after');
const textDate = document.getElementById('text-date').textContent.trim();
const textWordEls = [...document.querySelectorAll('.word')];
const textCon = document.querySelector('.text-con');
// let isAnalysisRunning = false;
// let statusBlinkInterval;
let selected = false;

textWordEls.forEach((el, i) => {
  el.addEventListener('mousedown', (e) => {
    if (!selected) {
      e.target.classList.add('selected');
      return selected = true;
    }

    if (wordHasNeighbours(e.target, i)) {
      e.target.classList.add('selected');
    } else {
      // reset
      textWordEls.forEach(el => el.classList.remove('selected'));
      selected = false;
    }
  });
});

function wordHasNeighbours(el, index) {
  let nextNeighbour = el.nextElementSibling.classList.contains('selected');
  let previousNeighbour;
  
  if (index !== 0) previousNeighbour = el.previousElementSibling.classList.contains('selected');

  if (previousNeighbour || nextNeighbour) return true;
  else return false;
}

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

document.getElementById('research-btn').addEventListener('click', async () => {

  // const urlParams = new URLSearchParams(window.location.search);
  // const dateVal = urlParams.get('date');
  // const date = dateVal ? dateVal : new Date();

  const chunk = Array.from(textWordEls).filter(word => word.classList.contains('selected')).map(s => s.textContent).join(' ');
  if (!chunk.length) return;
  const dailyText = Array.from(textWordEls).map(s => s.textContent).join(' ');

  try {
    // document.body.inert = true;
    // isDebugRunning = true;
    // statusBlink(executeIcon, '#fff', '#58acf1');
    // statusEl.textContent = 'Getting Daily Text..';

    const res = await fetch(`/text/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chunk: chunk, dailyText: dailyText })
    });

    const data = await res.json();
    console.log(data);
    // if (data.msg === 'Successfully analysed') window.location.reload();
    // else statusEl.textContent = data.msg;

  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
  }

  // isDebugRunning = false;
  // clearStatusBlink(executeIcon);
  // document.body.inert = false;
});