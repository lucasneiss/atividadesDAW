const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORTA = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('gamevault.db', (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');

        const queryCriacao = `
            CREATE TABLE IF NOT EXISTS jogos (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                titulo TEXT, 
                plataforma TEXT, 
                status TEXT, 
                nota INTEGER, 
                capa_url TEXT
            )`; 
        
        db.run(queryCriacao, (err) => {
            if(err) {
                console.error("Erro ao criar tabela:", err.message);
            } else {
                console.log("Tabela 'jogos' pronta para uso.");
            }
        });
    }
});

app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

app.get('/', (req, res) => {
    const query = `SELECT * FROM jogos`;

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Erro ao ler o banco");
        }

        res.render('paginaInicial', { 
            tituloDaPagina: "Minha Coleção de Jogos",
            jogos: rows 
        });
    });
});


app.get('/cadastro', (req, res) => {
    res.render('cadastro', { tituloDaPagina: "Cadastrar Jogo" });
});

app.post('/adicionar', (req, res) => {
   
    const { titulo, plataforma, status, nota, capa_url } = req.body;

    const query = `
        INSERT INTO jogos (titulo, plataforma, status, nota, capa_url) 
        VALUES (?, ?, ?, ?, ?)
    `;
    db.run(query, [titulo, plataforma, status, nota, capa_url], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Erro ao salvar o jogo.");
        }

        res.redirect('/');
    });
});

app.get('/deletar/:id', (req, res) => {
    const idDoJogo = req.params.id;
    
    const query = `DELETE FROM jogos WHERE id = ?`;
    
    db.run(query, [idDoJogo], (err) => {
        if (err) {
            console.error("Erro ao deletar:", err.message);
            return res.status(500).send("Erro ao deletar o jogo.");
        }
        
        console.log(`Jogo com ID ${idDoJogo} removido.`);
        res.redirect('/');
    });
});

app.use(express.static('public'));
