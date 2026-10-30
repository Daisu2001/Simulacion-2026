let currentScene = 1;

// ----------------------------------------------------
// VARIABLES ESCENA 1
// ----------------------------------------------------
let userStrokes = [];
let currentBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
let feedbackState1 = "NONE";
let feedbackTimer1 = 0;
let isSolved1 = false;

// ----------------------------------------------------
// VARIABLES ESCENA 2
// ----------------------------------------------------
let feedbackState2 = "NONE";
let feedbackTimer2 = 0;
let isSolved2 = false;

let calcDisplay = "0";
let calcCurrentOp = "";
let calcPrevValue = null;
let calcNewNumber = true;
let calcHistory = "";

let calcButtons = [];
const calcLayout = [
  ['C', 'CE', 'back', '/'],
  ['7', '8', '9', '*'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['±', '0', '.', '=']
];

// ----------------------------------------------------
// VARIABLES ESCENAS 4, 5 y 6
// ----------------------------------------------------
let scene4Items = [];
let scene4Generated = false;
let scene4FontSize = 28;

let scene5Elements = [];
let scene5Initialized = false;
let scene5AnimProgress = 0;

let scene6Initialized = false;
let scene6PaintLayer = null;
let scene6FillProgress = 0;
let scene6PaintedCells = [];
let scene6PaintedCellCount = 0;
const scene6GridColumns = 40;
const scene6GridRows = 30;

let scene9CameraStatus = "idle";
let scene9CameraVideo = null;
let scene9CameraStream = null;

// Botón Flecha
let nextButton = { x: 0, y: 0, size: 60 };

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  updatePositions();
}

function draw() {
  if (currentScene === 1) {
    drawScene1();
  } else if (currentScene === 2) {
    drawScene2();
  } else if (currentScene === 3) {
    drawScene3();
  } else if (currentScene === 4) {
    drawScene4();
  } else if (currentScene === 5) {
    drawScene5();
  } else if (currentScene === 6) {
    drawScene6();
  } else if (currentScene === 7) {
    drawScene7();
  } else if (currentScene === 8) {
    drawScene8();
  } else if (currentScene === 9) {
    drawScene9();
  }
}

function updatePositions() {
  nextButton.x = width - 80;
  nextButton.y = height - 80;
  setupCalculatorLayout();
  scene4Generated = false;
  scene5Initialized = false;
  scene6Initialized = false;
  if (scene6PaintLayer) {
    scene6PaintLayer.remove();
    scene6PaintLayer = null;
  }
}

// ----------------------------------------------------
// ESCENA 1
// ----------------------------------------------------
function drawScene1() {
  if (feedbackState1 === "FLASH_RED") {
    background(231, 76, 60);
  } else if (feedbackState1 === "FLASH_GREEN") {
    background(46, 204, 113);
  } else {
    background(241, 196, 15);
  }

  if (feedbackState1 !== "NONE") {
    feedbackTimer1++;
    if (feedbackTimer1 > 20) {
      if (feedbackState1 === "FLASH_RED") {
        userStrokes = [];
        resetBounds();
      }
      feedbackState1 = "NONE";
      feedbackTimer1 = 0;
    }
  }

  fill(30);
  noStroke();
  textSize(min(width, height) * 0.30);
  textAlign(RIGHT, CENTER);
  text("2 + 2 = ", width * 0.55, height * 0.5);

  stroke(30);
  strokeWeight(20);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  beginShape();
  for (let p of userStrokes) {
    vertex(p.x, p.y);
  }
  endShape();

  drawNextArrow(isSolved1);
}

function resetBounds() {
  currentBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
}

// ----------------------------------------------------
// ESCENA 2
// ----------------------------------------------------
function drawScene2() {
  if (feedbackState2 === "FLASH_RED") {
    background(231, 76, 60);
  } else if (feedbackState2 === "FLASH_GREEN") {
    background(46, 204, 113);
  } else {
    background(241, 196, 15);
  }

  if (feedbackState2 !== "NONE") {
    feedbackTimer2++;
    if (feedbackTimer2 > 20) {
      feedbackState2 = "NONE";
      feedbackTimer2 = 0;
    }
  }

  fill(30);
  noStroke();
  textSize(min(width, height) * 0.08);
  textAlign(CENTER, CENTER);
  text("2+2 ?", width / 2, height * 0.12);

  drawCalculator();

  drawNextArrow(isSolved2);
}

