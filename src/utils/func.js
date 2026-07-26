const crypto = require('crypto');

const hash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
}

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
}

const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (err) {
    return false;
  }
}

const standardizeDate = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${year}/${month}/${day}`;
}

const getTermPositionsInStr = (text, terms) => {
  const results = [];

  for (const term of terms) {
    const index = text.toLowerCase().indexOf(term.toLowerCase());

    if (index !== -1) {
      results.push({
        term: term,
        start: index,
        end: index + term.length - 1,
      });
    }
  }

  // Sort by position in original text
  results.sort((a, b) => a.start - b.start);

  return results;
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

module.exports = { hash, generateToken, isValidJSON, standardizeDate, getTermPositionsInStr, timeoutPromise };