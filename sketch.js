let nboids = 200;
let maxspeed = 5;
let maxforce = 5;

let separationDist = 50;
let cohesionDist = 40;
let alignmentDist = 40;

let separationWeight = 1;
let cohesionWeight = 1;
let alignmentWeight = 1;

let wallRepel = 0.5;

let limitFront    = 0;
let limitBack     = -300;
let limitTop      = -200;
let limitBottom   = 200;
let limitLeft     = -500;
let limitRight    = 500;

let boids = [];  // list of boids to update

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  limitLeft = -1 * windowWidth / 2;
  limitRight = windowWidth / 2;
  limitTop= -1 * windowHeight / 2;
  limitBottom = windowHeight / 2;

  console.log('begin');
  // add boids
  for (let i = 0; i < nboids; i++) {
    boids.push(new Boid());
  }
}

function draw() {
  
  background(0);
  update();
  render();

  noFill();
  push();
  translate(0, 0, limitBack / 2);
  strokeWeight(2);
  stroke(50);
  box(limitRight*2,limitBottom*2, -1 * limitBack);
  pop();
}

function Boid() {
  // initialize boid at origin with random velocity and zero acceleration
  this.acc = createVector(0, 0, 0);
  this.vel = createVector(0, 0, 0);
  this.pos = createVector(random(-100, 100), random(-100, 100), random(-100, -50));
}

function update() {

  for (boid of boids) {

    // update position
    boid.pos.add(boid.vel);
    let r = boid.pos;
    r.x = r.x > limitRight ? limitRight : r.x;
    r.x = r.x < limitLeft ? limitLeft : r.x;
    r.y = r.y > limitBottom ? limitBottom : r.y;
    r.y = r.y < limitTop ? limitTop : r.y;
    r.z = r.z > limitFront ? limitFront : r.z;
    r.z = r.z < limitBack ? limitBack : r.z;

    // update and limit velocity
    boid.vel.add(boid.acc).limit(maxspeed);
  }

  for (boid of boids) {

    boid.acc = createVector(0, 0, 0);

    let toSeparate = [];
    let toCohere = [];
    let toAlign = [];

    for (neighbor of boids) {
      if (neighbor == boid) continue;

      let d = boid.pos.dist(neighbor.pos);
      if (d < separationDist) toSeparate.push(neighbor);
      if (d < cohesionDist) toCohere.push(neighbor);
      if (d < alignmentDist) toAlign.push(neighbor);
    }

    let steerSeparate = createVector(0, 0, 0);

    if (toSeparate.length > 0) {
      steerSeparate =
        toSeparate.map( neighbor => {
          let r = p5.Vector.sub(boid.pos, neighbor.pos);
          if (r.mag() == 0) r = createVector(random(-1,1),random(-1,1),random(-1,1)).setMag(1e-3);
          return r.setMag(1 / r.mag());
        })
        .reduce((a,b) => p5.Vector.add(a,b))
        .div(toSeparate.length)
        .normalize();
    }

    let steerCohere = createVector(0, 0, 0);
    if (toCohere.length > 0) {
      steerCohere =
        toCohere.map(neighbor => neighbor.pos.copy())
        .reduce((a,b) => p5.Vector.add(a,b))
        .div(toCohere.length)
        .sub(boid.pos)
        .normalize();
    }

    let steerAlign = createVector(0, 0, 0);
    if (toAlign.length > 0) {

      steerAlign =
        toAlign.map(neighbor => neighbor.vel.copy())
        .reduce((a,b) => p5.Vector.add(a,b))
        .div(toAlign.length)
        .sub(boid.vel)
        .normalize();
    }

    let steer = createVector(0, 0, 0);
    steer.add(steerSeparate.mult(separationWeight));
    steer.add(steerCohere.mult(cohesionWeight));
    steer.add(steerAlign.mult(alignmentWeight));

    steer.limit(maxforce);

    boid.acc.add(steer);

    let wallForces = createVector(0, 0, 0);
    wallForces.x -= wallRepel / sqrt(abs(limitRight - boid.pos.x) + 1e-6);
    wallForces.x += wallRepel / sqrt(abs(limitLeft - boid.pos.x) + 1e-6);
    wallForces.y -= wallRepel / sqrt(abs(limitBottom - boid.pos.y) + 1e-6);
    wallForces.y += wallRepel / sqrt(abs(limitTop - boid.pos.y) + 1e-6);
    wallForces.z -= wallRepel / sqrt(abs(limitFront - boid.pos.z) + 1e-6);
    wallForces.z += wallRepel / sqrt(abs(limitBack - boid.pos.z) + 1e-6);
    boid.acc.add(wallForces);
  }

}

function render() {

  for (boid of boids) {
    push();
    translate(boid.pos.x, boid.pos.y, boid.pos.z);
    noStroke();
    fill(255);
    sphere(3);
    pop();
  }
}