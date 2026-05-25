const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

const PORTA = 3000;

app.get('/', (req, res) => {
    res.render('home', { tituloDaPagina: "Página Inicial" });
});


app.listen(PORTA, ()=> {
    console.log(`Servidor rodando na porta ${PORTA}`);
});

app.get('/perfil', (req, res) => {
    const dadosDoUsuario = {
        tituloDaPagina: "Meu Perfil",
        nomeUsuario: "Carlos",
        idade: 25
    };

    res.render('perfil', dadosDoUsuario);
});

app.get('/produtos', (req, res) => {
    const listaDeProdutos = [
        { id: 1, nome: "Notebook", preco: 4500.0 },
        { id: 2, nome: "Mouse sem fio", preco: 120.0 },
        { id: 3, nome: "Teclado Mecânico", preco: 350.0 },
    ];

    res.render('produtos', {
        tituloDaPagina: "Nossa Loja",
        produtos: listaDeProdutos
    });
});
