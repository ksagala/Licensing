/** Page Data. */
const PageData = {
  Controls: {
    Brightness: null,
    Contrast: null,
    Hue: null,
    Saturation: null,
  },
  ControlsOpen: false,
  Filename: '',
  MenuOffset: 0,
  MenuOpen: false,
  SavedImageTitle: 'untitled',
};

/** Read the filter values from the existing filter style on the SVG tag. */
function readFilterValuesfromSvg() {
  // console.log('readFilterValuesfromSvg');

  const filters = SvgModule.Data.Tag.style.filter;

  const bIndex = filters.indexOf('brightness');
  const cIndex = filters.indexOf('contrast');
  const hIndex = filters.indexOf('hue-rotate');
  const sIndex = filters.indexOf('saturate');

  const bString = Common.getStringBetween(filters, bIndex, '(', ')');
  const cString = Common.getStringBetween(filters, cIndex, '(', ')');
  const hString = Common.getStringBetween(filters, hIndex, '(', 'deg');
  const sString = Common.getStringBetween(filters, sIndex, '(', ')');

  if (bString) PageData.Controls.Brightness.value = bString * 10;
  if (cString) PageData.Controls.Contrast.value = cString * 10;
  if (hString) PageData.Controls.Hue.value = hString;
  if (sString) PageData.Controls.Saturation.value = sString * 10;
}

/** Update the SVG filter CSS based on changes to the image controls. */
function filterChange() {
  // console.log('filterChange');

  SvgModule.Data.Tag.style.filter = Common.getFiltersCss(
    PageData.Controls.Brightness.value,
    PageData.Controls.Contrast.value,
    PageData.Controls.Hue.value,
    PageData.Controls.Saturation.value);
}

/** Handles the user clicking the menu Filter reset button. */
function filterResetClick() {
  // console.log('filterResetClick');

  PageData.Controls.Brightness.value =
    PageData.Controls.Brightness.defaultValue;
  PageData.Controls.Contrast.value =
    PageData.Controls.Contrast.defaultValue;
  PageData.Controls.Hue.value =
    PageData.Controls.Hue.defaultValue;
  PageData.Controls.Saturation.value =
    PageData.Controls.Saturation.defaultValue;

  filterChange();
}

/** Handles the user clicking the menu Filter save button. */
function filterSaveClick() {
  // console.log('filterSaveClick');

  Common.Settings.Filters.Brightness = PageData.Controls.Brightness.value;
  Common.Settings.Filters.Contrast = PageData.Controls.Contrast.value;
  Common.Settings.Filters.Hue = PageData.Controls.Hue.value;
  Common.Settings.Filters.Saturation = PageData.Controls.Saturation.value;

  Common.saveSettings();

  PageData.ControlsOpen = false;
  setControlsPosition();
}

/** Sets the image controls panel position based on PageData.ControlsOpen. */
function setControlsPosition() {
  // console.log('setControlsPosition');
  if (Common.isIE) return;

  const imageControls = document.getElementById('imageControls');
  imageControls.style.top = PageData.ControlsOpen ? '24px' : '-300px';
  imageControls.style.display = 'block';
}

/** Set values and attach event listeners to image control elements. */
function setupImageControls() {
  // console.log('setupImageControls');
  if (Common.isIE) return;

  PageData.Controls.Brightness = document.getElementById('brightness');
  PageData.Controls.Contrast = document.getElementById('contrast');
  PageData.Controls.Hue = document.getElementById('hue');
  PageData.Controls.Saturation = document.getElementById('saturation');

  PageData.Controls.Brightness.value = Common.Settings.Filters.Brightness;
  PageData.Controls.Contrast.value = Common.Settings.Filters.Contrast;
  PageData.Controls.Hue.value = Common.Settings.Filters.Hue;
  PageData.Controls.Saturation.value = Common.Settings.Filters.Saturation;

  PageData.Controls.Brightness.addEventListener('input', filterChange);
  PageData.Controls.Contrast.addEventListener('input', filterChange);
  PageData.Controls.Hue.addEventListener('input', filterChange);
  PageData.Controls.Saturation.addEventListener('input', filterChange);

  document.getElementById('reset').addEventListener('click', filterResetClick);
  document.getElementById('save').addEventListener('click', filterSaveClick);
}

