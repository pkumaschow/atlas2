/*jshint esversion: 6 */

import Store from '../../store.js';
import Dispatcher from '../../dispatcher';
import Constants from '../../constants';
import $ from 'jquery';

let appState = {
  newWorkspaceDialog: {
    open: false
  },
  newMapDialog: {
    open: false
  },
  workspaces: {},
  singleWorkspace: {},
  canvasState: {
    highlight: false,
    coords: null
  },
  newNodeDialog: {
    open: false
  },
  w_maps: {}
};

var workspacesQueriedForFirstTime = false;
class WorkspaceStore extends Store {

  constructor() {
    super();
  }
  getMapInfo(mapID) {
    //TODO: loading
    if (!appState.w_maps[mapID]) {
      return {};
    }
    return appState.w_maps[mapID];
  }

  recordNewComponent(type, params) { //normalizes the drop and opens the new node dialog
    var relativeToCanvasPosX = params.pos[0]/*absolute pos of drop*/ - appState.canvasState.coords.offset.left/*absolute pos of canvas*/;
    var relativeToCanvasPosY = params.pos[1]/*absolute pos of drop*/ - appState.canvasState.coords.offset.top/*absolute pos of canvas*/;

    var universalCoordX = relativeToCanvasPosX / appState.canvasState.coords.size.width;
    var universalCoordY = relativeToCanvasPosY / appState.canvasState.coords.size.height;
    appState.newNodeDialog.open = true;
    appState.newNodeDialog.type = type;
    appState.newNodeDialog.coords = {
      x: universalCoordX,
      y: universalCoordY
    };
  }

  newNodeCreated(data) { // the new map dialog confirms the component creation
    console.log('new node to be created', data);
    console.log(data.name);
    console.log(data.type);
    console.log(data.coords);
  }

  getNewNodeDialogState() {
    return appState.newNodeDialog;
  }

  getCanvasState() {
    return appState.canvasState;
  }
  getState() {
    return appState;
  }

  reset() {
    appState = {};
  }
  emitChange() {
    super.emitChange();
  }
  updateWorkspaces() {
    this.serverRequest = $.get('/api/workspaces', function(result) {
      appState.workspaces = result;
      this.emitChange();
    }.bind(this));
  }
  fetchSingleWorkspaceInfo(workspaceID) {
    this.serverRequest = $.get('/api/workspace/' + workspaceID, function(result) {
      console.log('result', result);
      appState.singleWorkspace[workspaceID] = result;
      this.emitChange();
    }.bind(this));
  }
  getWorkspaces() {
    if (!workspacesQueriedForFirstTime) {
      this.updateWorkspaces();
      workspacesQueriedForFirstTime = true;
    }
    return appState.workspaces;
  }

  isWorkspaceNewDialogOpen() {
    if (appState && appState.newWorkspaceDialog) {
      return appState.newWorkspaceDialog;
    } else {
      return {open: false};
    }
  }
  isMapNewDialogOpen() {
    if (appState && appState.newMapDialog) {
      return appState.newMapDialog;
    } else {
      return {open: false};
    }
  }

  submitNewWorkspaceDialog(data) {
    $.ajax({
      type: 'POST',
      url: '/api/workspace/',
      dataType: 'json',
      data: data,
      success: function(data) {
        appState.newWorkspaceDialog.open = false;
        this.updateWorkspaces();
      }.bind(this)
    });
  }

  submitNewMapDialog(data) {
    $.ajax({
      type: 'POST',
      url: '/api/map/',
      dataType: 'json',
      data: data,
      success: function(data2) {
        appState.newMapDialog.open = false;
        this.fetchSingleWorkspaceInfo(data.workspaceID);
      }.bind(this)
    });
  }

  getWorkspaceInfo(workspaceID) {
    if (!workspaceID) {
      console.error('No worksapceId in getWorkspaceInfo');
    }

    if (appState.singleWorkspace[workspaceID]) {
      return appState.singleWorkspace[workspaceID];
    }

    this.fetchSingleWorkspaceInfo(workspaceID);

    return {
      workspace: {
        name: "Loading...",
        maps: []
      }
    };
  }

}
let workspaceStoreInstance = new WorkspaceStore();

let ActionTypes = Constants.ACTION_TYPES;

workspaceStoreInstance.dispatchToken = Dispatcher.register(action => {
  console.log(action);
  switch (action.actionType) {
    case ActionTypes.WORKSPACE_OPEN_NEW_WORKSPACE_DIALOG:
      appState.newWorkspaceDialog.open = true;
      workspaceStoreInstance.emitChange();
      break;
    case ActionTypes.WORKSPACE_CLOSE_NEW_WORKSPACE_DIALOG:
      appState.newWorkspaceDialog.open = false;
      workspaceStoreInstance.emitChange();
      break;
    case ActionTypes.WORKSPACE_SUBMIT_NEW_WORKSPACE_DIALOG:
      workspaceStoreInstance.submitNewWorkspaceDialog(action.data);
      //no change, because it will go only after the submission is successful
      break;
    case ActionTypes.MAP_OPEN_NEW_WORKSPACE_DIALOG:
      appState.newMapDialog.open = true;
      workspaceStoreInstance.emitChange();
      break;
    case ActionTypes.MAP_CLOSE_NEW_WORKSPACE_DIALOG:
      appState.newMapDialog.open = false;
      workspaceStoreInstance.emitChange();
      break;
    case ActionTypes.MAP_CLOSE_SUBMIT_EDIT_WORKSPACE_DIALOG:
      workspaceStoreInstance.submitNewMapDialog(action.data);
      break;
    case ActionTypes.PALETTE_DRAG_STARTED:
      appState.canvasState.highlight = true;
      workspaceStoreInstance.emitChange();
      break;
    case ActionTypes.PALETTE_DRAG_STOPPED:
      appState.canvasState.highlight = false;
      workspaceStoreInstance.recordNewComponent(action.type, action.data);
      workspaceStoreInstance.emitChange();
      break;
    case ActionTypes.CANVAS_RESIZED:
      appState.canvasState.coords = action.data;
      workspaceStoreInstance.emitChange();
      break;
    case ActionTypes.MAP_CLOSE_NEW_NODE_DIALOG:
      appState.newNodeDialog = { //cleans up by overwriting any current data
        open: false
      };
      workspaceStoreInstance.emitChange();
      break;
    case ActionTypes.MAP_CLOSE_SUBMIT_NEW_NODE_DIALOG:
      console.log("action", action);
      workspaceStoreInstance.newNodeCreated(action.data);
      appState.newNodeDialog = { //cleans up by overwriting any current data
        open: false
      };
      break;
    default:
      return;
  }

});

export default workspaceStoreInstance;
