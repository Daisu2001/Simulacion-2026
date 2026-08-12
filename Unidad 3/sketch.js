let numTypes = 5;
let particles = [];
let colors = [];
let matrix = [];
let matrixInputs = [];

// Controles de interfaz
let sliderNumParticles;
let sliderTrail;
let sliderSpeed;
let currentParticleCount = 1000;

// Parámetros de física
let maxRadius = 110;
let friction = 0.82;
let baseForceFactor = 1.2;
let maxForce = 2.0;

// Reglas de Infección
let infectionRadius = 35;
let infectionTimeThreshold = 5.0;

// Estado del evento de defensa
let defenseModeActive = false;

const typeNames = ['A', 'B', 'C', 'D', 'E'];

// Matriz base basada en la imagen (escalada a enteros entre -100 y 100)
const initialMatrixBase = [
  [ 50, -10,   0,   0,   0], // A
  [ 10,  50,  10,  10,  10], // B
  [  0, -10,  50,   0,   0], // C
  [  0, -10,   0,  50,   0], // D
  [  0, -10,   0,   0,  50]  // E
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  colors = [
    color(255, 70, 70),   // A - Rojo
    color(70, 255, 140),  // B - VERDE (Foco de Infección)
    color(70, 180, 255),  // C - Azul
    color(255, 200, 70),  // D - Amarillo
    color(200, 90, 255)   // E - Violeta
  ];

  setDefaultMatrix();
  buildUI();
  initParticles(currentParticleCount);
}

function draw() {
  let trailVal = sliderTrail.value();
  let fadeAlpha = map(trailVal, 0, 100, 255, 12); 

  noStroke();
  fill(10, 12, 16, fadeAlpha);
  rect(0, 0, width, height);

  let targetCount = sliderNumParticles.value();
  if (targetCount !== particles.length) {
    initParticles(targetCount);
  }

  checkInfectionThreshold();
  updatePhysics();

  // Renderizado de partículas
  noStroke();
  for (let p of particles) {
    fill(colors[p.type]);
    circle(p.x, p.y, p.type === 1 ? 4.5 : 3.5);
  }
}

function setDefaultMatrix() {
  matrix = JSON.parse(JSON.stringify(initialMatrixBase));
  defenseModeActive = false;
  saveMatrixToStorage();
}

function checkInfectionThreshold() {
  if (particles.length === 0) return;

  // Contar partículas verdes (Tipo B / Infección)
  let greenCount = 0;
  for (let p of particles) {
    if (p.type === 1) greenCount++;
  }

  // Umbral del 30% del total de partículas
  let threshold = particles.length * 0.3;
  let shouldBeActive = greenCount > threshold;

  if (shouldBeActive !== defenseModeActive) {
    defenseModeActive = shouldBeActive;

    const healthyTypes = [0, 2, 3, 4]; // A, C, D, E

    for (let i of healthyTypes) {
      for (let j of healthyTypes) {
        if (i !== j) {
          // Si el umbral se supera, las sanas se atraen con fuerza 40 (0.40)
          // Si cae por debajo, vuelven a 0 (estado inicial)
          matrix[i][j] = defenseModeActive ? 40 : 0;
        }
      }
    }

    updateMatrixInputsUI();
    saveMatrixToStorage();
  }
}

function saveMatrixToStorage() {
  localStorage.setItem('particleLife_matrix', JSON.stringify(matrix));
}

function updateMatrixInputsUI() {
  for (let i = 0; i < numTypes; i++) {
    for (let j = 0; j < numTypes; j++) {
      if (matrixInputs[i] && matrixInputs[i][j]) {
        matrixInputs[i][j].value(matrix[i][j]);
      }
    }
  }
}

function initParticles(count) {
  particles = [];
  let numPatientZero = max(2, floor(count * 0.02));
  let healthyTypes = [0, 2, 3, 4];

  for (let i = 0; i < count; i++) {
    let assignedType;
    if (i < numPatientZero) {
      assignedType = 1;
    } else {
      assignedType = healthyTypes[i % healthyTypes.length];
    }

    particles.push({
      x: random(width),
      y: random(height),
      vx: 0,
      vy: 0,
      type: assignedType,
      exposureTimer: 0
    });
  }

  // Restablecer la matriz a su estado original al reiniciar la población
  setDefaultMatrix();
  updateMatrixInputsUI();
}

