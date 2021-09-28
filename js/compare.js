/** Move the slider between diagrams. */
function moveSlider() {
  document.getElementById('compareOverlay').style.width =
    document.getElementById('compareSlider').value + '%';
}

/** Displays the given error message. */
function showError(error) {
  // console.log('showError', error);

  if (overlay) overlay.style.display = 'none';
  if (slider) slider.style.display = 'none';

  document.title = 'Error | M365 Maps';

  document.getElementById('errorMessage').innerText = error;
  document.getElementById('errorDiv').style.display = 'block';
}

/** Shows the App Offline indicator. */
function appOffline() {
  document.getElementById('offline').style.display = 'block';
}

/** Hides the App Offline indicator. */
function appOnline() {
  document.getElementById('offline').style.display = 'none';
}

/** Page Load event handler. */
function pageLoad() {

  moveSlider();

  if (Common.isIE) {
    document.getElementById('compareSlider')
      .addEventListener('change', moveSlider);
  } 
  else {
    document.getElementById('compareSlider')
      .addEventListener('input', moveSlider);
  }

  const elements = window.location.search.substring(1).split('&');
  if (elements.length !== 2) {
    showError('Comparison diagrams missing');
    return;
  }

  const compare1 = document.getElementById('compare1');
  if (elements[1].startsWith('*')) {
    compare1.src = '/viewsvg.htm#' + elements[1] + '-blank';
  } else {
    compare1.src = '/' + elements[1] + '.htm#blank';
  }

  const compare2 = document.getElementById('compare2');
  if (elements[0].startsWith('*')) {
    compare2.src = '/viewsvg.htm#' + elements[0] + '-blank';
  } else {
    compare2.src = '/' + elements[0] + '.htm#blank';
  }

  document.getElementById('offline').style
    .display = (navigator.onLine ? 'none' : 'block');

  window.addEventListener('offline', appOffline);
  window.addEventListener('online', appOnline);
}

window.addEventListener('load', pageLoad);