function setupCalculatorLayout() {
  calcButtons = [];
  let calcW = min(width * 0.8, 340);
  let calcH = min(height * 0.6, 440);
  let startX = (width - calcW) / 2;
  let startY = (height - calcH) / 2 + 30;

  let cols = 4;
  let rows = 5;
  let padding = 8;
  let btnW = (calcW - padding * (cols + 1)) / cols;
  let btnH = (calcH - 80 - padding * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let label = calcLayout[r][c];
      let bx = startX + padding + c * (btnW + padding);
      let by = startY + 80 + padding + r * (btnH + padding);
      calcButtons.push({
        label: label,
        x: bx,
        y: by,
        w: btnW,
        h: btnH
      });
    }
  }
}

function drawCalculator() {
  let calcW = min(width * 0.8, 340);
  let calcH = min(height * 0.6, 440);
  let startX = (width - calcW) / 2;
  let startY = (height - calcH) / 2 + 30;

  fill(35);
  stroke(20);
  strokeWeight(3);
  rect(startX, startY, calcW, calcH, 16);

  fill(210, 225, 210);
  stroke(50);
  strokeWeight(2);
  rect(startX + 12, startY + 15, calcW - 24, 55, 8);

  fill(20);
  noStroke();
  textSize(28);
  textAlign(RIGHT, CENTER);
  text(calcDisplay, startX + calcW - 24, startY + 42);

  for (let btn of calcButtons) {
    let isHover = mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h;
    
    if (btn.label === '=') {
      fill(isHover ? '#d35400' : '#e67e22');
    } else if (['/', '*', '-', '+', 'C', 'CE', 'back'].includes(btn.label)) {
      fill(isHover ? '#7f8c8d' : '#95a5a6');
    } else {
      fill(isHover ? '#bdc3c7' : '#ecf0f1');
    }

    stroke(30);
    strokeWeight(1.5);
    rect(btn.x, btn.y, btn.w, btn.h, 6);

    fill(20);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    let displayLabel = btn.label === 'back' ? '←' : btn.label;
    text(displayLabel, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }
}

function handleCalculatorClick(label) {
  if (label >= '0' && label <= '9') {
    if (calcNewNumber) {
      calcDisplay = label;
      calcNewNumber = false;
    } else {
      if (calcDisplay === "0") calcDisplay = label;
      else calcDisplay += label;
    }
    calcHistory += label;
  } else if (label === '.') {
    if (calcNewNumber) {
      calcDisplay = "0.";
      calcNewNumber = false;
    } else if (!calcDisplay.includes('.')) {
      calcDisplay += '.';
    }
    calcHistory += '.';
  } else if (['+', '-', '*', '/'].includes(label)) {
    calcPrevValue = parseFloat(calcDisplay);
    calcCurrentOp = label;
    calcNewNumber = true;
    calcHistory += label;
  } else if (label === '=') {
    calcHistory += '=';
    let result = 0;
    let val = parseFloat(calcDisplay);

    if (calcPrevValue !== null && calcCurrentOp !== "") {
      if (calcCurrentOp === '+') result = calcPrevValue + val;
      if (calcCurrentOp === '-') result = calcPrevValue - val;
      if (calcCurrentOp === '*') result = calcPrevValue * val;
      if (calcCurrentOp === '/') result = val !== 0 ? calcPrevValue / val : "Error";

      calcDisplay = String(result);

      if (result === 4 && (calcHistory.includes("2+2=") || (calcPrevValue === 2 && val === 2 && calcCurrentOp === '+'))) {
        feedbackState2 = "FLASH_GREEN";
        isSolved2 = true;
      } else {
        feedbackState2 = "FLASH_RED";
      }

      calcPrevValue = null;
      calcCurrentOp = "";
      calcNewNumber = true;
      calcHistory = "";
      feedbackTimer2 = 0;
    }
  } else if (label === 'C') {
    calcDisplay = "0";
    calcPrevValue = null;
    calcCurrentOp = "";
    calcNewNumber = true;
    calcHistory = "";
  } else if (label === 'CE') {
    calcDisplay = "0";
    calcNewNumber = true;
  } else if (label === 'back') {
    if (calcDisplay.length > 1) {
      calcDisplay = calcDisplay.slice(0, -1);
    } else {
      calcDisplay = "0";
      calcNewNumber = true;
    }
  } else if (label === '±') {
    if (calcDisplay !== "0") {
      calcDisplay = calcDisplay.startsWith('-') ? calcDisplay.slice(1) : '-' + calcDisplay;
    }
  }
}

// ----------------------------------------------------
// ESCENA 3
// ----------------------------------------------------
function drawScene3() {
  background(241, 196, 15);

  fill(30);
  noStroke();
  textSize(min(width, height) * 0.12);
  textAlign(CENTER, CENTER);
  text("¿why bother?", width / 2, height / 2);

  drawNextArrow();
}

// ----------------------------------------------------
// ESCENA 4
// ----------------------------------------------------
function drawScene4() {
  background(241, 196, 15);

  if (!scene4Generated) {
    generateScene4Items();
  }

  fill(30);
  noStroke();
  textSize(scene4FontSize);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  for (let item of scene4Items) {
    for (let i = 0; i < item.lines.length; i++) {
      text(item.lines[i], item.x, item.y + i * item.lineHeight);
    }
  }
  textStyle(NORMAL);

  drawNextArrow();
}

function generateScene4Items() {
  scene4Items = [];
  textStyle(BOLD);

  let phrases = [
    "¿Qué tiene valor?",
    "¿tengo miedo a no poder justificar la importancia de algo con el esfuerzo que implicó?",
    "¿El proceso?",
    "¿El camino?",
    "¿Qué vale una molestia?",
    "¿Qué vale mi esfuerzo?",
    "¿El resultado?",
    "¿El destino?",
    "¿why bother?",
    "¿why bother?",
    "¿why bother?",
    "¿why bother?",
    "¿why bother?",
    "¿why bother?"
  ];

  phrases = shuffle(phrases);

  let cols = 4;
  let rows = 4;
  let cellW = width / cols;
  let cellH = height / rows;
  let marginX = min(30, cellW * 0.08);
  let marginY = min(30, cellH * 0.08);

  let cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ c: c, r: r });
    }
  }
  cells = shuffle(cells);

  scene4FontSize = min(28, (cellW - marginX * 2) * 0.14, (cellH - marginY * 2) * 0.2);
  let wrappedPhrases = [];
  let layoutFits = false;
  while (!layoutFits) {
    textSize(scene4FontSize);
    let lineHeight = scene4FontSize * 1.2;
    wrappedPhrases = phrases.map(phrase => {
      let lines = [];
      let currentLine = "";
      for (let word of phrase.split(" ")) {
        let candidate = currentLine ? currentLine + " " + word : word;
        if (currentLine && textWidth(candidate) > cellW - marginX * 2) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = candidate;
        }
      }
      if (currentLine) lines.push(currentLine);
      return { phrase: phrase, lines: lines, lineHeight: lineHeight };
    });
    layoutFits = wrappedPhrases.every(item =>
      item.lines.every(line => textWidth(line) <= cellW - marginX * 2) &&
      item.lines.length * lineHeight <= cellH - marginY * 2
    );
    if (!layoutFits) {
      scene4FontSize *= 0.9;
    }
  }

  for (let i = 0; i < phrases.length; i++) {
    let item = wrappedPhrases[i];
    let tWidth = max(...item.lines.map(line => textWidth(line)));
    let tHeight = item.lines.length * item.lineHeight;

    let cell = cells[i];
    let cellX = cell.c * cellW;
    let cellY = cell.r * cellH;

    let maxOffX = max(0, cellW - tWidth - marginX * 2);
    let maxOffY = max(0, cellH - tHeight - marginY * 2);

    let rx = cellX + marginX + random(maxOffX);
    let ry = cellY + marginY + random(maxOffY);

    scene4Items.push({
      text: item.phrase,
      lines: item.lines,
      lineHeight: item.lineHeight,
      x: rx,
      y: ry,
      w: tWidth,
      h: tHeight
    });
  }

  scene4Generated = true;
  textStyle(NORMAL);
}

