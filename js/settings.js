/// <reference path="common.js" />
/* global Settings, saveSettings, isEmbedded, setTheme, setupModal,
   defaultSettings, setupOfflineIndicator */

/** Save click event to commit changes. */
function saveClick() {
  Settings.Highlight1 = document.getElementById('highlight1').value;
  Settings.Highlight2 = document.getElementById('highlight2').value;
  Settings.Highlight3 = document.getElementById('highlight3').value;
  Settings.Menu = document.getElementById('menu-state').value;
  Settings.Theme = document.getElementById('theme').value;
  Settings.Zoom = document.getElementById('zoom').value;

  saveSettings();

  if (!isEmbedded()) {
    window.history.back();
  }
}

/**
 * Set the selected option by the supplied label
 * @returns true if option found and selected, otherwise false.
 */
function selectByLabel(select, label) {
  for (const option of select.options) {
    if (option.label === label) {
      option.selected = true;
      return true;
    }
  }

  return false;
}

/** Applies the Settings values to the controls on the page. */
function setControlValues() {
  document.getElementById('highlight1').value = Settings.Highlight1;
  document.getElementById('highlight2').value = Settings.Highlight2;
  document.getElementById('highlight3').value = Settings.Highlight3;

  selectByLabel(document.getElementById('menu-state'), Settings.Menu);
  selectByLabel(document.getElementById('zoom'), Settings.Zoom);
  selectByLabel(document.getElementById('theme'), Settings.Theme);
}

/** Defaults click event to apply the default settings. */
function defaultsClick() {
  defaultSettings();
  setControlValues();
  setTheme(document.getElementById('theme').value);
}

/** Attaches event listeners to the settings controls. */
function setupEventListeners() {
  document.getElementById('defaults').addEventListener('click', defaultsClick);
  document.getElementById('save').addEventListener('click', saveClick);
  document.getElementById('cancel').addEventListener('click', 
    () => window.history.back());
  document.getElementById('theme').addEventListener('change',
    (event) => setTheme(event.target.value));
}

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  if (isEmbedded()) {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('cancel').style.display = 'none';
  }

  setupOfflineIndicator();
  setupModal();
  setControlValues();
  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
