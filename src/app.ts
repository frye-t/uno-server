import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173' },
});

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello world!!!');
});

io.on('connect', (socket) => {
  console.log('A user connected');
});

import { Player } from './models/player';
import { GameController } from './controllers/gameController';

const playerOne = new Player('1');
const playerTwo = new Player('2');

const gameController = new GameController([playerOne, playerTwo]);
gameController.startGame();

export default httpServer;
