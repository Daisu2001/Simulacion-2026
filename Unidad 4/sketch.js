/*
  TRÁMITES EN FASE — Sistema Audiovisual Basado en Osciladores de Kuramoto
  Diseño: Interacción performativa entre burocracia, sincronía y ritmo.
*/

const TAU = Math.PI * 2;

// ─── 1. DIRECCIÓN DE ARTE & PERFILES SONOROS ────────────────────────────────
const PROFILES = [
  { id: "stamp",  label: "SELLO",     color: "#c94131", dark: "#752619", gain: 0.45, pitchBase: 1.00 },
  { id: "folder", label: "CARPETA",   color: "#da9a38", dark: "#805417", gain: 0.35, pitchBase: 0.95 },
  { id: "staple", label: "GRAPADORA", color: "#2b7c77", dark: "#164640", gain: 0.32, pitchBase: 1.12 },
  { id: "ticket", label: "TURNO",     color: "#415f95", dark: "#253b63", gain: 0.18, pitchBase: 1.05 }
];

const AGENT_LAYOUT = [
  ["stamp",  0.12], ["folder", 0.62], ["staple", 0.29], ["ticket", 0.84],
  ["folder", 0.46], ["ticket", 0.05], ["stamp",  0.73], ["staple", 0.94]
];

let agents = [];
let selected = null;
let lastTime = 0;
let audioReady = false;
let dragged = null;
let heldAgent = null;
let sounds = [];
let metronomeSound = null;

const AUDIO_PATHS = {
  stamp: "Audio/Stamp.mp3",
  folder: "Audio/Folder.mp3",
  staple: "Audio/Grapadora.mp3",
  ticket: "Audio/Turn.mp3",
  metronome: "Audio/Heels.mp3"
};

function preload() {
  sounds = AGENT_LAYOUT.map(([profileId]) => loadSound(AUDIO_PATHS[profileId]));
  metronomeSound = loadSound(AUDIO_PATHS.metronome);
}

function setup() {
  const holder = document.querySelector("#canvas-holder");
  const canvas = createCanvas(holder.clientWidth, holder.clientHeight);
  canvas.parent(holder);
  pixelDensity(1);
  textFont("Arial");

  agents = AGENT_LAYOUT.map(([profileId, phase], i) => {
    const profile = PROFILES.find(p => p.id === profileId);
    return {
      id: i,
      profile,
      theta: phase * TAU,
      baseOmega: random(2.85, 6.35),
      omega: 8.0,
      sound: sounds[i],
      x: 0, y: 0, w: 0, h: 0,
      flashed: 0,
      boostUntil: 0,
      lastTrigger: 0
    };
  });
  bindControls();
}

function draw() {
  const now = millis() / 1000;
  const dt = constrain(now - lastTime, 0, 0.05);
  lastTime = now;

  advanceKuramoto(dt);
  drawOffice();
  updateInterface();
}

// ─── 2. MOTOR DINÁMICO DE KURAMOTO ──────────────────────────────────────────
function advanceKuramoto(dt) {
  const K = Number(document.querySelector("#coupling").value);
  const spread = Number(document.querySelector("#spread").value);
  const averageNatural = agents.reduce((sum, a) => sum + a.baseOmega, 0) / agents.length;
  const nextThetas = [];
  const crossedCycle = [];

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i];
    const boost = millis() < a.boostUntil ? 1.4 : 0;
    a.omega = averageNatural + (a.baseOmega - averageNatural) * spread + boost;
    
    // Acoplamiento sinusoidal estándar
    let influence = 0;
    for (const other of agents) {
      influence += Math.sin(other.theta - a.theta);
    }
    
    const dTheta = a.omega + (K / agents.length) * influence;

    if (a === heldAgent) {
      nextThetas[i] = a.theta;
      crossedCycle[i] = false;
    } else {
      const unclippedNext = a.theta + dTheta * dt;
      // Detección estricta de cruce de ciclo natural
      crossedCycle[i] = unclippedNext >= TAU;
      nextThetas[i] = (unclippedNext % TAU + TAU) % TAU;
    }
  }

  agents.forEach((a, i) => {
    a.theta = nextThetas[i];
    a.flashed = max(0, a.flashed - dt * 3.0);
    if (crossedCycle[i]) triggerAgent(a);
  });
}

