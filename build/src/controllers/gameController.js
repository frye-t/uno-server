"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_1 = require("../models/game");
// import shortUUID from 'short-uuid';
class GameController {
    constructor(io, roomCode, playerController) {
        this.game = null;
        this.isNewGameSetup = false;
        this.io = io;
        this.roomCode = roomCode;
        this.players = [];
        this.sockets = new Map();
        this.playerController = playerController;
        this.bindSocketEvents();
    }
    update(gameState) {
        this.sendStateToPlayers(gameState);
        if (this.isNewGameSetup) {
            this.isNewGameSetup = false;
        }
        this.initiateTurn();
    }
    bindSocketEvents() { }
    playerJoined(socket) {
        // const newPlayerId = this.generatePlayerId();
        // const player = new Player(newPlayerId);
        // this.players.push(player);
        // this.sockets.set(newPlayerId, socket);
        this.playerController.addPlayer(socket);
        this.sendMessageToRoom('playerJoined', null);
    }
    // private generatePlayerId(): string {
    //   return (this.players.length + 1).toString();
    // }
    startGame() {
        this.game = new game_1.Game(this.playerController.getPlayers());
        this.game.addObserver(this);
        this.isNewGameSetup = true;
        this.game.start();
        this.sendMessageToRoom('gameStarted', null);
        // this.updateGameStateToClients();
        // this.initiateTurn();
    }
    // private updateGameStateToClients() {
    //   if (this.game) {
    //     const gameState = this.game.getCurrentGameState();
    //     this.sendStateToPlayers(gameState);
    //   } else {
    //     console.error('Game is not initialized');
    //   }
    // }
    initiateTurn() {
        var _a;
        if (this.game) {
            const currentTurnPlayerId = (_a = this.game) === null || _a === void 0 ? void 0 : _a.getCurrentTurnPlayerId();
            const players = this.playerController.getPlayers();
            for (const player of players) {
                const playerId = player.getId();
                const isCurrentTurn = currentTurnPlayerId === playerId;
                this.notifyPlayerTurnStatus(playerId, isCurrentTurn, currentTurnPlayerId);
            }
        }
        else {
            console.error('Game is not initialized');
        }
    }
    handlePlayerAction(action, player, cardData) {
        if (!this.game) {
            console.error('Game is not initialized');
            return;
        }
        if (cardData) {
            this.game.performAction(action, player, cardData);
        }
        else {
            this.game.performAction(action, player);
        }
    }
    notifyPlayerTurnStatus(playerId, isCurrentTurn, currentTurnPlayerId) {
        if (isCurrentTurn) {
            this.sendMessage(playerId, 'turnStart');
        }
        else {
            this.sendMessage(playerId, 'turnWaiting', currentTurnPlayerId);
        }
    }
    sendStateToPlayers(gameState) {
        const players = this.playerController.getPlayers();
        for (const player of players) {
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
            this.sendMessage(playerId, 'gameState', JSON.stringify(playerGameState));
        }
    }
    sendMessage(playerId, messageType, data) {
        // const socket = this.sockets.get(playerId);
        const socket = this.playerController.getPlayerSocketById(playerId);
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
}
exports.GameController = GameController;
//# sourceMappingURL=gameController.js.map