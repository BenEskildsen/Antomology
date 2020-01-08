'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var Checkbox = require('./components/Checkbox.react');
var Dropdown = require('./components/Dropdown.react');
var useState = React.useState,
    useEffect = React.useEffect;

var BehaviorCard = require('./BehaviorCard.react');

function TaskCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      task = props.task,
      newTask = props.newTask;

  var _useState = useState(task.repeating),
      _useState2 = _slicedToArray(_useState, 2),
      repeating = _useState2[0],
      setRepeating = _useState2[1];

  var _useState3 = useState(task.name),
      _useState4 = _slicedToArray(_useState3, 2),
      taskName = _useState4[0],
      setTaskName = _useState4[1];
  // "deep-copy" behaviorQueue so that BehaviorCards can mutate it


  var _useState5 = useState(task.behaviorQueue.map(function (b) {
    return JSON.parse(JSON.stringify(b));
  })),
      _useState6 = _slicedToArray(_useState5, 2),
      behaviorQueue = _useState6[0],
      setBehaviorQueue = _useState6[1];

  useEffect(function () {
    setRepeating(task.repeating);
    setTaskName(task.name);
    setBehaviorQueue(task.behaviorQueue.map(function (b) {
      return JSON.parse(JSON.stringify(b));
    }));
  }, [task.name, task.repeating, task.behaviorQueue]);

  var behaviors = behaviorQueue.map(function (b, i) {
    return React.createElement(
      'div',
      { key: 'behavior_' + i },
      React.createElement(BehaviorCard, { state: state, dispatch: dispatch, behavior: b })
    );
  });
  return React.createElement(
    'div',
    {
      className: 'taskCard',
      style: {}
    },
    React.createElement(
      'div',
      null,
      'Name:',
      React.createElement('input', { type: 'text',
        placeholder: 'Task Name',
        onChange: function onChange(ev) {
          setTaskName(ev.target.value);
        },
        value: taskName })
    ),
    React.createElement(
      'div',
      null,
      'Repeating:',
      React.createElement(Checkbox, { checked: repeating, onChange: setRepeating })
    ),
    React.createElement(
      'div',
      null,
      'BehaviorQueue:',
      React.createElement(
        'div',
        null,
        behaviors
      ),
      React.createElement(Button, {
        label: 'Add Behavior',
        onClick: function onClick() {}
      })
    ),
    React.createElement(Button, {
      label: newTask || taskName != task.name ? 'Create Task' : 'Update Task',
      onClick: function onClick() {
        var editedTask = { name: taskName, repeating: repeating, behaviorQueue: behaviorQueue };
        if (newTask || taskName != task.name) {
          dispatch({ type: 'CREATE_TASK', task: editedTask });
        } else {
          dispatch({ type: 'UPDATE_TASK', task: editedTask });
        }
      }
    })
  );
}

module.exports = TaskCard;