const crypto = require('crypto');

const hash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
}

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
}

const standardizeDate = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${year}/${month}/${day}`;
}

const humanizeDate = (date) => {
  const dateObj = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();
  return `${month} ${day}`;
}

function timeoutPromise(promise, ms) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Timeout')), ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timeoutId);
  });
}

module.exports = { hash, generateToken, standardizeDate, humanizeDate, timeoutPromise };