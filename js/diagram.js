/** Page Data. */
const PageData = {};

/** Reset all page data to original page load state. */
function resetPageData() {
  PageData.Dragging = false;
  PageData.Filename = '';
  PageData.Highlighted = [];
  PageData.Highlighting = false;
  PageData.MenuOffset = 0;
  PageData.MenuOpen = false;
  PageData.Flagged = false;
  PageData.Flags = [];
  PageData.Scroll = {
    Top: 0,
    Left: 0,
    X: 0,
    Y: 0,
  };
  PageData.SvgTag = undefined;
  PageData.Zoom = 100;
}

/** Converts the SVG Tag into XML. */
function getSvgXml() {
  // console.log('getSvgXml');

  const svgStyle = ' style="' + PageData.SvgTag.style.cssText + '"';
  let svgXml = new XMLSerializer()
    .serializeToString(PageData.SvgTag)
    .replace(svgStyle, '');

  if (isIE) {
    // IE11 workaround for malformed namespaces
    svgXml = svgXml.replace('xmlns:NS1="" NS1:xmlns:ev="http://www.w3.org/2001/xml-events"',
      'xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events"');
  }

  return svgXml;
}

/** Hides any error messages. */
function hideError() {
  document.getElementById('errorDiv').style.display = 'none';
}

