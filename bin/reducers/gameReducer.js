'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/stateHelpers'),
    addEntity = _require2.addEntity,
    removeEntity = _require2.removeEntity,
    antSwitchTask = _require2.antSwitchTask,
    lookupInGrid = _require2.lookupInGrid;

var _require3 = require('../utils/helpers'),
    clamp = _require3.clamp;

var _require4 = require('../entities/makeEntityByType'),
    makeEntityByType = _require4.makeEntityByType;

var _require5 = require('../entities/edge'),
    createEdge = _require5.createEdge;

var _require6 = require('../selectors/selectors'),
    insideWorld = _require6.insideWorld;

var _require7 = require('../state/tasks'),
    createIdleTask = _require7.createIdleTask;

var gameReducer = function gameReducer(game, action) {
  switch (action.type) {
    case 'CREATE_ENTITY':
      {
        var entity = action.entity;

        createEntityReducer(game, entity);
        nextID = Math.max(nextID, entity.id + 1);
        return game;
      }
    case 'CREATE_MANY_ENTITIES':
      {
        var _ret = function () {
          var entityType = action.entityType,
              pos = action.pos,
              width = action.width,
              height = action.height,
              editorState = action.editorState;
          var x = pos.x,
              y = pos.y;

          if (game.entities[nextID] != null) {
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("NEXT_ID", nextID, game.entities[nextID]);
            console.log(game.entities[nextID + 1]);
            // nextID++;
          }
          for (var i = 0; i <= width; i++) {
            for (var j = 0; j <= height; j++) {
              var gridPos = { x: x + i, y: y + j };
              var occupied = lookupInGrid(game.grid, gridPos).map(function (i) {
                return game.entities[i];
              }).filter(function (e) {
                return e.type == entityType;
              }).length > 0;
              if (!occupied) {
                var _entity = makeEntityByType(game, editorState, entityType, gridPos);
                createEntityReducer(game, _entity);
              }
            }
          }

          return {
            v: game
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
    case 'DESTROY_ENTITY':
      {
        var id = action.id;

        game.selectedEntities = game.selectedEntities.filter(function (i) {
          return i != id;
        });
        var _entity2 = game.entities[id];
        if (_entity2 == null) {
          return game; // TODO: shouldn't happen!
        }
        if (game.LOCATION.includes(id)) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = game.ANT[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var antID = _step.value;

              var ant = game.entities[antID];
              if (ant.location != null && ant.location.id === id) {
                ant.location = null;
              }
              if (ant.task != null && ant.task.name == _entity2.task.name) {
                antSwitchTask(game, ant, createIdleTask());
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
        removeEntity(game, _entity2);
        return game;
      }
    case 'SET_SELECTED_ENTITIES':
      {
        var entityIDs = action.entityIDs;

        var prevSelected = [].concat(_toConsumableArray(game.selectedEntities));

        // deselected ants inside a location should take up that task
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = prevSelected[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _id = _step2.value;

            if (!entityIDs.includes(_id)) {
              var _ant = game.entities[_id];
              if (_ant.type != 'ANT') continue;
              if (_ant.location != null && (_ant.task == null || _ant.task.name != _ant.location.task.name)) {
                antSwitchTask(game, _ant, _ant.location.task, [{ name: 'Follow Trail', index: 0 }, { name: 'Find Pheromone Trail', index: 0 }]);
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return _extends({}, game, {
          selectedEntities: entityIDs
        });
      }
    case 'TOGGLE_FOG':
      {
        var fog = action.fog;

        return _extends({}, game, {
          fog: fog
        });
      }
    case 'SET_GAME_OVER':
      {
        var gameOver = action.gameOver;

        return _extends({}, game, {
          gameOver: gameOver
        });
      }
    case 'SET_PHEROMONE_CONDITION':
      {
        var category = action.category,
            condition = action.condition;

        game.pheromones[category].condition = condition;
        return game;
      }
    case 'SET_PHEROMONE_STRENGTH':
      {
        var _category = action.category,
            strength = action.strength;

        game.pheromones[_category].strength = strength;
        return game;
      }
    case 'SET_WORLD_SIZE':
      {
        var width = action.width,
            height = action.height;

        var nextWorldWidth = width != null ? width : game.worldWidth;
        var nextWorldHeight = height != null ? height : game.worldHeight;

        // delete entities outside the world
        var entitiesToDelete = [];
        for (var _id2 in game.entities) {
          var _entity3 = game.entities[_id2];
          if (_entity3 == null) continue; // entity already deleted
          if (_entity3.position.x >= nextWorldWidth || _entity3.position.y >= nextWorldHeight) {
            entitiesToDelete.push(_entity3);
          }
        }
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = entitiesToDelete[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _entity4 = _step3.value;

            removeEntity(game, _entity4);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return _extends({}, game, {
          worldWidth: nextWorldWidth,
          worldHeight: nextWorldHeight
        });
      }
    case 'CREATE_EDGE':
      {
        var start = action.start;

        var newEdge = createEdge(start);
        game.edges[newEdge.id] = newEdge;
        game.curEdge = newEdge.id;
        game.entities[start].outgoingEdges.push(newEdge.id);
        return game;
      }
    case 'UPDATE_EDGE':
      {
        var _id3 = action.id,
            edge = action.edge;

        if (game.edges[_id3].end == null && edge.end != null) {
          game.entities[edge.end].incomingEdges.push(_id3);
        }
        game.edges[_id3] = edge;
        game.curEdge = null;
        return game;
      }
    case 'SET_CUR_EDGE':
      {
        var curEdge = action.curEdge;

        return _extends({}, game, {
          curEdge: curEdge
        });
      }
    case 'CREATE_TASK':
      {
        var task = action.task;

        return _extends({}, game, {
          tasks: [].concat(_toConsumableArray(game.tasks), [task])
        });
      }
    case 'UPDATE_TASK':
      {
        var _task = action.task;

        var oldTask = game.tasks.filter(function (t) {
          return t.name === _task.name;
        })[0];
        oldTask.repeating = _task.repeating;
        oldTask.behaviorQueue = _task.behaviorQueue;
        return game;
      }
    case 'UPDATE_LOCATION_NAME':
      {
        var _id4 = action.id,
            newName = action.newName;

        var loc = game.entities[_id4];
        loc.name = newName;
        loc.task.name = newName;
        return game;
      }
    case 'UPDATE_NEXT_LOCATION_NAME':
      {
        var name = action.name;

        return _extends({}, game, {
          nextLocationName: name
        });
      }
    case 'UPDATE_LOCATION_TASK':
      {
        var _task2 = action.task,
            _id5 = action.id;

        var _loc = game.entities[_id5];
        _loc.task.repeating = false;
        _loc.task.behaviorQueue = _task2.behaviorQueue;
        return game;
      }
    case 'ASSIGN_TASK':
      {
        var _task3 = action.task,
            ants = action.ants;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = ants[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _id6 = _step4.value;

            game.entities[_id6].task = _task3;
            game.entities[_id6].taskStack = [];
            game.entities[_id6].taskIndex = 0;
          }
          // add the task to the task array
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        var taskAdded = game.tasks.filter(function (t) {
          return t.name === _task3.name;
        }).length > 0;
        if (!taskAdded) {
          game.tasks.push(_task3);
        }
        return game;
      }
    case 'SET_USER_MODE':
      {
        var userMode = action.userMode;

        return _extends({}, game, {
          userMode: userMode
        });
      }
    case 'SET_INFO_TAB':
      {
        var infoTab = action.infoTab;

        return _extends({}, game, {
          infoTab: infoTab
        });
      }
    case 'SET_ANT_MODE':
      {
        var antMode = action.antMode;

        return _extends({}, game, {
          antMode: antMode
        });
      }
    case 'SET_TICKER':
      {
        var text = action.text,
            maxAge = action.maxAge;

        return _extends({}, game, {
          ticker: {
            text: text, maxAge: maxAge,
            curAge: 0
          }
        });
      }
    case 'SET_HOVER_CARD_JSX':
      {
        var jsx = action.jsx;

        return _extends({}, game, {
          hoverCard: _extends({}, game.hoverCard, {
            jsx: jsx,
            mouseStillTime: jsx == null ? 0 : game.hoverCard.mouseStillTime + 1
          })
        });
      }
    case 'SET_HOVER_CARD_TIME':
      {
        var mouseStillTime = action.mouseStillTime;

        return _extends({}, game, {
          hoverCard: _extends({}, game.hoverCard, {
            mouseStillTime: mouseStillTime
          })
        });
      }
    case 'UPDATE_THETA':
      {
        var _id7 = action.id,
            theta = action.theta;

        if (game.entities[_id7] != null) {
          game.entities[_id7].theta = theta;
        }
        return game;
      }
    case 'SET_PREV_PHEROMONE':
      {
        var _id8 = action.id;

        return _extends({}, game, {
          prevPheromone: _id8
        });
      }
    case 'SET_MOUSE_DOWN':
      {
        var isLeft = action.isLeft,
            isDown = action.isDown,
            downPos = action.downPos;

        return _extends({}, game, {
          mouse: _extends({}, game.mouse, {
            isLeftDown: isLeft ? isDown : game.mouse.isLeftDown,
            isRightDown: isLeft ? game.mouse.isRightDOwn : isDown,
            downPos: isDown && downPos != null ? downPos : game.mouse.downPos
          })
        });
      }
    case 'SET_MOUSE_POS':
      {
        var curPos = action.curPos,
            curPixel = action.curPixel;

        return _extends({}, game, {
          mouse: _extends({}, game.mouse, {
            prevPos: _extends({}, game.mouse.curPos),
            curPos: curPos,
            prevPixel: _extends({}, game.mouse.curPixel),
            curPixel: curPixel
          })
        });
      }
    case 'SET_VIEW_POS':
      {
        // TODO: this action isn't used by WASD, but is used on left click...
        var viewPos = action.viewPos,
            inEditor = action.inEditor;

        if (inEditor) {
          return _extends({}, game, {
            viewPos: viewPos
          });
        }
        var nextViewPos = {
          x: clamp(viewPos.x, 0, game.worldWidth - config.width),
          y: clamp(viewPos.y, 0, game.worldHeight - config.height)
        };
        return _extends({}, game, {
          viewPos: nextViewPos
        });
      }
    case 'ZOOM':
      {
        var out = action.out,
            _inEditor = action.inEditor;

        var widthToHeight = config.width / config.height;
        var heightToWidth = config.height / config.width;
        var zoomFactor = 1;
        var nextWidth = config.width + widthToHeight * zoomFactor * out;
        var nextHeight = config.height + heightToWidth * zoomFactor * out;
        var widthDiff = nextWidth - config.width;
        var heightDiff = nextHeight - config.height;

        // zoom relative to the view position
        var nextViewPosX = game.viewPos.x - widthDiff / 2;
        var nextViewPosY = game.viewPos.y - heightDiff / 2;

        if (_inEditor) {
          config.width = Math.max(nextWidth, 1);
          config.height = Math.max(nextHeight, 1);
          return _extends({}, game, {
            viewPos: {
              x: nextViewPosX,
              y: nextViewPosY
            }
          });
        }
        if (nextWidth > game.worldWidth || nextHeight > game.worldHeight || nextWidth < 1 || nextHeight < 1) {
          return game; // don't zoom too far in or out
        }
        config.width = nextWidth;
        config.height = nextHeight;
        return _extends({}, game, {
          viewPos: {
            x: clamp(nextViewPosX, 0, game.worldWidth - config.width),
            y: clamp(nextViewPosY, 0, game.worldHeight - config.height)
          }
        });
      }
  }

  return game;
};

var createEntityReducer = function createEntityReducer(game, entity) {
  if (entity.position != null && !insideWorld(game, entity.position)) {
    return;
  }
  if (entity.type == 'LOCATION') {
    // if trying to make a location with the same name as one that already exists,
    // just update the position of the currently-existing entity for that location
    var locationIDWithName = game.LOCATION.filter(function (l) {
      return game.entities[l].name === entity.name;
    })[0];
    if (locationIDWithName != null) {
      // is null for clicked location
      var locationEntity = game.entities[locationIDWithName];
      removeEntity(game, game.entities[locationIDWithName]);
      var updatedLocation = _extends({}, entity, { id: locationIDWithName,
        task: locationEntity != null ? locationEntity.task : entity.task
      });
      addEntity(game, updatedLocation);
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = game.ANT[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var antID = _step5.value;

          var ant = game.entities[antID];
          if (ant.location != null && ant.location.id === locationIDWithName) {
            ant.location = updatedLocation;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    } else {
      addEntity(game, entity);
    }
  } else if (entity.type === 'PHEROMONE') {
    game.prevPheromone = entity.id;
    var pheromonesAtPos = lookupInGrid(game.grid, entity.position).map(function (id) {
      return game.entities[id];
    }).filter(function (e) {
      return e.type == 'PHEROMONE';
    }).filter(function (e) {
      return e.theta === entity.theta || entity.strength < 0;
    });

    if (pheromonesAtPos.length == 0) {
      addEntity(game, entity);
    }
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = pheromonesAtPos[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var pher = _step6.value;

        pher.quantity = clamp(entity.quantity + pher.quantity, 0, config.pheromoneMaxQuantity);
      }

      // TODO: remove or bring back edges
      // game.edges[entity.edge].pheromones.push(entity.id);
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  } else {
    addEntity(game, entity);
  }
};

module.exports = { gameReducer: gameReducer };