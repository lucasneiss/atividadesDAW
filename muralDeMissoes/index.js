const express = require('express');
const { Sequelize, DataTypes } = require('@sequelize/core');
const { SqliteDialect } = require('@sequelize/sqlite3');

const app = express();
const PORTA = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


const conexaoBanco = new Sequelize({
    dialect: SqliteDialect,
    storage: 'banco_de_missoes.sqlite'
});

const Missao = conexaoBanco.define('Missao', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao: {
        type: DataTypes.TEXT, 
        allowNull: false
    },
    recompensaXP: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pendente'
    }
});

conexaoBanco.sync()
    .then(() => console.log('Banco de dados do Mural de Missões sincronizado e pronto!'))
    .catch((erro) => console.error('Falha ao sincronizar o banco:', erro));


app.get('/', async (req, res) => {
    try {
        const listaMissao = await Missao.findAll();

        let totalXPAcumulado = 0;
        listaMissao.forEach(missao => {
            if (missao.status === 'Concluída') {
                totalXPAcumulado += missao.recompensaXP;
            }
        });

        res.render('mural', { missoes: listaMissao, totalXP: totalXPAcumulado });
    } catch (erro) {
        res.status(500).send('Erro ao buscar missões: ' + erro.message);
    }
});


app.get('/nova-missao', (req, res) => {
    res.render('nova_missao');
});


app.post('/salvar-missao', async (req, res) => {
    try {
        await Missao.create({
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            recompensaXP: parseInt(req.body.recompensaXP),
            
        });
        res.redirect('/');
    } catch (erro) {
        res.status(500).send('Erro ao salvar a missão: ' + erro.message);
    }
});


app.post('/concluir-missao/:identificador', async (req, res) => {
    try {
        const missaoEncontrada = await Missao.findByPk(req.params.identificador);
        if (missaoEncontrada) {
            missaoEncontrada.status = 'Concluída';
            await missaoEncontrada.save();
            res.redirect('/');
        } else {
            res.status(404).send('Missão não encontrada');
        }
    } catch (erro) {
        res.status(500).send('Erro ao concluir missão: ' + erro.message);
    }
});


app.post('/excluir-missao/:identificador', async (req, res) => {
    try {
        const missaoEncontrada = await Missao.findByPk(req.params.identificador);
        if (missaoEncontrada) {
            await missaoEncontrada.destroy();
            res.redirect('/');
        } else {
            res.status(404).send('Missão não encontrada');
        }
    } catch (erro) {
        res.status(500).send('Erro ao excluir missão: ' + erro.message);
    }
});

app.listen(PORTA, () => {
    console.log(`Servidor de missões ativo em: http://localhost:${PORTA}`);
});
