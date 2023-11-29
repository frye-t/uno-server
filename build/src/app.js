"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const gameController_1 = require("./controllers/gameController");
const generateRoomCode_1 = __importDefault(require("./utils/generateRoomCode"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: 'http://localhost:5173' },
});
const activeRooms = [];
const gameControllers = {};
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello world!!!');
});
app.get('/getRoomCode', (req, res) => {
    const roomCode = (0, generateRoomCode_1.default)();
    activeRooms.push(roomCode);
    const data = { roomCode };
    res.send(JSON.stringify(data));
});
io.on('connect', (socket) => {
    console.log('A user connected');
    let room;
    socket.on('hostRoom', (data) => {
        console.log('Got hostRoom Message', data);
        const { roomCode } = data;
        room = roomCode;
        socket.join(roomCode);
        const gameController = new gameController_1.GameController(io, room);
        gameControllers[roomCode] = gameController;
        gameController.playerJoined(socket);
    });
    socket.on('joinRoom', (data) => {
        const { roomCode } = data;
        console.log('Got joinRoom Message', roomCode);
        const roomExists = activeRooms.some((rC) => rC === roomCode);
        if (roomExists) {
            room = roomCode;
            socket.join(roomCode);
            socket.emit('roomJoined');
            const gameController = gameControllers[room];
            gameController.playerJoined(socket);
        }
        else {
            socket.emit('roomJoinError');
        }
    });
    socket.on('startGame', () => {
        console.log("startGame received");
        const gameController = gameControllers[room];
        console.log("Starting game for:", gameController);
        gameController.startGame();
    });
    socket.on('message', () => {
        console.log("Got a message, sending to room:", room);
        io.to(room).emit("messageReceived");
    });
});
exports.default = httpServer;
//# sourceMappingURL=app.js.map