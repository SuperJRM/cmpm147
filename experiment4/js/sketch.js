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


let tile_width_step_main; // A width step is half a tile's width
let tile_height_step_main; // A height step is half a tile's height

// Global variables. These will mostly be overwritten in setup().
let tile_rows, tile_columns;
let camera_offset;
let camera_velocity;

/////////////////////////////
// Transforms between coordinate systems
// These are actually slightly weirder than in full 3d...
/////////////////////////////
function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i + camera_x, j + camera_y];
}

function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i, j];
}

function tileRenderingOrder(offset) {
  return [offset[1] - offset[0], offset[0] + offset[1]];
}

function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
  screen_x -= camera_x;
  screen_y -= camera_y;
  screen_x /= tile_width_step_main * 2;
  screen_y /= tile_height_step_main * 2;
  screen_y += 0.5;
  return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
}

function cameraToWorldOffset([camera_x, camera_y]) {
  let world_x = camera_x / (tile_width_step_main * 2);
  let world_y = camera_y / (tile_height_step_main * 2);
  return { x: Math.round(world_x), y: Math.round(world_y) };
}

function worldOffsetToCamera([world_x, world_y]) {
  let camera_x = world_x * (tile_width_step_main * 2);
  let camera_y = world_y * (tile_height_step_main * 2);
  return new p5.Vector(camera_x, camera_y);
}

function preload() {
  if (window.p3_preload) {
    window.p3_preload();
  }
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

  camera_offset = new p5.Vector(-width / 2, height / 2);
  camera_velocity = new p5.Vector(0, 0);

  if (window.p3_setup) {
    window.p3_setup();
  }

  let label = createP();
  label.html("World key: ");
  label.parent("container");

  let input = createInput("xyzzy");
  input.parent(label);
  input.input(() => {
    rebuildWorld(input.value());
  });

  createP("Use the arrow keys to travel across the seas. Click on the ground to dig for treasure!").parent("container");

  rebuildWorld(input.value());
}

function rebuildWorld(key) {
  if (window.p3_worldKeyChanged) {
    window.p3_worldKeyChanged(key);
  }
  tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
  tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
  tile_columns = Math.ceil(width / (tile_width_step_main * 2));
  tile_rows = Math.ceil(height / (tile_height_step_main * 2));
}

function mouseClicked() {
  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );

  if (window.p3_tileClicked) {
    window.p3_tileClicked(world_pos[0], world_pos[1]);
  }
  return false;
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  background(220);    
  // call a method on the instance
  myInstance.myMethod();

  // Keyboard controls!
  if (keyIsDown(LEFT_ARROW)) {
    camera_velocity.x -= 1;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    camera_velocity.x += 1;
  }
  if (keyIsDown(DOWN_ARROW)) {
    camera_velocity.y -= 1;
  }
  if (keyIsDown(UP_ARROW)) {
    camera_velocity.y += 1;
  }

  let camera_delta = new p5.Vector(0, 0);
  camera_velocity.add(camera_delta);
  camera_offset.add(camera_velocity);
  camera_velocity.mult(0.95); // cheap easing
  if (camera_velocity.mag() < 0.01) {
    camera_velocity.setMag(0);
  }

  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

  background(100);

  if (window.p3_drawBefore) {
    window.p3_drawBefore();
  }

  let overdraw = 0.1;

  let y0 = Math.floor((0 - overdraw) * tile_rows);
  let y1 = Math.floor((1 + overdraw) * tile_rows);
  let x0 = Math.floor((0 - overdraw) * tile_columns);
  let x1 = Math.floor((1 + overdraw) * tile_columns);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
        camera_offset.x,
        camera_offset.y
      ]); // odd row
    }
    for (let x = x0; x < x1; x++) {
      drawTile(
        tileRenderingOrder([
          x + 0.5 + world_offset.x,
          y + 0.5 - world_offset.y
        ]),
        [camera_offset.x, camera_offset.y]
      ); // even rows are offset horizontally
    }
  }

  describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

  if (window.p3_drawAfter) {
    window.p3_drawAfter();
  }
}

// Display a discription of the tile at world_x, world_y.
function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
}

function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
  push();
  translate(screen_x, screen_y);
  if (window.p3_drawSelectedTile) {
    window.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
  }
  pop();
}

// Draw a tile, mostly by calling the user's drawing code.
function drawTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  push();
  translate(0 - screen_x, screen_y);
  if (window.p3_drawTile) {
    window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
  }
  pop();
}




function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};
let waves = [];
let dugTiles = {};
let treasureTiles = {};
let currentI = 0;
let currentJ = 0;

function p3_tileClicked(i, j) {
  let key = `${i+1},${j+1}`;
  let type = getTileType(i + 1, j + 1)
  dugTiles[key] = true;

  if (random() < 0.1 && type != "water" && type !="port") {
    treasureTiles[key] = true;
  }
}

