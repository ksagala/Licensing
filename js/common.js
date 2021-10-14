/* eslint-disable no-unused-vars */

/** Storage name constants. */
const StoreName = {
  Flags: 'flags',
  Settings: 'settings',
};

/** Mouse button constants. */
const Mouse = {
  Button: {
    Left: 0,
    Middle: 1,
    Right: 2,
    Back: 3,
    Forward: 4,
  },
  Buttons: {
    Left: 1,
    Right: 2,
    Middle: 4,
    Back: 8,
    Forward: 16,
  },
  Which: {
    Left: 1,
    Middle: 2,
    Right: 3,
  },
};

/** User settings. */
const Settings = {
  Filters: {
    Brightness: 10,
    Contrast: 10,
    Hue: 0,
    Saturation: 10,
  },
  Highlight1: '',
  Highlight2: '',
  Highlight3: '',
  Menu: '',
  Theme: '',
  Zoom: '',
};

/** Is this running in Chrome on iOS? */
// const isIOSChrome = (navigator.userAgent.indexOf('CriOS') !== -1);

/** Is this running in Edge on iOS? */
const isIOSEdge = (navigator.userAgent.indexOf('EdgiOS') !== -1);

/** Is this running on an iOS device? */
const isIOS = (window.navigator.userAgent.indexOf('iPad') !== -1 ||
  window.navigator.userAgent.indexOf('iPhone') !== -1);

/** Callback to execute after Modal OK / Yes button press. */
let modalOkCallback = undefined;

/** Callback to execute after Modal Cancel / No button press. */
let modalCancelCallback = undefined;

/** Handle the modal OK / Yes button click.  */
function modalOkClick(event) {
  document.getElementById('modal').style.display = 'none';
  if (modalOkCallback) modalOkCallback(event);
}

/** Handle the modal Cancel / No button click.  */
function modalCancelClick(event) {
  document.getElementById('modal').style.display = 'none';
  if (modalCancelCallback) modalCancelCallback(event);
}

/** Handles pressing Enter inside the modal prompt text box. */
function modalInputKeyUpEvent(event) {
  if (event.key === 'Enter') {
    const okButton = document.getElementById('modal-ok');
    if (!okButton) return;

    event.preventDefault();

    okButton.click();
  }
}

/** Set up the modal popup box. */
function setupModal() {
  const modal = document.createElement('div');
  modal.id = 'modal';
  document.body.appendChild(modal);

  const modalContent = document.createElement('div');
  modalContent.id = 'modal-content';
  modal.appendChild(modalContent);

  const modalText = document.createElement('p');
  modalText.id = 'modal-text';
  modalContent.appendChild(modalText);

  const modalInput = document.createElement('input');
  modalInput.id = 'modal-input';
  modalInput.type = 'text';
  modalContent.appendChild(modalInput);
  modalInput.addEventListener('keyup', modalInputKeyUpEvent);

  const modalOk = document.createElement('button');
  modalOk.id = 'modal-ok';
  modalOk.addEventListener('click', modalOkClick);
  modalContent.appendChild(modalOk);

  const modalCancel = document.createElement('button');
  modalCancel.id = 'modal-cancel';
  modalCancel.addEventListener('click', modalCancelClick);
  modalContent.appendChild(modalCancel);
}

/** Registers the service worker. */
function registerServiceWorker() {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', () =>
      window.location.reload());

    navigator.serviceWorker.register('sw.min.js');
  }
}

/** Loads the default settings. */
function defaultSettings() {
  Settings.Highlight1 = '#CCCC00';
  Settings.Highlight2 = '#AA00CC';
  Settings.Highlight3 = '#00CCBB';
  Settings.Menu = 'Open';
  Settings.Theme = 'Light';
  Settings.Zoom = 'Fit';
}