/** Displays the given error message. */
function showError(error) {
  // console.log('showError', error);

  resetPageData();

  document.getElementById('errorMessage').innerText = error;
  document.getElementById('errorDiv').style.display = 'block';

  document.getElementById('menu').style.display = 'none';

  document.getElementsByTagName('svg').item(0).style.display = 'none';
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

  if (isIOSEdge) {
    const menuPrint = document.getElementById('menuPrint');
    menuPrint.style.display = 'none';
  }

  if (PageData.Highlighting) {
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

  if (PageData.Highlighting) {
    menuSave.style.display = 'inline';

    // menuExportSvg.style.display = 'inline';
    menuExportSvg.style.display = (isIOSEdge ? 'none' : 'inline');

    // menuExportPng.style.display =  (isIE ? 'none' : 'inline');
    menuExportPng.style.display = (isIOSEdge || isIE ? 'none' : 'inline');
  } else {
    menuSave.style.display = 'none';
    menuExportSvg.style.display = 'none';
    menuExportPng.style.display = 'none';
  }

  menuFlag.style.display = 'inline';

  if (PageData.Highlighting) {
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

/** Intercepts the mouse wheel event and uses it to zoom in/out on SVG (when
 * present). */
function wheelEvent(event) {
  if (!PageData.SvgTag) return;

  event.preventDefault();

  if (event.deltaY > -0.1) {
    PageData.Zoom -= (PageData.Zoom > 100 ? 20 : 5);
  } else if (event.deltaY < 0.1) {
    PageData.Zoom += (PageData.Zoom < 100 ? 5 : 20);
  } else {
    return;
  }

  if (PageData.Zoom > 800) PageData.Zoom = 800;
  else if (PageData.Zoom < 10) PageData.Zoom = 10;

  const startWidth = PageData.SvgTag.getAttribute('startwidth');
  const startHeight = PageData.SvgTag.getAttribute('startheight');
  const prevWidth = PageData.SvgTag.clientWidth;
  const prevHeight = PageData.SvgTag.clientHeight;
  const newWidth = Math.floor((startWidth * PageData.Zoom) / 100.0);
  const newHeight = Math.floor((startHeight * PageData.Zoom) / 100.0);
  PageData.SvgTag.style.width = newWidth + 'px';
  PageData.SvgTag.style.height = newHeight + 'px';

  // Scroll to keep image centred about the pointer position
  const scaleFactorX = newWidth / prevWidth;
  const scaleFactorY = newHeight / prevHeight;
  const centreX = event.pageX * scaleFactorX;
  const centreY = event.pageY * scaleFactorY;
  const deltaX = centreX - event.pageX;
  const deltaY = centreY - event.pageY;

  window.scroll(
    document.documentElement.scrollLeft + deltaX,
    document.documentElement.scrollTop + deltaY
  );
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

  localStorage.setItem(StoreName.Flags, JSON.stringify(PageData.Flags));

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

  PageData.Highlighting = !PageData.Highlighting;

  updateMenu();
}

/** Handles the user clicking the menu Save item. */
function menuSaveClick(event) {
  // console.log('menuSaveClick');

  event.preventDefault();

  let diagramTitle = decodeURIComponent(PageData.Filename);
  diagramTitle = customPrompt('Save diagram as:', diagramTitle);

  if (!diagramTitle) return;

  let storageKey = Date.now().toString();

  const svgXml = getSvgXml();
  const svgObject = { Title: diagramTitle, SvgXml: svgXml };
  const jsonData = JSON.stringify(svgObject);
  localStorage.setItem(storageKey, jsonData);
}

/** Handles the user clicking the menu Export SVG item. */
function exportSvgClick(event) {
  // console.log('exportSvgClick');

  event.preventDefault();

  const filename = decodeURIComponent(PageData.Filename) + '.svg';
  const svgXml = getSvgXml();

  exportSvg(filename, svgXml);
}

/** Handles the user clicking the menu Export PNG item. */
function exportPngClick(event) {
  // console.log('exportPngClick');

  event.preventDefault();

  if (isIE) return;

  const background = window.getComputedStyle(document.body).backgroundColor;
  const filename = decodeURIComponent(PageData.Filename) + '.png';
  const svgXml = getSvgXml();

  exportPng(filename, svgXml, background);
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

  document.getElementById('menuSave')
    .addEventListener('click', menuSaveClick);

  document.getElementById('menuExportSvg')
    .addEventListener('click', exportSvgClick);

  document.getElementById('menuExportPng')
    .addEventListener('click', exportPngClick);

  PageData.MenuOpen = (Settings.Menu === 'Open');
}

/** Clears all highlight classes from the current diagram SVG. */
function clearAllHighlights() {
  for (let index = 0; index < PageData.Highlighted.length; index += 1) {
    const target = PageData.Highlighted[index];
    target.className.baseVal = target.className.baseVal
      .replace('highlight1', '')
      .replace('highlight2', '')
      .replace('highlight3', '');
  }
  PageData.Highlighted = [];

  // Array.from(PageData.SvgTag.getElementsByClassName('highlight1'))
  //   .forEach(function arrayForEach(element) {
  //     element.classList.remove('highlight1');
  //   });
  // Array.from(PageData.SvgTag.getElementsByClassName('highlight2'))
  //   .forEach(function arrayForEach(element) {
  //     element.classList.remove('highlight2');
  //   });
  // Array.from(PageData.SvgTag.getElementsByClassName('highlight3'))
  //   .forEach(function arrayForEach(element) {
  //     element.classList.remove('highlight3');
  //   });
}

/** Returns a highlight target inside the SVG given the starting element. */
function findHighlightTarget(start) {
  // console.log('findHighlightTarget');

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

  if (target.nodeName === 'rect' || target.nodeName === 'path') return target;

  return null;
}

/** Sizes the SVG image to fit according the user preferred Zoom option. */
function sizeSvg() {
  // console.log('sizeSvg');

  if (!PageData.SvgTag) return;

  PageData.SvgTag.style.display = 'inline';

  let scale = 0.985;

  switch (Settings.Zoom) {
    case 'Fit':
      scale *= Math.min(
        window.innerWidth / PageData.SvgTag.clientWidth,
        window.innerHeight / PageData.SvgTag.clientHeight
      );
      break;

    case 'Fit Width':
      scale *= window.innerWidth / PageData.SvgTag.clientWidth;
      break;

    case 'Fit Height':
      scale *= window.innerHeight / PageData.SvgTag.clientHeight;
      break;

    case 'Fill':
      scale *= Math.max(
        window.innerWidth / PageData.SvgTag.clientWidth,
        window.innerHeight / PageData.SvgTag.clientHeight
      );
      break;

    default:
      showError('Unexpected Zoom setting value: ' + Settings.Zoom);
      return;
  }

  const newWidth = Math.floor(PageData.SvgTag.clientWidth * scale);
  const newHeight = Math.floor(PageData.SvgTag.clientHeight * scale);

  PageData.SvgTag.style.width = newWidth + 'px';
  PageData.SvgTag.style.height = newHeight + 'px';
  PageData.SvgTag.setAttribute('startwidth', newWidth);
  PageData.SvgTag.setAttribute('startheight', newHeight);

  PageData.Zoom = 100;
}

/** Handles mouse middle button click events. */
function auxClickEvent(event) {
  // console.log('auxClickEvent', event);
  if (event.button !== Mouse.Button.Middle) return;

  event.preventDefault();

  if (PageData.Highlighting) {
    clearAllHighlights();
  } else {
    sizeSvg();
  }
}

/** Handles mouse left click events for highlighting and drag to scroll end. */
function clickEvent(event) {
  // console.log('clickEvent');

  // For browsers that don't support the auxclick event (IE11)
  if (event.button === Mouse.Button.Middle) {
    auxClickEvent(event);
    return;
  }

  // Ignore click events at the end of dragging
  if (PageData.Dragging) {
    event.preventDefault();

    PageData.Dragging = false;
  } else if (PageData.Highlighting) {
    const target = findHighlightTarget(event.target);
    if (target === null) return;

    event.preventDefault();

    // Using 'className' because IE11 doesn't support classList
    const classes = target.className.baseVal.split(' ');

    let oldStyle = '';
    if (classes.contains('highlight1')) {
      classes.remove('highlight1');
      oldStyle = 'highlight1';
    } else if (classes.contains('highlight2')) {
      classes.remove('highlight2');
      oldStyle = 'highlight2';
    } else if (classes.contains('highlight3')) {
      classes.remove('highlight3');
      oldStyle = 'highlight3';
    }

    if (oldStyle === '') {
      let newStyle = '';
      if (event.ctrlKey) {
        newStyle = 'highlight3';
      } else if (event.shiftKey) {
        newStyle = 'highlight2';
      } else {
        newStyle = 'highlight1';
      }

      // target.classList.add(newStyle);
      classes.push(newStyle);
      PageData.Highlighted.push(target);
    } else {
      PageData.Highlighted.remove(target);
    }

    target.className.baseVal = classes.join(' ');
  }
}

/** Sets drag to scroll reference data on left button and ignores middle button
 * events. */
function mouseDown(event) {
  if (event.buttons === Mouse.Buttons.Left) {
    PageData.Scroll.Left = document.documentElement.scrollLeft;
    PageData.Scroll.Top = document.documentElement.scrollTop;
    PageData.Scroll.X = event.clientX;
    PageData.Scroll.Y = event.clientY;
  } else if (event.buttons === Mouse.Buttons.Middle) {
    event.preventDefault();
  }
}

/** Performs drag to scroll events for left button and ignores zero movement
 * events. */
function mouseMove(event) {
  if (event.buttons !== Mouse.Buttons.Left) return;

  // Ignore zero movement events by clicking when tooltips are visible
  if (PageData.Scroll.X === event.clientX
    && PageData.Scroll.Y === event.clientY) {
    return;
  }

  event.preventDefault();

  PageData.Dragging = true;

  window.scroll(
    PageData.Scroll.Left + PageData.Scroll.X - event.clientX,
    PageData.Scroll.Top + PageData.Scroll.Y - event.clientY
  );
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

/** Page Load event handler. */
function pageLoad() {
  // console.log('pageLoad');
  
  hideError();
  loadFlags();
  setupMenu();

  PageData.SvgTag = document.getElementsByTagName('svg').item(0);
  PageData.Filename = window.location.pathname.substring(1, window.location.pathname.length - 4);
  PageData.Flagged = (PageData.Flags.indexOf(PageData.Filename) !== -1);

  sizeSvg();
  updateMenu();
  setMenuPosition();

  // Add click listeners to the SVG diagram
  PageData.SvgTag.addEventListener('click', clickEvent);
  PageData.SvgTag.addEventListener('auxclick', auxClickEvent);

  // Mouse actions for drag to scroll
  window.addEventListener('mousedown', mouseDown);
  window.addEventListener('mousemove', mouseMove);

  // Listen for the scroll wheel specifically
  window.addEventListener('wheel', wheelEvent, { passive: false });

  document.getElementById('offline').style
    .display = (navigator.onLine ? 'none' : 'block');
  window.addEventListener('offline', appOffline);
  window.addEventListener('online', appOnline);
}

registerServiceWorker();

window.addEventListener('load', pageLoad);

resetPageData();
loadSettings();
setTheme(Settings.Theme);
addThemeListener(themeChange);
