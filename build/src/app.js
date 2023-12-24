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
const playerController_1 = __importDefault(require("./controllers/playerController"));
const generateRoomCode_1 = __importDefault(require("./utils/generateRoomCode"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: 'http://localhost:5173' },
});
const activeRooms = [];
const gameControllers = {};
const playerControllers = {};
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
    // let gc: GameController;
    // let playerController: PlayerController;
    socket.on('hostRoom', (data) => {
        console.log('Got hostRoom Message', data);
        const { roomCode } = data;
        room = roomCode;
        socket.join(roomCode);
        const playerController = new playerController_1.default();
        // playerController = pc;
        const gameController = new gameController_1.GameController(io, room, playerController);
        // gc = gameController;
        gameControllers[roomCode] = gameController;
        playerControllers[roomCode] = playerController;
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
        console.log("Starting game for a room:");
        gameController.startGame();
    });
    socket.on('message', () => {
        console.log("Got a message, sending to room:", room);
        io.to(room).emit("messageReceived");
    });
    socket.on('drawCard', (data) => {
        const playerController = playerControllers[room];
        const gameController = gameControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            gameController.handlePlayerAction('draw', player);
        }
    });
    socket.on('playCard', (data) => {
        console.log("Player played card:", data);
        const playerController = playerControllers[room];
        const gameController = gameControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            gameController.handlePlayerAction('play', player, data);
        }
    });
    socket.on('additionalAction', (data) => {
        const playerController = playerControllers[room];
        const gameController = gameControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            gameController.handlePlayerAction('additionalAction', player, data);
        }
    });
    socket.on('confirmChallenge', () => {
        const playerController = playerControllers[room];
        const gameController = gameControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            gameController.handlePlayerAction('challengeDrawFour', player);
        }
    });
    socket.on('discardChallenge', () => {
        const playerController = playerControllers[room];
        const gameController = gameControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            gameController.handlePlayerAction('discardChallenge', player);
        }
    });
});
exports.default = httpServer;
//# sourceMappingURL=app.js.map