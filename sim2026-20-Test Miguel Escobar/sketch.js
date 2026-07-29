// ==========================================
// EL JARDÍN DE LOS SENDEROS QUE SE BIFURCAN
// Formato Vertical 9:16
// ==========================================

let puntos = [];
let lineas = [];
let coloresPuntos;
let velocidadConstante = 1.8;
const RESOLUCION_LINEA = 30;

function setup() {
  // Ajustar el lienzo para mantener siempre proporción 9:16
  ajustarLienzo916();
  
  coloresPuntos = [
    color(255, 99, 71),   // Coral / Rojo
    color(50, 205, 50),   // Verde
    color(30, 144, 255),  // Azul
    color(255, 215, 0)    // Amarillo
  ];

  inicializarJardin();
}

function ajustarLienzo916() {
  let w = windowWidth;
  let h = windowHeight;
  
  // Calcular dimensión manteniendo aspecto 9:16
  if (w / h > 9 / 16) {
    w = h * (9 / 16);
  } else {
    h = w * (16 / 9);
  }
  
  let canvas = createCanvas(w, h);
  canvas.style('display', 'block');
  canvas.style('margin', 'auto'); // Centra el canvas si la pantalla es más ancha
}

function inicializarJardin() {
  puntos = [];
  lineas = [];
  
  let centro = createVector(width / 2, height / 2);
  
  // Destinos iniciales adaptados a la proporción vertical (9:16)
  let destinos = [
    createVector(width / 2, height * 0.05), // Arriba
    createVector(width / 2, height * 0.95), // Abajo
    createVector(width * 0.08, height / 2), // Izquierda
    createVector(width * 0.92, height / 2)  // Derecha
  ];
  
  for (let i = 0; i < 4; i++) {
    let nuevaLinea = crearObjetoLinea(centro, destinos[i], color(80, 80, 80));
    lineas.push(nuevaLinea);
    
    let d = centro.dist(destinos[i]);
    puntos.push({
      col: coloresPuntos[i],
      origen: centro.copy(),
      destino: destinos[i].copy(),
      lineaActual: nuevaLinea,
      t: 0,
      paso: velocidadConstante / d,
      historial: []
    });
  }
}

function crearObjetoLinea(p1, p2, colorInicial, esExcepcion = false, colorExcepcion = null) {
  let historialColores = [];
  
  if (Array.isArray(colorInicial)) {
    historialColores = colorInicial.map(c => color(red(c), green(c), blue(c)));
  } else {
    for (let i = 0; i < RESOLUCION_LINEA; i++) {
      historialColores.push(colorInicial);
    }
  }

  let colorNeonFinal = null;
  if (esExcepcion) {
    colorNeonFinal = colorExcepcion || color(random(100, 255), random(100, 255), random(100, 255));
  }

  return { 
    p1: p1.copy(), 
    p2: p2.copy(), 
    visitas: 1,
    esExcepcion: esExcepcion,
    colorExcepcion: colorNeonFinal,
    sePuedePintar: !esExcepcion,
    coloresSegmento: historialColores
  };
}

function draw() {
  background(15);

  dibujarSenderos();
  actualizarViajeros();
  dibujarInterfazUI();
}

// --- DIBUJO DE LA RED ---
function dibujarSenderos() {
  for (let ln of lineas) {
    let grosor = map(ln.visitas, 1, 25, 1.5, 5, true);
    strokeWeight(grosor);

    // ⚡ LÉVY FLIGHT: Color aleatorio vibrante
    if (ln.esExcepcion) {
      stroke(ln.colorExcepcion);
      strokeWeight(3.5);
      line(ln.p1.x, ln.p1.y, ln.p2.x, ln.p2.y);
      continue;
    }

    // Líneas comunes pintables
    for (let i = 0; i < RESOLUCION_LINEA - 1; i++) {
      let t1 = i / (RESOLUCION_LINEA - 1);
      let t2 = (i + 1) / (RESOLUCION_LINEA - 1);

      let pos1 = p5.Vector.lerp(ln.p1, ln.p2, t1);
      let pos2 = p5.Vector.lerp(ln.p1, ln.p2, t2);

      let c = ln.coloresSegmento[i];
      stroke(red(c), green(c), blue(c), 200);
      line(pos1.x, pos1.y, pos2.x, pos2.y);
    }
  }
}

// --- MOVIMIENTO DE LOS VIAJEROS ---
function actualizarViajeros() {
  for (let p of puntos) {
    let posX = lerp(p.origen.x, p.destino.x, p.t);
    let posY = lerp(p.origen.y, p.destino.y, p.t);
    let posActual = createVector(posX, posY);

    if (p.lineaActual && p.lineaActual.sePuedePintar) {
      sobreescribirColorLinea(p.lineaActual, p.origen, p.destino, p.t, p.col);
    }

    p.historial.push(posActual);
    if (p.historial.length > 25) {
      p.historial.shift();
    }

    // Estela del viajero
    noFill();
    for (let i = 0; i < p.historial.length - 1; i++) {
      let p1 = p.historial[i];
      let p2 = p.historial[i + 1];

      let alpha = map(i, 0, p.historial.length - 1, 0, 220);
      let grosor = map(i, 0, p.historial.length - 1, 2, 12);

      stroke(red(p.col), green(p.col), blue(p.col), alpha);
      strokeWeight(grosor);
      line(p1.x, p1.y, p2.x, p2.y);
    }

    // Círculo viajero
    noStroke();
    fill(p.col);
    circle(posX, posY, 14);
    
    p.t += p.paso;
    
    if (p.t >= 1) {
      p.t = 0;
      decidirSiguienteBifurcacion(p);
    }
  }
}

