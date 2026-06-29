const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs'); 
const http = require('http');
const { Server } = require('socket.io');
const { User } = require('./db');
const path = require('path'); // Módulo nativo para corrigir caminhos de pastas

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Força o Express a encontrar a pasta views corretamente
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

// Configuração da Sessão
app.use(session({
  secret: 'segredo_super_seguro_do_stop',
  resave: false,
  saveUninitialized: false
}));

// Rota Raiz (Redireciona para o lobby se estiver logado, ou para o login se não estiver)
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/lobby');
  }
  res.redirect('/login');
});

// Middleware do Layout (Deixado antes das rotas para que todas possam usar)
app.use((req, res, next) => {
  res.renderComLayout = function (view, dados = {}) {
    // Garante que o username da sessão esteja sempre disponível para o layout.ejs
    const dadosEscopo = { 
      username: req.session ? req.session.username : null, 
      ...res.locals, 
      ...dados 
    };
    
    res.render(view, dadosEscopo, (erro, html) => {
      if (erro) return next(erro);
      res.render('layout', {
        ...dadosEscopo,
        body: html
      });
    });
  };
  next();
});

// Rota de Login (GET) - Corrigida para usar o Layout Estilizado
app.get('/login', (req, res) => {
  res.renderComLayout('login', { titulo: 'Login' });
});

// Rota de Login (POST) - Corrigida para renderizar o erro dentro do Layout
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  
  if (user) {
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      req.session.userId = user.id;
      req.session.username = user.username;
      return res.redirect('/lobby');
    }
  }
  
  // Exibe o erro de forma elegante dentro da caixinha vermelha do Bootstrap
  res.renderComLayout('login', { 
    titulo: 'Login', 
    erro: 'Usuário ou senha inválidos' 
  });
});

app.get('/cadastro', async(req, res) => {
  res.renderComLayout('cadastro', { titulo: 'Cadastro' });
});

app.post('/cadastro', async(req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || password.length < 6) {
            return res.renderComLayout('cadastro', {
                titulo: 'Cadastro',
                erro: 'Preencha todos os campos. A senha deve conter pelo menos seis caracteres.'
            });
        }

        await User.create({ username, password });
        res.redirect('/login');

    } catch(erro) {
        console.error(erro);
        res.renderComLayout('cadastro', {
            titulo: 'Cadastro',
            erro: 'Erro ao cadastrar usuário. Escolha outro nome.'
        });
    }
});

// Middleware de Autenticação (Protege as rotas do jogo)
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) { 
    return next(); 
  } else {
    res.redirect('/login');
  }
}

// Rota do Lobby - Corrigida para usar o Layout Estilizado
app.get('/lobby', requireAuth, (req, res) => {
  res.renderComLayout('lobby', { titulo: 'Lobby' });
});

// Rota do Jogo - Corrigida para usar o Layout Estilizado
app.get('/jogo', requireAuth, (req, res) => {
  const sala = req.query.sala;
  res.renderComLayout('jogo', { titulo: `Sala: ${sala}`, sala });
});

// WebSockets (Socket.io)
io.on('connection', (socket) => {
  console.log('Novo jogador conectado:', socket.id);

  socket.on('entrar_sala', (dados) => {
    const { sala, username } = dados;
    socket.join(sala);
    
    io.to(sala).emit('mensagem_chat', {
        username: 'Sistema',
        texto: `${username} entrou na sala` 
    });
  });

  socket.on('sortear_letra', (sala) => {
    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letraSorteada = alfabeto[Math.floor(Math.random() * alfabeto.length)];
    io.to(sala).emit('letra_sorteada', letraSorteada);
  });

  socket.on('gritar_stop', (dados) => {
    const { sala, username } = dados;
    io.to(sala).emit('fim_de_rodada', username);
  });
});

server.listen(3000, () => console.log('Servidor rodando na porta 3000'));
