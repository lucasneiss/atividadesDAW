//Rodar no p5.js

class Balao{
  constructor(x, y){
    this.posicao = {x, y}
    this.cor = color(random(255), random(255), random(255));  
  }
  
  
  atualiza(){
    this.posicao.y -= 1.5;
    this.posicao.x += random(-1, 1);
  }
  
  desenha(){
    fill(this.cor);
    ellipse(this.posicao.x, this.posicao.y, 20, 35);
    triangle(
      this.posicao.x, this.posicao.y + 17, 
      this.posicao.x - 3, this.posicao.y + 22, 
      this.posicao.x + 3, this.posicao.y + 22
    );
  }
}

class Missel extends Balao{
  constructor(x, y){
    super(x, y);
  }
  
  desenha(){
    fill(62, 56, 56);
    rect(this.posicao.x, this.posicao.y, 20, 50);
    fill(255, 0, 0);
    triangle(
      this.posicao.x, this.posicao.y,
      this.posicao.x + 10, this.posicao.y - 50,
      this.posicao.x + 20, this.posicao.y
    );
  }
  atualiza(){
    this.posicao.y -= 6;
    this.posicao.x += random(-2, 2);
  }
}



let baloes = [];
let misseis = [];

function setup() {
  createCanvas(400, 400);
}



function draw() {
  background(220);
  /*if(b != undefined){
    b.atualiza();
    b.desenha();
    
  }
  */
  if(baloes != undefined){
    for(b in baloes){
      baloes[b].atualiza();
      baloes[b].desenha();
    }
  }
  
  if(misseis != undefined){
    for(m in misseis){
      misseis[m].atualiza();
      misseis[m].desenha();
    }
  }
  
  
 
}

function mousePressed() {
  if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height){
    if(mouseButton === RIGHT){
      //b = new Balao(mouseX, mouseY);
      baloes.push(new Balao(mouseX, mouseY));
    }else{
     misseis.push(new Missel(mouseX, mouseY));
    }
  }
}
document.oncontextmenu = function() {
  return false;
}
