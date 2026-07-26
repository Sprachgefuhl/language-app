function selectUser(event) {
  const parent = event.currentTarget;
  const userIcon = parent.querySelector('#user-icon');
  userIcon.classList = 'fa-solid fa-user';
}

function unselectUser(event) {
  const parent = event.currentTarget;
  const userIcon = parent.querySelector('#user-icon');
  userIcon.classList = 'fa-regular fa-user';
}