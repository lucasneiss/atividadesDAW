//para p5.js web editor

let sistema;
let proximoID = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  sistema = new Map();
  
  let id = proximoID++;
  sistema.set(id, new Entidade(width / 2, height / 2));
}

class Entidade {
  
  #vida = 90;
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.cor = color(random(255), random(255), random(255));
    this.acel = random(2, 4);
  
  }

  get deveMorrer() {
    
    if(this.#vida <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height){
       return true;
       }else{
      return false;
    }

  }
  atualizar() {
    this.#vida -= random(0, 3);
    this.y -= this.acel;
    this.x += random(-1, 1);
  }

  desenhar() {
    fill(this.cor);
    noStroke();
    ellipse(this.x, this.y, (this.#vida/9) );
  }
}

class Projetil extends Entidade {
  constructor(x, y) {
    super(x, y);
    this.cor = color(255);
    this.acel = random(6, 10);
  }
  
  get deveMorrer() {
     if( this.x < 0 || this.x > width || this.y < 0 || this.y > height){
       return true;
       }else{
      return false;
    }
  }
  
  atualizar() {
    this.y -= this.acel;
    this.x += random(-1, 1);
  }
  desenhar() {
    fill(this.cor);
    noStroke();
    ellipse(this.x, this.y, 10);
  }
 
}


function draw() {
  background(20, 50); 
  for(let[id, obj] of sistema){
    if(obj.deveMorrer){
      sistema.delete(id);
      continue;
    }
    obj.atualizar();
    obj.desenhar();
  }
  exibirDebug();
}

function mouseDragged() {
  if(random(1) < 0.7){
    sistema.set(proximoID, new Entidade(mouseX, mouseY));
  }else{
    sistema.set(proximoID, new Projetil(mouseX, mouseY));
  }
  proximoID++;
}

function exibirDebug() {
  fill(255);
  noStroke();
  text(`Entidades ativas: ${sistema ? sistema.size : 0}`, 20, 30);
}
