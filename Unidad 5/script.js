const canvas = document.getElementById('webgl');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 7.5);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Grupo contenedor posicionado a la derecha
const structureGroup = new THREE.Group();
structureGroup.position.set(2.2, 0, 0);
scene.add(structureGroup);

// --- CREACIÓN DE TEXTURAS DE GLOW ---

const textureLoader = new THREE.TextureLoader();
const upbTexture = textureLoader.load('FotosPresentacion/UPB-Colombia-1024x358.png');

function createWhiteGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.7, 'rgba(200, 230, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(0, 210, 255, 0.9)');
  gradient.addColorStop(0.55, 'rgba(112, 0, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

function createCyanGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(0, 210, 255, 1)');
  gradient.addColorStop(0.6, 'rgba(0, 100, 255, 0.6)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

function createGreenGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(0, 255, 102, 1)');
  gradient.addColorStop(0.6, 'rgba(0, 200, 80, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

function createPurpleGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(180, 0, 255, 1)');
  gradient.addColorStop(0.6, 'rgba(112, 0, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

function createYellowGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 220, 0, 1)');
  gradient.addColorStop(0.6, 'rgba(255, 170, 0, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

function createPinkGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 105, 180, 1)');
  gradient.addColorStop(0.6, 'rgba(255, 20, 147, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

function createDarkBlueGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(0, 51, 153, 1)');
  gradient.addColorStop(0.6, 'rgba(0, 25, 102, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

const whiteGlowTexture = createWhiteGlowTexture();
const glowTexture = createGlowTexture();
const cyanGlowTexture = createCyanGlowTexture();
const greenGlowTexture = createGreenGlowTexture();
const purpleGlowTexture = createPurpleGlowTexture();
const yellowGlowTexture = createYellowGlowTexture();
const pinkGlowTexture = createPinkGlowTexture();
const darkBlueGlowTexture = createDarkBlueGlowTexture();

// --- 1. ESTRUCTURA BASE: ROMBICOSIDODECAEDRO (60 VÉRTICES, 120 ARISTAS) ---

const radius = 2.4;
const phi = (1 + Math.sqrt(5)) / 2;
const phi2 = phi * phi;
const phi3 = phi * phi2;

const rawVertices = [];

function addPermutations(x, y, z) {
  const signs = [-1, 1];
  const set = new Set();
  
  signs.forEach(sx => {
    signs.forEach(sy => {
      signs.forEach(sz => {
        const key = `${sx*x},${sy*y},${sz*z}`;
        if (!set.has(key)) {
          set.add(key);
          rawVertices.push(new THREE.Vector3(sx * x, sy * y, sz * z));
        }
      });
    });
  });
}

function addEvenRotations(x, y, z) {
  addPermutations(x, y, z);
  addPermutations(y, z, x);
  addPermutations(z, x, y);
}

addEvenRotations(1, 1, phi3);
addEvenRotations(phi2, phi, 2 * phi);
addEvenRotations(2 + phi, 0, phi2);

const mainVertices = rawVertices.map(v => v.clone().normalize().multiplyScalar(radius));

const adjacencyList = Array.from({ length: mainVertices.length }, () => []);
const edgePositions = [];
const edgeThreshold = 0.72 * radius;

const allEdges = [];

for (let i = 0; i < mainVertices.length; i++) {
  for (let j = i + 1; j < mainVertices.length; j++) {
    const dist = mainVertices[i].distanceTo(mainVertices[j]);
    if (dist < edgeThreshold) {
      adjacencyList[i].push(j);
      adjacencyList[j].push(i);
      edgePositions.push(
        mainVertices[i].x, mainVertices[i].y, mainVertices[i].z,
        mainVertices[j].x, mainVertices[j].y, mainVertices[j].z
      );
      allEdges.push({ from: i, to: j, dist });
    }
  }
}

const mainLineGeometry = new THREE.BufferGeometry();
mainLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));

const mainLineMaterial = new THREE.LineBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const structureLines = new THREE.LineSegments(mainLineGeometry, mainLineMaterial);
structureGroup.add(structureLines);

// --- PUNTOS CIAN (DIAPOSITIVAS 1 A 4) ---
const mainPointsGeometry = new THREE.BufferGeometry().setFromPoints(mainVertices);
const mainPointsMaterial = new THREE.PointsMaterial({
  size: 0.35,
  map: glowTexture,
  transparent: true,
  opacity: 1.0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const structurePoints = new THREE.Points(mainPointsGeometry, mainPointsMaterial);
structureGroup.add(structurePoints);

// --- PUNTOS MULTICOLOR ORIGINALES (DIAPOSITIVAS 5 A 7) ---
const purpleVertices = [];
const yellowVertices = [];
const greenVertices = [];

mainVertices.forEach((v, idx) => {
  if (idx % 3 === 0) purpleVertices.push(v);
  else if (idx % 3 === 1) yellowVertices.push(v);
  else greenVertices.push(v);
});

const purpleGeo = new THREE.BufferGeometry().setFromPoints(purpleVertices);
const yellowGeo = new THREE.BufferGeometry().setFromPoints(yellowVertices);
const greenGeo = new THREE.BufferGeometry().setFromPoints(greenVertices);

const multiPointsMatProps = {
  size: 0.45,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
};

const purplePoints = new THREE.Points(purpleGeo, new THREE.PointsMaterial({ ...multiPointsMatProps, map: purpleGlowTexture }));
const yellowPoints = new THREE.Points(yellowGeo, new THREE.PointsMaterial({ ...multiPointsMatProps, map: yellowGlowTexture }));
const greenPoints = new THREE.Points(greenGeo, new THREE.PointsMaterial({ ...multiPointsMatProps, map: greenGlowTexture }));

structureGroup.add(purplePoints);
structureGroup.add(yellowPoints);
structureGroup.add(greenPoints);

// --- PUNTOS ROSA Y AZUL OSCURO (DIAPOSITIVA 8 EN ADELANTE) ---
const pinkVertices = [];
const darkBlueVertices = [];

mainVertices.forEach((v, idx) => {
  if (idx % 2 === 0) pinkVertices.push(v);
  else darkBlueVertices.push(v);
});

const pinkGeo = new THREE.BufferGeometry().setFromPoints(pinkVertices);
const darkBlueGeo = new THREE.BufferGeometry().setFromPoints(darkBlueVertices);

const pinkPoints = new THREE.Points(pinkGeo, new THREE.PointsMaterial({ ...multiPointsMatProps, map: pinkGlowTexture }));
const darkBluePoints = new THREE.Points(darkBlueGeo, new THREE.PointsMaterial({ ...multiPointsMatProps, map: darkBlueGlowTexture }));

structureGroup.add(pinkPoints);
structureGroup.add(darkBluePoints);

// --- PUNTOS MORADOS PARA LA FINALIZACIÓN DE LA DIAPOSITIVA 10 ---
const allPurpleGeo = new THREE.BufferGeometry().setFromPoints(mainVertices);
const allPurplePointsMat = new THREE.PointsMaterial({
  ...multiPointsMatProps,
  map: purpleGlowTexture,
  opacity: 0
});
const allPurplePoints = new THREE.Points(allPurpleGeo, allPurplePointsMat);
structureGroup.add(allPurplePoints);

// --- SISTEMA DE 35 PARTÍCULAS AZULES BRILLANTES ALREDEDOR DE LA FIGURA (DIAPOSITIVA 11 / ÍNDICE 10) ---
const slide11BlueCount = 35;
const slide11BluePositions = new Float32Array(slide11BlueCount * 3);
const slide11BlueTargetPositions = [];
const slide11BlueSpeeds = [];

for (let i = 0; i < slide11BlueCount; i++) {
  // Distribución esférica en un radio entre 2.8 y 4.5 alrededor de la figura
  const theta = Math.random() * Math.PI * 2;
  const phiAngle = Math.acos((Math.random() * 2) - 1);
  const r = 2.8 + Math.random() * 1.7;

  const x = r * Math.sin(phiAngle) * Math.cos(theta);
  const y = r * Math.sin(phiAngle) * Math.sin(theta);
  const z = r * Math.cos(phiAngle);

  // Inicialmente posicionadas en sus coordenadas destino
  slide11BluePositions[i * 3] = x;
  slide11BluePositions[i * 3 + 1] = y;
  slide11BluePositions[i * 3 + 2] = z;

  slide11BlueTargetPositions.push(new THREE.Vector3(x, y, z));
  slide11BlueSpeeds.push(0.5 + Math.random() * 0.8);
}

const slide11BlueGeo = new THREE.BufferGeometry();
slide11BlueGeo.setAttribute('position', new THREE.BufferAttribute(slide11BluePositions, 3));

// Arreglo de opacidades individuales por partícula para controlar su aparición secuencial
const slide11BlueOpacities = new Float32Array(slide11BlueCount);
slide11BlueGeo.setAttribute('alpha', new THREE.BufferAttribute(slide11BlueOpacities, 1));

// ShaderMaterial personalizado para manejar la opacidad secuencial de cada partícula
const slide11BlueMat = new THREE.ShaderMaterial({
  uniforms: {
    pointTexture: { value: cyanGlowTexture },
    size: { value: 0.55 * (window.devicePixelRatio || 1.0) }
  },
  vertexShader: `
    attribute float alpha;
    varying float vAlpha;
    uniform float size;
    void main() {
      vAlpha = alpha;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D pointTexture;
    varying float vAlpha;
    void main() {
      vec4 texColor = texture2D(pointTexture, gl_PointCoord);
      gl_FragColor = vec4(texColor.rgb, texColor.a * vAlpha);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const slide11BluePoints = new THREE.Points(slide11BlueGeo, slide11BlueMat);
structureGroup.add(slide11BluePoints);

const highlightGeo = new THREE.BufferGeometry();
highlightGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));

const highlightMaterial = new THREE.PointsMaterial({
  size: 1.0,
  map: greenGlowTexture,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const highlightPoint = new THREE.Points(highlightGeo, highlightMaterial);
highlightPoint.renderOrder = 3;
structureGroup.add(highlightPoint);

const COLOR_AZUL_BORDE = 0x00d2ff;
const SCALE_FACTOR = 0.70 * 0.75;
const CIRCLE_RADIUS = 0.86 * SCALE_FACTOR;

const lineThickness = 0.045 * SCALE_FACTOR;
const pointerLineGeo = new THREE.PlaneGeometry(1, lineThickness);
pointerLineGeo.translate(0.5, 0, 0);

const pointerLineMat = new THREE.MeshBasicMaterial({
  color: COLOR_AZUL_BORDE,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
  depthWrite: false
});
const pointerLineMesh = new THREE.Mesh(pointerLineGeo, pointerLineMat);
structureGroup.add(pointerLineMesh);

const imageNodeGroup = new THREE.Group();
imageNodeGroup.visible = false;
structureGroup.add(imageNodeGroup);

const circleBackgroundGeo = new THREE.CircleGeometry(CIRCLE_RADIUS, 32);
const circleBackgroundMat = new THREE.MeshBasicMaterial({
  color: 0x031028,
  side: THREE.DoubleSide,
  depthWrite: false
});
const circleBackgroundMesh = new THREE.Mesh(circleBackgroundGeo, circleBackgroundMat);
imageNodeGroup.add(circleBackgroundMesh);

const logoWidth = CIRCLE_RADIUS * 1.35;
const logoHeight = logoWidth * (358 / 1024);
const planeImageGeo = new THREE.PlaneGeometry(logoWidth, logoHeight);
const planeImageMat = new THREE.MeshBasicMaterial({
  map: upbTexture,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false
});
const planeImageMesh = new THREE.Mesh(planeImageGeo, planeImageMat);
planeImageMesh.position.z = 0.01;
imageNodeGroup.add(planeImageMesh);

const circleBorderGeo = new THREE.RingGeometry(CIRCLE_RADIUS - 0.03, CIRCLE_RADIUS, 32);
const circleBorderMat = new THREE.MeshBasicMaterial({
  color: COLOR_AZUL_BORDE,
  side: THREE.DoubleSide,
  depthWrite: false
});
const circleBorderMesh = new THREE.Mesh(circleBorderGeo, circleBorderMat);
circleBorderMesh.position.z = 0.02;
imageNodeGroup.add(circleBorderMesh);

const greenPathGroup = new THREE.Group();
greenPathGroup.renderOrder = 2;
structureGroup.add(greenPathGroup);

const MAX_TARGET_POINTS = 5;
const greenTargetPositions = new Float32Array(MAX_TARGET_POINTS * 3);
const greenTargetGeo = new THREE.BufferGeometry();
greenTargetGeo.setAttribute('position', new THREE.BufferAttribute(greenTargetPositions, 3));

const greenTargetMat = new THREE.PointsMaterial({
  size: 0.9,
  map: greenGlowTexture,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const greenTargetPoints = new THREE.Points(greenTargetGeo, greenTargetMat);
greenTargetPoints.renderOrder = 3;
structureGroup.add(greenTargetPoints);

// --- CILINDROS DE PROPAGACIÓN MORADOS PARA LA DIAPOSITIVA 10 ---

const slide10CylindersGroup = new THREE.Group();
slide10CylindersGroup.renderOrder = 2;
structureGroup.add(slide10CylindersGroup);

const COLOR_PURPLE = 0xb400ff;
const slide10Cylinders = [];

function setupSlide10Propagation() {
  while (slide10CylindersGroup.children.length > 0) {
    const obj = slide10CylindersGroup.children.pop();
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  }
  slide10Cylinders.length = 0;

  allEdges.forEach(edge => {
    const vFrom = mainVertices[edge.from];
    const vTo = mainVertices[edge.to];

    const cylGeo1 = new THREE.CylinderGeometry(0.008, 0.008, 1, 8);
    cylGeo1.translate(0, 0.5, 0);
    cylGeo1.rotateX(Math.PI / 2);
    const mat1 = new THREE.MeshBasicMaterial({
      color: COLOR_PURPLE,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh1 = new THREE.Mesh(cylGeo1, mat1);
    mesh1.position.copy(vFrom);
    mesh1.lookAt(vTo);
    mesh1.scale.set(1, 1, 0);

    const cylGeo2 = new THREE.CylinderGeometry(0.008, 0.008, 1, 8);
    cylGeo2.translate(0, 0.5, 0);
    cylGeo2.rotateX(Math.PI / 2);
    const mat2 = new THREE.MeshBasicMaterial({
      color: COLOR_PURPLE,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh2 = new THREE.Mesh(cylGeo2, mat2);
    mesh2.position.copy(vTo);
    mesh2.lookAt(vFrom);
    mesh2.scale.set(1, 1, 0);

    slide10CylindersGroup.add(mesh1);
    slide10CylindersGroup.add(mesh2);

    slide10Cylinders.push({
      mesh1,
      mesh2,
      targetDist: edge.dist
    });
  });
}

setupSlide10Propagation();

// --- ORBES Y DESTELLO BLANCO ---

const slide4Group = new THREE.Group();
structureGroup.add(slide4Group);

const slide4Materials = [
  new THREE.PointsMaterial({ size: 1.8, map: greenGlowTexture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  new THREE.PointsMaterial({ size: 1.8, map: purpleGlowTexture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  new THREE.PointsMaterial({ size: 1.8, map: yellowGlowTexture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
];

const slide4TargetPositionsX = [-1.8, 0.0, 1.8];
const slide4PointsArray = [];

slide4TargetPositionsX.forEach((posX, idx) => {
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
  const pts = new THREE.Points(geo, slide4Materials[idx]);
  slide4Group.add(pts);
  slide4PointsArray.push(pts);
});

const flashGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
const flashMat = new THREE.PointsMaterial({
  size: 10.0,
  map: whiteGlowTexture,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const flashPoint = new THREE.Points(flashGeo, flashMat);
flashPoint.renderOrder = 10;
structureGroup.add(flashPoint);

// --- ESTRUCTURAS GEOMÉTRICAS SECUNDARIAS PARA TRANSICIÓN EN SLIDE 7 ---

function createTriangleGeometry(rad) {
  const pts = [];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    pts.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, 0));
  }
  const edges = [
    pts[0].x, pts[0].y, pts[0].z, pts[1].x, pts[1].y, pts[1].z,
    pts[1].x, pts[1].y, pts[1].z, pts[2].x, pts[2].y, pts[2].z,
    pts[2].x, pts[2].y, pts[2].z, pts[0].x, pts[0].y, pts[0].z
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3));
  return { pts, geo };
}

function createOctahedronGeometry(rad) {
  const pts = [
    new THREE.Vector3(rad, 0, 0), new THREE.Vector3(-rad, 0, 0),
    new THREE.Vector3(0, rad, 0), new THREE.Vector3(0, -rad, 0),
    new THREE.Vector3(0, 0, rad), new THREE.Vector3(0, 0, -rad)
  ];
  const edgesIdx = [
    0,2, 2,1, 1,3, 3,0, 0,4, 1,4, 2,4, 3,4, 0,5, 1,5, 2,5, 3,5
  ];
  const edges = [];
  for (let i = 0; i < edgesIdx.length; i += 2) {
    const p1 = pts[edgesIdx[i]];
    const p2 = pts[edgesIdx[i + 1]];
    edges.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3));
  return { pts, geo };
}

function createIcosahedronGeometry(rad) {
  const t = (1 + Math.sqrt(5)) / 2;
  const pts = [
    new THREE.Vector3(-1, t, 0), new THREE.Vector3(1, t, 0), new THREE.Vector3(-1, -t, 0), new THREE.Vector3(1, -t, 0),
    new THREE.Vector3(0, -1, t), new THREE.Vector3(0, 1, t), new THREE.Vector3(0, -1, -t), new THREE.Vector3(0, 1, -t),
    new THREE.Vector3(t, 0, -1), new THREE.Vector3(t, 0, 1), new THREE.Vector3(-t, 0, -1), new THREE.Vector3(-t, 0, 1)
  ].map(v => v.normalize().multiplyScalar(rad));

  const edges = [];
  const thresh = rad * 1.15;

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (pts[i].distanceTo(pts[j]) < thresh) {
        edges.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3));
  return { pts, geo };
}

const triangleData = createTriangleGeometry(1.5);
const octahedronData = createOctahedronGeometry(1.8);
const icosahedronData = createIcosahedronGeometry(2.1);

const transitionLineMat = new THREE.LineBasicMaterial({
  color: COLOR_AZUL_BORDE,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const transitionLines = new THREE.LineSegments(triangleData.geo, transitionLineMat);
structureGroup.add(transitionLines);

const transitionPointsGeo = new THREE.BufferGeometry();
const transitionPointsMat = new THREE.PointsMaterial({
  size: 0.45,
  map: pinkGlowTexture,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const transitionPoints = new THREE.Points(transitionPointsGeo, transitionPointsMat);
structureGroup.add(transitionPoints);

// Partícula rosa viajera de impacto
const pinkBulletGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
const pinkBulletMat = new THREE.PointsMaterial({
  size: 0.7,
  map: pinkGlowTexture,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const pinkBullet = new THREE.Points(pinkBulletGeo, pinkBulletMat);
scene.add(pinkBullet);

// --- 2. PARTÍCULAS FLOTANTES Y PLEXUS ---

const floatingCount = 50;
const floatingParticles = [];
const floatingVelocities = [];

for (let i = 0; i < floatingCount; i++) {
  const particle = new THREE.Vector3(
    (Math.random() - 0.5) * 8.5,
    (Math.random() - 0.5) * 7.5,
    (Math.random() - 0.5) * 5.0
  );
  floatingParticles.push(particle);

  floatingVelocities.push(new THREE.Vector3(
    (Math.random() - 0.5) * 0.003,
    (Math.random() - 0.5) * 0.003,
    (Math.random() - 0.5) * 0.003
  ));
}

const floatingGeometry = new THREE.BufferGeometry().setFromPoints(floatingParticles);
const floatingMaterial = new THREE.PointsMaterial({
  color: COLOR_AZUL_BORDE,
  size: 0.22,
  map: glowTexture,
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const floatingPoints = new THREE.Points(floatingGeometry, floatingMaterial);
structureGroup.add(floatingPoints);

const maxConnectDistance = 1.5;
const maxDynamicConnections = floatingCount * (mainVertices.length + floatingCount);
const dynamicPositions = new Float32Array(maxDynamicConnections * 6);

const dynamicGeometry = new THREE.BufferGeometry();
dynamicGeometry.setAttribute('position', new THREE.BufferAttribute(dynamicPositions, 3));

const dynamicLineMaterial = new THREE.LineBasicMaterial({
  color: 0x7000ff,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const dynamicLines = new THREE.LineSegments(dynamicGeometry, dynamicLineMaterial);
structureGroup.add(dynamicLines);

let isRotating = true;
let isParticlesPaused = false;
let accumulatedTime = 0;

let slide3AnimStartTime = 0;
let isSlide3Animating = false;
let activeCylinderMeshes = [];
let activeTargetVertices = [];

let slide4AnimStartTime = 0;
let isSlide4Animating = false;

let slide5AnimStartTime = 0;
let isSlide5Animating = false;

let slide7AnimStartTime = 0;
let isSlide7Animating = false;

let slide10AnimStartTime = 0;
let isSlide10Animating = false;

let slide11AnimStartTime = 0;
let isSlide11Animating = false;

let currentBulletStart = new THREE.Vector3();
let currentBulletTarget = new THREE.Vector3();

const clock = new THREE.Clock();

const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const indicator = document.getElementById('slide-indicator');

let currentSlide = 0;
const totalSlides = slides.length;

function findFrontalNodeIndex() {
  structureGroup.updateMatrixWorld();
  let selectedIndex = -1;
  let minXYDistance = Infinity;

  mainVertices.forEach((v, idx) => {
    const cameraSpacePos = v.clone().applyMatrix4(structureGroup.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
    const groupCenterCam = structureGroup.position.clone().applyMatrix4(camera.matrixWorldInverse);

    if (cameraSpacePos.z > groupCenterCam.z) {
      const dx = cameraSpacePos.x - groupCenterCam.x;
      const dy = cameraSpacePos.y - groupCenterCam.y;
      const distXY = Math.sqrt(dx * dx + dy * dy);

      if (distXY < minXYDistance) {
        minXYDistance = distXY;
        selectedIndex = idx;
      }
    }
  });

  if (selectedIndex === -1) {
    let maxZ = -Infinity;
    mainVertices.forEach((v, idx) => {
      const cameraSpacePos = v.clone().applyMatrix4(structureGroup.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      if (cameraSpacePos.z > maxZ) {
        maxZ = cameraSpacePos.z;
        selectedIndex = idx;
      }
    });
  }
  return selectedIndex;
}

function clearGreenPaths() {
  while (greenPathGroup.children.length > 0) {
    const obj = greenPathGroup.children.pop();
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  }
  activeCylinderMeshes = [];
}

function computeSlide3Paths(startIdx) {
  clearGreenPaths();

  const visited = new Map();
  const queue = [{ node: startIdx, depth: 0, path: [startIdx] }];
  visited.set(startIdx, 0);

  const validPaths = [];

  while (queue.length > 0) {
    const { node, depth, path } = queue.shift();

    if (depth > 0 && depth <= 3) {
      validPaths.push({ target: node, depth, path });
    }

    if (depth < 3) {
      for (const neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
          visited.set(neighbor, depth + 1);
          queue.push({ node: neighbor, depth: depth + 1, path: [...path, neighbor] });
        }
      }
    }
  }

  structureGroup.updateMatrixWorld();
  const groupCenterCam = structureGroup.position.clone().applyMatrix4(camera.matrixWorldInverse);

  const frontalPaths = validPaths.filter(p => {
    const v = mainVertices[p.target];
    const cameraSpacePos = v.clone().applyMatrix4(structureGroup.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
    return cameraSpacePos.z > groupCenterCam.z;
  });

  const selectedPaths = frontalPaths.slice(0, 5);

  activeTargetVertices = [];
  const edgesToRender = [];

  selectedPaths.forEach(p => {
    for (let i = 0; i < p.path.length - 1; i++) {
      edgesToRender.push({
        from: p.path[i],
        to: p.path[i + 1],
        step: i
      });
    }
    activeTargetVertices.push(p.target);
  });

  const cylinderMat = new THREE.MeshBasicMaterial({
    color: 0x00ff66,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  edgesToRender.forEach(edge => {
    const v1 = mainVertices[edge.from];
    const v2 = mainVertices[edge.to];
    const dist = v1.distanceTo(v2);

    const cylGeo = new THREE.CylinderGeometry(0.005, 0.005, 1, 8);
    cylGeo.translate(0, 0.5, 0);
    cylGeo.rotateX(Math.PI / 2);

    const cylMesh = new THREE.Mesh(cylGeo, cylinderMat.clone());
    cylMesh.position.copy(v1);
    cylMesh.lookAt(v2);
    cylMesh.scale.set(1, 1, 0);

    greenPathGroup.add(cylMesh);
    activeCylinderMeshes.push({
      mesh: cylMesh,
      targetLength: dist,
      step: edge.step
    });
  });

  const targetPos = greenTargetGeo.attributes.position.array;
  activeTargetVertices.forEach((targetIdx, idx) => {
    const v = mainVertices[targetIdx];
    targetPos[idx * 3] = v.x;
    targetPos[idx * 3 + 1] = v.y;
    targetPos[idx * 3 + 2] = v.z;
  });
  greenTargetGeo.attributes.position.needsUpdate = true;
}

function updateNarrativeState(slideIndex) {
  transitionLineMat.opacity = 0;
  transitionPointsMat.opacity = 0;
  pinkBulletMat.opacity = 0;
  slide10CylindersGroup.visible = false;
  allPurplePointsMat.opacity = 0;

  // Reiniciar opacidades de las partículas de la diapositiva 11 a cero
  const opacities = slide11BlueGeo.attributes.alpha.array;
  for (let i = 0; i < slide11BlueCount; i++) {
    opacities[i] = 0;
  }
  slide11BlueGeo.attributes.alpha.needsUpdate = true;

  if (slideIndex >= 4 && slideIndex <= 6) {
    structurePoints.visible = false;
    purplePoints.material.opacity = 1.0;
    yellowPoints.material.opacity = 1.0;
    greenPoints.material.opacity = 1.0;
    pinkPoints.material.opacity = 0;
    darkBluePoints.material.opacity = 0;
  } else if (slideIndex >= 7) {
    structurePoints.visible = false;
    purplePoints.material.opacity = 0;
    yellowPoints.material.opacity = 0;
    greenPoints.material.opacity = 0;
    pinkPoints.material.opacity = 1.0;
    darkBluePoints.material.opacity = 1.0;
  } else {
    structurePoints.visible = true;
    purplePoints.material.opacity = 0;
    yellowPoints.material.opacity = 0;
    greenPoints.material.opacity = 0;
    pinkPoints.material.opacity = 0;
    darkBluePoints.material.opacity = 0;
  }

  if (slideIndex === 1 || slideIndex === 2) {
    isRotating = false;
    isParticlesPaused = true;
    isSlide4Animating = false;
    isSlide5Animating = false;
    isSlide7Animating = false;
    isSlide10Animating = false;
    isSlide11Animating = false;

    structureLines.visible = true;
    floatingPoints.visible = true;
    dynamicLines.visible = true;
    slide4Materials.forEach(m => m.opacity = 0);
    flashMat.opacity = 0;
    structureGroup.scale.set(1, 1, 1);
    pinkPoints.position.set(0, 0, 0);
    darkBluePoints.position.set(0, 0, 0);

    const selectedIndex = findFrontalNodeIndex();
    const targetVertex = mainVertices[selectedIndex];

    highlightGeo.attributes.position.setXYZ(0, targetVertex.x, targetVertex.y, targetVertex.z);
    highlightGeo.attributes.position.needsUpdate = true;
    highlightMaterial.opacity = 1.0;

    const targetCirclePos = new THREE.Vector3(
      targetVertex.x - 2.8,
      targetVertex.y + 1.8,
      targetVertex.z
    );

    const worldPos = targetCirclePos.clone().applyMatrix4(structureGroup.matrixWorld);
    const ndcPos = worldPos.clone().project(camera);

    const marginX = 0.82;
    const marginY = 0.82;

    let clamped = false;
    if (ndcPos.x < -marginX) { ndcPos.x = -marginX; clamped = true; }
    if (ndcPos.x > marginX)  { ndcPos.x = marginX;  clamped = true; }
    if (ndcPos.y < -marginY) { ndcPos.y = -marginY; clamped = true; }
    if (ndcPos.y > marginY)  { ndcPos.y = marginY;  clamped = true; }

    let circleCenter = targetCirclePos;
    if (clamped) {
      const unprojectedWorld = ndcPos.unproject(camera);
      const dir = unprojectedWorld.sub(camera.position).normalize();
      const distanceZ = (worldPos.z - camera.position.z) / dir.z;
      const correctedWorld = camera.position.clone().add(dir.multiplyScalar(distanceZ));
      
      circleCenter = correctedWorld.applyMatrix4(structureGroup.matrixWorld.clone().invert());
    }

    const direction = new THREE.Vector3().subVectors(circleCenter, targetVertex);
    const totalDistance = direction.length();
    const lineDistance = Math.max(0.01, totalDistance - CIRCLE_RADIUS);

    direction.normalize();

    pointerLineMesh.position.copy(targetVertex);
    pointerLineMesh.scale.set(lineDistance, 1, 1);

    const angle = Math.atan2(direction.y, direction.x);
    pointerLineMesh.rotation.set(0, 0, angle);

    pointerLineMat.opacity = 0.95;

    imageNodeGroup.position.copy(circleCenter);
    imageNodeGroup.rotation.set(
      -structureGroup.rotation.x,
      -structureGroup.rotation.y,
      -structureGroup.rotation.z
    );
    imageNodeGroup.visible = true;

    if (slideIndex === 2) {
      computeSlide3Paths(selectedIndex);
      slide3AnimStartTime = clock.getElapsedTime();
      isSlide3Animating = true;
      greenTargetMat.opacity = 1.0;
    } else {
      isSlide3Animating = false;
      clearGreenPaths();
      greenTargetMat.opacity = 0;
    }

  } else if (slideIndex === 3) {
    isRotating = false;
    isParticlesPaused = true;
    isSlide3Animating = false;
    isSlide5Animating = false;
    isSlide7Animating = false;
    isSlide10Animating = false;
    isSlide11Animating = false;

    highlightMaterial.opacity = 0;
    pointerLineMat.opacity = 0;
    imageNodeGroup.visible = false;
    clearGreenPaths();
    greenTargetMat.opacity = 0;
    flashMat.opacity = 0;

    structureGroup.rotation.set(0, 0, 0);
    structureLines.visible = true;
    floatingPoints.visible = true;
    dynamicLines.visible = true;
    pinkPoints.position.set(0, 0, 0);
    darkBluePoints.position.set(0, 0, 0);

    slide4PointsArray.forEach((pts) => {
      pts.geometry.attributes.position.setXYZ(0, 0, 0, 0);
      pts.geometry.attributes.position.needsUpdate = true;
    });

    slide4AnimStartTime = clock.getElapsedTime();
    isSlide4Animating = true;

  } else if (slideIndex === 4) {
    isRotating = false;
    isParticlesPaused = true;
    isSlide3Animating = false;
    isSlide4Animating = false;
    isSlide7Animating = false;
    isSlide10Animating = false;
    isSlide11Animating = false;

    highlightMaterial.opacity = 0;
    pointerLineMat.opacity = 0;
    imageNodeGroup.visible = false;
    clearGreenPaths();
    greenTargetMat.opacity = 0;
    structureLines.visible = false;
    structurePoints.visible = false;
    purplePoints.material.opacity = 0;
    yellowPoints.material.opacity = 0;
    greenPoints.material.opacity = 0;
    pinkPoints.material.opacity = 0;
    darkBluePoints.material.opacity = 0;
    floatingPoints.visible = false;
    dynamicLines.visible = false;

    structureGroup.rotation.set(0, 0, 0);

    slide5AnimStartTime = clock.getElapsedTime();
    isSlide5Animating = true;

  } else if (slideIndex === 6) {
    // --- ANIMACIÓN ESPECIAL DIAPOSITIVA 7 (ÍNDICE 6) ---
    isRotating = true;
    isParticlesPaused = false;
    isSlide3Animating = false;
    isSlide4Animating = false;
    isSlide5Animating = false;
    isSlide10Animating = false;
    isSlide11Animating = false;

    highlightMaterial.opacity = 0;
    pointerLineMat.opacity = 0;
    imageNodeGroup.visible = false;
    clearGreenPaths();
    greenTargetMat.opacity = 0;

    slide7AnimStartTime = clock.getElapsedTime();
    isSlide7Animating = true;

  } else if (slideIndex === 9) {
    // --- ANIMACIÓN ESPECIAL DIAPOSITIVA 10 (ÍNDICE 9) ---
    isRotating = true;
    isParticlesPaused = false;
    isSlide3Animating = false;
    isSlide4Animating = false;
    isSlide5Animating = false;
    isSlide7Animating = false;
    isSlide11Animating = false;

    highlightMaterial.opacity = 0;
    pointerLineMat.opacity = 0;
    imageNodeGroup.visible = false;
    clearGreenPaths();
    greenTargetMat.opacity = 0;

    structureLines.visible = false;
    slide10CylindersGroup.visible = true;

    setupSlide10Propagation();
    slide10AnimStartTime = clock.getElapsedTime();
    isSlide10Animating = true;

  } else if (slideIndex === 10) {
    // --- ANIMACIÓN ESPECIAL DIAPOSITIVA 11 (ÍNDICE 10): APARICIÓN SECUENCIAL UNA A UNA ---
    isRotating = true;
    isParticlesPaused = false;
    isSlide3Animating = false;
    isSlide4Animating = false;
    isSlide5Animating = false;
    isSlide7Animating = false;
    isSlide10Animating = false;

    highlightMaterial.opacity = 0;
    pointerLineMat.opacity = 0;
    imageNodeGroup.visible = false;
    clearGreenPaths();
    greenTargetMat.opacity = 0;

    structureLines.visible = true;
    floatingPoints.visible = true;
    dynamicLines.visible = true;

    slide11AnimStartTime = clock.getElapsedTime();
    isSlide11Animating = true;

  } else {
    // --- NARRATIVA Y EFECTOS (RESTO DE DIAPOSITIVAS) ---
    isRotating = true;
    isParticlesPaused = false;
    isSlide3Animating = false;
    isSlide4Animating = false;
    isSlide5Animating = false;
    isSlide7Animating = false;
    isSlide10Animating = false;
    isSlide11Animating = false;

    structureLines.visible = true;
    floatingPoints.visible = true;
    dynamicLines.visible = true;
    structureGroup.scale.set(1, 1, 1);

    highlightMaterial.opacity = 0;
    pointerLineMat.opacity = 0;
    imageNodeGroup.visible = false;
    clearGreenPaths();
    greenTargetMat.opacity = 0;
    slide4Materials.forEach(m => m.opacity = 0);
    flashMat.opacity = 0;

    pinkPoints.position.set(0, 0, 0);
    darkBluePoints.position.set(0, 0, 0);
    structureGroup.rotation.z = 0;
    floatingMaterial.opacity = 0.65;

    if (slideIndex === 5) {
      dynamicLineMaterial.opacity = 0.7;
    } else if (slideIndex === 7) {
      dynamicLineMaterial.opacity = 0.6;
    } else if (slideIndex === 8) {
      // Slide 9 ("Una visión. Dos generaciones")
    } else if (slideIndex === 11) {
      dynamicLineMaterial.opacity = 0.8;
    } else if (slideIndex === 12) {
      dynamicLineMaterial.opacity = 0.25;
      floatingMaterial.opacity = 0.35;
    }
  }
}

function updateSlides() {
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });

  indicator.textContent = `${currentSlide + 1} / ${totalSlides}`;

  if (mainLineMaterial && dynamicLineMaterial) {
    switch (currentSlide) {
      case 0:
        mainLineMaterial.color.setHex(0x00ffff);
        dynamicLineMaterial.color.setHex(0x7000ff);
        break;
      default:
        mainLineMaterial.color.setHex(COLOR_AZUL_BORDE);
        dynamicLineMaterial.color.setHex(0x5533ff);
        break;
    }
  }

  updateNarrativeState(currentSlide);
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    updateSlides();
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    updateSlides();
  }
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});

function setupBulletTrajectory() {
  const angle = Math.random() * Math.PI * 2;
  const dist = 8.0;
  currentBulletStart.set(Math.cos(angle) * dist, Math.sin(angle) * dist, (Math.random() - 0.5) * 4.0);
  currentBulletTarget.copy(structureGroup.position);
}

function animate() {
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  if (isRotating) {
    const rotSpeed = (currentSlide === 12) ? 0.04 : 0.15;
    accumulatedTime += delta * (rotSpeed / 0.15);
    structureGroup.rotation.y = accumulatedTime * rotSpeed;
    
    let pulseScaleOffset = 0;
    if (currentSlide === 11) {
      pulseScaleOffset = Math.sin(elapsedTime * 4.0) * 0.04;
    }
    
    const baseScale = (currentSlide === 9) ? 1.08 : 1.0;
    const finalScale = baseScale + pulseScaleOffset;
    if (!isSlide7Animating) {
      structureGroup.scale.set(finalScale, finalScale, finalScale);
    }

    structureGroup.rotation.x = Math.sin(accumulatedTime * 0.1) * 0.25;

    if (currentSlide === 8) {
      const hemisOffset = Math.sin(elapsedTime * 1.5) * 0.6;
      pinkPoints.position.x = -0.8 - hemisOffset;
      darkBluePoints.position.x = 0.8 + hemisOffset;
      structureGroup.rotation.z = Math.sin(elapsedTime * 0.8) * 0.2;
    } else {
      pinkPoints.position.set(0, 0, 0);
      darkBluePoints.position.set(0, 0, 0);
      structureGroup.rotation.z = Math.cos(accumulatedTime * 0.08) * 0.12;
    }
  }

  if (!isParticlesPaused) {
    const floatPositions = floatingGeometry.attributes.position.array;
    const speedMultiplier = (currentSlide === 10) ? 1.8 : 1.0;

    for (let i = 0; i < floatingCount; i++) {
      const vel = floatingVelocities[i].clone().multiplyScalar(speedMultiplier);
      floatingParticles[i].add(vel);

      if (Math.abs(floatingParticles[i].x) > 4.8) floatingVelocities[i].x *= -1;
      if (Math.abs(floatingParticles[i].y) > 4.2) floatingVelocities[i].y *= -1;
      if (Math.abs(floatingParticles[i].z) > 3.0) floatingVelocities[i].z *= -1;

      floatPositions[i * 3] = floatingParticles[i].x;
      floatPositions[i * 3 + 1] = floatingParticles[i].y;
      floatPositions[i * 3 + 2] = floatingParticles[i].z;
    }
    floatingGeometry.attributes.position.needsUpdate = true;
  }

  if (isSlide3Animating) {
    const totalProgress = Math.min((elapsedTime - slide3AnimStartTime) / 5.0, 1.0);

    activeCylinderMeshes.forEach(item => {
      const stepStart = item.step * 0.28;
      const stepEnd = stepStart + 0.35;
      const localProgress = Math.max(0, Math.min(1, (totalProgress - stepStart) / (stepEnd - stepStart)));

      item.mesh.scale.set(1, 1, item.targetLength * localProgress);
    });

    greenTargetMat.opacity = Math.min(1.0, totalProgress * 1.5);
  }

  if (isSlide4Animating) {
    const timeInSlide4 = elapsedTime - slide4AnimStartTime;
    const progress = Math.min(timeInSlide4 / 1.8, 1.0);

    if (progress < 1.0) {
      const scaleVal = 1.0 - progress;
      structureGroup.scale.set(scaleVal, scaleVal, scaleVal);
      slide4Materials.forEach(m => m.opacity = 0);
      flashMat.opacity = 0;
    } else {
      structureLines.visible = false;
      structurePoints.visible = false;
      purplePoints.material.opacity = 0;
      yellowPoints.material.opacity = 0;
      greenPoints.material.opacity = 0;
      pinkPoints.material.opacity = 0;
      darkBluePoints.material.opacity = 0;
      floatingPoints.visible = false;
      dynamicLines.visible = false;
      structureGroup.scale.set(1, 1, 1);

      const flashProgress = Math.min((timeInSlide4 - 1.8) / 0.9, 1.0);
      if (flashProgress <= 1.0) {
        flashMat.opacity = Math.sin(flashProgress * Math.PI);
        slide4Materials.forEach(m => m.opacity = flashProgress);
      } else {
        flashMat.opacity = 0;
        slide4Materials.forEach(m => m.opacity = 1.0);
      }

      const moveProgress = Math.min((timeInSlide4 - 1.8) / 0.8, 1.0);
      const easedMove = 1 - Math.pow(1 - moveProgress, 3);

      slide4TargetPositionsX.forEach((targetX, idx) => {
        const currentX = targetX * easedMove;
        const geo = slide4PointsArray[idx].geometry;
        geo.attributes.position.setXYZ(0, currentX, 0, 0);
        geo.attributes.position.needsUpdate = true;
      });
    }
  }

  if (isSlide5Animating) {
    const slide5Time = elapsedTime - slide5AnimStartTime;

    if (slide5Time < 1.5) {
      slide4Materials.forEach(m => m.opacity = 1.0);
      const progress = slide5Time / 1.5;

      slide4TargetPositionsX.forEach((targetX, idx) => {
        const startX = targetX;
        const startY = 0;
        const startAngle = Math.atan2(startY, startX);
        const startRadius = Math.hypot(startX, startY);

        const angle = startAngle + progress * Math.PI * 6;
        const currentRadius = startRadius * (1.0 - progress);

        const x = Math.cos(angle) * currentRadius;
        const y = Math.sin(angle) * currentRadius;

        const geo = slide4PointsArray[idx].geometry;
        geo.attributes.position.setXYZ(0, x, y, 0);
        geo.attributes.position.needsUpdate = true;
      });
      flashMat.opacity = 0;

    } else if (slide5Time >= 1.5 && slide5Time < 2.4) {
      slide4Materials.forEach(m => m.opacity = 0);
      const flashProgress = (slide5Time - 1.5) / 0.9;
      flashMat.opacity = Math.sin(flashProgress * Math.PI);

    } else {
      flashMat.opacity = 0;
      structureLines.visible = true;
      structurePoints.visible = false;
      
      if (currentSlide >= 4 && currentSlide <= 6) {
        purplePoints.material.opacity = 1.0;
        yellowPoints.material.opacity = 1.0;
        greenPoints.material.opacity = 1.0;
      } else if (currentSlide >= 7) {
        pinkPoints.material.opacity = 1.0;
        darkBluePoints.material.opacity = 1.0;
      }
      
      floatingPoints.visible = true;
      dynamicLines.visible = true;

      const expandProgress = Math.min((slide5Time - 2.4) / 1.2, 1.0);
      const scaleVal = expandProgress === 1 ? 1 : 1 + 2.7 * Math.pow(expandProgress - 1, 3) + 1.7 * Math.pow(expandProgress - 1, 2);
      const clampedScale = Math.max(0.01, Math.min(1.0, scaleVal));

      structureGroup.scale.set(clampedScale, clampedScale, clampedScale);

      if (expandProgress >= 1.0) {
        isSlide5Animating = false;
      }
    }
  }

  // --- ANIMACIÓN LENTA Y SUAVE EN DIAPOSITIVA 7 ---
  if (isSlide7Animating) {
    const t = elapsedTime - slide7AnimStartTime;

    if (t < 2.5) {
      const colProgress = t / 2.5;
      const s = Math.max(0.001, 1.0 - colProgress);
      structureGroup.scale.set(s, s, s);
      structureLines.visible = true;
      purplePoints.material.opacity = 1 - colProgress;
      yellowPoints.material.opacity = 1 - colProgress;
      greenPoints.material.opacity = 1 - colProgress;
      transitionLineMat.opacity = 0;
      transitionPointsMat.opacity = 0;
      flashMat.opacity = 0;
      pinkBulletMat.opacity = 0;

    } else if (t >= 2.5 && t < 4.0) {
      structureGroup.scale.set(0.3, 0.3, 0.3);
      structureLines.visible = false;
      purplePoints.material.opacity = 0;
      yellowPoints.material.opacity = 0;
      greenPoints.material.opacity = 0;
      const flashP = (t - 2.5) / 1.5;
      flashMat.opacity = Math.sin(flashP * Math.PI);

      if (flashP > 0.5) {
        transitionLines.geometry = triangleData.geo;
        transitionLineMat.opacity = 1.0;
        transitionPointsGeo.setFromPoints(triangleData.pts);
        transitionPointsMat.opacity = 1.0;
      }

    } else if (t >= 4.0 && t < 8.5) {
      flashMat.opacity = 0;
      const stepT = t - 4.0;
      if (stepT < 0.1) setupBulletTrajectory();

      if (stepT < 2.0) {
        const bulletP = stepT / 2.0;
        const curPos = new THREE.Vector3().lerpVectors(currentBulletStart, currentBulletTarget, bulletP);
        pinkBulletGeo.attributes.position.setXYZ(0, curPos.x, curPos.y, curPos.z);
        pinkBulletGeo.attributes.position.needsUpdate = true;
        pinkBulletMat.opacity = 1.0;
        structureGroup.scale.set(0.3, 0.3, 0.3);
      } else {
        pinkBulletMat.opacity = 0;
        transitionLines.geometry = octahedronData.geo;
        transitionPointsGeo.setFromPoints(octahedronData.pts);
        
        const growP = Math.min((stepT - 2.0) / 2.5, 1.0);
        const currentScale = THREE.MathUtils.lerp(0.3, 0.55, growP);
        structureGroup.scale.set(currentScale, currentScale, currentScale);
      }

    } else if (t >= 8.5 && t < 13.0) {
      const stepT = t - 8.5;
      if (stepT < 0.1) setupBulletTrajectory();

      if (stepT < 2.0) {
        const bulletP = stepT / 2.0;
        const curPos = new THREE.Vector3().lerpVectors(currentBulletStart, currentBulletTarget, bulletP);
        pinkBulletGeo.attributes.position.setXYZ(0, curPos.x, curPos.y, curPos.z);
        pinkBulletGeo.attributes.position.needsUpdate = true;
        pinkBulletMat.opacity = 1.0;
        structureGroup.scale.set(0.55, 0.55, 0.55);
      } else {
        pinkBulletMat.opacity = 0;
        transitionLines.geometry = icosahedronData.geo;
        transitionPointsGeo.setFromPoints(icosahedronData.pts);
        
        const growP = Math.min((stepT - 2.0) / 2.5, 1.0);
        const currentScale = THREE.MathUtils.lerp(0.55, 0.8, growP);
        structureGroup.scale.set(currentScale, currentScale, currentScale);
      }

    } else if (t >= 13.0 && t < 17.5) {
      const stepT = t - 13.0;
      if (stepT < 0.1) setupBulletTrajectory();

      if (stepT < 2.0) {
        const bulletP = stepT / 2.0;
        const curPos = new THREE.Vector3().lerpVectors(currentBulletStart, currentBulletTarget, bulletP);
        pinkBulletGeo.attributes.position.setXYZ(0, curPos.x, curPos.y, curPos.z);
        pinkBulletGeo.attributes.position.needsUpdate = true;
        pinkBulletMat.opacity = 1.0;
        structureGroup.scale.set(0.8, 0.8, 0.8);
      } else {
        pinkBulletMat.opacity = 0;
        transitionLineMat.opacity = 0;
        transitionPointsMat.opacity = 0;
        structureLines.visible = true;
        purplePoints.material.opacity = 1.0;
        yellowPoints.material.opacity = 1.0;
        greenPoints.material.opacity = 1.0;

        const growP = Math.min((stepT - 2.0) / 2.5, 1.0);
        const currentScale = THREE.MathUtils.lerp(0.8, 1.0, growP);
        structureGroup.scale.set(currentScale, currentScale, currentScale);
      }

    } else {
      isSlide7Animating = false;
      structureGroup.scale.set(1, 1, 1);
      transitionLineMat.opacity = 0;
      transitionPointsMat.opacity = 0;
      pinkBulletMat.opacity = 0;
      structureLines.visible = true;
      purplePoints.material.opacity = 1.0;
      yellowPoints.material.opacity = 1.0;
      greenPoints.material.opacity = 1.0;
    }
  }

  // --- ANIMACIÓN PROPAGACIÓN Y VÉRTICES MORADOS EN DIAPOSITIVA 10 ---
  if (isSlide10Animating) {
    const t = elapsedTime - slide10AnimStartTime;
    const duration = 4.0;
    const progress = Math.min(t / duration, 1.0);

    slide10Cylinders.forEach(item => {
      const halfDist = item.targetDist * 0.5;
      item.mesh1.scale.set(1, 1, halfDist * progress);
      item.mesh2.scale.set(1, 1, halfDist * progress);
    });

    if (progress > 0.8) {
      const pointFade = (progress - 0.8) / 0.2;
      pinkPoints.material.opacity = 1.0 - pointFade;
      darkBluePoints.material.opacity = 1.0 - pointFade;
      allPurplePointsMat.opacity = pointFade;
    } else {
      pinkPoints.material.opacity = 1.0;
      darkBluePoints.material.opacity = 1.0;
      allPurplePointsMat.opacity = 0;
    }

    if (progress >= 1.0) {
      isSlide10Animating = false;
      pinkPoints.material.opacity = 0;
      darkBluePoints.material.opacity = 0;
      allPurplePointsMat.opacity = 1.0;
    }
  }

  // --- ANIMACIÓN APARICIÓN SECUENCIAL (UNA A UNA) Y ÓRBITA EN DIAPOSITIVA 11 ---
  if (isSlide11Animating) {
    const t = elapsedTime - slide11AnimStartTime;
    const interval = 0.12; // Tiempo en segundos entre la aparición de cada partícula
    const fadeDuration = 0.4; // Duración del desvanecimiento suave individual
    const opacities = slide11BlueGeo.attributes.alpha.array;

    for (let i = 0; i < slide11BlueCount; i++) {
      const startTime = i * interval;
      if (t >= startTime) {
        const particleProgress = Math.min((t - startTime) / fadeDuration, 1.0);
        opacities[i] = particleProgress * 0.95;
      } else {
        opacities[i] = 0;
      }
    }
    slide11BlueGeo.attributes.alpha.needsUpdate = true;

    // Órbita suave de las partículas alrededor del centro
    const pos = slide11BlueGeo.attributes.position.array;
    for (let i = 0; i < slide11BlueCount; i++) {
      const speed = slide11BlueSpeeds[i];
      const angleOffset = t * 0.25 * speed;

      const targetPos = slide11BlueTargetPositions[i];
      const cosA = Math.cos(angleOffset);
      const sinA = Math.sin(angleOffset);

      pos[i * 3] = targetPos.x * cosA - targetPos.z * sinA;
      pos[i * 3 + 1] = targetPos.y + Math.sin(t * 0.8 + i) * 0.12;
      pos[i * 3 + 2] = targetPos.x * sinA + targetPos.z * cosA;
    }
    slide11BlueGeo.attributes.position.needsUpdate = true;
  }

  let lineVertexIndex = 0;
  const activeConnectDistance = (currentSlide === 5 || currentSlide === 6) ? maxConnectDistance * 1.3 : maxConnectDistance;

  for (let i = 0; i < floatingCount; i++) {
    for (let j = 0; j < mainVertices.length; j++) {
      const dist = floatingParticles[i].distanceTo(mainVertices[j]);

      if (dist < activeConnectDistance) {
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].x;
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].y;
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].z;

        dynamicPositions[lineVertexIndex++] = mainVertices[j].x;
        dynamicPositions[lineVertexIndex++] = mainVertices[j].y;
        dynamicPositions[lineVertexIndex++] = mainVertices[j].z;
      }
    }

    for (let k = i + 1; k < floatingCount; k++) {
      const dist = floatingParticles[i].distanceTo(floatingParticles[k]);

      if (dist < activeConnectDistance * 0.7) {
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].x;
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].y;
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].z;

        dynamicPositions[lineVertexIndex++] = floatingParticles[k].x;
        dynamicPositions[lineVertexIndex++] = floatingParticles[k].y;
        dynamicPositions[lineVertexIndex++] = floatingParticles[k].z;
      }
    }
  }

  dynamicGeometry.setDrawRange(0, lineVertexIndex / 3);
  dynamicGeometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Inicializar
updateSlides();
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (slide11BlueMat.uniforms) {
    slide11BlueMat.uniforms.size.value = 0.55 * (window.devicePixelRatio || 1.0);
  }
  updateNarrativeState(currentSlide);
});