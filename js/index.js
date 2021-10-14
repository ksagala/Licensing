/// <reference path="common.js" />
/* global isEmbedded, StoreName, setupOfflineIndicator */

/** Page Data. */
const PageData = { Flags: [] };

/** Updates the visual appearance of a button to match state. */
/* eslint no-param-reassign:
 ["error", { "props":true, "ignorePropertyModificationsFor":["button"] }] */
function updateFlag(button, state) {
  if (state) {
    if (button.classList.contains('unflagged')) {
      button.classList.remove("unflagged");
    }
    if (!button.classList.contains('flagged')) {
      button.classList.add('flagged');
    }
    button.title = 'Remove flag';
  } else {
    if (button.classList.contains('flagged')) {
      button.classList.remove("flagged");
    }
    if (!button.classList.contains('unflagged')) {
      button.classList.add('unflagged');
    }
    button.title = 'Flag this diagram';
  }
}

/** Handles the user clicking the Flag item beside a diagram link. */
function flagClick(event) {
  const button = event.target;
  const link = button.nextSibling;
  const filename = link.pathname.slice(1, -4);

  const flagIndex = PageData.Flags.indexOf(filename);
  if (flagIndex === -1) {
    PageData.Flags.push(filename);
    updateFlag(button, true);
  } else {
    PageData.Flags.splice(flagIndex, 1);
    updateFlag(button, false);
  }

  localStorage.setItem(StoreName.Flags, JSON.stringify(PageData.Flags));
}

/** Handles the user clicking the Flag all item at the bottom of the links. */
function flagAllClick(event) {
  event.preventDefault();

  PageData.Flags = [];

  const links = document.getElementsByClassName('link-text');
  for (const link of links) {
    const filename = link.pathname.slice(1, -4);
    PageData.Flags.push(filename);

    const button = link.previousSibling;
    updateFlag(button, true);
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
  for (const link of links) {
    const button = link.previousSibling;
    updateFlag(button, false);
  }
}

/** Sets the display properties and attaches event listeners to flags. */
function setupFlags() {
  const flagsJSON = localStorage.getItem(StoreName.Flags);
  if (flagsJSON) PageData.Flags = JSON.parse(flagsJSON);

  const buttons = document.getElementsByClassName('flag-button');
  for (const button of buttons) {
    button.addEventListener('click', flagClick);

    const link = button.nextSibling;
    const filename = link.pathname.slice(1, -4);

    // TODO: Hover preview?
    // const preview = document.createElement('img');
    // preview.src = '/' + filename + '.svg';
    // preview.height = "200";
    // link.appendChild(preview);

    const flagged = (PageData.Flags.indexOf(filename) !== -1);
    updateFlag(button, flagged);
  }

  document.getElementById('clear-all')
    .addEventListener('click', clearFlagsClick);

  document.getElementById('flag-all')
    .addEventListener('click', flagAllClick);
}

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  if (isEmbedded()) {
    document.getElementById('footer').style.display = 'none';
  }

  setupOfflineIndicator();
  setupFlags();

  // Is this running in Internet Explorer?
  if (navigator.userAgent.indexOf('Trident/') !== -1) {
    document.getElementById('ie-warning').style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
