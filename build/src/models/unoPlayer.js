"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNOPlayer = void 0;
const player_1 = require("./player");
class UNOPlayer extends player_1.Player {
    constructor() {
        super();
    }
    hasUno() {
        return this.getHandSize() === 1;
    }
}
exports.UNOPlayer = UNOPlayer;
//# sourceMappingURL=unoPlayer.js.map