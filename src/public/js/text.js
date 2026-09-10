const statusEl = document.getElementById('status');
const overlayEl = document.querySelector('.overlay');
const textDate = document.getElementById('text-date').textContent.trim();
const beforeIcon = document.getElementById('day-before');
const afterIcon = document.getElementById('day-after');
const alignmentEls = [...document.querySelectorAll('.alignment')];
let opened = [];

const standardizeDate = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${year}/${month}/${day}`;
}

function jumpDate(isBefore) {
  const offsets = { Today: 0, Yesterday: -1, Tomorrow: 1 };
  const date = textDate in offsets ? new Date() : new Date(textDate);

  if (textDate in offsets) {
    date.setDate(date.getDate() + offsets[textDate]);
  }

  date.setDate(date.getDate() + (isBefore ? -1 : 1));
  window.location.href = `/text?date=${standardizeDate(date)}`;
}

alignmentEls.forEach(el => {
  el.addEventListener('click', () => {
    const isOpen = opened.includes(el.id);

    if (isOpen) {
      el.children[0].style.display = 'none';
      opened.splice(opened.indexOf(el.id), 1);
    } else {
      el.children[0].style.display = 'block';
      opened.push(el.id);
    }
  });
});

document.getElementById('create-card-btn').addEventListener('click', async () => {
  try {
    const frontEl = document.getElementById('front');
    const backEl = document.getElementById('back');
    const deckId = document.getElementById('deck').value;

    statusEl.textContent = 'Creating...';
    const res = await fetch(`/decks/${deckId}/create-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        front: frontEl.value.trim(),
        back: backEl.value.trim()
      })
    });

    const result = await res.json();
    if (result.msg === 'Card created') overlayEl.classList.add('hidden');
    else statusEl.textContent = result.msg;
  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
  }
});

document.querySelector('.open-overlay').addEventListener('click', () => {
  overlayEl.classList.remove('hidden');
  overlayEl.addEventListener('click', () => {
    console.log('hi')
  })
});

beforeIcon.addEventListener('click', () => jumpDate(true));
afterIcon.addEventListener('click', () => jumpDate(false));