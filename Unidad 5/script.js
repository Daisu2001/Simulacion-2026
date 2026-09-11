// --- CONFIGURACIÓN DE THREE.JS Y DODECAEDRO PLEXUS CON GLOW ---

const canvas = document.getElementById('webgl');

// Escena, Cámara y Renderer
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

// Grupo contenedor para la rotación 3D del Dodecaedro
const structureGroup = new THREE.Group();
structureGroup.position.set(2.2, 0, 0);
scene.add(structureGroup);

// --- CREACIÓN DE TEXTURA DE GLOW PARA NODOS Y LÍNEAS ---

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

const glowTexture = createGlowTexture();

// --- 1. ESTRUCTURA BASE: DODECAEDRO 3D (20 VÉRTICES, 30 ARISTAS) ---

const radius = 2.4;
const phi = (1 + Math.sqrt(5)) / 2; // Razón Áurea
const a = 1 / Math.sqrt(3);
const b = a / phi;
const c = a * phi;

// Vértices matemáticos del Dodecaedro regular
const rawVertices = [
  new THREE.Vector3(-a, -a, -a), new THREE.Vector3(-a, -a,  a),
  new THREE.Vector3(-a,  a, -a), new THREE.Vector3(-a,  a,  a),
  new THREE.Vector3( a, -a, -a), new THREE.Vector3( a, -a,  a),
  new THREE.Vector3( a,  a, -a), new THREE.Vector3( a,  a,  a),
  
  new THREE.Vector3( 0, -b, -c), new THREE.Vector3( 0, -b,  c),
  new THREE.Vector3( 0,  b, -c), new THREE.Vector3( 0,  b,  c),
  
  new THREE.Vector3(-b, -c,  0), new THREE.Vector3(-b,  c,  0),
  new THREE.Vector3( b, -c,  0), new THREE.Vector3( b,  c,  0),
  
  new THREE.Vector3(-c,  0, -b), new THREE.Vector3(-c,  0,  b),
  new THREE.Vector3( c,  0, -b), new THREE.Vector3( c,  0,  b)
];

// Escalado por radio
const dodecaVertices = rawVertices.map(v => v.multiplyScalar(radius));

// Extracción de aristas del Dodecaedro por distancia geométrica exacta
const edgeThreshold = 1.45 * radius; // Distancia límite entre vértices adyacentes
const dodecaLinePositions = [];

for (let i = 0; i < dodecaVertices.length; i++) {
  for (let j = i + 1; j < dodecaVertices.length; j++) {
    const dist = dodecaVertices[i].distanceTo(dodecaVertices[j]);
    if (dist < edgeThreshold) {
      dodecaLinePositions.push(
        dodecaVertices[i].x, dodecaVertices[i].y, dodecaVertices[i].z,
        dodecaVertices[j].x, dodecaVertices[j].y, dodecaVertices[j].z
      );
    }
  }
}

// Geometría y Material de las Aristas del Dodecaedro
const dodecaLineGeometry = new THREE.BufferGeometry();
dodecaLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dodecaLinePositions, 3));

const mainLineMaterial = new THREE.LineBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});

const dodecaStructureLines = new THREE.LineSegments(dodecaLineGeometry, mainLineMaterial);
structureGroup.add(dodecaStructureLines);

// Vértices / Nodos Emisivos del Dodecaedro
const dodecaPointsGeometry = new THREE.BufferGeometry().setFromPoints(dodecaVertices);
const dodecaPointsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.45,
  map: glowTexture,
  transparent: true,
  opacity: 1.0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const dodecaStructurePoints = new THREE.Points(dodecaPointsGeometry, dodecaPointsMaterial);
structureGroup.add(dodecaStructurePoints);

// --- 2. PARTÍCULAS SUELTAS FLOTANTES EN EL ENTORNO ---

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
  color: 0x00d2ff,
  size: 0.22,
  map: glowTexture,
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const floatingPoints = new THREE.Points(floatingGeometry, floatingMaterial);
structureGroup.add(floatingPoints);