// ----------------------------------------------------
// ESCENA 5
// ----------------------------------------------------
function drawScene5() {
  background(241, 196, 15);

  stroke(0);
  strokeWeight(2);
  line(width / 2, 0, width / 2, height);

  if (!scene5Initialized) {
    initScene5Elements();
  }

  // Incremento reducido para hacer la animación de transición mucho más lenta y pausada
  if (scene5AnimProgress < 1) {
    scene5AnimProgress += 0.005;
    if (scene5AnimProgress > 1) scene5AnimProgress = 1;
  }

  let easeProgress = easeOutCubic(scene5AnimProgress);

  textSize(28);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  for (let el of scene5Elements) {
    let currentX = lerp(el.startX, el.targetX, easeProgress);
    let currentY = lerp(el.startY, el.targetY, easeProgress);
    
    let c = lerpColor(color(30), color(255), easeProgress);
    fill(c);
    noStroke();

    text(el.text, currentX, currentY);
  }
  textStyle(NORMAL);

  drawNextArrow();
}

function initScene5Elements() {
  scene5Elements = [];
  scene5AnimProgress = 0;
  textSize(28);

  let targetTexts = ["¿El Destino?", "¿El Resultado?", "¿El proceso?", "¿El camino?"];
  let totalItems = targetTexts.length;
  
  let spacing = width / (totalItems + 1);
  let centerY = height / 2;

  for (let i = 0; i < totalItems; i++) {
    let t = targetTexts[i];
    let targetX = spacing * (i + 1);
    let targetY = centerY;

    let startX = targetX;
    let startY = centerY;

    let found = scene4Items.find(item => item.text === t);
    if (found) {
      startX = found.x + found.w / 2;
      startY = found.y + found.h / 2;
    }

    scene5Elements.push({
      text: t,
      startX: startX,
      startY: startY,
      targetX: targetX,
      targetY: targetY
    });
  }

  scene5Initialized = true;
}

