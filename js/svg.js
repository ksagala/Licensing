const SvgModule = {
  /** SVG Data. */
  Data: {
    Dragging: false,
    Highlighted: [],
    Highlighting: false,
    Scroll: {
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
  },

  /** Converts the SVG Tag into XML. */
  getSvgXml: function () {
    // console.log('getSvgXml');

    let svgXml = new XMLSerializer().serializeToString(this.Data.Tag);

    // IE11 workaround for malformed namespaces
    if (Common.isIE) {
      svgXml = svgXml.replace('xmlns:NS1="" NS1:xmlns:ev="http://www.w3.org/2001/xml-events"',
        'xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events"');
    }

    return svgXml;
  },

  /** Inject the Highlight Style block into the SVG tag. */
  injectHighlightStyles: function () {
    let styleTag = this.Data.Tag.getElementById('m365MapsHighlights');
    if (styleTag) {
      this.Data.Tag.removeChild(styleTag);
    }

    const styleHtml = '<style id="m365MapsHighlights">'
      + '.highlight1{fill:' + Common.Settings.Highlight1 + '!important;transition:0.4s;}'
      + '.highlight2{fill:' + Common.Settings.Highlight2 + '!important;transition:0.4s;}'
      + '.highlight3{fill:' + Common.Settings.Highlight3 + '!important;transition:0.4s;}'
      + '</style>';

    styleTag = Common.createElementFromHtml(styleHtml);
    this.Data.Tag.appendChild(styleTag);
  },

  /** Clears all highlight classes from the current diagram SVG. */
  clearAllHighlights: function () {
    for (let index = 0; index < this.Data.Highlighted.length; index += 1) {
      const target = this.Data.Highlighted[index];
      target.className.baseVal = target.className.baseVal
        .replace('highlight1', '')
        .replace('highlight2', '')
        .replace('highlight3', '');
    }
    this.Data.Highlighted = [];

    // Array.from(this.Data.Tag.getElementsByClassName('highlight1'))
    //   .forEach(function arrayForEach(element) {
    //     element.classList.remove('highlight1');
    //   });
    // Array.from(this.Data.Tag.getElementsByClassName('highlight2'))
    //   .forEach(function arrayForEach(element) {
    //     element.classList.remove('highlight2');
    //   });
    // Array.from(this.Data.Tag.getElementsByClassName('highlight3'))
    //   .forEach(function arrayForEach(element) {
    //     element.classList.remove('highlight3');
    //   });
  },

  /** Returns a highlight target inside the SVG given the starting element. */
  findHighlightTarget: function (start) {
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

    return (target.nodeName === 'rect' || target.nodeName === 'path') ?
      target : null;
  },

  /** Sizes the SVG image to fit according the user preferred Zoom option. */
  sizeSvg: function () {
    // console.log('sizeSvg');

    if (!this.Data.Tag) return;

    this.Data.Tag.style.display = 'inline';

    let scale = 0.985;

    switch (Common.Settings.Zoom) {
      case 'Fit':
        scale *= Math.min(
          window.innerWidth / this.Data.Tag.clientWidth,
          window.innerHeight / this.Data.Tag.clientHeight
        );
        break;

      case 'Fit Width':
        scale *= window.innerWidth / this.Data.Tag.clientWidth;
        break;

      case 'Fit Height':
        scale *= window.innerHeight / this.Data.Tag.clientHeight;
        break;

      case 'Fill':
        scale *= Math.max(
          window.innerWidth / this.Data.Tag.clientWidth,
          window.innerHeight / this.Data.Tag.clientHeight
        );
        break;

      default:
        Common.showError('Unexpected Zoom setting value: ' + Common.Settings.Zoom);
        return;
    }

    const newWidth = Math.floor(this.Data.Tag.clientWidth * scale);
    const newHeight = Math.floor(this.Data.Tag.clientHeight * scale);

    this.Data.Tag.style.width = newWidth + 'px';
    this.Data.Tag.style.height = newHeight + 'px';

    this.Data.StartWidth = newWidth;
    this.Data.StartHeight = newHeight;
    this.Data.Zoom = 100;
  },

  /** Handles mouse middle button click events. */
  auxClickEvent: function (event) {
    // console.log('auxClickEvent', event);
    if (event.button !== Common.Mouse.Button.Middle) return;

    event.preventDefault();

    if (SvgModule.Data.Highlighting) {
      SvgModule.clearAllHighlights();
    } else {
      SvgModule.sizeSvg();
    }
  },

  /** Handles mouse left click events for highlighting and drag to scroll end. */
  clickEvent: function (event) {
    // console.log('clickEvent');

    // For browsers that don't support the auxclick event (IE11)
    if (event.button === Common.Mouse.Button.Middle) {
      SvgModule.auxClickEvent(event);
      return;
    }

    // Ignore click events at the end of dragging
    if (SvgModule.Data.Dragging) {
      event.preventDefault();

      SvgModule.Data.Dragging = false;
    } else if (SvgModule.Data.Highlighting) {
      const target = SvgModule.findHighlightTarget(event.target);
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
        SvgModule.Data.Highlighted.push(target);
      } else {
        SvgModule.Data.Highlighted.remove(target);
      }

      target.className.baseVal = classes.join(' ');
    }
  },

  /** Sets drag to scroll reference data on left button and ignores middle button
   * events. */
  mouseDown: function (event) {
    if (event.buttons === Common.Mouse.Buttons.Left) {
      SvgModule.Data.Scroll.Left = document.documentElement.scrollLeft;
      SvgModule.Data.Scroll.Top = document.documentElement.scrollTop;
      SvgModule.Data.Scroll.X = event.clientX;
      SvgModule.Data.Scroll.Y = event.clientY;
    } else if (event.buttons === Common.Mouse.Buttons.Middle) {
      event.preventDefault();
    }
  },

  /** Performs drag to scroll events for left button and ignores zero movement
   * events. */
  mouseMove: function (event) {
    if (event.buttons !== Common.Mouse.Buttons.Left) return;

    // Ignore drag events on input controls (ie. Sliders)
    if (event.target.nodeName === 'INPUT') return;

    // Ignore zero movement events by clicking when tooltips are visible
    if (SvgModule.Data.Scroll.X === event.clientX
      && SvgModule.Data.Scroll.Y === event.clientY) {
      return;
    }

    event.preventDefault();

    SvgModule.Data.Dragging = true;

    window.scroll(
      SvgModule.Data.Scroll.Left + SvgModule.Data.Scroll.X - event.clientX,
      SvgModule.Data.Scroll.Top + SvgModule.Data.Scroll.Y - event.clientY
    );
  },

  /** Timer fires regularly to act on zoom instructions, taking the action off
   *  the even listener. */
  zoomTimer: function () {
    if (!SvgModule.Data.Zooming) return;

    SvgModule.Data.Zooming = false;

    const prevWidth = SvgModule.Data.Tag.clientWidth;
    const prevHeight = SvgModule.Data.Tag.clientHeight;
    const newWidth =
      Math.floor(SvgModule.Data.StartWidth * SvgModule.Data.Zoom / 100);
    const newHeight =
      Math.floor(SvgModule.Data.StartHeight * SvgModule.Data.Zoom / 100);

    SvgModule.Data.Tag.style.width = newWidth + 'px';
    SvgModule.Data.Tag.style.height = newHeight + 'px';

    // Scroll to keep image centred about the pointer position
    const scaleFactorX = newWidth / prevWidth;
    const scaleFactorY = newHeight / prevHeight;
    const centreX = SvgModule.Data.ZoomX * scaleFactorX;
    const centreY = SvgModule.Data.ZoomY * scaleFactorY;
    const deltaX = centreX - SvgModule.Data.ZoomX;
    const deltaY = centreY - SvgModule.Data.ZoomY;

    window.scroll(
      document.documentElement.scrollLeft + deltaX,
      document.documentElement.scrollTop + deltaY
    );
  },

  /** Intercepts the mouse wheel event and uses it to zoom in/out on SVG (when
    * present). */
  wheelEvent: function (event) {
    if (!SvgModule.Data.Tag) return;

    event.preventDefault();

    if (event.deltaY < 0.1 && event.deltaY > -0.1) return;

    if (SvgModule.Data.Zoom < 100) SvgModule.Data.Zoom -= event.deltaY / 2;
    else SvgModule.Data.Zoom -= event.deltaY;

    if (SvgModule.Data.Zoom > 1000) SvgModule.Data.Zoom = 1000;
    else if (SvgModule.Data.Zoom < 10) SvgModule.Data.Zoom = 10;

    SvgModule.Data.ZoomX = event.pageX;
    SvgModule.Data.ZoomY = event.pageY;

    SvgModule.Data.Zooming = true;
  },

  /** Register the SVG related event handlers. */
  registerEvents: function () {
    // SVG Click events
    this.Data.Tag.addEventListener('click', this.clickEvent);
    this.Data.Tag.addEventListener('auxclick', this.auxClickEvent);

    // Mouse actions for drag to scroll
    window.addEventListener('mousedown', this.mouseDown);
    window.addEventListener('mousemove', this.mouseMove);

    // Listen for the scroll wheel for zooming
    window.addEventListener('wheel', this.wheelEvent, { passive: false });

    // Setup timer function for zooming actions outside the event listener
    setInterval(SvgModule.zoomTimer, 100);
  },

};
