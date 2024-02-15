"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const generateRoomCode_1 = __importDefault(require("./utils/generateRoomCode"));
const unoGameFactory_1 = require("./utils/unoGameFactory");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:8080'], // Add your second origin here
    },
});
const activeRooms = [];
const gameControllers = {};
const playerControllers = {};
const gameFactory = new unoGameFactory_1.UNOGameFactory();
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello world!!!');
});
app.get('/roomCode', (req, res) => {
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
        try {
            const { roomCode } = data;
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
            socket.emit('roomHosted');
            gameController.playerJoined(socket, true);
        }
        catch (e) {
            // Error handling on room hosting failed
        }
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
            gameController.playerJoined(socket, false);
        }
        else {
            socket.emit('roomJoinError');
        }
    });
    socket.on('requestPlayerData', () => {
        const playerController = playerControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            const playerId = player.getId();
            const playerName = player.getName();
            const isHost = player.getIsHost();
            socket.emit('respondPlayerData', { playerId, playerName, isHost });
        }
        else {
            // playerId not found
        }
    });
    socket.on('playerCatchup', () => {
        const playerController = playerControllers[room];
        const playerId = playerController.getPlayerIdBySocket(socket);
        const players = playerController.getPlayers().filter(p => p.getId() !== playerId);
        socket.emit('playerCatchup', { players });
    });
    socket.on('playerChangeName', (data) => {
        console.log(data);
        const { name } = data;
        const playerController = playerControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            player.setName(name);
            const playerId = player.getId();
            // socket.emit('playerCatchup', {players})
            io.to(room).emit('playerNameChange', { playerId, playerName: name });
        }
    });
    socket.on('setupGame', () => {
        console.log('startGame received');
        const playerController = playerControllers[room];
        playerController.resetHands();
        const gameController = gameControllers[room];
        console.log('Starting game for a room:');
        const unoPlayers = playerController.getPlayers();
        const unoGame = gameFactory.createGame(unoPlayers, playerController);
        gameController.setupGame(unoGame);
    });
    socket.on('startGame', () => {
        const gameController = gameControllers[room];
        gameController.startGame();
    });
    socket.on('message', () => {
        console.log('Got a message, sending to room:', room);
        io.to(room).emit('messageReceived');
    });
    socket.on('gameLoaded', () => {
        const gameController = gameControllers[room];
        const playerController = playerControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            gameController.playerLoaded(player);
        }
        else {
            console.error('Player not found for socket:', socket.id);
        }
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
        console.log('Player played card:', data);
        const playerController = playerControllers[room];
        const gameController = gameControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            gameController.handlePlayerAction('play', player, data);
        }
    });
    socket.on('additionalAction', (data) => {
        console.log('in additionalAction:', data);
        const playerController = playerControllers[room];
        const gameController = gameControllers[room];
        const player = playerController.getPlayerBySocket(socket);
        if (player) {
            gameController.handlePlayerAction('additionalAction', player, data);
        }
    });
    socket.on('disconnect', () => {
        // const gameController = gameControllers[room];
        const playerController = playerControllers[room];
        if (playerController) {
            const player = playerController.getPlayerBySocket(socket);
            if (player) {
                const playerId = player.getId();
                console.log("Player", playerId, "disconnected");
                playerController.removePlayer(playerId);
                io.to(room).emit('playerDisconnect', { playerId });
                if (player.getIsHost()) {
                    const newHostPlayer = playerController.getPlayers()[0];
                    if (newHostPlayer) {
                        newHostPlayer.makeHost();
                        const playerId = newHostPlayer.getId();
                        io.to(room).emit('assignNewHost', { playerId });
                    }
                }
            }
        }
    });
});
exports.default = httpServer;
//# sourceMappingURL=app.js.map