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

let moonX;
let moonY;
let circles = [];
let treeLayers = [];

let spinSpeed = 0;
let targetSpeed = 0;
let rotationAngle = 0;

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

  background(21, 0, 63);
  stroke(255);
  noFill();

  for (let i = 0; i < 150; i++) {
    let x = random(-width, width);
    let y = random(-height, height);
    circles.push([x, y]);
  }
  moonX = random(-width/2, width/2);
  moonY = random(-height/5, -5*height/6);

  generateTrees();
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  //background(220);    
  // call a method on the instance
  myInstance.myMethod();

  
  noStroke();
  fill(21, 0, 63, 20);
  rect(0, 0, width, height);

  let mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);
  mouseSpeed = constrain(mouseSpeed, 0, 50);

  mouseSpeed = map(mouseSpeed, 0, 50, 0, 0.001, true);
  //spinSpeed = lerp(spinSpeed, targetSpeed, 0.05);
  //spinSpeed = max(0, spinSpeed);
  spinSpeed += mouseSpeed

  rotationAngle += spinSpeed;
  
  if(spinSpeed > 0) {
    spinSpeed -= 0.0045/deltaTime;
  }
  if (spinSpeed < 0) {
    spinSpeed = 0;
  }

  push();
  translate(width / 2, height);
  rotate(rotationAngle);
  stroke(255);
  noFill();
  for (let [x, y] of circles) {
    ellipse(x, y, 3);
  }
  fill(255)
  ellipse(moonX, moonY, 50);
  
  pop();
  
  drawHillLayer();
  drawTreeLayers();
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}

function generateTrees() {
  treeLayers = [];

  const configs = [
    { count: 25, hRange: [60, 100], color: color(10, 10, 20) },
    { count: 20, hRange: [90, 110], color: color(15, 25, 30) },
    { count: 15, hRange: [150, 130], color: color(20, 40, 40) }
  ];

  for (let layer of configs) {
    let trees = [];
    for (let i = 0; i < layer.count; i++) {
      let x = random(0, width);
      let h = random(layer.hRange[0], layer.hRange[1]);
      trees.push({ x: x, h: h, color: layer.color });
    }
    treeLayers.push(trees);
  }
}

function drawHillLayer() {
  noStroke();
  fill(0,25,10);
  circle(width/2, 5.3*height/3, 1500)
}

function drawTreeLayers() {
  for (let trees of treeLayers) {
    for (let tree of trees) {
      drawTree(tree.x, tree.h, tree.color);
    }
  }
}

function drawTree(x, h, c) {
  noStroke();
  fill(c);
  triangle(x - 20, height, x + 20, height, x, height - h);
}