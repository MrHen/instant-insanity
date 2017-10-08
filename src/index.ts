import "./stylesheet.css";

import * as d3 from 'd3';
import * as _ from 'lodash';

// https://en.wikipedia.org/wiki/Instant_Insanity

//     +---+
//     | R |
// +---+---+---+---+
// | U | F | D | B |
// +---+---+---+---+
//     | L |
//     +---+

var rotations = {
  'up': {
    'up': 'front',
    'back': 'up',
    'down': 'back',
    'front': 'down',
    'left': 'left',
    'right': 'right'
  },
  'back': {
    'up': 'up',
    'back': 'back',
    'down': 'down',
    'front': 'front',
    'left': 'left',
    'right': 'right'
  },
  'down': {
    'up': 'back',
    'back': 'down',
    'down': 'front',
    'front': 'up',
    'left': 'left',
    'right': 'right'
  },
  'front': {
    'up': 'up',
    'back': 'back',
    'down': 'down',
    'front': 'front',
    'left': 'left',
    'right': 'right'
  },
  'left': {
    'up': 'up',
    'back': 'left',
    'down': 'down',
    'front': 'right',
    'left': 'front',
    'right': 'back'
  },
  'right': {
    'up': 'up',
    'back': 'right',
    'down': 'down',
    'front': 'left',
    'left': 'back',
    'right': 'front'
  }
}

var xPositions = {
  'up': '3.5rem',
  'back': '3.5rem',
  'down': '3.5rem',
  'front': '3.5rem',
  'left': '1rem',
  'right': '6rem'
}

var yPositions = {
  'up': '1rem',
  'back': '8.5rem',
  'down': '6rem',
  'front': '3.5rem',
  'left': '3.5rem',
  'right': '3.5rem'
}

var opacity = {
  'up': '1',
  'back': '1',
  'down': '1',
  'front': '1',
  'left': '0.5',
  'right': '0.5'
}

var goalBackground = {
  'valid': 'darkgreen',
  'invalid': 'darkred'
}

var faceBackgrounds = d3.scaleOrdinal(['#e41a1c','#377eb8','#4daf4a','#984ea3'])
var glyphs = d3.scaleOrdinal(['&hearts;', '&diams;', '&clubs;', '&spades;'])

var container = d3.selectAll("#container")
var state = loadState() || initialState();
validate(state);

build();
paint(false);

function build() {
  container
    .selectAll(".cube")
    .data(state.cubes)
    .enter()
    .append("div")
    .classed("cube", true)
    .style("background-color", "#222")
    .style("display", "inline-block")
    .style("position", "relative")
    .style("border", "1px solid black")
    .style("margin", "0.25rem")
    .style("padding", "1em")
    .style("height", "9.5rem")
    .style("width", "7rem")

  container
    .selectAll(".cube")
    .selectAll('.face')
    .data((f) => f)
    .enter()
    .append("div")
    .classed("face", true)
    .style("position", "absolute")
    .style("background-color", "lightgrey")
    .style("padding", "0.25rem")
    .style("line-height", "1.5rem")
    .style("font-size", "1.25rem")
    .style("line-height", "1.5rem")
    .style("width", "1.5rem")
    .html((f) => glyphs(f.value))

  container
    .selectAll(".cube .face")
    .on("click", rotateFrom)

  container
    .append('div')
    .classed('goal-container', true)
    .style("background-color", "#222")
    .style("display", "inline-block")
    .style("position", "relative")
    .style("border", "1px solid black")
    .style("margin", "0.25rem")
    .style("padding", "1em")
    .style("height", "9.5rem")
    .style("width", "2rem")

  container
    .select(".goal-container")
    .selectAll(".goal")
    .data(state.goals)
    .enter()
    .append("div")
    .style("position", "absolute")
    .style("height", "1.5rem")
    .style("width", "1.5rem")
    .style("padding", "0.25rem")
    .classed("goal", true)
    .style('top', (c) => yPositions[c.face])
}

function paint(shouldTransition = true) {
  container
    .selectAll('.face')
    .transition()
    .duration(shouldTransition ? 250 : 0)
    .style('background-color', (f) => faceBackgrounds(f.value))
    .style('opacity', (f) => opacity[f.face])
    .style('top', (f) => yPositions[f.face])
    .style('left', (f) => xPositions[f.face])

  container
    .selectAll('.goal')
    .transition()
    .duration(shouldTransition ? 200 : 0)
    .delay(shouldTransition ? 50 : 0)
    .style('background-color', (g) => goalBackground[g.valid])
}

function rotateFrom (face) {
  var cube = d3.select(this.parentNode).datum()

  rotateCube(cube, rotations[face.face])
  validate(state);
  saveState(state);

  paint();
}

function rotateCube (cube, rotation) {
  for(var i in cube) {
    var face = cube[i]
    var next = rotation[face.face]
    face.face = rotation[face.face]
  }
}

function validate (state) {
  for(var i in state.goals) {
    var goal = state.goals[i]
    var faces = _.flatten(state.cubes)
    faces = _.filter(faces, { 'face': goal.face })
    var uniq = _.uniqBy(faces, 'value')
    goal.valid = faces.length === uniq.length ? 'valid' : 'invalid'
  }
}

function initialState() {
  var cubes = [
    [
      { 'face': 'left',  'value': 'A' },
      { 'face': 'front', 'value': 'B' },
      { 'face': 'right', 'value': 'A' },
      { 'face': 'back',  'value': 'D' },
      { 'face': 'up',    'value': 'A' },
      { 'face': 'down',  'value': 'C' }
    ],
    [
      { 'face': 'left',  'value': 'B' },
      { 'face': 'front', 'value': 'B' },
      { 'face': 'right', 'value': 'A' },
      { 'face': 'back',  'value': 'C' },
      { 'face': 'up',    'value': 'A' },
      { 'face': 'down',  'value': 'D' }
    ],
    [
      { 'face': 'left',  'value': 'C' },
      { 'face': 'front', 'value': 'D' },
      { 'face': 'right', 'value': 'C' },
      { 'face': 'back',  'value': 'B' },
      { 'face': 'up',    'value': 'D' },
      { 'face': 'down',  'value': 'A' }
    ],
    [
      { 'face': 'left',  'value': 'B' },
      { 'face': 'front', 'value': 'B' },
      { 'face': 'right', 'value': 'D' },
      { 'face': 'back',  'value': 'C' },
      { 'face': 'up',    'value': 'C' },
      { 'face': 'down',  'value': 'A' }
    ]
  ]

  var goals = [
    {
      'face': 'up',
      'valid': false
    },
    {
      'face': 'front',
      'valid': false
    },
    {
      'face': 'down',
      'valid': false
    },
    {
      'face': 'back',
      'valid': false
    }
  ]

  return {
    'cubes': cubes,
    'goals': goals
  }
}

function saveState(state) {
  var str = JSON.stringify(state)
  var b64 = btoa(str)
  localStorage.setItem('mrhen-insanity', b64);

}

function loadState() {
  var b64 = localStorage.getItem('mrhen-insanity')
  if (!b64) {
    return null
  }

  var str = atob(b64)

  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}
