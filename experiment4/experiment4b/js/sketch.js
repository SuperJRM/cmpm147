// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;
let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

function preload() {
  tilesetImage = loadImage(
    "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
  );
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  select("#seedReport").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    let chars = lines[i].split("");
    for (let j = 0; j < chars.length; j++) {
      row.push(chars[j]);
    }
    grid.push(row);
  }
  return grid;
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  numCols = select("#asciiBox").attribute("rows") | 0;
  numRows = select("#asciiBox").attribute("cols") | 0;

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  select("#reseedButton").mousePressed(reseed);
  select("#asciiBox").input(reparseGrid);

  reseed();
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  background(220);    
  // call a method on the instance
  myInstance.myMethod();

  randomSeed(seed);
  drawGrid(currentGrid);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}

function gridCheck(grid, i, j, target) {
  let inRange = (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length);
  if (inRange) {
    return grid[i][j] == target;
  }
  else {return false;}
}


function gridCode(grid, i, j, target) {
  let north = gridCheck(grid, i, j-1, target);
  let west = gridCheck(grid, i-1, j, target);
  let east = gridCheck(grid, i+1, j, target);
  let south = gridCheck(grid, i, j+1, target);
  
  return ((north<<0) + (west<<1) + (east<<2) + (south<<3))
}


function drawContext(grid, i, j, target, ti, tj) {
  const [tiOffset, tjOffset] = lookup[gridCode(grid, i, j, target)];
  placeTile(i, j, ti + tiOffset, tj + tjOffset);
}


const lookup = [ 
  [0,0],   // No Neighbors //ti11 tj1
  [1,0],  // North
  [0,1],  // West
  [1,1],  // NW 
  [0,-1],  // East
  [1,-1],  // NE
  [1,0],  // East + West
  [1,0],  // E + N + W
  [-1,0],  // South
  [0,0],  // South + North
  [-1,1],  // SW
  [0,1],  // S + N + W
  [-1,-1],  // SE
  [0,-1],  // S + N + E
  [-1,0],  // S + W + E
  [0,0]  // All Neighbors
];


function generateGrid(numCols, numRows) {
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      if (noise(i/20,j/20) < .26) {
        row.push("w");
      }
      else if (noise(i/5,j/5) > .6) {
        row.push(":");
      }
      else {row.push("_")}
    }
    grid.push(row);
  }
  
  return grid;
}

function drawGrid(grid) {
  background(128);
  let snowFall = random() < 0.2;
  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == 'w') {
        if (snowFall) {
          placeTile(i, j, (random()*second())%2, 13);
          drawContext(grid, i, j, 'w', 10, 13);
        }
        else{
          placeTile(i, j, (random([0,0,0,1,2,3])*second()%4), 14)
          drawContext(grid, i, j, 'w', 10, 1);
        }
      }
      else {
        if (snowFall) {
          placeTile(i, j, (random()*second())%2, 12)
          if (grid[i][j] == ':') {
            placeTile(i, j, 21, 0)
          }
        }
        else {
          placeTile(i, j, (floor(random(4))), 0)
          if (grid[i][j] == ':') {
            placeTile(i, j, 15, 0)
          }
        }
      }
    }
  }
}