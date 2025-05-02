"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {}

let worldSeed;

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

function p3_drawAfter() {
}