function updatePhysics() {
  let dt = min(deltaTime / 1000, 0.05);
  let currentMaxSpeed = sliderSpeed ? sliderSpeed.value() : 6;
  let forceFactor = baseForceFactor * (currentMaxSpeed / 6);

  for (let i = 0; i < particles.length; i++) {
    let p1 = particles[i];
    let fx = 0;
    let fy = 0;
    let isNearInfection = false;

    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;
      let p2 = particles[j];

      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;

      if (dx > width * 0.5) dx -= width;
      if (dx < -width * 0.5) dx += width;
      if (dy > height * 0.5) dy -= height;
      if (dy < -height * 0.5) dy += height;

      let d = sqrt(dx * dx + dy * dy);

      if (p1.type !== 1 && p2.type === 1 && d < infectionRadius) {
        isNearInfection = true;
      }

      if (d > 1 && d < maxRadius) {
        let rNorm = d / maxRadius;
        let force = 0;

        if (rNorm < 0.25) {
          force = rNorm / 0.25 - 1;
        } else {
          let attraction = matrix[p1.type][p2.type] / 100.0;
          force = attraction * (1 - abs(2 * rNorm - 1.25) / 0.75);
        }

        fx += (dx / d) * force * forceFactor;
        fy += (dy / d) * force * forceFactor;
      }
    }

    if (p1.type !== 1) {
      if (isNearInfection) {
        p1.exposureTimer += dt;
        if (p1.exposureTimer >= infectionTimeThreshold) {
          p1.type = 1;
          p1.exposureTimer = 0;
        }
      } else {
        p1.exposureTimer = max(0, p1.exposureTimer - dt * 0.5);
      }
    }

    let totalForce = sqrt(fx * fx + fy * fy);
    if (totalForce > maxForce) {
      fx = (fx / totalForce) * maxForce;
      fy = (fy / totalForce) * maxForce;
    }

    p1.vx = (p1.vx + fx) * friction;
    p1.vy = (p1.vy + fy) * friction;

    let speed = sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
    if (speed > currentMaxSpeed) {
      p1.vx = (p1.vx / speed) * currentMaxSpeed;
      p1.vy = (p1.vy / speed) * currentMaxSpeed;
    }

    p1.x += p1.vx;
    p1.y += p1.vy;

    if (p1.x < 0) p1.x += width;
    if (p1.x > width) p1.x -= width;
    if (p1.y < 0) p1.y += height;
    if (p1.y > height) p1.y -= height;
  }
}

