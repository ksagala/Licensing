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
  Flagged: false,
  Flags: [],
};

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

/** Updates all data on the Menu elements and sets the size and offset data. */
function updateMenu() {
  // console.log('updateMenu');

  const menuPanel = document.getElementById('menu');
  const menuGrip = document.getElementById('menuGrip');
  const menuFlag = document.getElementById('menuFlag');
  const menuPdf = document.getElementById('menuPdf');
  const menuPng = document.getElementById('menuPng');
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

  if (PageData.Flagged) {
    menuFlag.src = '/media/flagged.svg';
    menuFlag.title = 'Remove flag';
  } else {
    menuFlag.src = '/media/unflagged.svg';
    menuFlag.title = 'Flag this diagram';
  }

  if (SvgModule.Data.Highlighting) {
    menuSave.style.display = 'inline';

    // menuExportSvg.style.display = 'inline';
    menuExportSvg.style.display = (Common.isIOSEdge ? 'none' : 'inline');

    // menuExportPng.style.display =  (isIE ? 'none' : 'inline');
    menuExportPng.style.display = (Common.isIOSEdge || Common.isIE ? 'none' : 'inline');
  } else {
    menuSave.style.display = 'none';
    menuExportSvg.style.display = 'none';
    menuExportPng.style.display = 'none';
  }

  menuFlag.style.display = 'inline';

  if (SvgModule.Data.Highlighting) {
    menuPdf.style.display = 'none';
    menuPng.style.display = 'none';
  } else {
    menuPdf.style.display = 'inline';
    menuPng.style.display = 'inline';
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
}

/** Handles the user clicking the menu Flag item. */
function flagClick(event) {
  // console.log('flagClick');

  event.preventDefault();

  if (PageData.Flagged) {
    const flagIndex = PageData.Flags.indexOf(PageData.Filename);
    if (flagIndex > -1) PageData.Flags.splice(flagIndex, 1);

    PageData.Flagged = false;
  } else {
    PageData.Flags.push(PageData.Filename);

    PageData.Flagged = true;
  }

  localStorage.setItem(Common.StoreName.Flags, JSON.stringify(PageData.Flags));

  updateMenu();
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

  let diagramTitle = decodeURIComponent(PageData.Filename);
  diagramTitle = Common.customPrompt('Save diagram as:', diagramTitle);

  if (!diagramTitle) return;

  let storageKey = Date.now().toString();

  const svgXml = SvgModule.getSvgXml();
  const svgObject = { Title: diagramTitle, SvgXml: svgXml };
  const jsonData = JSON.stringify(svgObject);
  localStorage.setItem(storageKey, jsonData);
}

/** Handles the user clicking the menu Export SVG item. */
function exportSvgClick(event) {
  // console.log('exportSvgClick');

  event.preventDefault();

  const filename = decodeURIComponent(PageData.Filename) + '.svg';
  const svgXml = SvgModule.getSvgXml();

  Common.exportSvg(filename, svgXml);
}

/** Handles the user clicking the menu Export PNG item. */
function exportPngClick(event) {
  // console.log('exportPngClick');

  event.preventDefault();

  if (Common.isIE) return;

  const background = window.getComputedStyle(document.body).backgroundColor;
  const filename = decodeURIComponent(PageData.Filename) + '.png';
  const svgXml = SvgModule.getSvgXml();

  Common.exportPng(filename, svgXml, background);
}

/** Attaches event listeners and sets the initial menu state. */
function setupMenu() {
  // console.log('setupMenu');

  document.getElementById('menuGrip')
    .addEventListener('click', menuGripClick);

  document.getElementById('menuFlag')
    .addEventListener('click', flagClick);

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

/** Load flagged diagrms list from local storage. */
function loadFlags() {
  const flagsJSON = localStorage.getItem(Common.StoreName.Flags);
  if (flagsJSON) {
    const flags = JSON.parse(flagsJSON);
    if (flags) {
      PageData.Flags = flags;
    }
  }
}

/** Page Load event handler. */
function pageLoad() {
  // console.log('pageLoad');

  const noChrome = (window.location.hash === '#blank');
  if (!noChrome) {
    setupMenu();
    setupImageControls();

    loadFlags();

    PageData.Filename = window.location.pathname
      .substring(1, window.location.pathname.length - 4);

    PageData.Flagged = PageData.Flags.contains(PageData.Filename);
  }

  SvgModule.Data.Tag = document.getElementsByTagName('svg').item(0);

  SvgModule.injectHighlightStyles();
  SvgModule.sizeSvg();
  SvgModule.registerEvents();

  if (!Common.isIE) filterChange();

  if (!noChrome) {
    updateMenu();
    setMenuPosition();
    setControlsPosition();

    document.getElementById('offline').style
      .display = (navigator.onLine ? 'none' : 'block');
    window.addEventListener('offline', appOffline);
    window.addEventListener('online', appOnline);
  }
}

window.addEventListener('load', pageLoad);
