"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlayerController {
    constructor(createPlayerFn) {
        this.players = new Map();
        this.sockets = new Map();
        this.createPlayerFn = createPlayerFn;
    }
    addPlayer(socket, player) {
        const newPlayerId = this.generatePlayerId();
        // const newPlayer = new Player(newPlayerId);
        this.players.set(newPlayerId, player);
        this.sockets.set(newPlayerId, socket);
        console.log("in PC adding player");
    }
    createPlayer() {
        const player = this.createPlayerFn();
        const id = this.generatePlayerId();
        player.init(id);
        return player;
    }
    getPlayers() {
        return Array.from(this.players.values());
    }
    getPlayerById(playerId) {
        return this.players.get(playerId);
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
        return (this.players.size + 1).toString();
    }
}
exports.default = PlayerController;
//# sourceMappingURL=playerController.js.map