/** Page Data. */
const PageData = {
  ComparisonContainer: null,
  ComparisonInputs: null,
  DiagramCount: 18,
  DiagramGroups: [1, 3, 5, 4, 5],
  FeatureSearchInput: null,
  FeatureSearchChanged: false,
  TableRows: null,
};

/** Toggle the Feature Search Changed variable when a Key Up event occurs. */
function featureSearchKeyUp() {
  PageData.FeatureSearchChanged = true;
}

/** Update the row visibility based on search text. */
function applySearchFilter() {
  const filter = PageData.FeatureSearchInput.value.toUpperCase();

  for (let index = 0; index < PageData.TableRows.length; index += 1) {
    const row = PageData.TableRows[index];

    const isHeaderRow = (row.className.indexOf('stickyRow') !== -1);
    if (!isHeaderRow) {
      const cell = row.getElementsByTagName('td')[0];
      if (cell) {
        const featureName = cell.textContent || cell.innerText;
        if (featureName.toUpperCase().indexOf(filter) !== -1) {
          row.style.display = 'table-row';
        } else {
          row.style.display = 'none';
        }
      }
    }
  }
}

/** Timer periodically fires to update the row visibility in response to
 *  search text changes. */
function featureSearchTimer() {
  if (!PageData.FeatureSearchChanged) return;

  // console.log('featureSearchTimer: FeatureSearchChanged');

  PageData.FeatureSearchChanged = false;

  applySearchFilter();
}

/** Set up the feature search box and action functions. */
function setupFeatureSearch() {
  PageData.FeatureSearchInput = document.getElementById('featureSearch');
  PageData.FeatureSearchInput.addEventListener('keyup', featureSearchKeyUp);

  setInterval(featureSearchTimer, 250);
}

/** Count the selected columns within the given group. This is used to
 *  determine license type header visibility when filtering columns. */
function countInGroup(group, all) {
  let count = 0;
  let start = 0;

  for (let i = 0; i < PageData.DiagramGroups.length; i += 1) {
    if (i === group) {
      const end = start + PageData.DiagramGroups[i];
      for (let allIndex = start; allIndex < end; allIndex += 1) {
        if (all[allIndex]) {
          count += 1;
        }
      }
      return count;
    }
    start += PageData.DiagramGroups[i];
  }

  return -1;
}

/** Get an array of booleans represented the state of each license checkbox. */
function getSelectedCheckboxes() {
  const selected = new Array(PageData.DiagramCount);

  for (let index = 0; index < PageData.ComparisonInputs.length; index += 1) {
    if (PageData.ComparisonInputs[index].type === 'checkbox') {
      const item = PageData.ComparisonInputs[index].value;
      const checked = PageData.ComparisonInputs[index].checked;
      selected[item] = checked;
    }
  }

  return selected;
}

/** Set the checked status of each checkbox based on an array of booleans. */
function setSelectedCheckboxes(selected) {
  for (let index = 0; index < PageData.ComparisonInputs.length; index += 1) {
    if (PageData.ComparisonInputs[index].type === 'checkbox') {
      const item = PageData.ComparisonInputs[index].value;
      const checked = selected[item];
      PageData.ComparisonInputs[index].checked = checked;
    }
  }
}

/** Helper function for  IE11 for showColumns function. */
function isFalse(value) {
  return value === false;
}

/** Find the group that corresponds with a license column number. */
function findGroup(find, groups) {
  let total = 0;
  for (let index = 0; index < groups.length; index += 1) {
    total += groups[index];
    if (find < total) return index;
  }
  return -1;
}

/** Show only the selected feature columns based on the array of booleans.
 *  Hide any rows that no longer have a visible feature. */
