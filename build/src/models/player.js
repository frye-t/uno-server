"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(id, socket) {
        this.id = id;
        this.socket = socket;
        this.hand = [];
    }
    drawCard(card) {
        this.hand.push(card);
    }
    playCard() { }
    addCardToHand(card) {
        this.hand.push(card);
    }
    printHand() {
        console.log(`Player ${this.id}'s hand:`, this.hand);
    }
    getId() {
        return this.id;
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map