/** Creates a visual divider for the item list. */
function newDivider() {
  const divider = document.createElement('div');
  divider.className = 'divider';
  return divider;
}

/** Creates a container div to put the action icons in. */
function newActions() {
  const actions = document.createElement('div');
  actions.className = 'actions';
  return actions;
}

/** Creates a header to put the diagram name link in. */
function newHeader() {
  const header = document.createElement('h2');
  return header;
}

/** Creates a diagram name link. */
function newDiagramLink(text, href) {
  const diagramLink = document.createElement('a');
  diagramLink.className = 'diagram';
  diagramLink.text = text;
  diagramLink.href = href;
  return diagramLink;
}

/** Creates an 'Export PNG' link. */
function newPngLink() {
  const pngLink = document.createElement('a');
  pngLink.href = '#';
  pngLink.className = 'export';
  pngLink.title = 'Export PNG';
  pngLink.text = 'PNG';
  return pngLink;
}

/** Creates an 'Export SVG' link. */
function newSvgLink() {
  const svgLink = document.createElement('a');
  svgLink.href = '#';
  svgLink.className = 'export';
  svgLink.title = 'Export SVG';
  svgLink.text = 'SVG';
  return svgLink;
}

/** Creates a 'Delete item' image. */
function newDeleteImage() {
  const deleteImage = document.createElement('img');
  deleteImage.src = '/media/delete.svg';
  deleteImage.width = 16;
  deleteImage.height = 16;
  deleteImage.alt = 'Delete';
  deleteImage.title = 'Delete';
  deleteImage.className = 'delete';
  return deleteImage;
}

/** Creates a 'Rename item' image. */
function newRenameImage() {
  const renameImage = document.createElement('img');
  renameImage.src = '/media/edit-off.svg';
  renameImage.width = 16;
  renameImage.height = 16;
  renameImage.alt = 'Rename';
  renameImage.title = 'Rename';
  renameImage.className = 'rename';
  return renameImage;
}

/** Adds the message ot show there are no saved diagrams. */
function addEmptyMessage(container) {
  const emptyHeader = document.createElement('h2');
  emptyHeader.innerText = 'There are no saved diagrams.';
  container.appendChild(emptyHeader);
}

/** Adds a new row to the saved diagrams list. */
/* eslint no-param-reassign:
 ["error", { "props":true,
 "ignorePropertyModificationsFor":["container", "entry"] }] */
function addNewRow(container, key, entry) {
  const entryHeader = newHeader();
  const entryLink = newDiagramLink(entry.Title, '/viewsvg.htm#*' + key);
  entryHeader.appendChild(entryLink);
  container.appendChild(entryHeader);

  const entryActions = newActions();

  const entryRename = newRenameImage();
  entryActions.appendChild(entryRename);

  const thisDivider = newDivider();

  entryRename.addEventListener('click', function renameClick() {
    const newName = customPrompt('Rename saved diagram:', entryLink.textContent);

    if (newName) {
      entry.Title = newName;
      const entryJSON = JSON.stringify(entry);
      localStorage.setItem(key, entryJSON);
      entryLink.textContent = newName;

      if (isIE) {
        fixToMaxItemWidth('diagram', 20, true);
      }
    }
  });

  const entryDelete = newDeleteImage();
  entryActions.appendChild(entryDelete);

  entryDelete.addEventListener('click', function deleteClick() {
    const message = 'Are you sure you want to delete "'
      + entryLink.textContent + '"?';

    if (customConfirm(message)) {
      localStorage.removeItem(key);

      container.removeChild(entryHeader);
      container.removeChild(entryActions);
      container.removeChild(thisDivider);

      if (container.getElementsByTagName('h2').length === 0) {
        container.innerHTML = '';
        container.appendChild(newDivider());
        addEmptyMessage(container);
        container.appendChild(newDivider());
      }
    }
  });

  if (!isIOSEdge) {
    const entrySvgLink = newSvgLink();
    entryActions.appendChild(entrySvgLink);

    entrySvgLink.addEventListener('click',
      function svgLinkClick(event) {
        event.preventDefault();
        exportSvg(entry.Title + '.svg', entry.SvgXml);
      }
    );
  }

  if (!isIOSEdge && !isIE) {
    const entryPngLink = newPngLink();
    entryActions.appendChild(entryPngLink);

    entryPngLink.addEventListener('click',
      function pngLinkClick(event) {
        event.preventDefault();
        const background = window.getComputedStyle(document.body).backgroundColor;
        exportPng(entry.Title + '.png', entry.SvgXml, background);
      }
    );
  }

  container.appendChild(entryActions);
  container.appendChild(thisDivider);
}

