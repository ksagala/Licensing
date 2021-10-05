/// <reference path="common.js" />
/* global Settings, modalAlert, saveSettings, StoreName, getStringBetween,
   getFiltersCss, isIOSEdge, getModalInputText, modalPrompt, modalAlert,
   modalConfirm, exportSvg, exportPng, setupModal, createElementFromHtml,
   setupOfflineIndicator, Mouse */

/** SVG Data. */
const SvgData = {
  Dragging: false,
  Editing: false,
  Scroll: {
    TargetNodeName: undefined,
    Top: 0,
    Left: 0,
    X: 0,
    Y: 0,
  },
  StartWidth: 0,
  StartHeight: 0,
  Tag: undefined,
  Zoom: 100,
  ZoomX: 0,
  ZoomY: 0,
  Zooming: false,
  ZoomStepSize: 20,
};

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
  Flagged: false,
  Flags: [],
  SavedDiagram: false,
  Comparing: false,
};

// SVG Functions

/** Converts the SVG Tag into XML. */
function getSvgXml() {
  return new XMLSerializer().serializeToString(SvgData.Tag);
}

/** Inject the Highlight Style block into the SVG tag. */
function injectHighlightStyles() {
  const oldStyleTag = SvgData.Tag.getElementById('m365MapsHighlights');
  if (oldStyleTag) {
    SvgData.Tag.removeChild(oldStyleTag);
  }

  const styleHtml = '<style id="m365MapsHighlights">'
    + '.highlight1{fill:' + Settings.Highlight1
    + '!important;transition:0.4s;}'
    + '.highlight2{fill:' + Settings.Highlight2
    + '!important;transition:0.4s;}'
    + '.highlight3{fill:' + Settings.Highlight3
    + '!important;transition:0.4s;}'
    + '</style>';

  const newStyleTag = createElementFromHtml(styleHtml);
  SvgData.Tag.appendChild(newStyleTag);
}

/** Clears all highlight classes from the current diagram SVG. */
function clearAllHighlights() {
  Array.from(SvgData.Tag.getElementsByClassName('highlight1'))
    .forEach(function arrayForEach(element) {
      element.classList.remove('highlight1');
    });
  Array.from(SvgData.Tag.getElementsByClassName('highlight2'))
    .forEach(function arrayForEach(element) {
      element.classList.remove('highlight2');
    });
  Array.from(SvgData.Tag.getElementsByClassName('highlight3'))
    .forEach(function arrayForEach(element) {
      element.classList.remove('highlight3');
    });
}

/** Returns a highlight target inside the SVG given the starting element. */
function findHighlightTarget(start) {
  let target = start;

  if (target.nodeName === 'tspan') target = target.parentNode;
  if (target.nodeName === 'text') target = target.parentNode;
  if (target.nodeName === 'g') {
    let children = target.getElementsByTagName('rect');
    if (children.length === 0) {
      children = target.getElementsByTagName('path');
    }
    if (children.length === 0) {
      return null;
    }

    target = children.item(0);
  }

  return (target.nodeName === 'rect' || target.nodeName === 'path') ?
    target : null;
}

/** Sizes the SVG image to fit according the user preferred Zoom option. */
function sizeSvg() {
  if (!SvgData.Tag) return;

  SvgData.Tag.style.display = 'inline';

  let scale = 0.985;

  switch (Settings.Zoom) {
    case 'Fit':
      scale *= Math.min(
        window.innerWidth / SvgData.Tag.clientWidth,
        window.innerHeight / SvgData.Tag.clientHeight
      );
      break;

    case 'Fit Width':
      scale *= window.innerWidth / SvgData.Tag.clientWidth;
      break;

    case 'Fit Height':
      scale *= window.innerHeight / SvgData.Tag.clientHeight;
      break;

    case 'Fill':
      scale *= Math.max(
        window.innerWidth / SvgData.Tag.clientWidth,
        window.innerHeight / SvgData.Tag.clientHeight
      );
      break;

    default:
      throw 'Unexpected Zoom setting value: ' + Settings.Zoom;
  }

  const newWidth = Math.floor(SvgData.Tag.clientWidth * scale);
  const newHeight = Math.floor(SvgData.Tag.clientHeight * scale);

  SvgData.Tag.style.width = newWidth + 'px';
  SvgData.Tag.style.height = newHeight + 'px';

  SvgData.StartWidth = newWidth;
  SvgData.StartHeight = newHeight;
  SvgData.Zoom = 100;
}

