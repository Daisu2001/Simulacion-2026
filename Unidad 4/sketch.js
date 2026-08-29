/*
  TRÁMITES EN FASE — motor de Kuramoto + capa audiovisual.
  Personaliza únicamente el bloque DIRECCIÓN DE ARTE y las funciones drawAgent / triggerAgent.
  El resto implementa la dinámica del modelo y las interacciones.
*/

const TAU = Math.PI * 2;

// ─── DIRECCIÓN DE ARTE: CAMBIA ESTE BLOQUE ──────────────────────────────────
// Cada perfil aparece exactamente en dos agentes. Puedes cambiar etiquetas,
// colores, texturas, tamaños y sonidos sin cambiar nada del motor Kuramoto.
const PROFILES = [
  { id: "stamp",  label: "SELLO",      color: "#c94131", dark: "#752619", sound: "stamp" },
  { id: "folder", label: "CARPETA",   color: "#da9a38", dark: "#805417", sound: "folder" },
  { id: "staple", label: "GRAPADORA", color: "#2b7c77", dark: "#164640", sound: "staple" },
  { id: "ticket", label: "TURNO",     color: "#415f95", dark: "#253b63", sound: "ticket" }
];

// Las filas son una decisión de composición, no de física.
const AGENT_LAYOUT = [
  ["stamp",  .12], ["folder", .62], ["staple", .29], ["ticket", .84],
  ["folder", .46], ["ticket", .05], ["stamp",  .73], ["staple", .94]
];

let agents = [];
let selected = null;
let lastTime = 0;
let audioReady = false;
let dragged = null;
let sounds = {};

function preload() {
    sounds.stamp = loadSound("Audio/Stamp.mp3");
    sounds.folder = loadSound("Audio/Folder.mp3");
    sounds.staple = loadSound("Audio/Grapadora.mp3");
    sounds.ticket = loadSound("Audio/Turn.mp3");
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
      // ω es distinto para cada agente: su ritmo natural, antes de acoplarse.
      baseOmega: 0.82 + i * 0.105 + (i % 2 ? 0.07 : -0.04),
      omega: 1,
      x: 0, y: 0, w: 0, h: 0,
      flashed: 0,
      wasNearEnd: false
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

// ─── MOTOR KURAMOTO: NO ES NECESARIO EDITAR ESTA SECCIÓN ────────────────────
function advanceKuramoto(dt) {
  const K = Number(document.querySelector("#coupling").value);
  const spread = Number(document.querySelector("#spread").value);
  const averageNatural = agents.reduce((sum, a) => sum + a.baseOmega, 0) / agents.length;
  const nextThetas = [];

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i];
    a.omega = averageNatural + (a.baseOmega - averageNatural) * spread;
    let influence = 0;
    for (const other of agents) influence += Math.sin(other.theta - a.theta);
    const dTheta = a.omega + (K / agents.length) * influence;
    nextThetas[i] = (a.theta + dTheta * dt + TAU) % TAU;
  }
  agents.forEach((a, i) => {
    const crossedCycle = nextThetas[i] < a.theta;
    a.theta = nextThetas[i];
    a.flashed = max(0, a.flashed - dt * 2.8);
    if (crossedCycle) triggerAgent(a);
  });
}

function orderParameter() {
  let x = 0, y = 0;
  for (const a of agents) { x += cos(a.theta); y += sin(a.theta); }
  return Math.sqrt(x * x + y * y) / agents.length;
}