function easeOutCubic(x) {
  return 1 - pow(1 - x, 3);
}

// ----------------------------------------------------
// ESCENA 6
// ----------------------------------------------------
function drawScene6() {
  if (!scene5Initialized) {
    initScene5Elements();
  }
  if (!scene6Initialized) {
    initScene6();
  }

  background(0);

  if (scene6FillProgress < 1) {
    scene6FillProgress = min(1, scene6FillProgress + 0.0015);
  }

  noStroke();
  fill(241, 196, 15);
  let fillHeight = height * scene6FillProgress;
  rect(0, height - fillHeight, width / 2, fillHeight);

  image(scene6PaintLayer, 0, 0);

  textSize(28);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  fill(255);
  noStroke();
  for (let element of scene5Elements) {
    text(element.text, element.targetX, element.targetY);
  }
  textStyle(NORMAL);

  stroke(255);
  strokeWeight(2);
  line(width / 2, 0, width / 2, height);

  if (mouseX >= width / 2 && mouseX <= width && mouseY >= 0 && mouseY <= height &&
      scene6PaintedCellCount < scene6GridColumns * scene6GridRows) {
    drawScene6BrushIndicator();
  }

  if (scene6FillProgress >= 1 &&
      scene6PaintedCellCount >= scene6GridColumns * scene6GridRows) {
    drawNextArrow();
  }
}

function initScene6() {
  scene6PaintLayer = createGraphics(width, height);
  scene6FillProgress = 0;
  scene6PaintedCells = Array(scene6GridColumns * scene6GridRows).fill(false);
  scene6PaintedCellCount = 0;
  scene6Initialized = true;
}