/** Handles mouse middle button click events. */
function auxClickEvent(event) {
  if (event.button !== Mouse.Button.Middle) return;

  event.preventDefault();

  if (SvgData.Editing) {
    clearAllHighlights();
  } else {
    sizeSvg();
  }
}

/** Handles mouse left click events for highlighting and
 * drag to scroll end. */
function clickEvent(event) {
  // Ignore click events at the end of dragging
  if (SvgData.Dragging) {
    event.preventDefault();

    SvgData.Dragging = false;
  } else if (SvgData.Editing) {
    const target = findHighlightTarget(event.target);
    if (target === null) return;

    event.preventDefault();

    if (target.classList.contains('highlight1')) {
      target.classList.remove('highlight1');
    } else if (target.classList.contains('highlight2')) {
      target.classList.remove('highlight2');
    } else if (target.classList.contains('highlight3')) {
      target.classList.remove('highlight3');
    } else if (event.ctrlKey) {
      target.classList.add('highlight3');
    } else if (event.shiftKey) {
      target.classList.add('highlight2');
    } else {
      target.classList.add('highlight1');
    }
  }
}

/** Sets drag to scroll reference data on left button and ignores middle
 * button events. */
function mouseDown(event) {
  if (event.buttons === Mouse.Buttons.Left) {
    SvgData.Scroll.TargetNodeName = event.target.nodeName;
    SvgData.Scroll.Left = document.documentElement.scrollLeft;
    SvgData.Scroll.Top = document.documentElement.scrollTop;
    SvgData.Scroll.X = event.clientX;
    SvgData.Scroll.Y = event.clientY;
  } else if (event.buttons === Mouse.Buttons.Middle) {
    event.preventDefault();
  }
}

/** Performs drag to scroll events for left button and ignores zero movement
 * events. */
function mouseMove(event) {
  if (event.buttons !== Mouse.Buttons.Left) return;

  // Ignore drag events initiated on input and button controls (ie. Sliders)
  if (SvgData.Scroll.TargetNodeName === 'INPUT'
    || SvgData.Scroll.TargetNodeName === 'BUTTON') {
    return;
  }

  // Ignore zero movement events by clicking when tooltips are visible
  if (SvgData.Scroll.X === event.clientX
    && SvgData.Scroll.Y === event.clientY) {
    return;
  }

  event.preventDefault();

  SvgData.Dragging = true;

  window.scroll(
    SvgData.Scroll.Left + SvgData.Scroll.X - event.clientX,
    SvgData.Scroll.Top + SvgData.Scroll.Y - event.clientY
  );
}

/** Timer fires regularly to act on zoom instructions, taking the action off
 *  the even listener. */
function zoomTimer() {
  if (!SvgData.Zooming) return;

  SvgData.Zooming = false;

  const prevWidth = SvgData.Tag.clientWidth;
  const prevHeight = SvgData.Tag.clientHeight;
  const newWidth =
    Math.floor(SvgData.StartWidth * SvgData.Zoom / 100);
  const newHeight =
    Math.floor(SvgData.StartHeight * SvgData.Zoom / 100);

  SvgData.Tag.style.width = newWidth + 'px';
  SvgData.Tag.style.height = newHeight + 'px';

  // Scroll to keep image centred about the pointer position
  const scaleFactorX = newWidth / prevWidth;
  const scaleFactorY = newHeight / prevHeight;
  const centreX = SvgData.ZoomX * scaleFactorX;
  const centreY = SvgData.ZoomY * scaleFactorY;
  const deltaX = centreX - SvgData.ZoomX;
  const deltaY = centreY - SvgData.ZoomY;

  window.scroll(
    document.documentElement.scrollLeft + deltaX,
    document.documentElement.scrollTop + deltaY
  );
}

/** Apply the zoom step with checks and balances on limits and zoom level. */
function applyZoomStep(step) {
  // Use smaller step sizes when zoomed less than 100%
  if (SvgData.Zoom < 100) {
    step = step / 4;
  } else if (SvgData.Zoom === 100) {
    if (step < 0) {
      step = step / 4;
    }
  }

  SvgData.Zoom += step;

  if (SvgData.Zoom > 1000) SvgData.Zoom = 1000;
  else if (SvgData.Zoom < 10) SvgData.Zoom = 10;
}

/** Intercepts the mouse wheel event and uses it to zoom in/out on SVG (when
  * present). */