// Parámetro de orden global r(t)
function orderParameter() {
  let x = 0, y = 0;
  for (const a of agents) { 
    x += cos(a.theta); 
    y += sin(a.theta); 
  }
  return Math.sqrt(x * x + y * y) / agents.length;
}

// ─── 3. RENDERIZADO VISUAL CON CARÁCTER MECÁNICO ─────────────────────────────
function drawOffice() {
  background("#d7cfbd");
  const r = orderParameter();
  drawDeskTexture(r);
  
  const cols = width > 580 ? 4 : 2;
  const gap = 18;
  const pad = 25;
  const cellW = (width - pad * 2 - gap * (cols - 1)) / cols;
  const cellH = (height - pad * 2 - gap * (ceil(agents.length / cols) - 1)) / ceil(agents.length / cols);
  
  drawResonanceLinks(r, cols, gap, pad, cellW, cellH);
  
  agents.forEach((agent, index) => {
    const col = index % cols;
    const row = floor(index / cols);
    agent.x = pad + col * (cellW + gap);
    agent.y = pad + row * (cellH + gap);
    agent.w = cellW;
    agent.h = cellH;
    drawAgent(agent);
  });
}

function drawDeskTexture(r) {
  stroke(63, 52, 38, 22 + r * 50); 
  strokeWeight(1);
  for (let y = 12; y < height; y += 17) {
    line(0, y, width, y - 7);
  }
}

function phaseDistance(a, b) {
  return abs(((a.theta - b.theta + PI) % TAU) - PI);
}

function phaseCluster(a, threshold = 0.32) {
  return agents.filter(other => phaseDistance(a, other) < threshold).length;
}

function drawResonanceLinks(r, cols, gap, pad, cellW, cellH) {
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const distance = phaseDistance(agents[i], agents[j]);
      if (distance >= 0.32) continue;
      
      const ai = agents[i], aj = agents[j];
      const xi = pad + (i % cols) * (cellW + gap) + cellW / 2;
      const yi = pad + floor(i / cols) * (cellH + gap) + cellH / 2;
      const xj = pad + (j % cols) * (cellW + gap) + cellW / 2;
      const yj = pad + floor(j / cols) * (cellH + gap) + cellH / 2;
      
      stroke(ai.profile.color + "88");
      strokeWeight(map(distance, 0, 0.32, 3.5, 0.5) * (0.6 + r * 0.8));
      line(xi, yi, xj, yj);
    }
  }
}

