/*jshint esversion: 6 */

var keyMirror = require('key-mirror-nested');

module.exports  = keyMirror({
  ACTION_TYPES : {
      WORKSPACE_OPEN_NEW_WORKSPACE_DIALOG : null,
      WORKSPACE_CLOSE_NEW_WORKSPACE_DIALOG : null,
      WORKSPACE_SUBMIT_NEW_WORKSPACE_DIALOG : null,
      MAP_OPEN_NEW_WORKSPACE_DIALOG : null,
      MAP_CLOSE_NEW_WORKSPACE_DIALOG : null,
      MAP_CLOSE_SUBMIT_EDIT_WORKSPACE_DIALOG : null,
      PALETTE_DRAG_STARTED : null,
      PALETTE_DRAG_STOPPED : null,
      CANVAS_RESIZED : null,
      MAP_CLOSE_SUBMIT_NEW_NODE_DIALOG : null,
      MAP_CLOSE_NEW_NODE_DIALOG : null,
      DEDUPLICATOR_UNASSIGNED_COMPONENT_DRAG_STARTED : null,
      DEDUPLICATOR_UNASSIGNED_COMPONENT_DRAG_STOPPED : null,
      CANVAS_FOCUS_NODE : null,
      CANVAS_BLUR_NODES : null,
      CANVAS_NODE_DRAGGED : null
  },
  USERNEED : null,
  EXTERNAL : null,
  INTERNAL : null
});