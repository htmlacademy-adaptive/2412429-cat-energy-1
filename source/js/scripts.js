const pageHeaderElement = document.querySelector('.page-header');
const hamburgerElement = pageHeaderElement.querySelector('.page-header__hamburger');

hamburgerElement.addEventListener('click', function () {
  if (pageHeaderElement.classList.contains('page-header--closed')) {
    pageHeaderElement.classList.remove('page-header--closed');
    pageHeaderElement.classList.add('page-header--opened');
  } else {
    pageHeaderElement.classList.add('page-header--closed');
    pageHeaderElement.classList.remove('page-header--opened');
  }
});
pageHeaderElement.classList.remove('page-header--no-js');