function drawAgent(a) {
  const phase = a.theta / TAU;
  // Curva de anticipación percusiva (snap)
  const snappy = pow(sin(a.theta * 0.5), 3);
  const isSelected = selected === a;
  const flash = a.flashed;
  const clustered = phaseCluster(a);
  const held = heldAgent === a;
  const boosted = millis() < a.boostUntil;

  push();
  translate(a.x, a.y);
  
  // Fondo de la tarjeta
  noStroke();
  fill(245, 241, 232, 230); 
  rect(0, 0, a.w, a.h, 2);
  
  stroke(a.profile.dark); 
  strokeWeight(isSelected ? 3 : 1); 
  noFill(); 
  rect(0, 0, a.w, a.h, 2);
  
  if (clustered > 1) { 
    noFill(); 
    stroke(a.profile.color + "77"); 
    strokeWeight(clustered); 
    rect(-3, -3, a.w + 6, a.h + 6, 4); 
  }

  // Barra de progreso de fase
  noStroke(); 
  fill(a.profile.dark + "33"); 
  rect(11, 12, 3, a.h - 24);
  fill(a.profile.color); 
  rect(11, 12 + (a.h - 24) * (1 - phase), 3, (a.h - 24) * phase);

  // Renderizado del artefacto de oficina
  if (a.profile.id === "stamp") drawStamp(a, snappy);
  if (a.profile.id === "folder") drawFolder(a, phase);
  if (a.profile.id === "staple") drawStaple(a, snappy);
  if (a.profile.id === "ticket") drawTicket(a, phase);

  // Textos y etiquetas de estado
  fill(a.profile.dark); 
  textAlign(LEFT, BOTTOM); 
  textStyle(BOLD); 
  textSize(10);
  noStroke();
  text(a.profile.label, 22, a.h - 11);
  
  textAlign(RIGHT, BOTTOM); 
  textStyle(NORMAL); 
  text("ω " + a.omega.toFixed(2), a.w - 11, a.h - 11);
  
  if (held) { 
    fill(a.profile.dark); textAlign(CENTER, TOP); textStyle(BOLD); text("RETENIDO", a.w / 2, 7); 
  }
  if (boosted) { 
    fill(a.profile.color); textAlign(CENTER, TOP); textStyle(BOLD); text("PRIORIDAD", a.w / 2, 7); 
  }
  if (flash > 0) { 
    noFill(); stroke(a.profile.color); strokeWeight(4 * flash); rect(4, 4, a.w - 8, a.h - 8); 
  }
  pop();
}

function drawStamp(a, snappy) {
  push(); 
  translate(a.w * 0.58, a.h * 0.47 + (1 - snappy) * 12);
  fill(a.profile.dark); rectMode(CENTER); rect(0, 0, 42, 13, 2);
  fill(a.profile.color); rect(0, -19, 28, 30, 3); rect(0, -38, 41, 10, 2);
  fill(a.profile.color); ellipse(0, 17, 58 + a.flashed * 14, 17);
  if (a.theta > TAU * 0.85) { 
    fill(255); textAlign(CENTER, CENTER); textSize(8); textStyle(BOLD); text("APROBADO", 0, 17); 
  } 
  pop();
}

function drawFolder(a, phase) {
  push(); 
  translate(a.w * 0.56, a.h * 0.43); 
  rotate(sin(phase * TAU) * 0.18);
  fill(a.profile.color); stroke(a.profile.dark); strokeWeight(2); rectMode(CENTER); rect(0, 0, 76, 48, 2);
  noStroke(); fill(255, 245, 215, 180); rect(7, 6, 57, 32); fill(a.profile.dark); rect(-25, -29, 28, 10, 1);
  fill(a.profile.dark + "66"); rect(7, -3, 42 * phase, 2); 
  pop();
}

function drawStaple(a, snappy) {
  push(); 
  translate(a.w * 0.57, a.h * 0.48); 
  rotate(-0.12 + snappy * 0.36);
  fill(a.profile.dark); rectMode(CENTER); rect(0, 13, 72, 12, 3);
  fill(a.profile.color); rect(1, -8, 72, 14, 3); fill(237, 233, 219); rect(20, 3, 12, 8); 
  pop();
}

function drawTicket(a, phase) {
  push(); 
  translate(a.w * 0.57, a.h * 0.46); 
  rotate((floor(phase * 4) % 2 === 0 ? 1 : -1) * 0.03);
  fill(a.profile.color); stroke(a.profile.dark); strokeWeight(2); rectMode(CENTER); rect(0, 0, 71, 54, 1);
  noStroke(); fill(244, 239, 223); rect(0, 4, 53, 26); fill(a.profile.dark); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(18); 
  text(nf(floor(phase * 99), 2), 0, 4); 
  pop();
}

