import { createSelector } from 'reselect';

import { NODE_BASE_SIZE } from '../constants/styles';
import { zoomCacheKey } from '../utils/topology-utils';

// TODO: Make all the selectors below pure (so that they only depend on the global state).

const viewportWidthSelector = createSelector(
  [
    state => state.width,
    (_, props) => props.margins,
  ],
  (width, margins) => width - margins.left - margins.right
);
const viewportHeightSelector = createSelector(
  [
    state => state.height,
    (_, props) => props.margins,
  ],
  (height, margins) => height - margins.top
);

// Compute the default zoom settings for the given graph layout.
const defaultZoomSelector = createSelector(
  [
    state => state.layoutNodes,
    (_, props) => props.margins,
    viewportWidthSelector,
    viewportHeightSelector,
  ],
  (layoutNodes, margins, width, height) => {
    if (layoutNodes.size === 0) {
      return {};
    }

    const xMin = layoutNodes.minBy(n => n.get('x')).get('x');
    const xMax = layoutNodes.maxBy(n => n.get('x')).get('x');
    const yMin = layoutNodes.minBy(n => n.get('y')).get('y');
    const yMax = layoutNodes.maxBy(n => n.get('y')).get('y');

    const xFactor = width / (xMax - xMin);
    const yFactor = height / (yMax - yMin);

    // Maximal allowed zoom will always be such that a node covers 1/5 of the viewport.
    const maxZoomScale = Math.min(width, height) / NODE_BASE_SIZE / 5;

    // Initial zoom is such that the graph covers 90% of either the viewport,
    // or one half of maximal zoom constraint, whichever is smaller.
    const zoomScale = Math.min(xFactor, yFactor, maxZoomScale / 2) * 0.9;

    // Finally, we always allow zooming out exactly 5x compared to the initial zoom.
    const minZoomScale = zoomScale / 5;

    // This translation puts the graph in the center of the viewport, respecting the margins.
    const panTranslateX = ((width - ((xMax + xMin) * zoomScale)) / 2) + margins.left;
    const panTranslateY = ((height - ((yMax + yMin) * zoomScale)) / 2) + margins.top;

    return { zoomScale, minZoomScale, maxZoomScale, panTranslateX, panTranslateY };
  }
);

// Use the cache to get the last zoom state for the selected topology,
// otherwise use the default zoom options computed from the graph layout.
export const topologyZoomState = createSelector(
  [
    (state, props) => state.zoomCache[zoomCacheKey(props)],
    defaultZoomSelector,
  ],
  (cachedZoomState, defaultZoomState) => cachedZoomState || defaultZoomState
);