function wheelEvent(event) {
  if (!SvgData.Tag) return;

  event.preventDefault();

  if (event.deltaY < 0.1 && event.deltaY > -0.1) return;

  let step = SvgData.ZoomStepSize;
  if (event.deltaY > 0) step = -step;

  applyZoomStep(step);

  SvgData.ZoomX = event.pageX;
  SvgData.ZoomY = event.pageY;

  SvgData.Zooming = true;
}

/** Zoom based on a key press. */
function zoomKey(step) {
  applyZoomStep(step);

  // Centre the zoom about the middle of the viewport
  SvgData.ZoomX = document.documentElement.scrollLeft
    + (window.innerWidth / 2);
  SvgData.ZoomY = document.documentElement.scrollTop
    + (window.innerHeight / 2);

  SvgData.Zooming = true;
}

/** Act on key presses for zooming. */
function keyUpEvent(event) {
  if (event.target !== document.body) return;

  switch (event.key) {
    case '+':
      zoomKey(SvgData.ZoomStepSize);
      event.preventDefault();
      break;
    case '-':
      zoomKey(-SvgData.ZoomStepSize);
      event.preventDefault();
      break;
    case '=':
      sizeSvg();
      event.preventDefault();
      break;
  }
}

/** Adds custom tooltips to the individual tiles of the current diagram. */
// function addTooltips() {
//   const tooltipText = [
//     { text: 'Microsoft 365 E3', description: 'Microsoft 365 E3' },
//     { text: 'Self-Service Password Reset in AD', description: 'Self-Service Password Reset in AD' }
//   ];

//   const links = SvgData.Tag.getElementsByTagName('a');
//   Array.from(links).forEach(function forEachLink(link) {
//     const texts = link.getElementsByTagName('text');
//     if (texts.length === 1) {
//       const text = texts[0].textContent;
//       const tooltip = tooltipText.find(item => item.text === text);
//       if (tooltip) {
//         link.dataset.tooltip = tooltip.description;
//         // link.addEventListener('mouseover', () => {
//         //   mouseOverCallback(tooltip.description);
//         // });
//         //   link.addEventListener('mouseout', () => {
//         // });
//       }
//     }
//   });
// }

/** Register the SVG related event handlers. */
function registerSvgEvents() {
  // SVG Click events
  SvgData.Tag.addEventListener('click', clickEvent);
  SvgData.Tag.addEventListener('auxclick', auxClickEvent);

  // Mouse actions for drag to scroll
  window.addEventListener('mousedown', mouseDown);
  window.addEventListener('mousemove', mouseMove);

  // Key presses for zooming / reset zoom
  window.addEventListener('keyup', keyUpEvent);

  // Listen for the scroll wheel for zooming
  window.addEventListener('wheel', wheelEvent, { passive: false });

  // Setup timer function for zooming actions outside the event listener
  setInterval(zoomTimer, 100);
}

// Page Functions

/** Handles the user clicking the menu Flag item. */
function flagClick() {
  if (PageData.Flagged) {
    const flagIndex = PageData.Flags.indexOf(PageData.Filename);
    if (flagIndex > -1) PageData.Flags.splice(flagIndex, 1);

    PageData.Flagged = false;
  } else {
    PageData.Flags.push(PageData.Filename);

    PageData.Flagged = true;
  }

  localStorage.setItem(StoreName.Flags, JSON.stringify(PageData.Flags));

  updateMenu();
}

/** Load flagged diagrms list from local storage. */
function loadFlags() {
  const flagsJSON = localStorage.getItem(StoreName.Flags);
  if (flagsJSON) {
    const flags = JSON.parse(flagsJSON);
    if (flags) {
      PageData.Flags = flags;
    }
  }
}

/** Read the filter values from the existing filter style on the SVG tag. */
function readFilterValuesfromSvg() {
  const filters = SvgData.Tag.style.filter;
  if (filters === '') return false;

  const bIndex = filters.indexOf('brightness');
  const cIndex = filters.indexOf('contrast');
  const hIndex = filters.indexOf('hue-rotate');
  const sIndex = filters.indexOf('saturate');

  const bString = getStringBetween(filters, bIndex, '(', ')');
  const cString = getStringBetween(filters, cIndex, '(', ')');
  const hString = getStringBetween(filters, hIndex, '(', 'deg');
  const sString = getStringBetween(filters, sIndex, '(', ')');

  if (bString) PageData.Controls.Brightness.value = bString * 10;
  if (cString) PageData.Controls.Contrast.value = cString * 10;
  if (hString) PageData.Controls.Hue.value = hString;
  if (sString) PageData.Controls.Saturation.value = sString * 10;

  return true;
}