function buildUI() {
  let panel = createDiv();
  panel.style('position', 'fixed');
  panel.style('top', '20px');
  panel.style('right', '20px');
  panel.style('width', '280px');
  panel.style('background', 'rgba(15, 18, 24, 0.92)');
  panel.style('backdrop-filter', 'blur(12px)');
  panel.style('border', '1px solid rgba(255, 255, 255, 0.1)');
  panel.style('border-radius', '8px');
  panel.style('padding', '16px');
  panel.style('color', '#c0caf5');
  panel.style('font-family', 'system-ui, -apple-system, sans-serif');
  panel.style('font-size', '12px');
  panel.style('box-shadow', '0 10px 30px rgba(0,0,0,0.5)');
  panel.style('z-index', '100');

  let title = createDiv('Panel de Control');
  title.parent(panel);
  title.style('color', '#7dcfff');
  title.style('font-weight', '600');
  title.style('font-size', '14px');
  title.style('border-bottom', '1px solid rgba(255, 255, 255, 0.1)');
  title.style('padding-bottom', '8px');
  title.style('margin-bottom', '14px');

  createStyle(`
    input[type=range] {
      -webkit-appearance: none;
      background: #1a202c;
      height: 4px;
      border-radius: 2px;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 12px;
      width: 12px;
      border-radius: 50%;
      background: #7dcfff;
      cursor: pointer;
    }
  `);

  let numLabel = createDiv('Cantidad de partículas');
  numLabel.parent(panel);
  numLabel.style('margin-bottom', '4px');
  sliderNumParticles = createSlider(100, 2500, currentParticleCount, 50);
  sliderNumParticles.parent(panel);
  sliderNumParticles.style('width', '100%');
  sliderNumParticles.style('margin-bottom', '12px');

  let speedLabel = createDiv('Velocidad de movimiento');
  speedLabel.parent(panel);
  speedLabel.style('margin-bottom', '4px');
  sliderSpeed = createSlider(1, 20, 6, 0.5);
  sliderSpeed.parent(panel);
  sliderSpeed.style('width', '100%');
  sliderSpeed.style('margin-bottom', '12px');

  let trailLabel = createDiv('Duración de la estela');
  trailLabel.parent(panel);
  trailLabel.style('margin-bottom', '4px');
  sliderTrail = createSlider(0, 100, 60, 1);
  sliderTrail.parent(panel);
  sliderTrail.style('width', '100%');
  sliderTrail.style('margin-bottom', '16px');

  let btnContainer = createDiv();
  btnContainer.parent(panel);
  btnContainer.style('display', 'flex');
  btnContainer.style('gap', '8px');
  btnContainer.style('margin-bottom', '16px');

  let btnReset = createButton('Reiniciar');
  btnReset.parent(btnContainer);
  btnReset.style('flex', '1');
  btnReset.style('padding', '6px 4px');
  btnReset.style('background', '#7dcfff');
  btnReset.style('color', '#1a1b26');
  btnReset.style('font-weight', '600');
  btnReset.style('border', 'none');
  btnReset.style('border-radius', '4px');
  btnReset.style('cursor', 'pointer');
  btnReset.mousePressed(() => {
    initParticles(sliderNumParticles.value());
  });

  let btnRestore = createButton('Matriz Base');
  btnRestore.parent(btnContainer);
  btnRestore.style('flex', '1');
  btnRestore.style('padding', '6px 4px');
  btnRestore.style('background', '#1f2335');
  btnRestore.style('color', '#7dcfff');
  btnRestore.style('border', '1px solid rgba(125, 207, 255, 0.3)');
  btnRestore.style('border-radius', '4px');
  btnRestore.style('cursor', 'pointer');
  btnRestore.mousePressed(() => {
    setDefaultMatrix();
    updateMatrixInputsUI();
    initParticles(sliderNumParticles.value());
  });

  let matrixHeader = createDiv('Reglas de atracción (-100 a 100)');
  matrixHeader.parent(panel);
  matrixHeader.style('color', '#ffffff');
  matrixHeader.style('font-weight', '600');
  matrixHeader.style('margin-bottom', '4px');

  let matrixSub = createDiv('Filas: Recibe la fuerza | Columnas: Ejerce la fuerza');
  matrixSub.parent(panel);
  matrixSub.style('font-size', '10px');
  matrixSub.style('color', '#565f89');
  matrixSub.style('line-height', '1.3');
  matrixSub.style('margin-bottom', '10px');

  let gridContainer = createDiv();
  gridContainer.parent(panel);
  gridContainer.style('display', 'grid');
  gridContainer.style('grid-template-columns', '20px repeat(5, 1fr)');
  gridContainer.style('gap', '4px');
  gridContainer.style('align-items', 'center');

  let emptyCorner = createDiv('');
  emptyCorner.parent(gridContainer);

  for (let j = 0; j < numTypes; j++) {
    let colHeader = createDiv(typeNames[j]);
    colHeader.parent(gridContainer);
    colHeader.style('text-align', 'center');
    colHeader.style('font-weight', 'bold');
    colHeader.style('color', colors[j].toString('#rrggbb'));
  }

  for (let i = 0; i < numTypes; i++) {
    matrixInputs[i] = [];
    
    let rowHeader = createDiv(typeNames[i]);
    rowHeader.parent(gridContainer);
    rowHeader.style('text-align', 'center');
    rowHeader.style('font-weight', 'bold');
    rowHeader.style('color', colors[i].toString('#rrggbb'));

    for (let j = 0; j < numTypes; j++) {
      let inp = createInput(matrix[i][j].toString(), 'text');
      inp.parent(gridContainer);
      inp.style('width', '100%');
      inp.style('height', '22px');
      inp.style('box-sizing', 'border-box');
      inp.style('text-align', 'center');
      inp.style('background', '#16161e');
      inp.style('color', '#c0caf5');
      inp.style('font-family', 'inherit');
      inp.style('font-size', '10px');
      inp.style('border', '1px solid rgba(255,255,255,0.08)');
      inp.style('border-radius', '4px');

      inp.input(() => {
        let val = parseInt(inp.value(), 10);
        if (!isNaN(val)) {
          matrix[i][j] = constrain(val, -100, 100);
          saveMatrixToStorage();
        }
      });

      matrixInputs[i][j] = inp;
    }
  }
}

function createStyle(css) {
  let head = document.head || document.getElementsByTagName('head')[0];
  let style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
  return style;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}