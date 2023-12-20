/**
 * Enables zoom and pan interactions on an SVG element.
 * @param {SVGElement} svg - The SVG element to enable zoom and pan for.
 */
export function zoop(svg) {
  // Get the parent container of the SVG
  const svgContainer = svg.parentElement;

  // Set up event handlers for pointer interactions
  svgContainer.onpointerdown = pointerdownHandler;
  svgContainer.onpointermove = pointermoveHandler;
  svgContainer.onpointerup = pointerupHandler;
  svgContainer.onpointercancel = pointerupHandler;

  // Initialize an event cache to store pointer events
  const eventCache = { doublePoint: [], singlePoint: [] };

  // Initialize variable to track the previous distance between two pointers
  let prevDiff = -1;

  // Set up event handler for mouse wheel to handle zoom
  svgContainer.onmousewheel = (e) => {
    e.preventDefault();
    zoom(e.deltaY, e.offsetX, e.offsetY, svg);
  };

  /**
   * Handles the pointerdown event.
   * @param {PointerEvent} e - The pointerdown event.
   */
  function pointerdownHandler(e) {
    // Store the pointer event in the cache
    eventCache.doublePoint.push(e);
    eventCache.singlePoint.push(e);
  }

  /**
   * Handles the pointermove event.
   * @param {PointerEvent} e - The pointermove event.
   */
  function pointermoveHandler(e) {
    if (eventCache.singlePoint.length > 0) {
      // Calculate pan distance if a single pointer is down
      let x1 = eventCache.doublePoint[0].x,
        x2 = e.x,
        y1 = eventCache.doublePoint[0].y,
        y2 = e.y;

      pan(x1 - x2, y1 - y2, svg);
    }

    // Update the cache with the current pointer event
    const index = eventCache.doublePoint.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId
    );
    eventCache.doublePoint[index] = e;

    if (eventCache.doublePoint.length === 2) {
      // Handle zoom if two pointers are down
      const curDiff =
        eventCache.doublePoint[0].clientX - eventCache.doublePoint[1].clientX;
      const avgOffsetX =
        (eventCache.doublePoint[0].offsetX -
          eventCache.doublePoint[1].offsetX) /
        2;
      const avgOffsetY =
        (eventCache.doublePoint[0].offsetY -
          eventCache.doublePoint[1].offsetY) /
        2;
      zoom(curDiff - prevDiff, avgOffsetX, avgOffsetY, svg);

      // Cache the distance for the next move event
      prevDiff = curDiff;
    }
  }

  /**
   * Handles the pointerup event.
   * @param {PointerEvent} e - The pointerup event.
   */
  function pointerupHandler(e) {
    // Remove the pointer event from the cache
    removeEvent(e);

    // If the number of pointers down is less than two, reset diff tracker
    if (eventCache.doublePoint.length < 2) {
      prevDiff = -1;
    }
  }

  /**
   * Removes a pointer event from the cache.
   * @param {PointerEvent} ev - The pointer event to be removed.
   */
  function removeEvent(ev) {
    const index = eventCache.doublePoint.findIndex(
      (cachedEv) => cachedEv.pointerId === ev.pointerId
    );
    eventCache.doublePoint.splice(index, 1);
    eventCache.singlePoint.splice(index, 1);
  }
}

/**
 * Zooms the SVG element by a specified scale factor at a given point.
 * @param {number} scale - The scale factor for zooming.
 * @param {number} pointerOffsetX - The X-coordinate of the point to zoom around.
 * @param {number} pointerOffsetY - The Y-coordinate of the point to zoom around.
 * @param {SVGElement} svg - The SVG element to zoom.
 * @returns {SVGElement} - The modified SVG element.
 */
export function zoom(scale, pointerOffsetX, pointerOffsetY, svg) {
  let viewBoxArray = svg
    .getAttribute('viewBox')
    .split(' ')
    .map((s) => Number(s));
  var viewBox = {
    x: viewBoxArray[0],
    y: viewBoxArray[1],
    width: viewBoxArray[2],
    height: viewBoxArray[3],
  };
  var dw = viewBox.width * Math.sign(-scale) * 0.05;
  var dh = viewBox.height * Math.sign(-scale) * 0.05;
  var dx = (dw * pointerOffsetX) / svg.clientWidth;
  var dy = (dh * pointerOffsetY) / svg.clientHeight;

  svg.setAttribute(
    'viewBox',
    `${viewBox.x + dx} ${viewBox.y + dy} ${viewBox.width - dw} ${
      viewBox.height - dh
    }`
  );

  return svg;
}

/**
 * Pans the SVG element by a specified delta in both X and Y directions.
 * @param {number} deltaX - The change in the X-coordinate for panning.
 * @param {number} deltaY - The change in the Y-coordinate for panning.
 * @param {SVGElement} svg - The SVG element to pan.
 * @returns {SVGElement} - The modified SVG element.
 */
export function pan(deltaX, deltaY, svg) {
  let viewBoxArray = svg
    .getAttribute('viewBox')
    .split(' ')
    .map((s) => Number(s));
  var viewBox = {
    x: viewBoxArray[0],
    y: viewBoxArray[1],
    width: viewBoxArray[2],
    height: viewBoxArray[3],
  };
  var scale = viewBox.width / svg.clientWidth;

  var dx = deltaX / scale;
  var dy = deltaY / scale;

  svg.setAttribute(
    'viewBox',
    `${viewBox.x + dx} ${viewBox.y + dy} ${viewBox.width} ${viewBox.height}`
  );

  return svg;
}