function sobreescribirColorLinea(linea, origen, destino, tActual, nuevoColor) {
  let vaDeP1aP2 = origen.dist(linea.p1) < 1;
  let indiceActual = floor(tActual * RESOLUCION_LINEA);

  if (vaDeP1aP2) {
    for (let i = 0; i <= indiceActual && i < RESOLUCION_LINEA; i++) {
      linea.coloresSegmento[i] = nuevoColor;
    }
  } else {
    for (let i = RESOLUCION_LINEA - 1; i >= RESOLUCION_LINEA - 1 - indiceActual && i >= 0; i--) {
      linea.coloresSegmento[i] = nuevoColor;
    }
  }
}

// --- BIFURCACIÓN ---
function decidirSiguienteBifurcacion(viajero) {
  let nodoLlegada = viajero.destino.copy();
  viajero.origen = nodoLlegada.copy();
  
  let opciones = [];
  
  for (let ln of lineas) {
    let esP1 = ln.p1.dist(nodoLlegada) < 1;
    let esP2 = ln.p2.dist(nodoLlegada) < 1;
    
    if (esP1 || esP2) {
      let destinoCandidato = esP1 ? ln.p2 : ln.p1;
      let esElCaminoRecienRecorrido = (ln === viajero.lineaActual);

      let pesoBase = ln.visitas;
      let pesoEfectivo = esElCaminoRecienRecorrido ? max(1, floor(pesoBase * 0.15)) : pesoBase;
      
      for (let w = 0; w < pesoEfectivo; w++) {
        opciones.push({ nodo: destinoCandidato, lineaRef: ln });
      }
    }
  }
  
  if (opciones.length > 0) {
    let eleccion = random(opciones);
    viajero.destino = eleccion.nodo.copy();
    viajero.lineaActual = eleccion.lineaRef;
    eleccion.lineaRef.visitas++; 
  } else {
    viajero.destino = createVector(width / 2, height / 2);
    viajero.lineaActual = null;
  }

  let d = viajero.origen.dist(viajero.destino);
  viajero.paso = d > 0 ? (velocidadConstante / d) : 0.01;
}

// --- CREACIÓN DE BIFURCACIONES Y LÉVY FLIGHT ---
function mousePressed() {
  if (lineas.length === 0) return;
  
  let indiceLineaAzar = floor(random(lineas.length));
  let lineaElegida = lineas[indiceLineaAzar];

  let tAleatorio = random(0.2, 0.8);
  let puntoBifurcacion = p5.Vector.lerp(lineaElegida.p1, lineaElegida.p2, tAleatorio);

  let p1Original = lineaElegida.p1.copy();
  let p2Original = lineaElegida.p2.copy();
  let eraExcepcion = lineaElegida.esExcepcion;
  let colorExcepcionPadre = lineaElegida.colorExcepcion;
  
  let indiceCorte = floor(tAleatorio * RESOLUCION_LINEA);
  
  let coloresParte1 = [];
  let coloresParte2 = [];

  for (let i = 0; i < RESOLUCION_LINEA; i++) {
    let col = lineaElegida.coloresSegmento[i];
    if (i < indiceCorte) {
      coloresParte1.push(col);
    } else {
      coloresParte2.push(col);
    }
  }

  let reescalarArray = (arr) => {
    let res = [];
    for (let i = 0; i < RESOLUCION_LINEA; i++) {
      let idx = floor(map(i, 0, RESOLUCION_LINEA, 0, arr.length));
      res.push(arr[idx]);
    }
    return res;
  };

  lineaElegida.p2 = puntoBifurcacion.copy();
  lineaElegida.coloresSegmento = reescalarArray(coloresParte1);

  let segmento2 = crearObjetoLinea(puntoBifurcacion, p2Original, reescalarArray(coloresParte2), eraExcepcion, colorExcepcionPadre);
  lineas.push(segmento2);

  // Nueva rama adaptada a escala 9:16
  let esHorizontal = abs(p1Original.y - p2Original.y) < 1; 
  let nuevoPuntoFinal = puntoBifurcacion.copy();
  let esExcepcion = false;
  let distancia;

  // Lévy Flight proporcional a la altura del lienzo vertical
  if (random(1) < 0.10) {
    distancia = random(height * 0.4, height * 0.8);
    esExcepcion = true;
  } else {
    distancia = abs(randomGaussian(height * 0.2, height * 0.06));
  }

  let direccion = random([-1, 1]);

  if (esHorizontal) {
    nuevoPuntoFinal.y += distancia * direccion;
  } else {
    nuevoPuntoFinal.x += distancia * direccion;
  }

  // Límites del canvas ajustados
  nuevoPuntoFinal.x = constrain(nuevoPuntoFinal.x, 15, width - 15);
  nuevoPuntoFinal.y = constrain(nuevoPuntoFinal.y, 15, height - 15);

  let nuevaRama = crearObjetoLinea(puntoBifurcacion, nuevoPuntoFinal, color(80, 80, 80), esExcepcion);
  lineas.push(nuevaRama);
}

function dibujarInterfazUI() {
  fill(255, 170);
  noStroke();
  textSize(width * 0.032);
  textAlign(CENTER, TOP);
  text("Toca la pantalla para ramificar", width / 2, height * 0.03);
}

function windowResized() {
  ajustarLienzo916();
  inicializarJardin();
}