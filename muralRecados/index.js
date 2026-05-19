const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Para ajudar com caminhos de arquivos

const app = express();
const PORTA = 3000;

app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('mural.db', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run('CREATE TABLE IF NOT EXISTS recados(id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, mensagem TEXT)', (err) => {
            if(err) console.log("Erro criando tabela: ", err.message);
        });
    }
});

// Rota GET - Exibe o formulário e os recados
app.get('/', (req, res) => {
    db.all('SELECT * FROM recados', (err, rows) => {
        if(err) return res.status(500).send("Erro ao ler banco");

        const htmlDosRecados = rows.map((linha) => `
            <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                <strong>${linha.nome}</strong> disse:
                <p>${linha.mensagem}</p>
            </div>
        `).join('');

        res.send(`
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Mural de Recados</title>
            </head>
            <body>
                <h1>Mural de Recados</h1>
                <form action="/enviar-recado" method="POST">
                    <label>Nome:</label><br>
                    <input type="text" name="nome" required><br><br>
                    <label>Mensagem:</label><br>
                    <textarea name="mensagem" required></textarea><br><br>
                    <button type="submit">Enviar Recado</button>
                </form>
                <hr>
                ${rows.length > 0 ? htmlDosRecados : '<p>Nenhum recado ainda...</p>'}
            </body>
            </html>
        `);
    });
});

app.post('/enviar-recado', (req, res) => {
    const { nome, mensagem } = req.body;
    db.run('INSERT INTO recados (nome, mensagem) VALUES (?, ?)', [nome, mensagem], (err) => {
        if(err) return res.status(500).send("Erro ao salvar");
        res.redirect('/');
    });
});

app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
