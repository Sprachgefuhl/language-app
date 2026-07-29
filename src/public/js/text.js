const textDate = document.getElementById('text-date').textContent.trim();
const beforeIcon = document.getElementById('day-before');
const afterIcon = document.getElementById('day-after');
const textWordEls = [...document.querySelectorAll('.word')];
const textCon = document.querySelector('.text-con');
const flashcardCon = document.querySelector('.translate-card-flashcard');
const headers = document.querySelectorAll('.translate-card-header');
const frontEl = document.getElementById('selected');
const backEl = document.getElementById('result');
const translateBtn = document.getElementById('translate-btn');
let selected = false;
let translated = false;

textWordEls.forEach((el, i) => {
  el.addEventListener('mousedown', (e) => {
    if (translated) return window.location.reload();

    if (wordHasNeighbours(e.target, i) || selected == false) {
      selected = true;
      e.target.classList.add('selected');
    } else {
      // reset
      textWordEls.forEach(el => el.classList.remove('selected'));
      selected = false;
    }

    document.getElementById('selected').textContent = getSelectedChunk();
  });
});

function getSelectedChunk() {
  const chunk = Array.from(textWordEls).filter(word => word.classList.contains('selected')).map(s => s.textContent).join(' ');
  return chunk;
}

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

function createCard() {
  if (!translated) return;

  const front = frontEl.textContent;
  const back = backEl.textContent;

  headers[0].textContent = 'Front';
  headers[1].textContent = 'Back';
  frontEl.innerHTML = `<input type="text" id="front" value="${front}">`;
  backEl.innerHTML = `<input type="text" id="back" value="${back}">`;
  translateBtn.classList = 'fa-regular fa-circle-down';
  document.getElementById('translate-title').textContent = 'Create Card';
  document.querySelector('.select-deck').style.display = 'flex';

  translateBtn.addEventListener('click', async () => {
    const deckId = document.getElementById('select-deck').value;

    try {
      backEl.textContent = 'Saving...';

      const res = await fetch(`/decks/${deckId}/create-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ front: front, back: back })
      });

      const data = await res.json();
      if (data.msg === 'created') {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  });
}

translateBtn.addEventListener('click', async () => {
  const chunk = getSelectedChunk();
  if (!chunk.length) return;
  const dailyText = Array.from(textWordEls).map(s => s.textContent).join(' ');

  try {
    backEl.textContent = 'Translating...';

    const res = await fetch(`/text/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chunk: chunk, dailyText: dailyText })
    });

    const data = await res.json();
    if (data.msg === 'translated') {
      backEl.textContent = data.translation;
    }

  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
  }

  translated = true;
  translateBtn.id = 'create-card-btn';
  translateBtn.classList = 'fa-solid fa-bolt';
  translateBtn.addEventListener('click', () => createCard());
}, { once: true });

beforeIcon.addEventListener('click', () => jumpDate(true));
afterIcon.addEventListener('click', () => jumpDate(false));