function paintScene6Brush(x1, y1, x2, y2) {
  if (!scene6Initialized || scene6PaintedCellCount >= scene6GridColumns * scene6GridRows) {
    return;
  }

  let brushSize = scene6BrushSize();
  let radius = brushSize / 2;
  x1 = constrain(x1, width / 2, width);
  x2 = constrain(x2, width / 2, width);
  y1 = constrain(y1, 0, height);
  y2 = constrain(y2, 0, height);

  let context = scene6PaintLayer.drawingContext;
  context.save();
  context.beginPath();
  context.rect(width / 2, 0, width / 2, height);
  context.clip();
  context.strokeStyle = "rgb(241, 196, 15)";
  context.fillStyle = "rgb(241, 196, 15)";
  context.lineWidth = brushSize;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.beginPath();
  context.arc(x2, y2, radius, 0, TWO_PI);
  context.fill();
  context.restore();

  for (let row = 0; row < scene6GridRows; row++) {
    for (let column = 0; column < scene6GridColumns; column++) {
      let index = row * scene6GridColumns + column;
      if (scene6PaintedCells[index]) continue;

      let sampleX = width / 2 + (column + 0.5) * (width / 2) / scene6GridColumns;
      let sampleY = (row + 0.5) * height / scene6GridRows;
      if (distanceToSegment(sampleX, sampleY, x1, y1, x2, y2) <= radius) {
        scene6PaintedCells[index] = true;
        scene6PaintedCellCount++;
      }
    }
  }
}

function scene6BrushSize() {
  return min(42, min(width, height) * 0.07);
}

function drawScene6BrushIndicator() {
  let brushSize = scene6BrushSize();
  push();
  fill(241, 196, 15, 110);
  stroke(255);
  strokeWeight(3);
  circle(mouseX, mouseY, brushSize);
  stroke(0);
  strokeWeight(1);
  circle(mouseX, mouseY, brushSize);
  pop();
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let lengthSquared = dx * dx + dy * dy;
  let t = lengthSquared === 0 ? 0 : constrain(((px - x1) * dx + (py - y1) * dy) / lengthSquared, 0, 1);
  return dist(px, py, x1 + t * dx, y1 + t * dy);
}

// ----------------------------------------------------
// ESCENA 7
// ----------------------------------------------------
function drawScene7() {
  drawYellowTextScene("¿entonces de que se trata?");
}

function drawScene8() {
  drawYellowTextScene("siempre se trató de ti");
}

