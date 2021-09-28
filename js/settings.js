/** Save click event to commit changes. */
function saveClick() {
  Common.Settings.Highlight1 = document.getElementById('highlight1').value;
  Common.Settings.Highlight2 = document.getElementById('highlight2').value;
  Common.Settings.Highlight3 = document.getElementById('highlight3').value;
  Common.Settings.Menu = document.getElementById('menuState').value;
  Common.Settings.Theme = document.getElementById('theme').value;
  Common.Settings.Zoom = document.getElementById('zoom').value;

  Common.saveSettings();

  window.location.href = '/';
}

/** Event for when the user alters the theme selector. */
function themeSelectChange(event) {
  Common.setTheme(event.target.value);
}

/** Shows the App Offline indicator. */
function appOffline() {
  document.getElementById('offline').style.display = 'block';
}

/** Hides the App Offline indicator. */
function appOnline() {
  document.getElementById('offline').style.display = 'none';
}

/** Used for backwards compatibility with IE11 */
function setOption(select, value) {
  const options = select.getElementsByTagName('option');

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];

    if (option.text === value) {
      option.selected = true;
    }
  }
}

/** Applies the Settings values to the controls on the page. */
function setControlValues() {
  document.getElementById('highlight1').value = Common.Settings.Highlight1;
  document.getElementById('highlight2').value = Common.Settings.Highlight2;
  document.getElementById('highlight3').value = Common.Settings.Highlight3;
  setOption(document.getElementById('menuState'), Common.Settings.Menu);
  setOption(document.getElementById('zoom'), Common.Settings.Zoom);
  setOption(document.getElementById('theme'), Common.Settings.Theme);
}

/** Defaults click event to apply the default settings. */
function defaultsClick() {
  Common.defaultSettings();
  setControlValues();
  Common.setTheme(document.getElementById('theme').value);
}

/** Navigates back to the home page. */
function cancelClick() {
  window.location.href = '/';
}

/** Deletes all the application caches (app and diagram). */
function deleteAllCaches() {
  caches.keys().then(
    function forEachKey(keys) {
      keys.forEach(
        function cachesDelete(key) {
          caches.delete(key);
        }
      );
    }
  );
}

/** Unregisters the service worker(s) to force a full refresh. */
function unregisterServiceWorkers() {
  navigator.serviceWorker.getRegistrations().then(
    function serviceWorkers(registrations) {
      for (let index = 0; index < registrations.length; index += 1) {
        const registration = registrations[index];
        registration.unregister();
      }
    }
  );
}

/** Check the URL for a hash instruction and execute. */
function processHashInstruction() {
  switch (window.location.hash) {
    case '#nocache':
      deleteAllCaches();
      Common.customAlert('Deleted all Caches');
      break;

    case '#unregister':
      unregisterServiceWorkers();
      Common.customAlert('Unregistered Service Workers');
      break;

    case '#deletestorage':
      localStorage.clear();
      Common.customAlert('Deleted Storage');
      break;
  }
}

/** Page Load event handler. */
function pageLoad() {
  setControlValues();
  processHashInstruction();

  if (Common.isIE) Common.fixToMaxItemWidth('settings-header', 16, false);

  document.getElementById('theme').addEventListener('change', themeSelectChange);
  document.getElementById('defaults').addEventListener('click', defaultsClick);
  document.getElementById('save').addEventListener('click', saveClick);
  document.getElementById('cancel').addEventListener('click', cancelClick);

  document.getElementById('offline').style
    .display = (navigator.onLine ? 'none' : 'block');
  window.addEventListener('offline', appOffline);
  window.addEventListener('online', appOnline);
}

window.addEventListener('load', pageLoad);
