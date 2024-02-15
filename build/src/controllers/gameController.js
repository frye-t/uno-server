"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
// import shortUUID from 'short-uuid';
class GameController {
    constructor(io, roomCode, playerController) {
        this.game = null;
        this.isNewGameSetup = false;
        this.io = io;
        this.roomCode = roomCode;
        // this.players = [];
        // this.sockets = new Map();
        this.playerController = playerController;
        this.bindSocketEvents();
        this.playersLoaded = 0;
    }
    update(gameState) {
        this.sendStateToPlayers(gameState);
        if (this.isNewGameSetup) {
            this.isNewGameSetup = false;
        }
    }
    playerLoaded(player) {
        this.playersLoaded += 1;
        const playerId = player.getId();
        this.sendMessage(playerId, 'informPlayerId', { playerId });
        if (this.playersLoaded === this.playerController.getNumberOfPlayers()) {
            this.sendMessageToRoom('allPlayersLoaded', { playerCount: this.playerController.getNumberOfPlayers() });
        }
    }
    requirePlayerAdditionalAction(actionRequired) {
        var _a;
        console.log('Need additional action:', actionRequired);
        const playerId = (_a = this.game) === null || _a === void 0 ? void 0 : _a.getCurrentTurnPlayerId();
        if (playerId) {
            this.sendMessage(playerId, actionRequired);
        }
    }
    updateAsymmetricState(state) {
        var _a;
        const players = this.playerController.getPlayers();
        const currentPlayerId = (_a = this.game) === null || _a === void 0 ? void 0 : _a.getCurrentTurnPlayerId();
        const selfMessage = state + 'Self';
        for (const player of players) {
            const pId = player.getId();
            if (pId === currentPlayerId) {
                this.sendMessage(pId, selfMessage);
            }
            else {
                this.sendMessage(pId, state, currentPlayerId);
            }
        }
    }
    nextTurnStart() {
        this.initiateTurn();
    }
    bindSocketEvents() { }
    playerJoined(socket, isHost) {
        const newPlayer = this.playerController.createPlayer(isHost);
        this.playerController.addPlayer(socket, newPlayer);
        const playerName = newPlayer.getName();
        const playerId = newPlayer.getId();
        isHost = newPlayer.getIsHost();
        this.sendMessageToOthers(playerId, 'playerJoined', { playerName, playerId, isHost });
    }
    setupGame(game) {
        this.game = game;
        this.game.addObserver(this);
        this.isNewGameSetup = true;
        this.sendMessageToRoom('gameStarted', null);
        console.log("PlayerIDs:", this.playerController.getPlayerIds());
    }
    startGame() {
        var _a;
        (_a = this.game) === null || _a === void 0 ? void 0 : _a.start();
    }
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
            console.log('emitting gameState');
            console.log("Checksum:", this.generateChecksum(playerGameState));
            playerGameState.checksum = this.generateChecksum(playerGameState);
            console.log("Sending this game state:", playerGameState);
            this.sendMessage(playerId, 'gameState', JSON.stringify(playerGameState));
        }
    }
    generateChecksum(gameState) {
        const str = JSON.stringify(gameState);
        console.log(str);
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 33) ^ str.charCodeAt(i);
        }
        return hash >>> 0;
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
    sendMessageToOthers(sender, messageType, data) {
        const players = this.playerController.getPlayers().filter(p => p.getId() !== sender);
        players.forEach(player => {
            const socket = this.playerController.getPlayerSocketById(player.getId());
            socket === null || socket === void 0 ? void 0 : socket.emit('playerJoined', data);
        });
    }
}
exports.GameController = GameController;
//# sourceMappingURL=gameController.js.map