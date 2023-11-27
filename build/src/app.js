"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: 'http://localhost:5173' },
});
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello world!!!');
});
io.on('connect', (socket) => {
    console.log('A user connected');
});
const player_1 = require("./models/player");
const gameController_1 = require("./controllers/gameController");
const playerOne = new player_1.Player('1');
const playerTwo = new player_1.Player('2');
const gameController = new gameController_1.GameController([playerOne, playerTwo]);
gameController.startGame();
exports.default = httpServer;
//# sourceMappingURL=app.js.map