const params = new URL(location.toString()).searchParams;
const edit = !!params.get('edit');
if (params.get('edit') !== null) {
  document.body.contentEditable = true;
}

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

window.ymaps.ready(() => {
  const mapElement = document.querySelector('.map');
  const pictureElement = mapElement.querySelector('picture');
  const template = mapElement.querySelector('template').innerHTML;

  const map = new window.ymaps.Map(mapElement, {
    center: [59.9387165, 30.3230474],
    controls: [],
    zoom: 16
  });

  map.geoObjects.add(new window.ymaps.Placemark(map.getCenter(), null, {
    iconLayout: window.ymaps.templateLayoutFactory.createClass(template),
  }));
  map.behaviors.disable('scrollZoom');

  pictureElement.remove();
});
