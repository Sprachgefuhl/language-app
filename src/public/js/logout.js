const logoutEl = document.getElementById('logout');

logoutEl.addEventListener('click', () => {
  fetch('/logout?_method=DELETE', { method: 'post' })
    .then(res => window.location = res.url);
});