function drawScene9() {
  background(241, 196, 15);
  if (scene9CameraStatus === "idle") {
    initScene9Camera();
  }

  textStyle(BOLD);
  let titleSize = min(width, height) * 0.1;
  textSize(titleSize);
  if (textWidth("¿why bother?") > width * 0.9) {
    titleSize *= width * 0.9 / textWidth("¿why bother?");
  }
  let titleArea = titleSize * 1.3;
  let gap = max(12, height * 0.035);
  let availableBottom = nextButton.y - nextButton.size / 2 - 12;
  let topPadding = max(12, height * 0.04);
  let availableFrameHeight = max(40, availableBottom - titleArea - gap - topPadding);
  let frameW = min(width * 0.82, 1000, availableFrameHeight * 16 / 9);
  let frameH = frameW * 9 / 16;
  let frameX = (width - frameW) / 2;
  let contentHeight = titleArea + gap + frameH;
  let contentTop = (availableBottom - contentHeight) / 2;
  let frameY = contentTop + titleArea + gap;
  let borderSize = 5;
  let videoX = frameX + borderSize;
  let videoY = frameY + borderSize;
  let videoW = frameW - borderSize * 2;
  let videoH = frameH - borderSize * 2;

  fill(20);
  stroke(0);
  strokeWeight(5);
  rect(frameX, frameY, frameW, frameH);

  if (scene9CameraStatus === "ready" && scene9CameraVideo.readyState >= 2) {
    let sourceAspect = scene9CameraVideo.videoWidth / scene9CameraVideo.videoHeight;
    let frameAspect = videoW / videoH;
    let sourceX = 0;
    let sourceY = 0;
    let sourceW = scene9CameraVideo.videoWidth;
    let sourceH = scene9CameraVideo.videoHeight;

    if (sourceAspect > frameAspect) {
      sourceW = sourceH * frameAspect;
      sourceX = (scene9CameraVideo.videoWidth - sourceW) / 2;
    } else {
      sourceH = sourceW / frameAspect;
      sourceY = (scene9CameraVideo.videoHeight - sourceH) / 2;
    }

    drawingContext.drawImage(
      scene9CameraVideo,
      sourceX, sourceY, sourceW, sourceH,
      videoX, videoY, videoW, videoH
    );
  } else {
    fill(255);
    noStroke();
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    let message = scene9CameraStatus === "requesting"
      ? "Solicitando acceso a la cámara..."
      : scene9CameraStatus === "error"
        ? "No se pudo acceder a la cámara. Revisa los permisos del navegador."
        : "La cámara no está disponible en este navegador.";
    let maxTextWidth = videoW * 0.84;
    let maxTextHeight = videoH * 0.8;
    let messageSize = min(min(width, height) * 0.04, maxTextHeight * 0.2);
    let lines = [];
    let fits = false;

    while (!fits) {
      textSize(messageSize);
      lines = [];
      let lineText = "";
      for (let word of message.split(" ")) {
        let candidate = lineText ? lineText + " " + word : word;
        if (lineText && textWidth(candidate) > maxTextWidth) {
          lines.push(lineText);
          lineText = word;
        } else {
          lineText = candidate;
        }
      }
      if (lineText) lines.push(lineText);
      fits = lines.every(line => textWidth(line) <= maxTextWidth) &&
        lines.length * messageSize * 1.2 <= maxTextHeight;
      if (!fits) messageSize *= 0.9;
    }

    let lineHeight = messageSize * 1.2;
    let firstLineY = frameY + frameH / 2 - (lines.length - 1) * lineHeight / 2;
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], frameX + frameW / 2, firstLineY + i * lineHeight);
    }
    textStyle(NORMAL);
  }

  fill(0);
  noStroke();
  textSize(titleSize);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("¿why bother?", width / 2, contentTop + titleArea / 2);
  textStyle(NORMAL);
  drawNextArrow(false);
}

function initScene9Camera() {
  scene9CameraStatus = "requesting";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scene9CameraStatus = "unavailable";
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      scene9CameraStream = stream;
      scene9CameraVideo = document.createElement("video");
      scene9CameraVideo.autoplay = true;
      scene9CameraVideo.playsInline = true;
      scene9CameraVideo.muted = true;
      scene9CameraVideo.srcObject = stream;
      scene9CameraVideo.style.position = "fixed";
      scene9CameraVideo.style.left = "-1px";
      scene9CameraVideo.style.top = "-1px";
      scene9CameraVideo.style.width = "1px";
      scene9CameraVideo.style.height = "1px";
      scene9CameraVideo.style.opacity = "0";
      scene9CameraVideo.style.pointerEvents = "none";
      document.body.appendChild(scene9CameraVideo);
      return scene9CameraVideo.play();
    })
    .then(() => {
      scene9CameraStatus = "ready";
    })
    .catch(error => {
      if (scene9CameraStream) {
        scene9CameraStream.getTracks().forEach(track => track.stop());
        scene9CameraStream = null;
      }
      scene9CameraStatus = "error";
      console.error("No se pudo iniciar la cámara:", error);
    });
}

function drawYellowTextScene(message) {
  background(241, 196, 15);

  let messageSize = min(width, height) * 0.12;
  textSize(messageSize);
  if (textWidth(message) > width * 0.9) {
    messageSize *= width * 0.9 / textWidth(message);
  }
  textSize(messageSize);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  fill(0);
  noStroke();
  text(message, width / 2, height / 2);
  textStyle(NORMAL);
  drawNextArrow();
}

