/// <reference path="common.js" />
/* global modalAlert, StoreName, isEmbedded, setupOfflineIndicator
   setupModal */

/** Get the values of the selected checkboxes. */
function getSelectedCheckboxes() {
  const checked = document.querySelectorAll('input[type="checkbox"]:checked');
  let values = [];
  checked.forEach(function getCheckboxValue(element) {
    values.push(element.value);
  });

  return values;
}

/** Click event handler for Compare button. */
function compareClick() {
  const checkboxes = getSelectedCheckboxes();
  if (checkboxes.length === 2) {
    window.location.href = '/comparing.htm#' + checkboxes.join('/');
  } else {
    modalAlert('You must select two diagrams to compare.');
  }
}

/** Disable all the checkboxes that are not currently checked. */
function disableUncheckedBoxes() {
  const checkboxes = document
    .querySelectorAll('input[type="checkbox"]:not(:checked):not(:disabled)');

  checkboxes.forEach(function disableEachCheckbox(checkbox) {
    checkbox.disabled = true;
    checkbox.parentElement.classList.add("disabled");
  });
}

/** Enable all the checkboxes that are not currently checked. */
function enableUncheckedBoxes() {
  const checkboxes = document
    .querySelectorAll('input[type="checkbox"]:not(:checked):disabled');

  checkboxes.forEach(function enableEachCheckbox(checkbox) {
    checkbox.disabled = false;
    checkbox.parentElement.classList.remove("disabled");
  });
}

/** Event handled for checkbox state changes. */
function checkboxChanged() {
  const checkboxes = getSelectedCheckboxes();

  if (checkboxes.length === 2) {
    disableUncheckedBoxes();
  } else {
    enableUncheckedBoxes();
  }
}

/** Add a saved diagram to the list. */
function addDiagram(container, key, entry) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = '*' + key;

  const label = document.createElement('label');
  label.appendChild(checkbox);
  label.append(entry.Title);

  container.appendChild(label);
  // container.insertAdjacentElement('afterend', label);
}

/** Adds the saved diagrams to the bottom of the diagram list. */
function addSavedDiagrams() {
  const container = document.getElementById('saved-diagrams');

  let keys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key !== StoreName.Flags && key !== StoreName.Settings) {
      keys.push(key);
    }
  }

  if (keys.length === 0) {
    container.append('There are no saved diagrams.');
    // const message = document.createElement('label');
    // message.append('None');
    // container.insertAdjacentElement('afterend', message);
  } else {
    keys = keys.sort(
      function keysSort(a, b) {
        return parseInt(a) - parseInt(b);
      }
    );

    for (const key of keys) {
      const entryJSON = localStorage.getItem(key);
      if (entryJSON) {
        const entry = JSON.parse(entryJSON);
        if (entry) {
          addDiagram(container, key, entry);
        }
      }
    }
  }
}

/** Attaches event listeners to all checkboxes. */
function setupCheckboxes() {
  const checkboxes = document
    .querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach(function setupEachCheckbox(checkbox) {
    checkbox.addEventListener('change', checkboxChanged);
  });
}

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  if (isEmbedded()) {
    document.getElementById('menu').style.display = 'none';
  }

  setupOfflineIndicator();
  setupModal();
  addSavedDiagrams();
  setupCheckboxes();

  document.getElementById('button-compare')
    .addEventListener('click', compareClick);
}

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
