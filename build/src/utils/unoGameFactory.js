"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNOGameFactory = void 0;
const unoPlayer_1 = require("../models/unoPlayer");
const gameController_1 = require("../controllers/gameController");
const playerController_1 = __importDefault(require("../controllers/playerController"));
const unoDeck_1 = require("../models/unoDeck");
const game_1 = require("../models/game");
class UNOGameFactory {
    createGameController(io, roomCode, playerController) {
        return new gameController_1.GameController(io, roomCode, playerController);
    }
    createPlayerController() {
        return new playerController_1.default(() => new unoPlayer_1.UNOPlayer());
    }
    createGame(players, playerController) {
        const unoDeck = new unoDeck_1.UNODeck();
        return new game_1.Game(players, unoDeck, playerController);
    }
}
exports.UNOGameFactory = UNOGameFactory;
//# sourceMappingURL=unoGameFactory.js.map