// ----------------------------------------------------
// EVENTOS DE MOUSE Y NAVEGACIÓN
// ----------------------------------------------------
function mousePressed() {
  if (currentScene === 6 && mouseX >= width / 2) {
    paintScene6Brush(mouseX, mouseY, mouseX, mouseY);
  }
}

function mouseDragged() {
  if (currentScene === 1 && !isSolved1 && feedbackState1 === "NONE") {
    if (mouseX > width * 0.50) {
      userStrokes.push({ x: mouseX, y: mouseY });

      if (mouseX < currentBounds.minX) currentBounds.minX = mouseX;
      if (mouseX > currentBounds.maxX) currentBounds.maxX = mouseX;
      if (mouseY < currentBounds.minY) currentBounds.minY = mouseY;
      if (mouseY > currentBounds.maxY) currentBounds.maxY = mouseY;
    }
  }

  if (currentScene === 6 && mouseX >= width / 2) {
    paintScene6Brush(pmouseX, pmouseY, mouseX, mouseY);
  }
}

function mouseReleased() {
  if (currentScene === 1 && !isSolved1 && userStrokes.length > 5 && feedbackState1 === "NONE") {
    evaluateDrawing1();
  }
}

function evaluateDrawing1() {
  let detectedNumber = analyzeStroke1();
  if (detectedNumber === 4) {
    feedbackState1 = "FLASH_GREEN";
    isSolved1 = true;
  } else {
    feedbackState1 = "FLASH_RED";
  }
  feedbackTimer1 = 0;
}

function analyzeStroke1() {
  let w = currentBounds.maxX - currentBounds.minX;
  let h = currentBounds.maxY - currentBounds.minY;
  if (w < 10 && h < 10) return -1;
  let aspectRatio = w / h;

  if (aspectRatio < 0.35) return 1;

  let lastPt = userStrokes[userStrokes.length - 1];
  if (aspectRatio >= 0.35 && aspectRatio <= 1.2) {
    if (lastPt.x > currentBounds.minX + w * 0.5 && lastPt.y > currentBounds.minY + h * 0.4) {
      return 4;
    }
  }
  return 0;
}

function mouseClicked() {
  let d = dist(mouseX, mouseY, nextButton.x, nextButton.y);

  if (currentScene === 1 && isSolved1) {
    if (d < nextButton.size / 2) {
      currentScene = 2;
      return;
    }
  }

  if (currentScene === 2) {
    for (let btn of calcButtons) {
      if (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h) {
        handleCalculatorClick(btn.label);
        return;
      }
    }

    if (isSolved2 && d < nextButton.size / 2) {
      currentScene = 3;
      return;
    }
  }

  if (currentScene === 3 && d < nextButton.size / 2) {
    currentScene = 4;
    return;
  }

  if (currentScene === 4 && d < nextButton.size / 2) {
    currentScene = 5;
    return;
  }

  if (currentScene === 5 && d < nextButton.size / 2) {
    currentScene = 6;
    return;
  }

  if (currentScene === 6 && d < nextButton.size / 2 &&
      scene6FillProgress >= 1 &&
      scene6PaintedCellCount >= scene6GridColumns * scene6GridRows) {
    currentScene = 7;
    return;
  }

  if (currentScene === 7 && d < nextButton.size / 2) {
    currentScene = 8;
    return;
  }

  if (currentScene === 8 && d < nextButton.size / 2) {
    currentScene = 9;
    return;
  }
}

function drawNextArrow(enabled = true) {
  push();
  translate(nextButton.x, nextButton.y);
  fill(enabled ? 30 : 75);
  if (currentScene === 6) {
    stroke(255);
    strokeWeight(2);
  } else {
    noStroke();
  }
  circle(0, 0, nextButton.size);

  stroke(enabled ? 241 : 160, enabled ? 196 : 160, enabled ? 15 : 160);
  strokeWeight(4);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  line(-10, 0, 10, 0);
  line(2, -8, 10, 0);
  line(2, 8, 10, 0);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updatePositions();
}