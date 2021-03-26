/** Page Data. */
const PageData = {
  Flags: [],
};

/** Updates the visual appearance of a flagImage to match state. */
/* eslint no-param-reassign:
 ["error", { "props":true, "ignorePropertyModificationsFor":["flagImage"] }] */
function updateFlag(flagImage, state) {
  if (state) {
    flagImage.src = '/media/flagged.svg';
    flagImage.title = 'Remove flag';
  } else {
    flagImage.src = '/media/unflagged.svg';
    flagImage.title = 'Flag this diagram';
  }
}

/** Handles the user clicking the Flag item beside a diagram link. */
function flagClick(event) {
  const flagImage = event.target;
  const flagLink = flagImage.parentElement
    .getElementsByClassName('link-text').item(0);
  const filename = flagLink.hash.substring(1);

  const flagIndex = PageData.Flags.indexOf(filename);
  if (flagIndex === -1) {
    PageData.Flags.push(filename);
    updateFlag(flagImage, true);
  } else {
    PageData.Flags.splice(flagIndex, 1);
    updateFlag(flagImage, false);
  }

  localStorage.setItem(StoreName.Flags, JSON.stringify(PageData.Flags));
}

/** Handles the user clicking the Flag all item at the bottom of the links. */
function flagAllClick(event) {
  event.preventDefault();

  PageData.Flags = [];

  const links = document.getElementsByClassName('link-text');
  for (let index = 0; index < links.length; index += 1) {
    const link = links[index];

    const filename = link.hash.substring(1);
    PageData.Flags.push(filename);

    const flagImage = link.parentElement
      .getElementsByClassName('link-flag').item(0);

    updateFlag(flagImage, true);
  }

  const flagsJSON = JSON.stringify(PageData.Flags);
  localStorage.setItem(StoreName.Flags, flagsJSON);
}

/** Handles the user clicking the clear all flags item at the bottom of the
 * links. */
function clearFlagsClick(event) {
  event.preventDefault();

  PageData.Flags = [];
  const flagsJSON = JSON.stringify(PageData.Flags);
  localStorage.setItem(StoreName.Flags, flagsJSON);

  const links = document.getElementsByClassName('link-text');
  for (let index = 0; index < links.length; index += 1) {
    const link = links[index];

    const flagImage = link.parentElement
      .getElementsByClassName('link-flag').item(0);

    updateFlag(flagImage, false);
  }
}

/** Sets the correct display properties and attaches the event listeners to
 * all flags. */
function showFlags() {
  const flagsJSON = localStorage.getItem(StoreName.Flags);
  if (flagsJSON) PageData.Flags = JSON.parse(flagsJSON);

  const links = document.getElementsByClassName('link-text');
  for (let index = 0; index < links.length; index += 1) {
    const link = links[index];

    const flagImage = link.parentElement
      .getElementsByClassName('link-flag').item(0);

    flagImage.addEventListener('click', flagClick);

    const filename = link.hash.substring(1);

    // TODO: Hover preview?
    // const preview = document.createElement('img');
    // preview.src = '/' + filename + '.svg';
    // preview.height = "200";
    // link.appendChild(preview);

    const flagged = (PageData.Flags.indexOf(filename) !== -1);
    updateFlag(flagImage, flagged);
  }

  document.getElementById('clearAll')
    .addEventListener('click', clearFlagsClick);

  document.getElementById('flagAll')
    .addEventListener('click', flagAllClick);
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
  showFlags();

  if (isIE) fixToMaxItemWidth('link-header', 8, false);

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
