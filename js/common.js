"use strict";

/** Helper function for backwards compatibility with IE11. */
if (typeof Array.prototype.contains !== 'function') {
  Array.prototype.contains = function contains(item) {
    if (this === null) throw new TypeError();
    return (this.indexOf(item) !== -1);
  };
}

/** Helper function for backwards compatibility with IE11. */
if (typeof Array.prototype.remove !== 'function') {
  Array.prototype.remove = function remove(item) {
    if (this === null) throw new TypeError();
    const index = this.indexOf(item);
    if (index !== -1) this.splice(index, 1);
  };
}

/** Helper function for backwards compatibility with IE11. */
if (typeof Array.prototype.fill !== 'function') {
  Array.prototype.fill = function fill(value) {
    if (this === null) throw new TypeError();
    for (let index = 0; index < this.length; index += 1) {
      this[index] = value;
    }
  };
}

/** Helper function for backwards compatibility with IE11. */
if (typeof String.prototype.startsWith !== 'function') {
  String.prototype.startsWith = function startsWith(item) {
    if (this === null) throw new TypeError();
    return this.indexOf(item) === 0;
  };
}

/** Helper function for backwards compatibility with IE11. */
if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function endsWith(item) {
    if (this === null) throw new TypeError();
    return this.indexOf(item, this.length - item.length) !== -1;
  };
}