/** Adds all the saved diagrams onto the page. */
function populateList() {
  const container = document.getElementById('collection');
  container.innerHTML = '';

  container.appendChild(newDivider());

  let keys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key !== StoreName.Flags && key !== StoreName.Settings) {
      keys.push(key);
    }
  }

  keys = keys.sort(
    function keysSort(a, b) {
      return parseInt(a) - parseInt(b);
    }
  );

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];

    const entryJSON = localStorage.getItem(key);
    if (entryJSON) {
      const entry = JSON.parse(entryJSON);
      if (entry) {
        addNewRow(container, key, entry);
      }
    }
  }

  if (keys.length === 0) {
    addEmptyMessage(container);
    container.appendChild(newDivider());
  } else if (isIE) {
    fixToMaxItemWidth('diagram', 20, false);
  }
}

/** Imports the selected files into the Saved Diagrams list. */
function filesSelected(event) {
  const reader = new FileReader();

  const fileList = event.target.files;
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    reader.addEventListener('load',
      function fileLoaded(event) {
        let diagramTitle = file.name;
        diagramTitle = customPrompt('Import diagram as:', diagramTitle);
        if (diagramTitle) {
          const storageKey = Date.now().toString();
          const svgObject = { Title: diagramTitle, SvgXml: event.target.result };

          const jsonData = JSON.stringify(svgObject);
          localStorage.setItem(storageKey, jsonData);

          const container = document.getElementById('collection');
          addNewRow(container, storageKey, svgObject);
        }
      }
    );

    reader.readAsText(file);
  }

  const fileSelector = document.getElementById('fileSelector');
  fileSelector.value = '';
}

/** Clicks the export link corresponding with the supplied exportType for
 * all saved diagrams. */
function exportAllDiagrams(exportType) {
  const exportLinks = document.getElementsByClassName('export');
  for (let i = 0; i < exportLinks.length; i++) {
    const exportLink = exportLinks[i];
    if (exportLink.textContent === exportType) {
      simulateClick(exportLink);
      // exportLink.click();
    }
  }
}

/** Exports all saved diagrams as SVG files. */
function exportAllDiagramsSvg() {
  exportAllDiagrams('SVG');
}

/** Exports all saved diagrams as PNG files. */
function exportAllDiagramsPng() {
  exportAllDiagrams('PNG');
}

/** Triggers the file upload process. */
function importDiagram() {
  const fileSelector = document.getElementById('fileSelector');
  simulateClick(fileSelector);
  // fileSelector.click();
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
  populateList();

  const exportAllPng = document.getElementById('exportAllPng');
  if (isIE || isIOS) {
    exportAllPng.style.display = 'none';
  } else {
    exportAllPng.addEventListener('click', exportAllDiagramsPng);
  }

  const exportAllSvg = document.getElementById('exportAllSvg');
  if (isIOS) {
    exportAllSvg.style.display = 'none';
  } else {
    exportAllSvg.addEventListener('click', exportAllDiagramsSvg);
  }

  document.getElementById('import')
    .addEventListener('click', importDiagram);

  document.getElementById('fileSelector')
    .addEventListener('change', filesSelected);

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
