let particles = [];
let spacing = 6.25;
let fft;
let song = null;

// Sensibilidad y ondas Physarum
let highCutoff = 0.10;
let highHoldFrames = 4;
let lastHighFrame = 0;
let physarumWaves = [];
let waterRipples = [];

// Control de colores (HSB)
let currentHue = 0;
let nextHue = null;

// Control del estado de la tecla E (Flow Field)
let wasEPressed = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);

  initGrid();
  fft = new p5.FFT(0.8, 64);
  setupUI();
}

function initGrid() {
  particles = [];
  let cols = floor(width / spacing);
  let rows = floor(height / spacing);
  let startX = (width - cols * spacing) / 2 + spacing / 2;
  let startY = (height - rows * spacing) / 2 + spacing / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = startX + i * spacing;
      let y = startY + j * spacing;
      particles.push(new PhysarumParticle(x, y));
    }
  }
}

function draw() {
  background(0, 0, 0, 0.3);

  let highEnergy = 0;

  if (song && song.isPlaying()) {
    fft.analyze();
    let treble = fft.getEnergy("treble");
    let highMid = fft.getEnergy("highMid");
    highEnergy = max(treble, highMid) / 255;

    detectHighPeak(highEnergy);
  }

  // Estado de la tecla E (KeyCode 69)
  let isEPressed = keyIsDown(69);

  // Transición cuando se presiona recién la tecla E
  if (isEPressed && !wasEPressed) {
    for (let p of particles) {
      p.enterFlowField();
    }
    const statusMsg = document.getElementById('status-message');
    if (statusMsg) {
      statusMsg.textContent = '🌀 Flow Field activo (E sostenida)';
    }
  } else if (!isEPressed && wasEPressed) {
    const statusMsg = document.getElementById('status-message');
    if (statusMsg) {
      statusMsg.textContent = '↩ Retornando partículas...';
    }
  }

  wasEPressed = isEPressed;

  // Actualizar ondas de Physarum
  for (let i = physarumWaves.length - 1; i >= 0; i--) {
    physarumWaves[i].update();
    if (physarumWaves[i].isDead()) {
      physarumWaves.splice(i, 1);
    }
  }

  // Actualizar ondas de gota de agua
  for (let i = waterRipples.length - 1; i >= 0; i--) {
    waterRipples[i].update();
    if (waterRipples[i].isDead()) {
      waterRipples.splice(i, 1);
    }
  }

  // Actualizar y dibujar partículas
  for (let p of particles) {
    p.update(physarumWaves, waterRipples, isEPressed);
    p.display();
  }
}

function detectHighPeak(level) {
  if (level > highCutoff && lastHighFrame > highHoldFrames) {
    if (nextHue !== null) {
      currentHue = nextHue;
      nextHue = null;
    }

    physarumWaves.push(new PhysarumWave(width / 2, height / 2, level, currentHue));
    lastHighFrame = 0;
  } else {
    lastHighFrame++;
  }
}

function keyPressed() {
  // Tecla Q: Cambiar de color en el siguiente pulso
  if (key === 'q' || key === 'Q') {
    nextHue = random(0, 360);
    const statusMsg = document.getElementById('status-message');
    if (statusMsg) {
      statusMsg.textContent = '¡Color aleatorio en cola! Se aplicará en el próximo pulso.';
    }
  }

  // Tecla W: Generar gota de agua
  if (key === 'w' || key === 'W') {
    let rx = random(width * 0.1, width * 0.9);
    let ry = random(height * 0.1, height * 0.9);
    waterRipples.push(new WaterRipple(rx, ry));
    
    const statusMsg = document.getElementById('status-message');
    if (statusMsg) {
      statusMsg.textContent = '💧 Gota de agua generada.';
    }
  }
}

class PhysarumParticle {
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.pos = createVector(x, y);
    
    let center = createVector(width / 2, height / 2);
    this.radialDir = p5.Vector.sub(this.pos, center).normalize();

    this.angle = this.radialDir.heading();
    this.sensorAngle = QUARTER_PI;
    this.sensorDist = 18;