/** Displays the given error message. */
function showError(error) {
  // console.log('showError', error);

  document.title = 'Error | M365 Maps';

  document.getElementById('errorMessage').innerText = error;
  document.getElementById('errorDiv').style.display = 'block';
  document.getElementById('menu').style.display = 'none';
  if (SvgModule.Data.Tag) SvgModule.Data.Tag.style.display = 'none';
}

/** Updates all data on the Menu elements and sets the size and offset data. */
function updateMenu() {
  // console.log('updateMenu');

  const menuPanel = document.getElementById('menu');
  const menuGrip = document.getElementById('menuGrip');
  const menuSave = document.getElementById('menuSave');
  const menuHighlight = document.getElementById('menuHighlight');
  const menuExportSvg = document.getElementById('menuExportSvg');
  const menuExportPng = document.getElementById('menuExportPng');

  if (Common.isIOSEdge) {
    const menuPrint = document.getElementById('menuPrint');
    menuPrint.style.display = 'none';
  }

  if (SvgModule.Data.Highlighting) {
    menuHighlight.src = '/media/edit-on.svg';
    menuHighlight.title = 'Turn off highlighter';
  } else {
    menuHighlight.src = '/media/edit-off.svg';
    menuHighlight.title = 'Turn on highlighter';
  }

  if (SvgModule.Data.Highlighting) {
    menuSave.style.display = 'inline';

    // menuExportSvg.style.display = 'inline';
    menuExportSvg.style.display = (Common.isIOSEdge ? 'none' : 'inline');

    // menuExportPng.style.display =  (isIE ? 'none' : 'inline');
    menuExportPng.style.display = (Common.isIOSEdge || Common.isIE ? 'none' : 'inline');
  } else {
    menuSave.style.display = 'none';

    menuExportSvg.style.display = (!Common.isIOSEdge ? 'inline' : 'none');

    menuExportPng.style.display = (!Common.isIE && !Common.isIOSEdge ? 'inline' : 'none');
  }

  menuPanel.style.display = 'block';

  // 4px padding on div#menu
  PageData.MenuOffset = menuPanel.clientWidth - menuGrip.clientWidth - 4;
}

/** Shows the App Offline indicator and updates the menu. */
function appOffline() {
  document.getElementById('offline').style.display = 'block';
  updateMenu();
}

/** Hides the App Offline indicator and updates the menu. */
function appOnline() {
  document.getElementById('offline').style.display = 'none';
  updateMenu();
}

/** Sets the menu panel position, grip title, and grip graphic based on
 * PageData.MenuOpen. */
function setMenuPosition() {
  // console.log('setMenuPosition');
  const menuPanel = document.getElementById('menu');
  const menuGrip = document.getElementById('menuGrip');

  if (PageData.MenuOpen) {
    menuGrip.title = 'Close menu';
    menuGrip.src = '/media/close.svg';
    menuPanel.style.right = 0;
  } else {
    menuGrip.title = 'Open menu';
    menuGrip.src = '/media/open.svg';
    menuPanel.style.right = -PageData.MenuOffset + 'px';
  }
}

/** User clicked the menu grip, toggling the PageData.MenuOpen state and
 * redrawing the menu. */
function menuGripClick() {
  // console.log('menuGripClick');

  PageData.MenuOpen = !PageData.MenuOpen;
  setMenuPosition();

  if (!PageData.MenuOpen && PageData.ControlsOpen) {
    PageData.ControlsOpen = false;
    setControlsPosition();
  }
}

/** Handles the user clicking the menu Print item. */
function printClick(event) {
  // console.log('printClick');

  event.preventDefault();

  window.print();
}

/** Handles the user clicking the menu Highlighter item. */
function menuHighlightClick(event) {
  // console.log('menuHighlightClick');

  event.preventDefault();

  SvgModule.Data.Highlighting = !SvgModule.Data.Highlighting;

  updateMenu();
}

/** Handles the user clicking the menu Controls item. */
function menuControlsClick(event) {
  // console.log('menuControlsClick');

  event.preventDefault();

  PageData.ControlsOpen = !PageData.ControlsOpen;
  setControlsPosition();
}

/** Handles the user clicking the menu Save item. */
function menuSaveClick(event) {
  // console.log('menuSaveClick');

  event.preventDefault();

  let diagramTitle = PageData.SavedImageTitle;
  let storageKey = Date.now().toString();

  let overwrite = Common.customConfirm('Overwrite existing diagram?');
  if (overwrite) {
    storageKey = PageData.Filename;
  } else {
    diagramTitle = Common.customPrompt('Save diagram as:', diagramTitle);
    if (!diagramTitle) return;
  }

  const svgXml = SvgModule.getSvgXml();
  const svgObject = { Title: diagramTitle, SvgXml: svgXml };
  const jsonData = JSON.stringify(svgObject);
  localStorage.setItem(storageKey, jsonData);
}

