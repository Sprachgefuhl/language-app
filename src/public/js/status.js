function showStatus(msg, type) {
  // Remove any existing status message
  const existing = document.querySelector('.status-con');
  if (existing) existing.remove();

  const con = document.createElement('div');
  const icon = document.createElement('i');
  const content = document.createElement('p');
  con.classList = 'status-con';
  content.textContent = msg;

  const colours = {
    info:    { colour: '#60A5FA', icon: 'info' },
    success: { colour: '#10B981', icon: 'check' },
    error:   { colour: '#F87171', icon: 'exclamation' }
  };

  const style = colours[type];
  icon.classList = 'fa-solid fa-circle-' + style.icon;
  icon.style.color = style.colour;

  con.appendChild(icon);
  con.appendChild(content);
  document.body.appendChild(con);

  // Auto-hide after 3 seconds
  setTimeout(() => {
    con.style.opacity = '0';
    setTimeout(() => con.remove(), 300); // wait for fade-out
  }, 2000);
}