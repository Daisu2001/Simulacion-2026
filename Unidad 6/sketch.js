// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================

let melodyAgents = [];      // Partículas del Agente Melodía (Flow Field)
let voiceAgents = [];       // Agentes del Agente Voz (Steering + Flocking)

let trailBuffer;            // Canvas secundario para rastro tipo Physarum
let flowResolution = 20;    // Escala de la rejilla para el campo de flujo
let zOffset = 0;            // Evolución temporal del ruido Perlin

// Parámetros modificables en tiempo real durante la interpretación
let trailDecay = 18;        // Tasa de evaporación de la huella
let melodySpeed = 1.8;      // Velocidad de la melodía

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // Inicialización del buffer de evaporación (Physarum trail)
  trailBuffer = createGraphics(width, height);
  trailBuffer.background(11, 13, 16);

  // Instanciación del Agente Melodía (Campo de Flujo de fondo)
  for (let i = 0; i < 400; i++) {
    melodyAgents.push(new MelodyAgent());
  }

  // Instanciación del Agente Voz (Enjambre focal)
  for (let i = 0; i < 45; i++) {
    voiceAgents.push(new VoiceAgent(width / 2 + random(-50, 50), height / 2 + random(-50, 50)));
  }
}

function draw() {
  // 1. Difusión / Evaporación del rastro (Linger / Physarum)
  trailBuffer.noStroke();
  trailBuffer.fill(11, 13, 16, trailDecay);
  trailBuffer.rect(0, 0, width, height);

  // Dibujar el estado acumulado de rastros en la pantalla principal
  image(trailBuffer, 0, 0);

  // Actualización del tiempo para el campo de flujo
  zOffset += 0.002;

  // 2. Renderizado del Agente Melodía (Guitarras)
  for (let agent of melodyAgents) {
    agent.followFlowField(zOffset);
    agent.update();
    agent.edges();
    agent.show(trailBuffer);
  }

  // 3. Renderizado del Agente Voz (Línea vocal)
  let target = createVector(mouseX, mouseY);

  for (let agent of voiceAgents) {
    // Aplicar Steering Behaviors según la interacción humana
    let steeringForce;
    if (mouseIsPressed) {
      steeringForce = agent.flee(target); // Clímax o dispersión al hacer clic
    } else {
      steeringForce = agent.arrive(target); // Atracción orgánica suave
    }

    // Aplicar Flocking entre miembros del enjambre vocal
    let flockForce = agent.flock(voiceAgents);

    agent.applyForce(steeringForce.mult(1.3));
    agent.applyForce(flockForce.mult(0.8));

    agent.update();
    agent.edges();
    agent.show(trailBuffer);
  }
}

// ==========================================
// INTERPRETACIÓN HUMANA (TECLAS DE CONTROL)
// ==========================================

function keyPressed() {
  // Espacio: Modifica la duración del rastro (Physarum)
  if (key === ' ') {
    trailDecay = trailDecay === 18 ? 4 : 18;
  }

  // Flechas Arriba/Abajo: Ajustan la intensidad de la melodía
  if (keyCode === UP_ARROW) {
    melodySpeed = min(melodySpeed + 0.5, 4.5);
  } else if (keyCode === DOWN_ARROW) {
    melodySpeed = max(melodySpeed - 0.5, 0.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  trailBuffer.resizeCanvas(windowWidth, windowHeight);
  trailBuffer.background(11, 13, 16);
}

// ==========================================
// CLASE 1: AGENTE MELODÍA (FLOW FIELD)
// ==========================================

class MelodyAgent {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = melodySpeed;
  }

  followFlowField(zTime) {
    let xCol = floor(this.pos.x / flowResolution);
    let yRow = floor(this.pos.y / flowResolution);
    
    // Ángulo calculado con ruido Perlin 2D + Tiempo
    let angle = noise(xCol * 0.08, yRow * 0.08, zTime) * TWO_PI * 2;
    let force = p5.Vector.fromAngle(angle);
    force.setMag(0.12);
    
    this.acc.add(force);
  }

  update() {
    this.maxSpeed = melodySpeed;
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show(buffer) {
    buffer.stroke(110, 145, 175, 120); // Azul ceniza tenue
    buffer.strokeWeight(1);
    buffer.point(this.pos.x, this.pos.y);
  }
}

// ==========================================
// CLASE 2: AGENTE VOZ (STEERING + FLOCKING)
// ==========================================

class VoiceAgent {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.maxSpeed = 3.8;
    this.maxForce = 0.18;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  // Steering: Comportamiento Arrive
  arrive(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    let speed = this.maxSpeed;

    if (d < 120) {
      speed = map(d, 0, 120, 0, this.maxSpeed);
    }
    
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  // Steering: Comportamiento Flee
  flee(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();

    if (d < 250) {
      desired.setMag(this.maxSpeed);
      desired.mult(-1);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 2.5);
      return steer;
    }
    return createVector(0, 0);
  }

  // Flocking: Separación, Alineación y Cohesión
  flock(agents) {
    let perception = 50;
    let sep = createVector(0, 0);
    let ali = createVector(0, 0);
    let coh = createVector(0, 0);
    let total = 0;

    for (let other of agents) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (other !== this && d < perception) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(d * d);
        sep.add(diff);
        ali.add(other.vel);
        coh.add(other.pos);
        total++;
      }
    }

    if (total > 0) {
      sep.div(total).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce * 1.5);
      ali.div(total).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
      coh.div(total).sub(this.pos).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
    }

    let steering = createVector(0, 0);
    steering.add(sep.mult(1.5));
    steering.add(ali.mult(1.0));
    steering.add(coh.mult(1.0));
    return steering;
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show(buffer) {
    buffer.noStroke();
    buffer.fill(240, 220, 160, 220); // Dorado pálido/cálido para la voz
    buffer.ellipse(this.pos.x, this.pos.y, 3.5, 3.5);
  }
}