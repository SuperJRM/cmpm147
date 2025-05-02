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

let rainParticles = [];
let maxRain = 200;
let rainRange = 40;

function p3_tileClicked(i, j) {
  let key = `${i+1},${j+1}`;
  let type = getTileType(i + 1, j + 1)
  dugTiles[key] = true;

  if (random() < 0.1 && type != "water" && type !="port") {
    treasureTiles[key] = true;
  }
}

function p3_drawBefore() {
  rainParticles.push({
    x: random(0, width),
    y: random(0, height),
    speed: random(4, 8),
    len: random(8, 14)
  });

  while (rainParticles.length < maxRain) {
    let i = int(random(-rainRange, rainRange));
    let j = int(random(-rainRange, rainRange));

    let x = (i - j) * tw;
    let y = (i + j) * th - random(200); // spawn above tile height

    rainParticles.push({
      x,
      y,
      speed: random(2, 5),
      len: random(10, 16)
    });
  }
  
  if (random() < 0.02) {
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

  let grass = color(0, 160, 30);
  let sand = color(200, 190, 120);
  let shadowSand = color(180, 170, 110);
  let port = color(180, 120, 0);
  
  let key = `${i},${j}`;
  let isDug = dugTiles[key];
  let hasTreasure = treasureTiles[key];

  if (n < 0.68) {
    let time = millis() / 1000;
    let shimmer = (sin(time * 2 + i * 0.1 + j * 0.1) + 1) / 2;
    let baseColor = lerpColor(color(10, 40, 100), color(10, 30, 110), shimmer);
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
      let heightBoost = 1.5; // temp
      let waveJ = waveY + jOffset;
      wave.r += 3;

      let dist = abs((j - heightBoost) - waveJ);
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
  } else if (n < 0.7) {
    stroke(0, 0, 0, 20);
    let shallowColor = color(40, 80, 160);
    drawSquare(shallowColor);
    
  } else if (n < 0.71) {
    stroke(40, 30, 20, 35);
    let dirt1 = color(100, 70, 40);
    let dirt2 = color(120, 90, 60);
    let base = lerpColor(dirt1, dirt2, noise(i * 0.25, j * 0.25));
    drawCube(base, dirt2, dirt1);

  } else if (n < 0.72) {
    stroke(0, 0, 0, 20);
    let grass1 = color(100, 200, 100);
    let grass2 = color(70, 160, 70);
    let base = lerpColor(grass2, grass1, noise(i * 0.2, j * 0.2));
    if (isDug) base = lerpColor(base, color(50, 100, 50), 0.5);
    drawCube(base, grass1, grass2);

  } else if (n < 0.74) {
    stroke(0, 0, 0, 25);
    let portDark = color(120, 80, 0);
    let portLight = color(180, 120, 0);
    let base = lerpColor(portDark, portLight, noise(i * 0.3, j * 0.3));
    drawCube(base, portLight, portDark);

  } else if (n < 0.77) {
    stroke(0, 20, 0, 30);
    let forest1 = color(0, 90, 20);
    let forest2 = color(0, 60, 10);
    let base = lerpColor(forest2, forest1, noise(i * 0.3, j * 0.3));
    drawCube(base, forest1, forest2);

  } else {
    stroke(0, 0, 0, 25);
    let grassDark = color(0, 120, 20);
    let grassLight = color(0, 160, 40);
    let base = lerpColor(grassDark, grassLight, noise(i * 0.15 + 50, j * 0.15 + 50));
    if (isDug) base = lerpColor(base, color(50, 100, 50), 0.5);
    drawCube(base, grassLight, grassDark);
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

  /*let n = clicks[[i, j]] | 0;
  if (n % 2 == 1) {
    fill(0, 0, 0, 32);
    ellipse(0, 0, 10, 5);
    translate(0, -10);
    fill(255, 255, 100, 128);
    ellipse(0, 0, 10, 10);
  }*/

  //pop();
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
  noFill();
  stroke(200, 220, 255, 160);
  strokeWeight(1);

  for (let drop of rainParticles) {
    line(drop.x, drop.y, drop.x, drop.y + drop.len);
    drop.y += drop.speed;

    if (drop.y > height + 100) {
      // recycle drop
      drop.y = random(-200, -50);
      drop.x = (int(random(-40, 40)) - int(random(-40, 40))) * tw;
    }
  }
  
  noStroke();
  for (let i = 0; i < 5; i++) {
    let offsetY = i * 5;
    fill(color(200, 220, 225, 10));
    rect(0, offsetY, width, height);
  }
  
  
  fill(0, 0, 0, 80);
}
