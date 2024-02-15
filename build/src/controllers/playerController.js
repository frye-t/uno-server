"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlayerController {
    constructor(createPlayerFn) {
        this.players = new Map();
        this.sockets = new Map();
        this.createPlayerFn = createPlayerFn;
        this.currentPlayerId = 1;
        this.currentTurnPlayerId = '0';
    }
    addPlayer(socket, player) {
        console.log('Calling addPlayer');
        const newPlayerId = player.getId();
        // const newPlayer = new Player(newPlayerId);
        this.players.set(newPlayerId, player);
        this.sockets.set(newPlayerId, socket);
        console.log('in PC adding player');
    }
    removePlayer(playerId) {
        console.log('Deleting Player:', playerId);
        this.players.delete(playerId);
        this.sockets.delete(playerId);
    }
    createPlayer(isHost) {
        console.log('Calling createPlayer');
        const player = this.createPlayerFn();
        const id = this.generatePlayerId();
        player.init(id, isHost);
        return player;
    }
    getPlayers() {
        return Array.from(this.players.values());
    }
    getPlayerNames() {
        console.log(this.getPlayers());
        return this.getPlayers().map((player) => player.getName());
    }
    getNumberOfPlayers() {
        return Array.from(this.players.values()).length;
    }
    getPlayerById(playerId) {
        return this.players.get(playerId);
    }
    getPlayerIds() {
        return Array.from(this.players.keys());
    }
    getPlayerSocketById(playerId) {
        return this.sockets.get(playerId);
    }
    getPlayerBySocket(socket) {
        for (const [playerId, playerSocket] of this.sockets.entries()) {
            if (playerSocket === socket) {
                return this.players.get(playerId);
            }
        }
        return undefined;
    }
    getPlayerIdBySocket(socket) {
        for (const [playerId, playerSocket] of this.sockets.entries()) {
            if (playerSocket === socket) {
                return playerId;
            }
        }
        return undefined;
    }
    generatePlayerId() {
        const id = this.currentPlayerId;
        this.currentPlayerId++;
        return id.toString();
    }
    resetHands() {
        for (const player of this.players.values()) {
            player.resetHand();
        }
    }
}
exports.default = PlayerController;
//# sourceMappingURL=playerController.js.map