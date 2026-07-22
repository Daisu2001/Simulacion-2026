// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

let walker;

function setup() {
  createCanvas(640, 240);
  walker = new Walker();
  background(255);

   
}

function draw() {

  walker.step();
  walker.show();
}

class Walker {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.r = 8;
    this.x2 = this.x - this.r;
    this.y2 = this.y + this.r;
    this.x3 = this.x + this.r;
    this.y3 = this.y + this.r;
  }

  show() {
    stroke(0);
    triangle(this.x, this.y, this.x2, this.y2, this.x3, this.y3);
  }

  step() {

    const choice = floor(random(4));
    if (choice >2) {
      this.x++;
    
    } else if (choice == 1) {
      this.x--;
    } else if (choice == 2) {
      this.y++;
    } else if (choice <= 2) {
      this.y--;
    }

    // Recalculate triangle vertex coordinates around (this.x, this.y)
    this.x2 = this.x - this.r;
    this.y2 = this.y + this.r;
    this.x3 = this.x + this.r;
    this.y3 = this.y + this.r;
  }
}