// ─── RENDER: REEMPLAZA drawAgent PARA DEFINIR TU ESTÉTICA ───────────────────
function drawOffice() {
  background("#d7cfbd");
  drawDeskTexture();
  const cols = width > 580 ? 4 : 2;
  const gap = 18;
  const pad = 25;
  const cellW = (width - pad * 2 - gap * (cols - 1)) / cols;
  const cellH = (height - pad * 2 - gap * (ceil(agents.length / cols) - 1)) / ceil(agents.length / cols);
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

function drawDeskTexture() {
  stroke(63, 52, 38, 24); strokeWeight(1);
  for (let y = 12; y < height; y += 17) line(0, y, width, y - 7);
}

function drawAgent(a) {
  // Punto de edición visual principal. Conserva a.x/a.y/a.w/a.h para hit-testing.
  const phase = a.theta / TAU;
  const pulse = 0.65 + 0.35 * sin(a.theta);
  const isSelected = selected === a;
  const flash = a.flashed;
  push();
  translate(a.x, a.y);
  noStroke();
  fill(245, 241, 232, 225); rect(0, 0, a.w, a.h, 2);
  stroke(a.profile.dark); strokeWeight(isSelected ? 3 : 1); noFill(); rect(0, 0, a.w, a.h, 2);

  // La barra es una forma explícita de mostrar θᵢ sin convertirlo en un gráfico.
  noStroke(); fill(a.profile.dark); rect(11, 12, 3, a.h - 24);
  fill(a.profile.color); rect(11, 12 + (a.h - 24) * (1 - phase), 3, (a.h - 24) * phase);

  if (a.profile.id === "stamp") drawStamp(a, pulse);
  if (a.profile.id === "folder") drawFolder(a, pulse);
  if (a.profile.id === "staple") drawStaple(a, pulse);
  if (a.profile.id === "ticket") drawTicket(a, pulse);

  fill(a.profile.dark); textAlign(LEFT, BOTTOM); textStyle(BOLD); textSize(10);
  text(a.profile.label, 22, a.h - 11);
  textAlign(RIGHT, BOTTOM); textStyle(NORMAL); text("ω " + a.omega.toFixed(2), a.w - 11, a.h - 11);
  if (flash > 0) { noFill(); stroke(a.profile.color); strokeWeight(4 * flash); rect(5, 5, a.w - 10, a.h - 10); }
  pop();
}

function drawStamp(a, pulse) {
  push(); translate(a.w * .58, a.h * .47 + (1 - pulse) * 9);
  fill(a.profile.dark); rectMode(CENTER); rect(0, 0, 42, 13, 2);
  fill(a.profile.color); rect(0, -19, 28, 30, 3); rect(0, -38, 41, 10, 2);
  fill(a.profile.color); ellipse(0, 17, 58 + a.flashed * 14, 17); pop();
}
function drawFolder(a, pulse) {
  push(); translate(a.w * .56, a.h * .43); rotate((1 - pulse) * .08);
  fill(a.profile.color); stroke(a.profile.dark); strokeWeight(2); rectMode(CENTER); rect(0, 0, 76, 48, 2);
  noStroke(); fill(255, 245, 215, 180); rect(7, 6, 57, 32); fill(a.profile.dark); rect(-25, -29, 28, 10, 1); pop();
}
function drawStaple(a, pulse) {
  push(); translate(a.w * .57, a.h * .48); rotate(-.12 + (1 - pulse) * .22);
  fill(a.profile.dark); rectMode(CENTER); rect(0, 13, 72, 12, 3);
  fill(a.profile.color); rect(1, -8, 72, 14, 3); fill(237, 233, 219); rect(20, 3, 12, 8); pop();
}
function drawTicket(a, pulse) {
  push(); translate(a.w * .57, a.h * .46); rotate(sin(a.theta) * .04);
  fill(a.profile.color); stroke(a.profile.dark); strokeWeight(2); rectMode(CENTER); rect(0, 0, 71, 54, 1);
  noStroke(); fill(244, 239, 223); rect(0, 4, 53, 26); fill(a.profile.dark); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(18); text("0" + (a.id + 1), 0, 4); pop();
}

// ─── SONIDO: SUSTITUYE ESTAS RECETAS POR SAMPLES SI LO PREFIERES ────────────
function triggerAgent(a) {
  a.flashed = 1;
  if (!audioReady) return;

  const sound = sounds[a.profile.sound];
  if (!sound || !sound.isLoaded()) return;

  sound.stop(); // reinicia el sonido si ese objeto vuelve a activarse
  sound.rate(map(a.omega, 0.7, 1.7, 0.88, 1.12));
  sound.setVolume(0.45);
  sound.play();
}


function synthTone(freq, duration, type, volume, slide) {
  const osc = new p5.Oscillator(type); const env = new p5.Envelope();
  env.setADSR(.004, .025, .12, .05); env.setRange(volume, 0);
  osc.freq(freq); osc.start();
  if (slide) osc.freq(freq + slide, duration * .7);
  env.play(osc);
  setTimeout(() => osc.stop(), (duration + .22) * 1000);
}

function bindControls() {
  const coupling = document.querySelector("#coupling");
  const spread = document.querySelector("#spread");
  // Evita que los gestos del lienzo p5 intercepten el arrastre de un control HTML.
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
  document.querySelector("#advance").addEventListener("click", () => { if (selected) { selected.theta = (selected.theta + TAU * .18) % TAU; selected.flashed = 1; } });
}

function perturb() {
  shuffle(agents, true).slice(0, 4).forEach(a => { a.theta = random(TAU); a.flashed = 1; });
}

function updateInterface() {
  const r = orderParameter();
  const state = r < .38 ? "desorden" : r < .78 ? "organización parcial" : "organización estable";
  document.querySelector("#state-name").textContent = state;
  document.querySelector("#order-value").textContent = "r = " + r.toFixed(2);
  document.querySelector("#order-fill").style.width = (r * 100) + "%";
}

function mousePressed() {
  activateAudio();
  selected = agents.find(a => mouseX >= a.x && mouseX <= a.x + a.w && mouseY >= a.y && mouseY <= a.y + a.h) || null;
  dragged = selected;
  document.querySelector("#advance").disabled = !selected;
  return false;
}
function mouseDragged() {
  if (!dragged) return;
  // El gesto horizontal interviene directamente θᵢ; no cambia K ni usa un reloj maestro.
  dragged.theta = constrain((mouseX - dragged.x) / dragged.w, 0, 1) * TAU;
  dragged.flashed = 1;
  return false;
}
function mouseReleased() { dragged = null; }
function touchStarted() { return mousePressed(); }
function touchMoved() { return mouseDragged(); }
function touchEnded() { mouseReleased(); return false; }

function activateAudio() {
  if (audioReady) return;
  userStartAudio();
  audioReady = true;
  const note = document.querySelector("#audio-notice");
  note.textContent = "Audio activado"; note.classList.add("visible");
  setTimeout(() => note.classList.remove("visible"), 1500);
}
function windowResized() {
  const holder = document.querySelector("#canvas-holder");
  resizeCanvas(holder.clientWidth, holder.clientHeight);
}