// ─── 4. CAPA SONORA ADAPTATIVA ───────────────────────────────────────────────
function triggerAgent(a) {
  a.flashed = 1.0;
  if (!audioReady) return;

  const now = millis();
  if (now - a.lastTrigger < 35) return;
  a.lastTrigger = now;

  const sound = a.sound;
  if (!sound || !sound.isLoaded()) return;

  const cluster = phaseCluster(a);
  const r = orderParameter();

  // Control de saturación dinámico (Headroom) conforme el sistema colapsa al unísono
  const headroomFactor = map(r, 0, 1, 1.0, 0.55);
  const finalVolume = constrain((a.profile.gain + cluster * 0.015) * headroomFactor, 0.02, 0.65);

  sound.playMode("sustain");
  sound.rate(a.profile.pitchBase * map(a.omega, 2.0, 5.0, 0.94, 1.06));
  sound.setVolume(finalVolume);
  sound.play();
}

// ─── 5. CONTROLES E INTERACTIVIDAD ──────────────────────────────────────────
function bindControls() {
  const coupling = document.querySelector("#coupling");
  const spread = document.querySelector("#spread");
  const panel = document.querySelector(".control-panel");
  
  ["pointerdown", "mousedown", "touchstart"].forEach(type =>
    panel.addEventListener(type, event => event.stopPropagation(), { passive: true })
  );
  
  const refreshLabels = () => {
    document.querySelector("#coupling-value").textContent = Number(coupling.value).toFixed(2);
    document.querySelector("#spread-value").textContent = Number(spread.value).toFixed(2) + "×";
  };
  
  ["input", "change"].forEach(type => {
    coupling.addEventListener(type, refreshLabels);
    spread.addEventListener(type, refreshLabels);
  });
  
  document.querySelector("#perturb").addEventListener("click", perturb);
  document.querySelector("#advance").addEventListener("click", () => { 
    if (selected) { 
      selected.theta = (selected.theta + TAU * 0.25) % TAU; 
      selected.flashed = 1.0; 
    } 
  });
}

function perturb() {
  shuffle(agents, true).slice(0, 4).forEach((a, i) => {
    a.theta = random(TAU);
    if (i < 2) a.baseOmega = random(2.85, 4.35);
    a.flashed = 1.0;
  });
}

function updateInterface() {
  const r = orderParameter();
  const state = r < 0.38 ? "desorden" : r < 0.78 ? "organización parcial" : "organización estable";
  document.querySelector("#state-name").textContent = state;
  document.querySelector("#order-value").textContent = "r = " + r.toFixed(2);
  document.querySelector("#order-fill").style.width = (r * 100) + "%";
}

function mousePressed() {
  activateAudio();
  selected = agents.find(a => mouseX >= a.x && mouseX <= a.x + a.w && mouseY >= a.y && mouseY <= a.y + a.h) || null;
  dragged = selected;
  heldAgent = selected;
  document.querySelector("#advance").disabled = !selected;
  return false;
}

function mouseDragged() {
  if (!dragged) return;
  dragged.theta = constrain((mouseX - dragged.x) / dragged.w, 0, 1) * TAU;
  dragged.flashed = 1.0;
  return false;
}

function mouseReleased() { 
  dragged = null; 
  heldAgent = null; 
}

function mouseDoubleClicked() {
  const agent = agents.find(a => mouseX >= a.x && mouseX <= a.x + a.w && mouseY >= a.y && mouseY <= a.y + a.h);
  if (agent) { 
    agent.boostUntil = millis() + 1200; 
    agent.flashed = 1.0; 
  }
  return false;
}

function activateAudio() {
  if (audioReady) return;
  userStartAudio();
  audioReady = true;

  if (metronomeSound && metronomeSound.isLoaded()) {
    metronomeSound.setVolume(0.42);
    metronomeSound.loop();
  }

  const note = document.querySelector("#audio-notice");
  note.textContent = "Audio activado"; 
  note.classList.add("visible");
  setTimeout(() => note.classList.remove("visible"), 1500);
}

function windowResized() {
  const holder = document.querySelector("#canvas-holder");
  resizeCanvas(holder.clientWidth, holder.clientHeight);
}