'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../state/graphTasks'),
    createRandomMoveInLocationTask = _require2.createRandomMoveInLocationTask,
    createFindPheromoneTask = _require2.createFindPheromoneTask,
    createHighLevelIdleTask = _require2.createHighLevelIdleTask;

var makeLocation = function makeLocation(name, width, height, position) {
  var loc = _extends({}, makeEntity('LOCATION', width, height, position), {
    name: name,
    incomingEdges: [],
    outgoingEdges: [],
    task: null,
    visible: true
  });
  // loc.task = createFindPheromoneTask();
  // TODO update name on location name update
  loc.task = _extends({}, createHighLevelIdleTask(), { name: loc.name });;
  // loc.task = {...createRandomMoveInLocationTask(loc.id), name: loc.name};
  return loc;
};

module.exports = { makeLocation: makeLocation };