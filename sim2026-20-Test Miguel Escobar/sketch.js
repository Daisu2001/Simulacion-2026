// Variable para controlar el radio promedio del anillo actual
let meanRadius = 80;

function setup() {
  createCanvas(640, 480); // Un lienzo más grande para ver mejor los anillos
  background(255);
}

function draw() {
  // Solo genera partículas si el mouse está presionado
  if (mouseIsPressed) {
    // ---- LÓGICA DE ANILLO (Coordenadas Polares) ----
    
    // 1. Elegimos un ángulo completamente aleatorio alrededor del centro (0 a 2π)
    let angle = random(TWO_PI);
    
    // 2. Elegimos un radio aleatorio usando la distribución normal.
    // Usamos 'meanRadius' como media y una desviación estándar pequeña (15) para que el anillo sea definido.
    let currentRadius = randomGaussian(meanRadius, 15);
    
    // 3. Convertimos de Polares (ángulo, radio) a Cartesianas (dx, dy)
    // Usamos trigonometría para calcular el desplazamiento desde el centro
    let dx = currentRadius * cos(angle);
    let dy = currentRadius * sin(angle);
    
    // 4. Calculamos la posición final relativa al mouse
    let fx = mouseX + dx;
    let fy = mouseY + dy;

    // ---- DIBUJO DE LA PARTÍCULA ----
    noStroke();
    
    // Para que se vea genial, vamos a asignar el color basado en el ángulo
    colorMode(HSB); // Usamos HSB para un gradiente de color circular
    let hueValue = degrees(angle); // Ángulo en grados para el tono (0-360)
    fill(hueValue, 80, 80, 0.05); // Transparencia muy baja (5%)
    colorMode(RGB); // Volvemos a RGB para no afectar otros dibujos
    
    // Dibujamos un círculo pequeño (puedes variar su tamaño)
    circle(fx, fy, 8); 
  }
}

// Opcional: Cambia el tamaño del anillo al azar al hacer clic
function mousePressed() {
  meanRadius = random(30, 150); // El nuevo anillo tendrá un radio promedio aleatorio
}