/** Common functions and data. */
const Common = {
  /** The service worker JS file to use, handy for switching between the
    * minified and non-minified versions. */
  ServiceWorkerJS: 'sw.min.js',
  // ServiceWorkerJS: 'sw.js',

  /** Storage name constants. */
  StoreName: {
    Flags: 'flags',
    Settings: 'settings',
  },

  /** Mouse button constants. */
  Mouse: {
    Button: {
      Left: 0,
      Middle: 1,
      Right: 2,
      Back: 3,
      Forward: 4,
    },
    Buttons: {
      Left: 1,
      Right: 2,
      Middle: 4,
      Back: 8,
      Forward: 16,
    },
    Which: {
      Left: 1,
      Middle: 2,
      Right: 3,
    },
  },

  /** User settings. */
  Settings: {
    Filters: {
      Brightness: 10,
      Contrast: 10,
      Hue: 0,
      Saturation: 10,
    },
    Highlight1: '',
    Highlight2: '',
    Highlight3: '',
    Menu: '',
    Theme: '',
    Zoom: '',
  },

  /** Is this running in Internet Explorer? */
  isIE: (navigator.userAgent.indexOf('MSIE') !== -1 ||
    navigator.userAgent.indexOf('Trident') !== -1),

  /** Is this running in Chrome on iOS? */
  isIOSChrome: (navigator.userAgent.indexOf('CriOS') !== -1),

  /** Is this running in Edge on iOS? */
  isIOSEdge: (navigator.userAgent.indexOf('EdgiOS') !== -1),

  /** Is this running on an iOS device? */
  isIOS: (window.navigator.userAgent.indexOf('iPad') !== -1 ||
    window.navigator.userAgent.indexOf('iPhone') !== -1),

  /** Registers the Service Worker. */
  registerServiceWorker: function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(this.ServiceWorkerJS, { scope: '/' });
    }
  },

  /** Loads the default settings. */
  defaultSettings: function () {
    this.Settings.Highlight1 = '#CCCC00';
    this.Settings.Highlight2 = '#AA00CC';
    this.Settings.Highlight3 = '#00CCBB';
    this.Settings.Menu = 'Open';
    this.Settings.Theme = 'Light';
    this.Settings.Zoom = 'Fit';
  },

  /** Loads the settings from local storage. */
  loadSettings: function () {
    // console.log('loadSettings');

    this.defaultSettings();

    const settingsJSON = localStorage.getItem(this.StoreName.Settings);
    if (settingsJSON) {
      const newSettings = JSON.parse(settingsJSON);
      if (newSettings) {
        if (newSettings.Filters) {
          if (newSettings.Filters.Contrast) {
            this.Settings.Filters.Contrast = newSettings.Filters.Contrast;
          }

          if (newSettings.Filters.Hue) {
            this.Settings.Filters.Hue = newSettings.Filters.Hue;
          }

          if (newSettings.Filters.Saturation) {
            this.Settings.Filters.Saturation = newSettings.Filters.Saturation;
          }
        }

        if (newSettings.Highlight1) {
          this.Settings.Highlight1 = newSettings.Highlight1;
        }

        if (newSettings.Highlight2) {
          this.Settings.Highlight2 = newSettings.Highlight2;
        }

        if (newSettings.Highlight3) {
          this.Settings.Highlight3 = newSettings.Highlight3;
        }

        if (newSettings.Menu) {
          this.Settings.Menu = newSettings.Menu;
        }

        if (newSettings.Theme) {
          this.Settings.Theme = newSettings.Theme;
        }

        if (newSettings.Zoom) {
          this.Settings.Zoom = newSettings.Zoom;
        }
      }
    }
  },

  /** Saves the settings to local storage. */
  saveSettings: function () {
    // console.log('saveSettings');

    const settingsJSON = JSON.stringify(this.Settings);
    localStorage.setItem(this.StoreName.Settings, settingsJSON);
  },

  /** Sets the theme to Light, Dark, or follows the System. */
  setTheme: function (theme) {
    // console.log('setTheme', theme);

    const htmlElement = document.getElementsByTagName('html')[0];

    switch (theme) {
      case 'Light': htmlElement.className = 'theme-light'; break;
      case 'Dark': htmlElement.className = 'theme-dark'; break;
      case 'System':
      default:
        htmlElement.className = window.matchMedia('(prefers-color-scheme: dark)')
          .matches ? 'theme-dark' : 'theme-light';
        break;
    }
  },

  /** Theme Change event to track the System theme. */
  themeChange: function (event) {
    // console.log('themeChange');

    if (Common.Settings.Theme === 'System') {
      const htmlElement = document.getElementsByTagName('html')[0];
      htmlElement.className = (event.matches ? 'theme-dark' : 'theme-light');
    }
  },

  /** Adds the specified theme change listener. */
  addThemeListener: function (listener) {
    const matchMediaDark = window.matchMedia('(prefers-color-scheme: dark)');
    if ('addEventListener' in matchMediaDark) {
      matchMediaDark.addEventListener('change', listener);
    }
  },

  /** Exports an SVG XML as a PNG file download. */
  exportPng: function (filename, svgXml, background) {
    // console.log('exportPng', filename);

    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');

    const image = new Image();
    image.onload = function onload() {
      canvas.width = image.width;
      canvas.height = image.height;

      if (background) {
        canvasContext.fillStyle = background;
        canvasContext.rect(0, 0, canvas.width, canvas.height);
        canvasContext.fill();
      }

      if ('imageSmoothingQuality' in canvasContext) {
        canvasContext.imageSmoothingQuality = 'high';
      }

      canvasContext.drawImage(image, 0, 0);

      canvas.toBlob(
        function canvasBlob(blob) {
          Common.downloadBlob(filename, blob);
        }
      );
    };

    image.src = 'data:image/svg+xml;base64,' + btoa(svgXml);
  },

  /** Exports an SVG XML as an SVG file download. */
  exportSvg: function (filename, svgXml) {
    // console.log('exportSvg', filename);

    const blob = new Blob([svgXml], { type: 'image/svg+xml' });
    Common.downloadBlob(filename, blob);
  },

  /** Simulates a click event on a given element. */
  simulateClick: function (element) {
    element.click();
  },

  /** Downloads a given blob using the anchor tag click method. */
  downloadBlob: function (filename, blob) {
    // msSaveBlob for IE11
    if ('msSaveBlob' in navigator) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const anchor = document.createElement('a');
      anchor.rel = 'noopener';
      anchor.download = filename;

      anchor.href = URL.createObjectURL(blob);
      setTimeout(function timeoutClick() { URL.revokeObjectURL(anchor.href); }, 45000);
      setTimeout(function timeoutClick() { Common.simulateClick(anchor); }, 0);
    }
  },

  /** Returns a new HTML Element created from the provided HTML. */
  createElementFromHtml: function (innerHtml) {
    const newElementParent = document.createElement('div');
    newElementParent.innerHTML = innerHtml;
    return newElementParent.firstChild;
  },

  /** Find the string between two other strings. */
  getStringBetween: function (source, from, open, close) {
    if (!source) return undefined;
    if (from === -1) return undefined;

    const start = source.indexOf(open, from);
    if (start === -1) return undefined;

    const end = source.indexOf(close, start);
    if (end === -1) return undefined;

    return source.substring(start + 1, end);
  },

  /** Get the filter CSS for the specified filter values. */
  getFiltersCss: function (brightness, contrast, hue, saturation) {
    // console.log('getFiltersCss');

    return 'brightness(' + (brightness / 10.0).toPrecision(2) + ') ' +
      'contrast(' + (contrast / 10.0).toPrecision(2) + ') ' +
      'hue-rotate(' + hue + 'deg) ' +
      'saturate(' + (saturation / 10.0).toPrecision(2) + ')';
  },

  /** Finds all elements of className and fixes them
   *  to a consistent maximum width + padding.
   *  Used to fix formatting for IE11. */
  fixToMaxItemWidth: function (className, padding, resetFirst) {
    let maxWidth = 0;

    const elements = document.getElementsByClassName(className);
    for (let index = 0; index < elements.length; index += 1) {
      const element = elements[index];
      if (resetFirst && element.style.width !== '') element.style.width = '';
      if (element.clientWidth > maxWidth) maxWidth = element.clientWidth;
    }

    maxWidth += padding;

    for (let index = 0; index < elements.length; index += 1) {
      const element = elements[index];
      element.style.width = maxWidth + 'px';
    }
  },

  /** Mouse enters the header, turns on the link. */
  headerEnter: function (event) {
    let link = event.target.getElementsByTagName('a');
    if (link.length === 0) return;
    link = link.item(0);
    link.style.display = 'inline';
  },

  /** Mouse leaves the header, turns off the link. */
  headerLeave: function (event) {
    let link = event.target.getElementsByTagName('a');
    if (link.length === 0) return;
    link = link.item(0);
    link.style.display = 'none';
  },

  /** Sets up for showing the anchor link on header hover. */
  setupHeaders: function (tagName) {
    const headers = document.getElementsByTagName(tagName);
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];

      header.addEventListener('mouseenter', this.headerEnter);
      header.addEventListener('mouseleave', this.headerLeave);

      let link = header.getElementsByTagName('a');
      if (link.length !== 0) {
        link = link.item(0);
        link.href = '#' + header.id;
      }
    }
  },

  /** TODO: Implement alternative to native alert function. */
  customAlert: function (message) {
    window.alert(message);
  },

  /** TODO: Implement alternative to native confirm function. */
  customConfirm: function (message) {
    return window.confirm(message);
  },

  /** TODO: Implement alternative to native prompt function. */
  customPrompt: function (message, defaultValue) {
    return window.prompt(message, defaultValue);
  },

};

Common.registerServiceWorker();
Common.loadSettings();
Common.setTheme(Common.Settings.Theme);
Common.addThemeListener(Common.themeChange);
