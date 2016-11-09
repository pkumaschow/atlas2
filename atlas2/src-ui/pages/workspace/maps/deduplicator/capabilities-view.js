/*jshint esversion: 6 */

import React, {PropTypes} from 'react';
import {
  Grid,
  Row,
  Col,
  Jumbotron,
  Button,
  Table,
  ListGroup,
  Popover,
  OverlayTrigger,
  Glyphicon
} from 'react-bootstrap';
import Actions from './deduplicator-actions';
import _ from "underscore";
var AssignExistingCapabilityDialog = require('./assign-existing-capability');
import {getStyleForType} from './../editor/component-styles';
import MapLink from './maplink.js';

var acceptorStyle = {
  width: "100%",
  height: "35px",
  lineHeight: "35px",
  textAlign: "center",
  verticalAlign: "middle",
  margin: "1px",
  color: "white"
};

var capabilityStyle = {
  textAlign: "center"
};

var greyLaneStyle = {
  position: 'absolute',
  left: 1,
  right: 1,
  top: 5,
  height: 20,
  margin: "1px",
  backgroundColor: '#f8f8f8'
};
export default class CapabilitiesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.assignExistingCapabilityDialog =  {
        open: false
    };
    // this.componentDidMount = this.componentDidMount.bind(this);
    // this.componentWillUnmount = this.componentWillUnmount.bind(this);
    // this._onChange = this._onChange.bind(this);
    // this.render = this.render.bind(this);
  }

  // componentDidMount() {
  //   this.props.store.addChangeListener(this._onChange);
  // }
  //
  // componentWillUnmount() {
  //   this.props.store.removeChangeListener(this._onChange);
  // }
  //
  // _onChange() {
  //   console.log('new components will be', this.props.store.getProcessedComponents());
  //   this.setState(this.props.store.getProcessedComponents());
  // }

  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'copy';
  }
  handleDropExistingCapability(categoryId, capabilityID, existingItems, e) {
    if (!(categoryId && capabilityID && existingItems && e)) {
      console.error(categoryId, capabilityID, existingItems, e);
      return;
    }
    var copyOfNode = JSON.parse(e.dataTransfer.getData('json'));
    e.stopPropagation();
    if ((!existingItems) || (existingItems.length === 0)) {
      //easy part, no other components in the category, so just assign the node
      Actions.assignNodeToCapability(this.props.workspace._id, categoryId, capabilityID, copyOfNode.mapID, copyOfNode._id);
      return;
    }

    //otherwise launch deduplication dialog
    var newState = {
      assignExistingCapabilityDialog: {
        open: true,
        nodeBeingAssigned: copyOfNode,
        otherNodes: existingItems,
        capabilityID: capabilityID,
        categoryId: categoryId
      }
    };
    this.setState(newState);
  }

  handleDropNewCapability(cat, e) {
    var item = JSON.parse(e.dataTransfer.getData('json'));
    Actions.createNewCapability(this.props.workspace._id, cat, item._id);
  }

  cancelDialog(dialogParametersName) {
    var newState = {};
    newState[dialogParametersName] = {
      open: false
    };
    this.setState(newState);
  }

  submitDialog(capabilityCategory, newCapabilityName, copyOfNode) {
    Actions.createNewCapabilityAndAssingNodeToIt(this.props.workspace._id, capabilityCategory, newCapabilityName, copyOfNode.mapID, copyOfNode._id);
  }

  submitAssignDialog(nodeBeingAssignedMapID, nodeBeingAssignedID, referenceNodeID, referenceNodemapID) {
    console.log('submit 2');
    if (!(referenceNodeID && referenceNodemapID)) {
      //again, easy part as it is just a new component in the category
      Actions.assignNodeToCapability(this.props.workspace._id, this.state.assignExistingCapabilityDialog.categoryId, this.state.assignExistingCapabilityDialog.capabilityID, nodeBeingAssignedMapID, nodeBeingAssignedID);
      var newState = {
        assignExistingCapabilityDialog: {
          open: false
        }
      };
      this.setState(newState);
      console.log('submit 3');
      return;
    }
    console.log('submit 4');
    Actions.makeNodesReferenced(this.props.workspace._id, nodeBeingAssignedMapID, nodeBeingAssignedID, referenceNodeID, referenceNodemapID);
    //definitely not happy with this, as closing the dialog should be an answer to data refresh
    var newState = { //jshint ignore:line
      assignExistingCapabilityDialog: {
        open: false
      }
    };
    this.setState(newState);
  }

  clearNodeAssignement(mapID, nodeID, e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.stopPropagation();
    Actions.clearNodeAssignement(this.props.workspace._id, mapID, nodeID);
  }

  renderNodeInACapability(node) {
    var style = getStyleForType(node.type);
    style.left = node.x * 100 + '%';
    style.position = 'absolute';
    style.top = "10px";
    var linkToMap = "/map/" + node.mapID;
    var _popover = (
      <Popover id={node.name} title="Component details">
        <p>Name: {node.name}</p>
        <p>Map:
          <a href={linkToMap}>{node.mapName}</a>
        </p>
        <p>
          Appears also on following map(s):
          <ul>
            {node.referencedNodes.map(node => <li>
              <MapLink mapID={node.mapID}></MapLink>
            </li>)}</ul>
        </p>
        <p>
          <a href="#" onClick={this.clearNodeAssignement.bind(this, node.mapID, node._id)}>Remove from this capability
          </a>
        </p>
      </Popover>
    );
    //
    return (
      <OverlayTrigger trigger="click" placement="bottom" overlay={_popover}>
        <div style={style}></div>
      </OverlayTrigger>
    );
  }


  renderSingleNode(node){
    var style = getStyleForType(node.type);
    style.left = node.x * 100 + '%';
    style.position = 'absolute';
    style.top = "10px";
    return <div style={style}></div>;
  }

  render() {
    var _acceptorStyleToSet = _.clone(acceptorStyle);
    var _capabilityStyleToSet = _.clone(capabilityStyle);
    var _greyLaneStyleToSet = _.clone(greyLaneStyle);
    var greyLaneText = null;
    var _this = this;
    if (this.props.dragStarted) {
      _acceptorStyleToSet = _.extend(_acceptorStyleToSet, {
        borderColor: "#00789b",
        boxShadow: "0 0 10px #00789b",
        border: '1px solid #00789b',
        color: 'black'
      });
      _greyLaneStyleToSet = _.extend(_greyLaneStyleToSet, {
        borderColor: "#00789b",
        boxShadow: "0 0 5px #00789b",
        border: '1px solid #00789b',
        zIndex:20
      });
      greyLaneText = "Drop here if the component does the same what this component";
    }

    var categories = [];
    if(!this.props.categories || !this.props.categories.capabilityCategories){
      return <div> wait...</div>
    }
    this.props.categories.capabilityCategories.forEach(function(category){

      var dragOver = _this.handleDragOver.bind(_this);
      var onDrop = _this.handleDropNewCapability.bind(_this, category._id);

      // first the title
      categories.push(
        <Row className="show-grid" key={category._id}>
          <Col xs={3}>
            <h4>{category.name}</h4>
          </Col>
          <Col xs={9}>
            <div style={_acceptorStyleToSet} onDragOver={dragOver} onDrop={onDrop}>Drop here if nothing in this category does the same job</div>
          </Col>
        </Row>
      );

      category.capabilities.forEach(function(capability){
        //onDrop={this.handleDropExistingCapability.bind(this, category._id, capability._id, existingItems)
        // /{_itemsToDisplay}
        var _itemsToDisplay = [];
        capability.nodes.forEach(function(node){
            _itemsToDisplay.push(
              _this.renderSingleNode(node)
            );
        });
        var name = capability.nodes[0] ? capability.nodes[0].name : 'banana';
        categories.push(
          <Row className="show-grid" key={capability._id}>
                      <Col xs={3}>
                        <div style={{
                          textAlign: "right"
                        }}>
                          <h5>{name}</h5>
                        </div>
                      </Col>
                      <Col xs={9}>
                        <div style={_capabilityStyleToSet} onDragOver={dragOver}>
                          <div style={_greyLaneStyleToSet}>{greyLaneText}</div>
                          {_itemsToDisplay}
                        </div>
                      </Col>
                    </Row>
        );
      });

    });
    if(categories.length === 0){
      categories.push(<Row className="show-grid">
                  <Col xs={12}>
                    Nothing found
                  </Col>
                </Row>);
    }
    // if (this.props.workspace && this.props.workspace.capabilityCategories) {
    //   for (var i = 0; i < this.props.workspace.capabilityCategories.length; i++) {
    //     if (!categories) {
    //       categories = [];
    //     }
    //     var category = this.props.workspace.capabilityCategories[i];
    //     categories.push(
    //       <Row className="show-grid">
    //         <Col xs={3}>
    //           <h4>{category.name}</h4>
    //         </Col>
    //         <Col xs={9}>
    //           <div style={_acceptorStyleToSet} onDragOver={this.handleDragOver.bind(this)} onDrop={this.handleDropNewCapability.bind(this, category._id)}>Drop here if nothing in this category does the same job</div>
    //         </Col>
    //       </Row>
    //     );
    //     if (category.capabilities) {
    //       for (var j = 0; j < category.capabilities.length; j++) {
    //         var capability = category.capabilities[j];
    //         var _itemsToDisplay = this.renderFoundNodesInCapability(capability._id);
    //         var existingItems = this.findNodesInCapability(capability._id);
    //         categories.push(
    //           <Row className="show-grid">
    //             <Col xs={3}>
    //               <div style={{
    //                 textAlign: "right"
    //               }}>
    //                 <h5>{capability.name}</h5>
    //               </div>
    //             </Col>
    //             <Col xs={9}>
    //               <div style={_capabilityStyleToSet} onDragOver={this.handleDragOver.bind(this)} onDrop={this.handleDropExistingCapability.bind(this, category._id, capability._id, existingItems)}>
    //                 <div style={_greyLaneStyleToSet}>{greyLaneText}</div>
    //                 {_itemsToDisplay}
    //               </div>
    //             </Col>
    //           </Row>
    //         );
    //       }
    //     }
    //   }
    // }

    // var dialogOpen = this.state.newCapabilityDialog.open;
    // var nodeBeingAssigned = this.state.newCapabilityDialog.item;
    // var capabilityCategory = this.state.newCapabilityDialog.categoryId;
    //
    // var assignDialogOpen = this.state.assignExistingCapabilityDialog.open;
    // var assignNodeBeingAssigned = this.state.assignExistingCapabilityDialog.nodeBeingAssigned;
    // var assignCapabilityId = this.state.assignExistingCapabilityDialog.categoryId;
    // var assignItems = this.state.assignExistingCapabilityDialog.otherNodes;

    var _this;
    return (
      <Grid fluid={true}>
        {categories}
      </Grid>
    );
    // <AssignExistingCapabilityDialog open={assignDialogOpen} nodeBeingAssigned={assignNodeBeingAssigned} capabilityID={assignCapabilityId} otherNodes={assignItems} cancel={this.cancelDialog.bind(this, "assignExistingCapabilityDialog")} submitAssignDialog={this.submitAssignDialog.bind(this)}/>
  }
}