/** Loads the settings from local storage. */
function loadSettings() {
  defaultSettings();

  const settingsJSON = localStorage.getItem(StoreName.Settings);
  if (settingsJSON) {
    const newSettings = JSON.parse(settingsJSON);
    if (newSettings) {
      if (newSettings.Filters) {
        if (newSettings.Filters.Brightness) {
          Settings.Filters.Brightness = newSettings.Filters.Brightness;
        }

        if (newSettings.Filters.Contrast) {
          Settings.Filters.Contrast = newSettings.Filters.Contrast;
        }

        if (newSettings.Filters.Hue) {
          Settings.Filters.Hue = newSettings.Filters.Hue;
        }

        if (newSettings.Filters.Saturation) {
          Settings.Filters.Saturation = newSettings.Filters.Saturation;
        }
      }

      if (newSettings.Highlight1) {
        Settings.Highlight1 = newSettings.Highlight1;
      }

      if (newSettings.Highlight2) {
        Settings.Highlight2 = newSettings.Highlight2;
      }

      if (newSettings.Highlight3) {
        Settings.Highlight3 = newSettings.Highlight3;
      }

      if (newSettings.Menu) {
        Settings.Menu = newSettings.Menu;
      }

      if (newSettings.Theme) {
        Settings.Theme = newSettings.Theme;
      }

      if (newSettings.Zoom) {
        Settings.Zoom = newSettings.Zoom;
      }
    }
  }
}

/** Saves the settings to local storage. */
function saveSettings() {
  const settingsJSON = JSON.stringify(Settings);
  localStorage.setItem(StoreName.Settings, settingsJSON);
}

/** Sets the theme to Light, Dark, or follows the System. */
function setTheme(theme) {
  const htmlElement = document.getElementsByTagName('html')[0];

  switch (theme) {
    case 'Light': htmlElement.className = 'theme-light'; break;
    case 'Dark': htmlElement.className = 'theme-dark'; break;
    case 'System':
    default:
      htmlElement.className = window
        .matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'theme-dark' : 'theme-light';
      break;
  }
}

/** Theme Change event to track the System theme. */
function themeChange(event) {
  if (Settings.Theme === 'System') {
    const htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.className = (event.matches ? 'theme-dark' : 'theme-light');
  }
}

/** Adds the specified theme change listener. */
function addThemeListener(listener) {
  const matchMediaDark = window.matchMedia('(prefers-color-scheme: dark)');
  if ('addEventListener' in matchMediaDark) {
    matchMediaDark.addEventListener('change', listener);
  }
}

/** Downloads a given blob using the anchor tag click method. */
function downloadBlob(filename, blob) {
  const anchor = document.createElement('a');
  anchor.rel = 'noopener';
  anchor.download = filename;

  anchor.href = URL.createObjectURL(blob);
  setTimeout(() => URL.revokeObjectURL(anchor.href), 45000);
  setTimeout(() => anchor.click(), 0);
}

/** Exports an SVG XML as a PNG file download. */
function exportPng(filename, svgXml, background) {
  const canvas = document.createElement('canvas');
  const canvasContext = canvas.getContext('2d');

  const image = new Image();
  image.onload = function onload() {
    canvas.width = image.width;
    canvas.height = image.height;

    if (background) {
      canvasContext.fillStyle = background;
      canvasContext.rect(0, 0, canvas.width, canvas.height);
      canvasContext.fill();
    }

    if ('imageSmoothingQuality' in canvasContext) {
      canvasContext.imageSmoothingQuality = 'high';
    }

    canvasContext.drawImage(image, 0, 0);

    canvas.toBlob(
      function canvasBlob(blob) {
        downloadBlob(filename, blob);
      }
    );
  };

  image.src = 'data:image/svg+xml;base64,' + btoa(svgXml);
}

/** Exports an SVG XML as an SVG file download. */
function exportSvg(filename, svgXml) {
  const blob = new Blob([svgXml], { type: 'image/svg+xml' });
  downloadBlob(filename, blob);
}

