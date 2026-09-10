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

beforeIcon.addEventListener('click', () => jumpDate(true));
afterIcon.addEventListener('click', () => jumpDate(false));