function p3_drawBefore() {
  if (random() < 0.005) {
    waves.push({
      spawnTime: frameCount,
      x: currentI - 50,
      y: currentJ - 50,
      speed: 0.015 + random(0.01),
      noiseSeed: random(1000),
      lifetime: 99999
    });
  }

  waves = waves.filter(w => frameCount - w.spawnTime < w.lifetime);
}

function getTileType(i, j) {
  let n = noise(i / 20, j / 20);
  if (n < 0.68) return "water";
  if (n < 0.696) return "sand";
  if (n < 0.6969) return "port";
  return "land";
}

function p3_drawTile(i, j) {
  noStroke();

  let n = noise(i / 20, j / 20);

  let grass = color(0, 235, 40);
  let sand = color(255, 238, 167);
  let shadowSand = color(245, 228, 157);
  let port = color(252, 173, 0);
  
  let key = `${i},${j}`;
  let isDug = dugTiles[key];
  let hasTreasure = treasureTiles[key];

  if (n < 0.68) {
    let time = millis() / 1000;
    let shimmer = (sin(time * 2 + i * 0.1 + j * 0.1) + 1) / 2;
    let baseColor = lerpColor(color(20, 90, 240), color(67, 133, 255), shimmer);
    let waterColor = baseColor;

    let foamNeighbor = false;
    for (let [di, dj] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      let neighborType = getTileType(i + di, j + dj);
      if (neighborType !== "water") {
        foamNeighbor = true;
        break;
      }
    }

    if (foamNeighbor) {
      let foamNoise = noise(i * 0.5, j * 0.5, time * 0.3);
      let foamIntensity = map(foamNoise, 0, 1, 0.1, 0.5);
      let foamColor = color(200, 240, 255);
      waterColor = lerpColor(waterColor, foamColor, foamIntensity);
    }

    for (let wave of waves) {
      let age = frameCount - wave.spawnTime;
      let waveY = wave.y + age * wave.speed;
      let xOffset = noise(i * 0.3, wave.noiseSeed + age * 0.01);
      let jOffset = map(xOffset, 0, 1, -2, 2);
      let waveJ = waveY + jOffset;

      let dist = abs(j - waveJ);
      if (dist < 1.2) {
        let alpha = 1;
        let fadeIn = 60;
        let fadeOutStart = wave.lifetime - 100;
        let fadeOutRange = 30;

        if (age < fadeIn) {
          alpha = age / fadeIn;
        }

        let currentY = wave.y + age * wave.speed;
        if (currentY > fadeOutStart) {
          alpha *= constrain(1 - (currentY - fadeOutStart) / fadeOutRange, 0, 1);
        }

        let intensity = map(dist, 0, 1.2, 0.4, 0) * alpha;
        waterColor = lerpColor(waterColor, color(255), intensity);
      }
    }

    stroke(0, 150, 200, 85);
    drawSquare(waterColor);
  } else if (n < .696) {
    stroke(0, 0, 0, 30);
    let base = sand;
    if (isDug) base = lerpColor(sand, color(120, 100, 50), 0.5);
    drawCube(base, sand, shadowSand);
  } 
  else if (n < .6969) {
    stroke(0, 0, 0, 25);
    let base = port;
    drawCube(base, port, port);
  } 
  else {
    stroke(0, 0, 0, 25);
    let base = grass;
    if (isDug) base = lerpColor(grass, color(50, 100, 50), 0.5);
    drawCube(base, sand, shadowSand);
  }

  if (hasTreasure) {
    push();
    fill(255, 215, 0);
    stroke(80);
    strokeWeight(1);
    rectMode(CENTER);
    rect(0, -th * 2.2, 8, 8, 2);
    pop();
  }
}

function drawSquare(RGB) {
  push();
  fill(RGB)
  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);
  pop()
}

function drawCube(RGB, RGB2 = RGB, RGB3 = RGB) {
  push();
  fill(RGB);
  beginShape();
  vertex(-tw, -2*th);
  vertex(0, -th);
  vertex(tw, -2*th);
  vertex(0, -3*th);
  endShape(CLOSE);
  pop();
  push();
  fill(RGB2);
  beginShape();
  vertex(tw, 0);
  vertex(tw, -2*th);
  vertex(0, -th);
  vertex(0, th);
  endShape(CLOSE);
  beginShape();
  fill(RGB3);
  vertex(-tw, 0);
  vertex(-tw, -2*th);
  vertex(0, -th);
  vertex(0, th);
  endShape(CLOSE);
  pop()
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
  text("tile " + [i, j], 0, 0);
  updatePos(i, j)
}

function updatePos(i = null, j = null) {
  if (i != null) {
    currentI = i;
    currentJ = j;
  }
}

