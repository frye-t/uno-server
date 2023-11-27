"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_1 = require("../models/game");
const eventManager_1 = require("../services/eventManager");
class GameController {
    constructor(players) {
        this.game = new game_1.Game(players);
        this.eventManager = new eventManager_1.EventManager();
    }
    startGame() {
        console.log('starting game');
        this.game.start();
        const discardPile = this.game.getDiscardPile();
        this.eventManager.publish('gameStarted', { discardPile });
        console.log('Published GameStarted with:', discardPile);
    }
    handlePlayerAction(action, player) {
        this.game.performAction(action, player);
    }
}
exports.GameController = GameController;
//# sourceMappingURL=gameController.js.map