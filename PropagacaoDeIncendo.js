let grid, nextGrid;
let res = 5; 
let cols, rows;

const ESTADO = {
  VAZIO: 0,
  MATA: 1,
  FOGO: 2,
  CINZA: 3
};

const CORES = {
  [ESTADO.VAZIO]: [220, 220, 220],
  [ESTADO.MATA]:  [34, 139, 34],
  [ESTADO.FOGO]:  [255, 69, 0],
  [ESTADO.CINZA]: [105, 105, 105]
};

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.elt.oncontextmenu = () => false; 
  
  cols = floor(width / res);
  rows = floor(height / res);
  
  grid = inicializarGrid();
  nextGrid = inicializarGrid();
}

function draw() {
  background(220);
  desenharGrid();
  atualizarGrid();
  
  //Atualizar grid (copiar nextGrid para grid)
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = nextGrid[i][j];
    }
  }
}

function inicializarGrid() { 
  let novoGrid = new Array(cols); 
  for (let i = 0; i < cols; i++) { 
    novoGrid[i] = new Array(rows); 
    for (let j = 0; j < rows; j++) { 
      novoGrid[i][j] = random(1) < 0.15 ? ESTADO.VAZIO : ESTADO.MATA; 
    } 
  } 
  return novoGrid; 
}

function mousePressed() {
  let i = floor(mouseX / res);
  let j = floor(mouseY / res);
  
  if (i >= 0 && i < cols && j >= 0 && j < rows) {
    if (mouseButton === LEFT) {
      grid[i][j] = ESTADO.FOGO;
    } else if (mouseButton === RIGHT) {
      grid[i][j] = ESTADO.VAZIO;
    }
  }
}

function desenharGrid(){
  for(let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      let x = i * res;
      let y = j * res;
      fill(CORES[grid[i][j]]);
      stroke(200, 50); 
      rect(x, y, res, res);
    }
  }
}

function atualizarGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let estadoAtual = grid[i][j];

      if (estadoAtual === ESTADO.FOGO) {
        nextGrid[i][j] = ESTADO.CINZA;
      } 
      else if (estadoAtual === ESTADO.MATA) {
        let temFogoAoRedor = false;
        //Vizinhança de Moore (8 vizinhos)
        for (let a = -1; a <= 1; a++) {
          for (let b = -1; b <= 1; b++) {
            let colVi = i + a;
            let linVi = j + b;
            if (colVi >= 0 && colVi < cols && linVi >= 0 && linVi < rows) {
              if (grid[colVi][linVi] === ESTADO.FOGO) {
                temFogoAoRedor = true;
              }
            }
          }
        }
        //Combustão (25% de chance)
        if (temFogoAoRedor && random(1) < 0.25) {
          nextGrid[i][j] = ESTADO.FOGO;
        } else {
          nextGrid[i][j] = ESTADO.MATA;
        }
      } 
      else if (estadoAtual === ESTADO.CINZA) {
        //Regeneração espontânea (0.1% a 0.2%)
        if (random(1) < 0.002) {
          nextGrid[i][j] = ESTADO.MATA;
        } else {
          nextGrid[i][j] = ESTADO.CINZA;
        }
      }
      else {
        nextGrid[i][j] = estadoAtual;
      }
    }
  }
}
