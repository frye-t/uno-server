import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameController } from './controllers/gameController';
import PlayerController from './controllers/playerController';
import generateRoomCode from './utils/generateRoomCode';
import { UNOGameFactory } from './utils/unoGameFactory';
import { UNOPlayer } from './models/unoPlayer';
import { UNOCard } from './models/unoCard';
import { UNODeck } from './models/unoDeck';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173' },
});

const activeRooms: string[] = [];
const gameControllers: Record<string, GameController<UNOPlayer, UNOCard, UNODeck>> = {};
const playerControllers: Record<string, PlayerController<UNOPlayer, UNOCard>> = {};
const gameFactory = new UNOGameFactory();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello world!!!');
});

app.get('/getRoomCode', (req, res) => {
  const roomCode = generateRoomCode();
  activeRooms.push(roomCode);
  const data = { roomCode };
  res.send(JSON.stringify(data));
});

io.on('connect', (socket) => {
  console.log('A user connected');
  let room: string;
  // let gc: GameController;
  // let playerController: PlayerController;

  socket.on('hostRoom', (data) => {
    console.log('Got hostRoom Message', data);
    const {roomCode} = data;
    room = roomCode;
    socket.join(roomCode);
    // const playerController = new PlayerController();
    // playerController = pc;
    // const gameController = new GameController(io, room, playerController);
    const playerController = gameFactory.createPlayerController();
    const gameController = gameFactory.createGameController(io, roomCode, playerController);
    // gc = gameController;
    gameControllers[roomCode] = gameController;
    playerControllers[roomCode] = playerController;
    gameController.playerJoined(socket);
  });

  socket.on('joinRoom', (data) => {
    const {roomCode} = data;
    console.log('Got joinRoom Message', roomCode);
    const roomExists = activeRooms.some((rC) => rC === roomCode);
    if (roomExists) {
      room = roomCode;
      socket.join(roomCode);
      socket.emit('roomJoined');
      const gameController = gameControllers[room];
      gameController.playerJoined(socket);
    } else {
      socket.emit('roomJoinError');
    }
  });

  socket.on('startGame', () => {
    console.log("startGame received");
    const playerController = playerControllers[room];
    playerController.resetHands();
    const gameController = gameControllers[room];
    console.log("Starting game for a room:");
    const unoPlayers = playerController.getPlayers();
    const unoGame = gameFactory.createGame(unoPlayers);
    gameController.startGame(unoGame);
  })

  socket.on('message', () => {
    console.log("Got a message, sending to room:", room)
    io.to(room).emit("messageReceived");
  })

  socket.on('drawCard', (data) => {
    const playerController = playerControllers[room];
    const gameController = gameControllers[room];
    const player = playerController.getPlayerBySocket(socket);
    if (player) {
      gameController.handlePlayerAction('draw', player)
    }
  })

  socket.on('playCard', (data) => {
    console.log("Player played card:", data)
    const playerController = playerControllers[room];
    const gameController = gameControllers[room];
    const player = playerController.getPlayerBySocket(socket);
    if (player) {
      gameController.handlePlayerAction('play', player, data)
    }
  })

  socket.on('additionalAction', (data) => {
    console.log('in additionalAction:', data)
    const playerController = playerControllers[room];
    const gameController = gameControllers[room];
    const player = playerController.getPlayerBySocket(socket);
    if (player) {
      gameController.handlePlayerAction('additionalAction', player, data);
    }
  })
});

export default httpServer;
