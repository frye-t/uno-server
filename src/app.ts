import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameController } from './controllers/gameController';
import generateRoomCode from './utils/generateRoomCode';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173' },
});

const activeRooms: string[] = [];
const gameControllers: Record<string, GameController> = {};

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

  socket.on('hostRoom', (data) => {
    console.log('Got hostRoom Message', data);
    const {roomCode} = data;
    room = roomCode;
    socket.join(roomCode);
    const gameController = new GameController(io, room);
    gameControllers[roomCode] = gameController;
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
    const gameController = gameControllers[room];
    console.log("Starting game for:", gameController);
    gameController.startGame();
  })

  socket.on('message', () => {
    console.log("Got a message, sending to room:", room)
    io.to(room).emit("messageReceived");
  })
});

export default httpServer;
