"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_1 = require("../models/game");
const player_1 = require("../models/player");
class GameController {
    constructor(io, roomCode) {
        this.game = null;
        this.io = io;
        this.roomCode = roomCode;
        this.players = [];
        this.sockets = new Map();
        this.bindSocketEvents();
    }
    bindSocketEvents() { }
    playerJoined(socket) {
        const newPlayerId = this.generatePlayerId();
        const player = new player_1.Player(newPlayerId);
        this.players.push(player);
        this.sockets.set(newPlayerId, socket);
        this.sendMessageToRoom("playerJoined", null);
    }
    generatePlayerId() {
        return (this.players.length + 1).toString();
    }
    startGame() {
        this.game = new game_1.Game(this.players);
        this.game.start();
        this.sendMessageToRoom("gameStarted", null);
        const gameState = this.game.getCurrentGameState();
        this.sendStateToPlayers(gameState);
        const currentTurnPlayerId = this.game.getCurrentTurnPlayerId();
        this.initiateTurn(currentTurnPlayerId);
    }
    initiateTurn(currentTurnPlayerId) {
        for (const player of this.players) {
            const playerId = player.getId();
            const isCurrentTurn = currentTurnPlayerId === playerId;
            this.notifyPlayerTurnStatus(playerId, isCurrentTurn, currentTurnPlayerId);
        }
    }
    notifyPlayerTurnStatus(playerId, isCurrentTurn, currentTurnPlayerId) {
        if (isCurrentTurn) {
            this.sendMessage(playerId, "turnStart");
        }
        else {
            this.sendMessage(playerId, "turnWaiting", currentTurnPlayerId);
        }
    }
    sendMessage(playerId, messageType, data) {
        const socket = this.sockets.get(playerId);
        if (!socket) {
            console.error(`Socket not found for player ${playerId}`);
            return;
        }
        try {
            socket.emit(messageType, data);
        }
        catch (error) {
            console.error(`Failed to send ${messageType} message to player ${playerId}:`, error);
        }
    }
    sendMessageToRoom(messageType, data) {
        this.io.to(this.roomCode).emit(messageType, data);
    }
    sendStateToPlayers(gameState) {
        for (const player of this.players) {
            const playerId = player.getId();
            const playerGameState = {
                ...gameState,
                players: gameState.players.map((p) => {
                    if (p.id === playerId) {
                        return { id: p.id, cardCount: p.cardCount, hand: p.hand };
                    }
                    else {
                        return { id: p.id, cardCount: p.cardCount };
                    }
                }),
            };
            this.sendMessage(playerId, "gameState", JSON.stringify(playerGameState));
        }
    }
    handlePlayerAction(action, player) {
        if (!this.game) {
            console.error("Game is not initialized");
            return;
        }
        this.game.performAction(action, player);
    }
}
exports.GameController = GameController;
//# sourceMappingURL=gameController.js.map