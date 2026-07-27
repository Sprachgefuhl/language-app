const form = document.getElementById('login-form');
const statusEl = document.getElementById('status');
const iconStatusEl = document.getElementById('icon-status');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.email.value;
  const password = form.password.value;

  try {
    statusEl.textContent = 'validating...';
    // iconStatusEl.classList = 'fa-solid fa-unlock';

    const res = await fetch('/login/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password: password })
    });

    const result = await res.json();
    if (result.msg === 'Successfully logged in') {
      // await delay(1000);
      iconStatusEl.classList = 'fa-solid fa-lock-open';
      // await delay(500);
      return window.location.reload();
    }

    statusEl.textContent = result.msg;

    form.reset();
  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
  }
});