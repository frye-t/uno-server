"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = require("../models/player");
class PlayerController {
    constructor() {
        this.players = new Map();
        this.sockets = new Map();
    }
    addPlayer(socket) {
        const newPlayerId = this.generatePlayerId();
        const newPlayer = new player_1.Player(newPlayerId);
        this.players.set(newPlayerId, newPlayer);
        this.sockets.set(newPlayerId, socket);
        console.log("in PC adding player");
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