function showColumns(selected) {
  // console.log('showColumns');

  const noneSelected = selected.every(isFalse);

  const groupClasses = [];

  for (let row = 0; row < PageData.TableRows.length; row += 1) {
    const tr = PageData.TableRows[row];

    let emptyRow = false;
    let cells = null;

    if (row === 0) {
      cells = tr.getElementsByTagName('th');

      let groupA = true;

      for (let col = 1; col < cells.length; col += 1) {
        const cell = cells[col];

        const count = countInGroup(col - 1, selected);
        cell.style.display = (count > 0 ? 'table-cell' : 'none');
        cell.setAttribute('colspan', count);

        const groupClass = (groupA ? 'groupA' : 'groupB');
        groupClasses.push(groupClass);

        if (count !== 0) {
          cell.className = groupClass;
          groupA = !groupA;
        }
      }
    } else {
      const isGroupHeaderRow = (tr.className.indexOf('stickyRow3') !== -1);

      if (row === 1 || isGroupHeaderRow) {
        cells = tr.getElementsByTagName('th');
      } else {
        cells = tr.getElementsByTagName('td');
        // Only look for empty feature rows (denoted by the use of TD tags).
        // If none selected then don't hide any rows.
        emptyRow = !noneSelected;
      }

      if (isGroupHeaderRow) emptyRow = false;

      for (let col = 1; col < cells.length; col += 1) {
        const cell = cells[col];

        if (row === 1) {
          const groupIndex = findGroup(col - 1, PageData.DiagramGroups);
          const groupClass = groupClasses[groupIndex];
          cell.className = groupClass;
        }

        if (selected[col - 1]) {
          cell.style.display = 'table-cell';

          if (cell.textContent !== '') {
            emptyRow = false;
          }
        } else {
          cell.style.display = 'none';
        }
      }

      tr.style.display = (emptyRow ? 'none' : 'table-row');
    }
  }

  if (PageData.FeatureSearchInput.value !== '') {
    applySearchFilter();
  }
}

/** Updated selection of license types when hash changes. */
function hashChanged() {
  // console.log('hashChanged');

  const selected = new Array(PageData.DiagramCount);
  selected.fill(true);

  const hash = window.location.hash.substring(1);

  if (hash.length === selected.length) {
    for (let index = 0; index < hash.length; index += 1) {
      selected[index] = (hash[index] === '1');
    }
  }

  setSelectedCheckboxes(selected);

  showColumns(selected);
}

/** Listen for checboxes changing state. */
function checkboxChanged() {
  // console.log('checkboxChanged');

  const selected = getSelectedCheckboxes();

  let newHash = '#';
  for (let index = 0; index < selected.length; index += 1) {
    newHash += (selected[index] ? '1' : '0');
  }

  window.location.hash = newHash;
}

/** Add event listeners to all checkboxes. */
function setupCheckboxes() {
  // console.log('setupCheckboxes');

  for (let index = 0; index < PageData.ComparisonInputs.length; index += 1) {
    const input = PageData.ComparisonInputs[index];
    if (input.type === 'checkbox') {
      input.addEventListener('change', checkboxChanged);
    }
  }
}

/** Select all license types. */
function selectAllClick(event) {
  // console.log('selectAllClick');

  event.preventDefault();

  let newHash = '#';
  for (let index = 0; index < PageData.DiagramCount; index += 1) {
    newHash += '1';
  }

  window.location.hash = newHash;
}

/** Deselect all license types. */
function selectNoneClick(event) {
  // console.log('selectNoneClick');

  event.preventDefault();

  let newHash = '#';
  for (let index = 0; index < PageData.DiagramCount; index += 1) {
    newHash += '0';
  }

  window.location.hash = newHash;
}

/** Attach event listeners to Select All & Select None. */
function setupComparisonSelection() {
  // const compareToggle = document.getElementById('compareToggle');
  // compareToggle.addEventListener('click', compareToggleClick);

  const selectAll = document.getElementById('selectAll');
  selectAll.addEventListener('click', selectAllClick);

  const selectNone = document.getElementById('selectNone');
  selectNone.addEventListener('click', selectNoneClick);
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
  // console.log('pageLoad');

  if (Common.isIE) {
    Common.fixToMaxItemWidth('licenseType', 4, false);
    Common.fixToMaxItemWidth('checkLabel', 4, false);
  }

  const header = document.getElementById('header');
  header.style.width = document.body.scrollWidth + 'px';

  PageData.ComparisonContainer = document.getElementById('comparisons');
  PageData.ComparisonInputs = PageData.ComparisonContainer.getElementsByTagName('input');

  const featuresTable = document.getElementById('featuresTable');
  PageData.TableRows = featuresTable.getElementsByTagName('tr');

  setupComparisonSelection();
  setupFeatureSearch();
  setupCheckboxes();

  hashChanged();
  window.addEventListener('hashchange', hashChanged);

  document.getElementById('offline').style
    .display = (navigator.onLine ? 'none' : 'block');
  window.addEventListener('offline', appOffline);
  window.addEventListener('online', appOnline);
}

window.addEventListener('load', pageLoad);
