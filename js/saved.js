/// <reference path="common.js" />
/* global modalPrompt, setupOfflineIndicator, modalConfirm, getModalInputText,
   isEmbedded, isIOSEdge, exportSvg, exportPng, StoreName, isIOS, setupModal */

/** Creates a visual divider for the item list. */
function newDivider() {
  const element = document.createElement('div');
  element.className = 'divider';
  return element;
}

/** Creates a container div to put the action buttons in. */
function newActions() {
  const element = document.createElement('div');
  element.className = 'actions';
  return element;
}

/** Creates a diagram name link. */
function newDiagramLink(text, href) {
  const element = document.createElement('a');
  element.className = 'diagram';
  element.textContent = text;
  element.href = href;
  return element;
}

/** Creates an 'Export PNG' button. */
function newPngButton() {
  const pngLink = document.createElement('button');
  pngLink.className = 'export';
  pngLink.title = 'Export PNG';
  pngLink.textContent = 'PNG';
  return pngLink;
}

/** Creates an 'Export SVG' button. */
function newSvgButton() {
  const svgLink = document.createElement('button');
  svgLink.className = 'export';
  svgLink.title = 'Export SVG';
  svgLink.textContent = 'SVG';
  return svgLink;
}

/** Creates a 'Delete' button. */
function newDeleteButton() {
  const deleteImage = document.createElement('button');
  deleteImage.className = 'delete';
  deleteImage.title = 'Delete';
  return deleteImage;
}

/** Creates a 'Rename' button. */
function newRenameButton() {
  const renameImage = document.createElement('button');
  renameImage.className = 'rename';
  renameImage.title = 'Rename';
  return renameImage;
}

/** Adds the message ot show there are no saved diagrams. */
function addEmptyMessage(container) {
  const message = document.createElement('p');
  message.innerText = 'There are no saved diagrams.';
  container.appendChild(message);
}

/** Adds a new row to the saved diagrams list. */
function addNewRow(container, key, entry) {
  const entryLink = newDiagramLink(entry.Title, '/viewsvg.htm#*' + key);
  container.appendChild(entryLink);

  const entryActions = newActions();
  const thisDivider = newDivider();

  const entryRename = newRenameButton();
  entryActions.appendChild(entryRename);
  entryRename.addEventListener('click', function renameClick() {
    modalPrompt('Rename saved diagram:', entryLink.textContent,
      function renameOK() {
        const newName = getModalInputText();
        if (!newName) return;

        entry.Title = newName;
        const entryJSON = JSON.stringify(entry);
        localStorage.setItem(key, entryJSON);
        entryLink.textContent = newName;
      });
  });

  const entryDelete = newDeleteButton();
  entryActions.appendChild(entryDelete);
  entryDelete.addEventListener('click', function deleteClick() {
    const message =
      `Are you sure you want to delete "${entryLink.textContent}"?`;

    modalConfirm(message,
      function deleteYes() {
        localStorage.removeItem(key);

        container.removeChild(entryLink);
        container.removeChild(entryActions);
        container.removeChild(thisDivider);

        if (container.getElementsByClassName('diagram').length === 0) {
          container.innerHTML = '';
          container.appendChild(newDivider());
          addEmptyMessage(container);
          container.appendChild(newDivider());
        }
      });
  });

  if (!isIOSEdge) {
    const entrySvgButton = newSvgButton();
    entryActions.appendChild(entrySvgButton);
    entrySvgButton.addEventListener('click',
      function svgLinkClick(event) {
        event.preventDefault();
        exportSvg(entry.Title + '.svg', entry.SvgXml);
      }
    );

    const entryPngButton = newPngButton();
    entryActions.appendChild(entryPngButton);
    entryPngButton.addEventListener('click',
      function pngLinkClick() {
        const background = window.getComputedStyle(document.body)
          .backgroundColor;
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
        modalPrompt('Import diagram as:', file.name,
          function importOK() {
            const diagramTitle = getModalInputText();
            if (!diagramTitle) return;

            const storageKey = Date.now().toString();
            const svgObject = {
              Title: diagramTitle,
              SvgXml: event.target.result
            };

            const jsonData = JSON.stringify(svgObject);
            localStorage.setItem(storageKey, jsonData);

            const container = document.getElementById('collection');
            addNewRow(container, storageKey, svgObject);
          });
      }
    );

    reader.readAsText(file);
  }

  event.target.value = '';
}

/** Clicks the export link corresponding with the supplied exportType for
 * all saved diagrams. */
function exportAllDiagrams(exportType) {
  const exportLinks = document.getElementsByClassName('export');
  for (let i = 0; i < exportLinks.length; i++) {
    const exportLink = exportLinks[i];
    if (exportLink.textContent === exportType) {
      exportLink.click();
    }
  }
}

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  if (isEmbedded()) {
    document.getElementById('menu').style.display = 'none';
  }

  setupOfflineIndicator();
  setupModal();
  populateList();

  if (isIOS) {
    document.getElementById('export-all-png').style.display = 'none';
  } else {
    document.getElementById('export-all-png').addEventListener('click', () =>
      exportAllDiagrams('PNG'));
  }

  if (isIOS) {
    document.getElementById('export-all-svg').style.display = 'none';
  } else {
    document.getElementById('export-all-svg').addEventListener('click', () =>
      exportAllDiagrams('SVG'));
  }

  document.getElementById('import').addEventListener('click', () =>
    document.getElementById('file-selector').click());

  document.getElementById('file-selector')
    .addEventListener('change', filesSelected);
}

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
