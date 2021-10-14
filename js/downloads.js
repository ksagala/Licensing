/// <reference path="common.js" />
/* global isEmbedded, setupOfflineIndicator */

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  if (isEmbedded()) {
    document.getElementById('menu').style.display = 'none';
  }

  setupOfflineIndicator();
}

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
