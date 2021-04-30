"use strict";
/* eslint no-extend-native: ["error", { "exceptions": ["Array"] }] */

/** The service worker JS file to use, handy for switching between the minified
 * and non-minified versions. */
const ServiceWorkerJS = 'sw.min.js';
// const ServiceWorkerJS = 'sw.js';

/** Storage names. */
const StoreName = {
  Flags: 'flags',
  Settings: 'settings',
};

/** User settings. */
const Settings = {};

/** Mouse Button Constants. */
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

/** Is this running in Internet Explorer? */
const isIE = (navigator.userAgent.indexOf('MSIE') !== -1
  || navigator.userAgent.indexOf('Trident') !== -1);

/** Is this running in Chrome on iOS? */
const isIOSChrome = (navigator.userAgent.indexOf('CriOS') !== -1);

/** Is this running in Edge on iOS? */
const isIOSEdge = (navigator.userAgent.indexOf('EdgiOS') !== -1);

/** Is this running on an iOS device? */
const isIOS = (
  window.navigator.userAgent.indexOf('iPad') !== -1 ||
  window.navigator.userAgent.indexOf('iPhone') !== -1
);

/** Helper function for backwards compatibility with IE11. */
if (typeof Array.prototype.contains !== 'function') {
  Array.prototype.contains = function contains(item) {
    if (this === null) throw new TypeError();
    return (this.indexOf(item) !== -1);
  };
}

/** Helper function for backwards compatibility with IE11. */
if (typeof Array.prototype.remove !== 'function') {
  Array.prototype.remove = function remove(item) {
    if (this === null) throw new TypeError();
    const loc = this.indexOf(item);
    if (loc !== -1) this.splice(loc, 1);
  };
}

/** Registers the Service Worker. */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(ServiceWorkerJS, { scope: '/' });
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
  // console.log('loadSettings');

  defaultSettings();

  const settingsJSON = localStorage.getItem(StoreName.Settings);
  if (settingsJSON) {
    const newSettings = JSON.parse(settingsJSON);
    if (newSettings) {
      if (newSettings.Highlight1) Settings.Highlight1 = newSettings.Highlight1;
      if (newSettings.Highlight2) Settings.Highlight2 = newSettings.Highlight2;
      if (newSettings.Highlight3) Settings.Highlight3 = newSettings.Highlight3;
      if (newSettings.Menu) Settings.Menu = newSettings.Menu;
      if (newSettings.Theme) Settings.Theme = newSettings.Theme;
      if (newSettings.Zoom) Settings.Zoom = newSettings.Zoom;
    }
  }
}

/** Saves the settings to local storage. */
function saveSettings() {
  // console.log('saveSettings');

  const settingsJSON = JSON.stringify(Settings);
  localStorage.setItem(StoreName.Settings, settingsJSON);
}

/** Sets the theme to Light, Dark, or follows the System. */
function setTheme(theme) {
  // console.log('setTheme', theme);

  const htmlElement = document.getElementsByTagName('html')[0];

  switch (theme) {
    case 'Light': htmlElement.className = 'theme-light'; break;
    case 'Dark': htmlElement.className = 'theme-dark'; break;
    case 'System':
    default:
      htmlElement.className = window.matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'theme-dark' : 'theme-light';
      break;
  }
}

/** Theme Change event to track the System theme. */
function themeChange(event) {
  // console.log('themeChange');

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

/** Exports an SVG XML as a PNG file download. */
function exportPng(filename, svgXml, background) {
  // console.log('exportPng', filename);

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
  // console.log('exportSvg', filename);

  const blob = new Blob([svgXml], { type: 'image/svg+xml' });
  downloadBlob(filename, blob);
}

/** Simulates a click event on a given element. */
function simulateClick(element) {
  element.click();

  // try {
  //   element.dispatchEvent(new MouseEvent('click'));
  // } catch (e) {
  //   customAlert('simulateClick - error');

  //   var evt = document.createEvent('MouseEvents');
  //   evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
  //   element.dispatchEvent(evt);
  // }
}

/** Downloads a given blob using the anchor tag click method. */
function downloadBlob(filename, blob) {
  // msSaveBlob for IE11
  if ('msSaveBlob' in navigator) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const anchor = document.createElement('a');
    anchor.rel = 'noopener';
    anchor.download = filename;

    anchor.href = URL.createObjectURL(blob);
    setTimeout(function timeoutClick() { URL.revokeObjectURL(anchor.href); }, 45000);
    setTimeout(function timeoutClick() { simulateClick(anchor); }, 0);
  }
}

/** Returns a new HTML Element created from the provided HTML. */
function createElementFromHtml(innerHtml) {
  const newElementParent = document.createElement('div');
  newElementParent.innerHTML = innerHtml;
  return newElementParent.firstChild;
}

/** Finds all elements of className and fixes them
 * to a consistent maximum width + padding. */
function fixToMaxItemWidth(className, padding, resetFirst) {
  let maxWidth = 0;

  const elements = document.getElementsByClassName(className);
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    if (resetFirst && element.style.width !== '') element.style.width = '';
    if (element.clientWidth > maxWidth) maxWidth = element.clientWidth;
  }

  maxWidth += padding;

  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    element.style.width = maxWidth + 'px';
  }
}

/** Mouse enters the header, turns on the link. */
function headerEnter(event) {
  let link = event.target.getElementsByTagName('a');
  if (link.length === 0) return;
  link = link.item(0);
  link.style.display = 'inline';
}

/** Mouse leaves the header, turns off the link. */
function headerLeave(event) {
  let link = event.target.getElementsByTagName('a');
  if (link.length === 0) return;
  link = link.item(0);
  link.style.display = 'none';
}

/** Sets up for showing the anchor link on header hover. */
function setupHeaders(tagName) {
  const headers = document.getElementsByTagName(tagName);
  for (let index = 0; index < headers.length; index += 1) {
    const header = headers[index];

    header.addEventListener('mouseenter', headerEnter);
    header.addEventListener('mouseleave', headerLeave);

    let link = header.getElementsByTagName('a');
    if (link.length !== 0) {
      link = link.item(0);
      link.href = '#' + header.id;
    }
  }
}

/** TODO: Implement alternative to native alert function. */
function customAlert(message) {
  window.alert(message);
}

/** TODO: Implement alternative to native confirm function. */
function customConfirm(message) {
  return window.confirm(message);
}

/** TODO: Implement alternative to native prompt function. */
function customPrompt(message, defaultValue) {
  return window.prompt(message, defaultValue);
}