/** Update the SVG filter CSS based on changes to the image controls. */
function filterChange() {
  SvgData.Tag.style.filter = getFiltersCss(
    PageData.Controls.Brightness.value,
    PageData.Controls.Contrast.value,
    PageData.Controls.Hue.value,
    PageData.Controls.Saturation.value);
}

/** Handles the user clicking the image controls menu reset button. */
function imageControlsResetClick() {
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

/** Handles the user clicking the image controls menu save button. */
function imageControlsSaveClick() {
  Settings.Filters.Brightness = PageData.Controls.Brightness.value;
  Settings.Filters.Contrast = PageData.Controls.Contrast.value;
  Settings.Filters.Hue = PageData.Controls.Hue.value;
  Settings.Filters.Saturation = PageData.Controls.Saturation.value;

  saveSettings();

  PageData.ControlsOpen = false;
  setControlsPosition();
}

/** Sets the image controls panel position based on PageData.ControlsOpen. */
function setControlsPosition() {
  const filters = document.getElementById('image-controls');

  filters.style.top =
    (PageData.ControlsOpen ? document.getElementById('menu').clientHeight
      : '-' + filters.clientHeight)
    + 'px';
}

/** Set values and attach event listeners to image control elements. */
function setupImageControls() {
  PageData.Controls.Brightness = document.getElementById('brightness');
  PageData.Controls.Contrast = document.getElementById('contrast');
  PageData.Controls.Hue = document.getElementById('hue');
  PageData.Controls.Saturation = document.getElementById('saturation');

  PageData.Controls.Brightness.value = Settings.Filters.Brightness;
  PageData.Controls.Contrast.value = Settings.Filters.Contrast;
  PageData.Controls.Hue.value = Settings.Filters.Hue;
  PageData.Controls.Saturation.value = Settings.Filters.Saturation;

  PageData.Controls.Brightness.addEventListener('input', filterChange);
  PageData.Controls.Contrast.addEventListener('input', filterChange);
  PageData.Controls.Hue.addEventListener('input', filterChange);
  PageData.Controls.Saturation.addEventListener('input', filterChange);

  document.getElementById('image-controls-reset')
    .addEventListener('click', imageControlsResetClick);
  document.getElementById('image-controls-save')
    .addEventListener('click', imageControlsSaveClick);
}

/** Updates all data on the Menu elements and sets the size and offset data. */
function updateMenu() {
  const menuPanel = document.getElementById('menu');
  const menuGrip = document.getElementById('menu-grip');
  const menuEdit = document.getElementById('menu-edit');

  const menuFlag = document.getElementById('menu-flag');
  const menuDownloadPdf = document.getElementById('menu-download-pdf');
  const menuDownloadPng = document.getElementById('menu-download-png');
  const menuExportSvg = document.getElementById('menu-export-svg');
  const menuExportPng = document.getElementById('menu-export-png');

  if (isIOSEdge) {
    document.getElementById('menu-print').style.display = 'none';

    if (PageData.SavedDiagram) {
      menuExportSvg.style.display = 'none';
      menuExportPng.style.display = 'none';
    }
  }

  if (SvgData.Editing) {
    menuEdit.className = 'on';
    menuEdit.title = 'Turn off edit mode';

    if (!PageData.SavedDiagram) {
      menuExportSvg.style.display = (isIOSEdge ? 'none' : 'inline');
      menuExportPng.style.display = (isIOSEdge ? 'none' : 'inline');
    }

    if (menuDownloadPdf) menuDownloadPdf.style.display = 'none';
    if (menuDownloadPng) menuDownloadPng.style.display = 'none';
  } else {
    menuEdit.className = 'off';
    menuEdit.title = 'Turn on edit mode';

    if (!PageData.SavedDiagram) {
      menuExportSvg.style.display = 'none';
      menuExportPng.style.display = 'none';
    }

    if (menuDownloadPdf) menuDownloadPdf.style.display = 'inline';
    if (menuDownloadPng) menuDownloadPng.style.display = 'inline';

    if (navigator.onLine) {
      if (menuDownloadPdf) menuDownloadPdf.disabled = false;
      if (menuDownloadPng) menuDownloadPng.disabled = false;
    } else {
      if (menuDownloadPdf) menuDownloadPdf.disabled = true;
      if (menuDownloadPng) menuDownloadPng.disabled = true;
    }
  }

  if (menuFlag) {
    if (PageData.Flagged) {
      menuFlag.className = 'flagged';
      menuFlag.title = 'Remove flag';
    } else {
      menuFlag.className = 'unflagged';
      menuFlag.title = 'Flag this diagram';
    }
  }

  PageData.MenuOffset =
    menuPanel.clientWidth
    - window.getComputedStyle(menuPanel).paddingLeft.slice(0, -2)
    - menuGrip.clientWidth
    - window.getComputedStyle(menuGrip).marginRight.slice(0, -2);
}

/** Sets the menu panel position, grip title, and grip graphic based on
 * PageData.MenuOpen. */
function setMenuPosition() {
  const menuPanel = document.getElementById('menu');
  const menuGrip = document.getElementById('menu-grip');

  if (PageData.MenuOpen) {
    menuGrip.title = 'Close menu';
    menuGrip.className = 'close';
    menuPanel.style.right = 0;
  } else {
    menuGrip.title = 'Open menu';
    menuGrip.className = 'open';
    menuPanel.style.right = -PageData.MenuOffset + 'px';
  }
}

/** User clicked the menu grip, toggling the PageData.MenuOpen state and
 * redrawing the menu. */
function menuGripClick() {
  PageData.MenuOpen = !PageData.MenuOpen;
  setMenuPosition();

  if (!PageData.MenuOpen && PageData.ControlsOpen) {
    PageData.ControlsOpen = false;
    setControlsPosition();
  }
}

/** Handles the user clicking the menu edit item. */
function menuEditClick() {
  SvgData.Editing = !SvgData.Editing;

  updateMenu();
}

/** Handles the user clicking the menu Controls item. */
function menuControlsClick() {
  PageData.ControlsOpen = !PageData.ControlsOpen;
  setControlsPosition();
}

/** Save current SVG to local storage using title and key supplied. */
function saveSvg(title, storageKey) {
  const svgXml = getSvgXml();
  const svgObject = { Title: title, SvgXml: svgXml };
  const jsonData = JSON.stringify(svgObject);
  localStorage.setItem(storageKey, jsonData);
}

/** Handle the OK outcome on the Save Modal Prompt. */
function saveOK() {
  const diagramTitle = getModalInputText();
  if (!diagramTitle) return;

  const storageKey = Date.now().toString();
  saveSvg(diagramTitle, storageKey);

  window.location.href = '/viewsvg.htm#*' + storageKey;
}

/** Handles the Yes outcome on the Overwrite Modal Confirm. */
function overwriteYes() {
  saveSvg(PageData.SavedImageTitle, PageData.Filename);
}

/** Handles the No outcome on the Overwrite Modal Confirm. */
function overwriteNo() {
  modalPrompt('Save diagram as:', PageData.SavedImageTitle, saveOK);
}

/** Handles the user clicking the menu Save item. */
function menuSaveClick() {
  if (PageData.SavedDiagram) {
    modalConfirm('Overwrite existing diagram?', overwriteYes, overwriteNo);
  } else {
    const diagramTitle = decodeURIComponent(PageData.Filename);
    modalPrompt('Save diagram as:', diagramTitle, saveOK);
  }
}

/** Handles the user clicking the menu Export SVG item. */
function exportSvgClick() {
  var filename;
  if (PageData.SavedDiagram) {
    filename = PageData.SavedImageTitle + '.svg';
  } else {
    filename = decodeURIComponent(PageData.Filename) + '.svg';
  }

  const svgXml = getSvgXml();
  exportSvg(filename, svgXml);
}

/** Handles the user clicking the menu Export PNG item. */
function exportPngClick() {
  var filename;
  if (PageData.SavedDiagram) {
    filename = PageData.SavedImageTitle + '.png';
  } else {
    filename = decodeURIComponent(PageData.Filename) + '.png';
  }

  const svgXml = getSvgXml();
  const background = window.getComputedStyle(document.body).backgroundColor;
  exportPng(filename, svgXml, background);
}

/** Attaches event listeners and sets the initial menu state. */
function setupMenu() {
  document.getElementById('menu-grip')
    .addEventListener('click', menuGripClick);

  document.getElementById('menu-back')
    .addEventListener('click', () => window.history.back());

  document.getElementById('menu-print')
    .addEventListener('click', () => window.print());

  document.getElementById('menu-edit')
    .addEventListener('click', menuEditClick);

  document.getElementById('menu-controls')
    .addEventListener('click', menuControlsClick);

  document.getElementById('menu-save')
    .addEventListener('click', menuSaveClick);

  document.getElementById('menu-export-svg')
    .addEventListener('click', exportSvgClick);

  document.getElementById('menu-export-png')
    .addEventListener('click', exportPngClick);

  const menuFlag = document.getElementById('menu-flag');
  if (menuFlag) {
    menuFlag.addEventListener('click', flagClick);
  }

  const menuDownloadPdf = document.getElementById('menu-download-pdf');
  if (menuDownloadPdf) {
    menuDownloadPdf.addEventListener('click', () =>
      document.getElementById('download-pdf').click());
  }

  const menuDownloadPng = document.getElementById('menu-download-png');
  if (menuDownloadPng) {
    menuDownloadPng.addEventListener('click', () =>
      document.getElementById('download-png').click());
  }

  PageData.MenuOpen = (Settings.Menu === 'Open');
}

/** Detect a legacy diagram URL and redirect the user promptly to the
 *  correct page. */
function legacyRedirect() {
  let indexOf = window.location.href.indexOf('#');
  if (indexOf === -1) {
    indexOf = window.location.href.indexOf('=');
  }
  if (indexOf === -1 || indexOf === window.location.href.length - 1) {
    return false;
  }
  if (window.location.href[indexOf + 1] === '*') {
    return false;
  }

  const redirect = window.location.origin + '/'
    + window.location.href.substring(indexOf + 1) + '.htm';

  location.replace(redirect);

  return true;
}

/** Loads the saved diagram referenced in the URL hash. */
function loadSavedDiagram() {
  if (!window.location.hash || window.location.hash.length <= 2) {
    modalAlert('Missing saved diagram details',
      PageData.Comparing ? undefined : () => window.history.back());

    return false;
  }

  // Trim #* and /compare
  if (PageData.Comparing) {
    PageData.Filename = window.location.hash.slice(2, -8);
  } else {
    PageData.Filename = window.location.hash.substring(2);
  }

  const json = localStorage.getItem(PageData.Filename);
  if (!json) {
    modalAlert('Failed to locate saved diagram',
      PageData.Comparing ? undefined : () => window.history.back());

    return false;
  }

  const data = JSON.parse(json);
  if (!data || !data.SvgXml) {
    modalAlert('Failed to process saved diagram data',
      PageData.Comparing ? undefined : () => window.history.back());

    return false;
  }

  PageData.SavedImageTitle = data.Title;
  document.title = `Saved Diagram: ${data.Title} | M365 Maps`;

  const svgXml = data.SvgXml
    .replace(/<!--.*-->/i, '')
    .replace(/<\?xml.*\?>/i, '')
    .replace(/<!doctype.*>/i, '')
    .replace(/^[\n\r]+/, '');

  SvgData.Tag = createElementFromHtml(svgXml);
  document.body.appendChild(SvgData.Tag);

  return true;
}

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  setupModal();

  if (PageData.Comparing) {
    document.body.style.overflow = 'hidden';
    document.getElementById('menu').style.display = 'none';
    document.getElementById('image-controls').style.display = 'none';
  } else {
    setupMenu();

    setupOfflineIndicator();
    window.addEventListener('offline', updateMenu);
    window.addEventListener('online', updateMenu);

    if (!PageData.SavedDiagram) {
      loadFlags();

      // Remove leading / and trailing .htm
      PageData.Filename = window.location.pathname.slice(1, -4);

      PageData.Flagged = PageData.Flags.includes(PageData.Filename);
    }
  }

  setupImageControls();
}

/** Page Load event handler. */
function pageLoad() {
  if (PageData.SavedDiagram) {
    const loaded = loadSavedDiagram();
    if (!loaded) {
      return;
    }
  } else {
    SvgData.Tag = document.getElementsByTagName('svg').item(0);
  }

  injectHighlightStyles();
  sizeSvg();
  registerSvgEvents();

  const hasFilters = readFilterValuesfromSvg();
  if (!hasFilters) filterChange();

  if (!PageData.Comparing) {
    updateMenu();
    setMenuPosition();
    setControlsPosition();
    // addTooltips();
  }
}

PageData.Comparing = window.location.hash.endsWith('/compare');
PageData.SavedDiagram = (window.location.pathname === '/viewsvg.htm');

let redirecting = false;
if (PageData.SavedDiagram) {
  redirecting = legacyRedirect();
}

if (!redirecting) {
  document.addEventListener('DOMContentLoaded', DOMContentLoaded);
  window.addEventListener('load', pageLoad);
}
