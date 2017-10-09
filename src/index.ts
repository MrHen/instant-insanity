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

var rotations: RotationFrom = {
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

var xPositions:FaceMap<string> = {
  'up': '3.5rem',
  'back': '3.5rem',
  'down': '3.5rem',
  'front': '3.5rem',
  'left': '1rem',
  'right': '6rem'
}

var yPositions:FaceMap<string> = {
  'up': '1rem',
  'back': '8.5rem',
  'down': '6rem',
  'front': '3.5rem',
  'left': '3.5rem',
  'right': '3.5rem'
}

var opacity:FaceMap<string> = {
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
    .data((f: Face[]) => f)
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
    .html((f: Face) => glyphs(f.value))

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
    .style('top', (g: Goal) => yPositions[g.face])
}

function paint(shouldTransition = true) {
  container
    .selectAll('.face')
    .transition()
    .duration(shouldTransition ? 250 : 0)
    .style('background-color', (f: Face) => faceBackgrounds(f.value))
    .style('opacity', (f: Face) => opacity[f.face])
    .style('top', (f: Face) => yPositions[f.face])
    .style('left', (f: Face) => xPositions[f.face])

  container
    .selectAll('.goal')
    .transition()
    .duration(shouldTransition ? 200 : 0)
    .delay(shouldTransition ? 50 : 0)
    .style('background-color', (g: Goal) => goalBackground[g.valid])
}

function rotateFrom (this: Element, face: Face) {
  if (!this.parentElement) {
    return;
  }

  var cube = d3.select<Element, Face[]>(this.parentElement).datum()
  
  rotateCube(cube, rotations[face.face])
  validate(state);
  saveState(state);

  paint();
}

function rotateCube (cube: Face[], rotation: RotationTo) {
  for(var i in cube) {
    var face = cube[i]
    var next = rotation[face.face]
    face.face = next
  }
}

function validate (state: GameState) {
  for(var i in state.goals) {
    var goal = state.goals[i]
    var faces = _.flatten(state.cubes)
    faces = _.filter(faces, { 'face': goal.face })
    var uniq = _.uniqBy(faces, 'value')
    goal.valid = faces.length === uniq.length ? 'valid' : 'invalid'
  }
}

function initialState(): GameState {
  var cubes: Face[][] = [
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

  var goals: Goal[] = [
    {
      'face': 'up',
      'valid': 'invalid'
    },
    {
      'face': 'front',
      'valid': 'invalid'
    },
    {
      'face': 'down',
      'valid': 'invalid'
    },
    {
      'face': 'back',
      'valid': 'invalid'
    }
  ]

  return {
    'cubes': cubes,
    'goals': goals
  }
}

function saveState(state: GameState) {
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

type Orientation = 'up' | 'down' | 'front' | 'back' | 'left' | 'right'

interface GameState {
  cubes: Face[][];
  goals: Goal[];
}

interface Face {
  face: Orientation;
  value: string;
}

interface Goal {
  face: Orientation;
  valid: 'valid' | 'invalid';
}

type RotationFrom = FaceMap<RotationTo>
type RotationTo =  FaceMap<Orientation>

interface FaceMap<T> {
  'up': T;
  'down': T;
  'front': T;
  'back': T;
  'left': T;
  'right': T;
}
