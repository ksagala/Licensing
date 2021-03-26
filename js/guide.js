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
  setupHeaders('h2');

  if (isIE) fixToMaxItemWidth('row-icon', 16, false);

  document.getElementById('offline').style
    .display = (navigator.onLine ? 'none' : 'block');
  window.addEventListener('offline', appOffline);
  window.addEventListener('online', appOnline);
}

registerServiceWorker();

window.addEventListener('load', pageLoad);

loadSettings();
setTheme(Settings.Theme);
addThemeListener(themeChange);
