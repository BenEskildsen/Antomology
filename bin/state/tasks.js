'use strict';

///////////////////////////////////////////////////////////////
// general
///////////////////////////////////////////////////////////////

var createGoToLocationTask = function createGoToLocationTask(location) {
  return {
    name: 'Go To Location',
    repeating: false,
    behaviorQueue: [createGoToLocationBehavior(location)]
  };
};
// Helpers for creating tasks/locations via the console

var createDoAction = function createDoAction(type, object) {
  return {
    type: 'DO_ACTION',
    action: {
      type: type,
      payload: {
        object: object
      }
    }
  };
};

var createIdleTask = function createIdleTask() {
  return {
    name: 'Idle',
    repeating: true,
    behaviorQueue: [createDoAction('IDLE', null)]
  };
};

var createLayEggTask = function createLayEggTask() {
  return {
    name: 'Lay Egg',
    repeating: false,
    behaviorQueue: [createDoAction('LAY', null)]
  };
};

///////////////////////////////////////////////////////////////
// move
///////////////////////////////////////////////////////////////

var createMoveBehavior = function createMoveBehavior(location) {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'MOVE',
      payload: {
        object: location != null ? location : 'RANDOM'
      }
    }
  };
};

var createRandomMoveTask = function createRandomMoveTask() {
  return {
    name: 'Move Randomly',
    repeating: true,
    behaviorQueue: [createMoveBehavior()]
  };
};

///////////////////////////////////////////////////////////////
// go to location
///////////////////////////////////////////////////////////////

var createGoToLocationBehavior = function createGoToLocationBehavior(location) {
  return {
    type: 'WHILE',
    condition: {
      type: 'LOCATION',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: location
      }
    },
    behavior: createMoveBehavior(location)
  };
};

var getIthLocation = function getIthLocation(game, i) {
  var locationID = game.locations[i];
  return game.entities[locationID];
};

var getLocation = function getLocation(game, locationID) {
  return game.entities[locationID];
};

///////////////////////////////////////////////////////////////
// digging
///////////////////////////////////////////////////////////////

var createFindBlueprintBehavior = function createFindBlueprintBehavior() {
  return {
    type: 'WHILE',
    condition: {
      type: 'NEIGHBORING',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: 'MARKED'
      }
    },
    behavior: createMoveBehavior() // move randomly
  };
};

var createPickupBlueprintBehavior = function createPickupBlueprintBehavior() {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PICKUP',
      payload: {
        object: 'MARKED'
      }
    }
  };
};

var createFindDropOffLocationBehavior = function createFindDropOffLocationBehavior() {
  return {
    type: 'WHILE',
    condition: {
      type: 'RANDOM',
      not: false,
      comparator: 'LESS_THAN',
      payload: {
        object: 0.9
      }
    },
    behavior: createMoveBehavior()
  };
};

var createPutDownBehavior = function createPutDownBehavior() {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PUTDOWN',
      payload: {
        object: null // put down at current position
      }
    }
  };
};

var createPickupBlockerBehavior = function createPickupBlockerBehavior() {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PICKUP',
      payload: {
        object: 'BLOCKER'
      }
    }
  };
};

var createDigBlueprintTask = function createDigBlueprintTask(game) {
  return {
    name: 'Dig Out Blueprint',
    repeating: true,
    behaviorQueue: [createGoToLocationBehavior(getIthLocation(game, 0)), createFindBlueprintBehavior(), createPickupBlueprintBehavior(), createGoToLocationBehavior(getIthLocation(game, 0)), createFindDropOffLocationBehavior(), createPutDownBehavior(), {
      type: 'SWITCH_TASK',
      task: 'Move Dirt Out of the Way to the Entrance'
    }]
  };
};

var createGoToColonyEntranceWithBlockerTask = function createGoToColonyEntranceWithBlockerTask(game) {
  return {
    name: 'Move Dirt Out of the Way to the Entrance',
    repeating: false,
    behaviorQueue: [{
      type: 'WHILE',
      condition: {
        type: 'LOCATION',
        not: true,
        comparator: 'EQUALS',
        payload: {
          object: getIthLocation(game, 0)
        }
      },
      behavior: {
        type: 'IF',
        condition: {
          type: 'BLOCKED',
          not: true,
          comparator: 'EQUALS',
          payload: {
            object: null
          }
        },
        behavior: createMoveBehavior(getIthLocation(game, 0)),
        elseBehavior: {
          type: 'SWITCH_TASK',
          done: false,
          task: 'Put Down Blocking Dirt'
        }
      }
    }, {
      type: 'SWITCH_TASK',
      task: 'Dig Out Blueprint'
    }]
  };
};

var createMoveBlockerTask = function createMoveBlockerTask() {
  return {
    name: 'Put Down Blocking Dirt',
    repeating: false,
    behaviorQueue: [createPickupBlockerBehavior(), createFindDropOffLocationBehavior(), createPutDownBehavior(), {
      type: 'SWITCH_TASK',
      task: 'Move Dirt Out of the Way to the Entrance'
    }]
  };
};

///////////////////////////////////////////////////////////////
// with dispatch
///////////////////////////////////////////////////////////////

var sendAllAntsToLocation = function sendAllAntsToLocation(index) {
  var game = store.getState().game;
  store.dispatch({
    type: 'ASSIGN_TASK',
    task: createGoToLocationTask(getIthLocation(game, index)),
    ants: game.ants
  });
};

var sendAllAntsToBlueprint = function sendAllAntsToBlueprint() {
  var game = store.getState().game;
  store.dispatch({
    type: 'ASSIGN_TASK',
    task: createDigBlueprintTask(game),
    ants: game.ants
  });
};

var tasks = {
  createGoToLocationTask: createGoToLocationTask,
  getLocation: getLocation,
  getIthLocation: getIthLocation,
  createMoveBehavior: createMoveBehavior,
  createRandomMoveTask: createRandomMoveTask,
  createMoveBlockerTask: createMoveBlockerTask,
  createGoToColonyEntranceWithBlockerTask: createGoToColonyEntranceWithBlockerTask,
  createDigBlueprintTask: createDigBlueprintTask,
  sendAllAntsToLocation: sendAllAntsToLocation,
  sendAllAntsToBlueprint: sendAllAntsToBlueprint,
  createDoAction: createDoAction,
  createIdleTask: createIdleTask,
  createLayEggTask: createLayEggTask
};
window.tasks = tasks;

module.exports = tasks;