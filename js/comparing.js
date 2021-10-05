/// <reference path="common.js" />
/* global modalAlert, setupOfflineIndicator, setupModal */

/** Move the slider between the two diagrams. */
function moveSlider() {
  document.getElementById('compare-overlay').style.width =
    document.getElementById('compare-slider').value + '%';
}

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  setupOfflineIndicator();
  setupModal();

  const elements = window.location.hash.substring(1).split('/');
  if (elements.length === 2) {
    const compare1 = document.getElementById('compare1');
    if (elements[0].startsWith('*')) {
      compare1.src = `/viewsvg.htm#${elements[0]}/compare`;
    } else {
      compare1.src = `/${elements[0]}.htm#/compare`;
    }

    const compare2 = document.getElementById('compare2');
    if (elements[1].startsWith('*')) {
      compare2.src = `/viewsvg.htm#${elements[1]}/compare`;
    } else {
      compare2.src = `/${elements[1]}.htm#/compare`;
    }

    document.getElementById('compare-slider')
      .addEventListener('input', moveSlider);
  } else {
    document.getElementById('compare1').style.display = 'none';
    document.getElementById('compare-overlay').style.display = 'none';
    document.getElementById('compare-slider').style.display = 'none';

    modalAlert('Page loaded with invalid parameters',
      () => window.history.back());
  }
}

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