/** Returns a new HTML Element created from the provided HTML. */
function createElementFromHtml(innerHtml) {
  const newElementParent = document.createElement('div');
  newElementParent.innerHTML = innerHtml;
  return newElementParent.firstChild;
}

/** Find the string between two other strings. */
function getStringBetween(source, from, open, close) {
  if (!source) return undefined;
  if (from === -1) return undefined;

  const start = source.indexOf(open, from);
  if (start === -1) return undefined;

  const end = source.indexOf(close, start);
  if (end === -1) return undefined;

  return source.substring(start + 1, end);
}

/** Get the filter CSS for the specified filter values. */
function getFiltersCss(brightness, contrast, hue, saturation) {
  return `brightness(${(brightness / 10.0).toPrecision(2)}) ` +
    `contrast(${(contrast / 10.0).toPrecision(2)}) ` +
    `hue-rotate(${hue}deg) ` +
    `saturate(${(saturation / 10.0).toPrecision(2)})`;
}

/** Shows the App Offline indicator. */
function appOffline() {
  document.getElementById('offline').style.display = 'block';
}

/** Hides the App Offline indicator. */
function appOnline() {
  document.getElementById('offline').style.display = 'none';
}

/** Sets up the offline indicator. */
function setupOfflineIndicator() {
  document.getElementById('offline').style
    .display = (navigator.onLine ? 'none' : 'block');

  window.addEventListener('offline', appOffline);
  window.addEventListener('online', appOnline);
}

/** Alternative to native alert function. */
function modalAlert(message, okCallback) {
  modalOkCallback = okCallback;

  document.getElementById('modal-text').textContent = message;
  document.getElementById('modal-input').style.display = 'none';

  const modalOk = document.getElementById('modal-ok');
  modalOk.textContent = 'OK';
  modalOk.accessKey = 'o';
  modalOk.style.display = 'inline-block';

  document.getElementById('modal-cancel').style.display = 'none';

  document.getElementById('modal').style.display = 'block';

  modalOk.focus();
}

/** Alternative to native confirm function. */
function modalConfirm(message, yesCallback, noCallback) {
  modalOkCallback = yesCallback;
  modalCancelCallback = noCallback;

  document.getElementById('modal-text').textContent = message;
  document.getElementById('modal-input').style.display = 'none';

  const modalOk = document.getElementById('modal-ok');
  modalOk.textContent = 'Yes';
  modalOk.accessKey = 'y';
  modalOk.style.display = 'inline-block';

  const modalCancel = document.getElementById('modal-cancel');
  modalCancel.textContent = 'No';
  modalCancel.accessKey = 'n';
  modalCancel.style.display = 'inline-block';

  document.getElementById('modal').style.display = 'block';
}

/** Alternative to native prompt function. */
function modalPrompt(message, inputValue, okCallback, cancelCallback) {
  modalOkCallback = okCallback;
  modalCancelCallback = cancelCallback;

  document.getElementById('modal-text').textContent = message;

  const modalInput = document.getElementById('modal-input');
  modalInput.value = inputValue ? inputValue : '';
  modalInput.style.display = 'inline-block';

  const modalOk = document.getElementById('modal-ok');
  modalOk.textContent = 'OK';
  modalOk.accessKey = 'o';
  modalOk.style.display = 'inline-block';

  const modalCancel = document.getElementById('modal-cancel');
  modalCancel.textContent = 'Cancel';
  modalCancel.accessKey = 'c';
  modalCancel.style.display = 'inline-block';

  document.getElementById('modal').style.display = 'block';

  modalInput.focus();
}

/** Get the Modal dialog boxes input field text. */
function getModalInputText() {
  return document.getElementById('modal-input').value;
}

/** Detect if the site is embedded in a frame. */
function isEmbedded() {
  try {
    return (window.self !== window.top);
  } catch (error) {
    return true;
  }
}

/** Common initialisation actions for every page of the site. */
registerServiceWorker();
loadSettings();
setTheme(Settings.Theme);
addThemeListener(themeChange);
