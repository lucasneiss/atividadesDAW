//para p5.js
const API_URL = "https://api.rss2json.com/v1/api.json?rss_url=https://g1.globo.com/dynamo/brasil/rss2.xml";
const INTERVALO_NOTICIA = 10000; 
const INTERVALO_API = 60000;     

const PLAYER_STATE = { PLAYING: "playing", PAUSED: "paused" };
const DATA_STATE = { LOADING: "loading", READY: "ready", ERROR: "error" };

let estadoPlayer = PLAYER_STATE.PLAYING;
let estadoDados = DATA_STATE.LOADING;
let noticias = [];
let indiceAtual = 0;
let ultimaTroca = 0;
let ultimaConsulta = 0;
let tempoAcumuladoNaPausa = 0;
let linkNoticia;

function setup() {
  createCanvas(600, 400);

  linkNoticia = createA("#", "Abrir notícia completa", "_blank");
  linkNoticia.position(40, 310);
  linkNoticia.style('color', '#003366');
  linkNoticia.style('font-family', 'sans-serif');
  linkNoticia.style('font-weight', 'bold');
  linkNoticia.hide();

  pegarNoticias();
}

function draw() {
  background(240);

  if (estadoDados === DATA_STATE.LOADING) {
    desenharMensagem("Carregando notícias...");
  } else if (estadoDados === DATA_STATE.ERROR) {
    desenharMensagem("Erro ao carregar dados");
  } else if (estadoDados === DATA_STATE.READY) {
    atualizarLogica();
    desenharInterface();
  }
}


async function pegarNoticias() {
  estadoDados = DATA_STATE.LOADING;
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro na requisição");
    
    const dados = await resposta.json();
    noticias = dados.items;
    
    indiceAtual = 0;
    ultimaTroca = millis();
    ultimaConsulta = millis();
    estadoDados = DATA_STATE.READY;
  } catch (erro) {
    console.error(erro);
    estadoDados = DATA_STATE.ERROR;
  }
}

function atualizarLogica() {
  //atualizar API a cada 60s
  if (millis() - ultimaConsulta > INTERVALO_API) {
    pegarNoticias();
  }

  //carrossel automatico (em playing)
  if (estadoPlayer === PLAYER_STATE.PLAYING) {
    if (millis() - ultimaTroca > INTERVALO_NOTICIA) {
      proximaNoticia();
    }
  }
}

function proximaNoticia() {
  indiceAtual = (indiceAtual + 1) % noticias.length;
  ultimaTroca = millis();
}

//funcoes visuais

function desenharInterface() {
  let noticia = noticias[indiceAtual];
  
  desenharNoticia(noticia);
  desenharIndicadorTempo();
  desenharBotaoPlayer();
}

function desenharNoticia(n) {
  //card de fundo
  fill(255);
  noStroke();
  rect(20, 20, width - 40, 320, 10);
  
  //titulo
  fill(0, 51, 102);
  textSize(20);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(resumir(n.title, 70), 40, 40, width - 80);
  
  //descriacao
  let textoLimpo = limparHTML(n.description);
  fill(60);
  textSize(15);
  textStyle(NORMAL);
  text(resumir(textoLimpo, 220), 40, 120, width - 80);
  
  //atualizar link
  linkNoticia.attribute('href', n.link);
  linkNoticia.show();
}

function desenharIndicadorTempo() {
  let agora = millis();
  let decorrido = 0;

  if (estadoPlayer === PLAYER_STATE.PLAYING) {
    decorrido = agora - ultimaTroca;
  } else {
    decorrido = tempoAcumuladoNaPausa;
  }

  let largura = map(decorrido, 0, INTERVALO_NOTICIA, 0, width - 40);
  
  fill(200);
  rect(20, 350, width - 40, 6, 3);
  
  //barra de progresso
  fill(0, 120, 255);
  rect(20, 350, constrain(largura, 0, width - 40), 6, 3);
}

function desenharBotaoPlayer() {
  let x = width / 2;
  let y = 380;
  
  fill(255);
  stroke(0, 51, 102);
  strokeWeight(2);
  ellipse(x, y, 34, 34);
  
  fill(0, 51, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  
  if (estadoPlayer === PLAYER_STATE.PLAYING) {
    text("❚❚", x, y);
  } else {
    text("▶", x + 1, y);
  }
}



function mousePressed() {
  //detectar clique no botao
  let d = dist(mouseX, mouseY, width / 2, 380);
  if (d < 17) {
    if (estadoPlayer === PLAYER_STATE.PLAYING) {
      estadoPlayer = PLAYER_STATE.PAUSED;
      tempoAcumuladoNaPausa = millis() - ultimaTroca;
    } else {
      estadoPlayer = PLAYER_STATE.PLAYING;
      ultimaTroca = millis() - tempoAcumuladoNaPausa;
    }
  }
}


function resumir(texto, limite) {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite).trim() + "...";
}

function limparHTML(html) {
  let div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

function desenharMensagem(msg) {
  textAlign(CENTER, CENTER);
  fill(100);
  textSize(18);
  text(msg, width / 2, height / 2);
}
