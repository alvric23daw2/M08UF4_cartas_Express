/**
 * Aplicació en ExpressJS que crea una API REST completa
 * @author sergi.grau@fje.edu
 * @version 2.0 10.10.21
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); 

let partidas = {}; 

// Iniciar una nueva partida
app.post('/iniciarJoc/:codiPartida', (req, res) => {
    const codiPartida = req.params.codiPartida;
    partidas[codiPartida] = {
        mazo: crearMazo(),
        cartasJugador: [],
        cartasGrupier: []
    };    
    console.log(codiPartida);
});

// Obtener primera carta
app.get('/obtenerCarta/:codiPartida', (req, res) => {
    const codiPartida = req.params.codiPartida;
    const partida = partidas[codiPartida];
    if (partida.cartasJugador.length === 0) {
        partida.cartasJugador.push(robarCarta(partida.mazo), robarCarta(partida.mazo));
        partida.cartasGrupier.push(robarCarta(partida.mazo), robarCarta(partida.mazo));
    }

    res.json({
        cartasJugador: partida.cartasJugador,
        cartasGrupier: [partida.cartasGrupier[0], 'Cartes ocultes']
    });
});

// Pedir mas cartas
app.get('/pedirCarta/:codiPartida', (req, res) => {
    const codiPartida = req.params.codiPartida;
    const partida = partidas[codiPartida];
    const nuevaCarta = robarCarta(partida.mazo);
    partida.cartasJugador.push(nuevaCarta);

    res.json({
        cartasJugador: partida.cartasJugador,
        cartasGrupier: [partida.cartasGrupier[0], 'oculta'],
        nuevaCarta
    });
});

// Tirar una carta (no funciona)
app.get('/tirarCarta/:codiPartida/:carta', (req, res) => {
    const codiPartida = req.params.codiPartida;
    const carta = req.params.carta;
    const partida = partidas[codiPartida];
    const indiceCarta = partida.cartasJugador.findIndex(c => c === carta);
    partida.cartasJugador.splice(indiceCarta, 1);
});

// Plantarse
app.get('/plantarse/:codiPartida', (req, res) => {
    const codiPartida = req.params.codiPartida;

    const partida = partidas[codiPartida];
    let puntosGrupier = calcularPuntos(partida.cartasGrupier);
    //grupier no puede sacar mas de 17 putos
    while (puntosGrupier < 17) {
        partida.cartasGrupier.push(robarCarta(partida.mazo));
        puntosGrupier = calcularPuntos(partida.cartasGrupier);
    }

    const puntosJugador = calcularPuntos(partida.cartasJugador);
    const resultado = determinarResultado(puntosJugador, puntosGrupier);

    res.json({
        puntosJugador,
        puntosGrupier,
        cartasJugador: partida.cartasJugador,
        cartasGrupier: partida.cartasGrupier,
        resultado
    });
});

// json del mazo
function crearMazo() {
    const palos = ['♥', '♦', '♣', '♠'];
    const valores = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const mazo = [];

    for (const palo of palos) {
        for (const valor of valores) {
            mazo.push(`${valor} de ${palo}`);
        }
    }

    return barajar(mazo);
}

// randomm mazo
function barajar(mazo) {
    for (let i = mazo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
    return mazo;
}

function robarCarta(mazo) {
    return mazo.pop();
}

// calcularPuntos 
function calcularPuntos(cartas) {
    let puntos = 0;
    let ases = 0;

    cartas.forEach(carta => {
        const valor = carta.split(' ')[0];
        if (['J', 'Q', 'K'].includes(valor)) {
            puntos += 10;
        } else if (valor === 'A') {
            ases += 1;
            puntos += 11;
        } else {
            puntos += parseInt(valor);
        }
    });

    while (puntos > 21 && ases > 0) {
        puntos -= 10;
        ases -= 1;
    }

    return puntos;
}

// Ganador y Perdedor
function determinarResultado(puntosJugador, puntosGrupier) {
    if (puntosJugador > 21) {
        return 'Jugador pierde';
    } else if (puntosGrupier > 21) {
        return 'Jugador gana';
    } else if (puntosJugador > puntosGrupier) {
        return 'Jugador gana';
    } else if (puntosJugador < puntosGrupier) {
        return 'Jugador pierde';
    } else {
        return 'Empate';
    }
}


app.listen(3000, ()=>console.log('inici servidor'));
// http://localhost:3000