    this.hue = 0;
    this.saturation = 0;
    this.brightness = 100;
    this.activeFrames = 0;
    this.size = 1.5;
  }

  // Teletransporta la partícula a un punto inicial dentro del Flow Field al presionar E
  enterFlowField() {
    this.pos.x = random(width);
    this.pos.y = random(height);
  }

  update(waves, ripples, inFlowField) {
    if (inFlowField) {
      // Comportamiento del Flow Field mientras E esté presionada
      let angle = noise(this.pos.x * 0.005, this.pos.y * 0.005, frameCount * 0.01) * TWO_PI * 2;
      let flowVector = p5.Vector.fromAngle(angle).mult(3);
      this.pos.add(flowVector);

      // Reaparecer si salen del lienzo durante el flujo
      if (this.pos.x < 0) this.pos.x = width;
      if (this.pos.x > width) this.pos.x = 0;
      if (this.pos.y < 0) this.pos.y = height;
      if (this.pos.y > height) this.pos.y = 0;

      this.saturation = 80;
      this.size = 2.0;

    } else {
      // Comportamiento estándar
      let activeWave = null;

      for (let w of waves) {
        let d = dist(this.baseX, this.baseY, w.x, w.y);
        if (abs(d - w.radius) < w.thickness) {
          activeWave = w;
          break;
        }
      }

      // Repulsión por onda de agua
      let rippleForce = createVector(0, 0);
      for (let r of ripples) {
        let d = dist(this.pos.x, this.pos.y, r.x, r.y);
        if (abs(d - r.radius) < r.thickness) {
          let pushDir = p5.Vector.sub(this.pos, createVector(r.x, r.y)).normalize();
          let forceMagnitude = map(abs(d - r.radius), 0, r.thickness, r.strength, 0);
          rippleForce.add(pushDir.mult(forceMagnitude));
        }
      }

      this.pos.add(rippleForce);

      if (activeWave) {
        this.activeFrames = 30;
        this.hue = activeWave.hue;
        this.saturation = 100;
        this.brightness = 100;

        let sensorLeft = this.getSensorPos(this.angle - this.sensorAngle);
        let sensorRight = this.getSensorPos(this.angle + this.sensorAngle);

        let evalLeft = noise(sensorLeft.x * 0.01, sensorLeft.y * 0.01, frameCount * 0.05);
        let evalRight = noise(sensorRight.x * 0.01, sensorRight.y * 0.01, frameCount * 0.05);

        if (evalLeft > evalRight) {
          this.angle -= 0.15;
        } else if (evalRight > evalLeft) {
          this.angle += 0.15;
        }

        let moveDir = p5.Vector.fromAngle(this.angle).mult(1.8 * activeWave.intensity);
        this.pos.add(moveDir);
        this.size = 2.5 + activeWave.intensity * 2;

      } else {
        if (this.activeFrames > 0) {
          this.activeFrames--;
          this.saturation = map(this.activeFrames, 0, 30, 0, 100);
        } else {
          this.saturation = 0;
          this.brightness = 100;
        }

        // Retorno elástico acelerado a la posición base
        this.pos.x = lerp(this.pos.x, this.baseX, 0.25);
        this.pos.y = lerp(this.pos.y, this.baseY, 0.25);
        this.size = 1.5;
      }
    }
  }

  getSensorPos(angle) {
    return p5.Vector.add(this.pos, p5.Vector.fromAngle(angle).mult(this.sensorDist));
  }

  display() {
    noStroke();
    fill(this.hue, this.saturation, this.brightness);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

class PhysarumWave {
  constructor(x, y, intensity, hue) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = max(width, height) * 0.85;
    this.speed = map(intensity, 0.10, 1, 10, 24);
    this.thickness = map(intensity, 0.10, 1, 35, 80);
    this.intensity = intensity;
    this.hue = hue;
  }

  update() {
    this.radius += this.speed;
  }

  isDead() {
    return this.radius > this.maxRadius;
  }
}

class WaterRipple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = 250;
    this.speed = 7;
    this.thickness = 35;
    this.strength = 12;
  }

  update() {
    this.radius += this.speed;
  }

  isDead() {
    return this.radius > this.maxRadius;
  }
}

function setupUI() {
  const fileInput = document.getElementById('audio-upload');
  const playBtn = document.getElementById('btn-play');
  const hideBtn = document.getElementById('btn-hide');
  const fileNameDisplay = document.getElementById('file-name');
  const statusMsg = document.getElementById('status-message');
  const controlsContainer = document.getElementById('controls-container');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      userStartAudio();
      fileNameDisplay.textContent = file.name;
      statusMsg.textContent = 'Cargando audio...';
      
      if (song) song.stop();

      song = loadSound(file, () => {
        statusMsg.textContent = '¡Listo! Reproduciendo ' + file.name;
        song.loop();
        fft.setInput(song);
      }, (err) => {
        statusMsg.textContent = 'Error al cargar el archivo de audio.';
        console.error(err);
      });
    }
  });

  playBtn.addEventListener('click', () => {
    userStartAudio();
    if (song && song.isLoaded()) {
      if (song.isPlaying()) {
        song.pause();
        statusMsg.textContent = 'Pausado';
      } else {
        song.loop();
        fft.setInput(song);
        statusMsg.textContent = 'Reproduciendo audio';
      }
    } else {
      statusMsg.textContent = 'Carga primero un archivo con el botón azul.';
    }
  });

  hideBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    controlsContainer.classList.add('hidden');
  });

  window.addEventListener('click', (e) => {
    if (controlsContainer.classList.contains('hidden')) {
      controlsContainer.classList.remove('hidden');
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}