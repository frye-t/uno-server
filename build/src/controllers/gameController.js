"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_1 = require("../models/game");
const player_1 = require("../models/player");
const eventManager_1 = require("../services/eventManager");
class GameController {
    constructor(io, roomCode) {
        this.game = null;
        this.io = io;
        this.roomCode = roomCode;
        this.players = [];
        this.eventManager = new eventManager_1.EventManager();
    }
    playerJoined(socket) {
        const player = new player_1.Player(this.players.length.toString(), socket);
        this.players.push(player);
        this.io.to(this.roomCode).emit('playerJoined');
    }
    startGame() {
        this.game = new game_1.Game(this.players);
        this.game.start();
        this.io.to(this.roomCode).emit("gameStarted");
        // const discardPile = this.game.getDiscardPile();
    }
    handlePlayerAction(action, player) {
        if (!this.game) {
            console.error('Game is not initialized');
            return;
        }
        this.game.performAction(action, player);
    }
}
exports.GameController = GameController;
//# sourceMappingURL=gameController.js.map