// --- 3. CONEXIONES DINÁMICAS SUAVES (PLEXUS EFFECT) ---

const maxConnectDistance = 2.4;
const maxDynamicConnections = floatingCount * (dodecaVertices.length + floatingCount);
const dynamicPositions = new Float32Array(maxDynamicConnections * 6);

const dynamicGeometry = new THREE.BufferGeometry();
dynamicGeometry.setAttribute('position', new THREE.BufferAttribute(dynamicPositions, 3));

const dynamicLineMaterial = new THREE.LineBasicMaterial({
  color: 0x7000ff,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending
});

const dynamicLines = new THREE.LineSegments(dynamicGeometry, dynamicLineMaterial);
structureGroup.add(dynamicLines);

// --- LOOP DE ANIMACIÓN Y ROTACIÓN 3D ---

const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Rotación 3D continua del Dodecaedro
  structureGroup.rotation.y = elapsedTime * 0.15;
  structureGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.25;
  structureGroup.rotation.z = Math.cos(elapsedTime * 0.08) * 0.12;

  // Actualizar la posición de las partículas sueltas
  const floatPositions = floatingGeometry.attributes.position.array;

  for (let i = 0; i < floatingCount; i++) {
    floatingParticles[i].add(floatingVelocities[i]);

    if (Math.abs(floatingParticles[i].x) > 4.8) floatingVelocities[i].x *= -1;
    if (Math.abs(floatingParticles[i].y) > 4.2) floatingVelocities[i].y *= -1;
    if (Math.abs(floatingParticles[i].z) > 3.0) floatingVelocities[i].z *= -1;

    floatPositions[i * 3] = floatingParticles[i].x;
    floatPositions[i * 3 + 1] = floatingParticles[i].y;
    floatPositions[i * 3 + 2] = floatingParticles[i].z;
  }
  floatingGeometry.attributes.position.needsUpdate = true;

  // Cálculo dinámico de conexiones plexus
  let lineVertexIndex = 0;

  for (let i = 0; i < floatingCount; i++) {
    // Conectar partículas flotantes con los vértices del Dodecaedro
    for (let j = 0; j < dodecaVertices.length; j++) {
      const dist = floatingParticles[i].distanceTo(dodecaVertices[j]);

      if (dist < maxConnectDistance) {
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].x;
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].y;
        dynamicPositions[lineVertexIndex++] = floatingParticles[i].z;

        dynamicPositions[lineVertexIndex++] = dodecaVertices[j].x;
        dynamicPositions[lineVertexIndex++] = dodecaVertices[j].y;
        dynamicPositions[lineVertexIndex++] = dodecaVertices[j].z;
      }
    }

    // Conectar partículas flotantes entre sí
    for (let k = i + 1; k < floatingCount; k++) {
      const dist = floatingParticles[i].distanceTo(floatingParticles[k]);

      if (dist < maxConnectDistance * 0.7) {
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

animate();

// Ajuste dinámico de pantalla
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- LÓGICA DE CONTROL DE DIAPOSITIVAS ---

const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const indicator = document.getElementById('slide-indicator');

let currentSlide = 0;
const totalSlides = slides.length;

function updateSlides() {
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });

  indicator.textContent = `${currentSlide + 1} / ${totalSlides}`;
  onSlideChange(currentSlide);
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

function onSlideChange(slideIndex) {
  if (mainLineMaterial && dynamicLineMaterial) {
    switch (slideIndex) {
      case 0:
        mainLineMaterial.color.setHex(0x00ffff);
        dynamicLineMaterial.color.setHex(0x7000ff);
        break;
      case 1:
        mainLineMaterial.color.setHex(0x7000ff);
        dynamicLineMaterial.color.setHex(0x00d2ff);
        break;
      default:
        mainLineMaterial.color.setHex(0x00d2ff);
        dynamicLineMaterial.color.setHex(0x5533ff);
        break;
    }
  }
}