/** Handles the user clicking the menu Export SVG item. */
function exportSvgClick(event) {
  // console.log('exportSvgClick');

  event.preventDefault();

  const filename = PageData.SavedImageTitle + '.svg';
  const svgXml = SvgModule.getSvgXml();

  Common.exportSvg(filename, svgXml);
}

/** Handles the user clicking the menu Export PNG item. */
function exportPngClick(event) {
  // console.log('exportPngClick');

  event.preventDefault();

  if (Common.isIE) return;

  const background = window.getComputedStyle(document.body).backgroundColor;
  const filename = PageData.SavedImageTitle + '.png';
  const svgXml = SvgModule.getSvgXml();

  Common.exportPng(filename, svgXml, background);
}

/** Attaches event listeners and sets the initial menu state. */
function setupMenu() {
  // console.log('setupMenu');

  document.getElementById('menuGrip')
    .addEventListener('click', menuGripClick);

  document.getElementById('menuPrint')
    .addEventListener('click', printClick);

  document.getElementById('menuHighlight')
    .addEventListener('click', menuHighlightClick);

  const menuControls = document.getElementById('menuControls');
  if (Common.isIE) {
    menuControls.style.display = 'none';
  } else {
    menuControls.addEventListener('click', menuControlsClick);
  }

  document.getElementById('menuSave')
    .addEventListener('click', menuSaveClick);

  document.getElementById('menuExportSvg')
    .addEventListener('click', exportSvgClick);

  document.getElementById('menuExportPng')
    .addEventListener('click', exportPngClick);

  PageData.MenuOpen = (Common.Settings.Menu === 'Open');
}

/** Detect a legacy diagram URL and redirect the user promptly to the correct page. */
function legacyRedirect() {
  let indexOf = window.location.href.indexOf('#');
  if (indexOf === -1) indexOf = window.location.href.indexOf('=');
  if (indexOf === -1 || indexOf === window.location.href.length - 1) return;
  if (window.location.href[indexOf + 1] === '*') return;

  const redirect = window.location.origin + '/'
    + window.location.href.substring(indexOf + 1) + '.htm';

  location.replace(redirect);
}

/** Loads the saved diagram referenced in the URL hash. */
function loadSavedDiagram() {
  // console.log('loadSavedDiagram');

  if (!window.location.hash) {
    showError('Missing saved diagram details');
    return;
  }

  const end = window.location.hash.indexOf('-blank');
  if (end !== -1) {
    PageData.Filename = window.location.hash.substring(2, end);
  } else {
    PageData.Filename = window.location.hash.substring(2);
  }

  const json = localStorage.getItem(PageData.Filename);
  if (!json) {
    showError('Failed to load saved diagram');
    return;
  }

  const data = JSON.parse(json);
  if (!data || !data.SvgXml) {
    showError('Failed to process saved diagram data');
    return;
  }

  PageData.SavedImageTitle = data.Title;

  document.title = 'Saved diagram: ' + PageData.SavedImageTitle + ' | M365 Maps';

  const svgXml = data.SvgXml
    .replace(/<!--.*-->/i, '')
    .replace(/<\?xml.*\?>/i, '')
    .replace(/<!doctype.*>/i, '')
    .replace(/^[\n\r]+/, '');

  SvgModule.Data.Tag = Common.createElementFromHtml(svgXml);
  document.body.appendChild(SvgModule.Data.Tag);

  SvgModule.injectHighlightStyles();
  SvgModule.sizeSvg();
  SvgModule.registerEvents();

  if (SvgModule.Data.Tag.style.filter !== '')
    readFilterValuesfromSvg();

  filterChange();
}

/** Page Load event handler. */
function pageLoad() {
  // console.log('pageLoad');

  const blank = window.location.hash.endsWith('-blank');
  if (!blank) {
    setupMenu();
  }

  setupImageControls();
  loadSavedDiagram();

  if (!blank) {
    updateMenu();
    setMenuPosition();
    setControlsPosition();

    document.getElementById('offline').style
      .display = (navigator.onLine ? 'none' : 'block');
    window.addEventListener('offline', appOffline);
    window.addEventListener('online', appOnline);
  }
}

legacyRedirect();

window.addEventListener('load', pageLoad);
