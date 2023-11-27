"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(id) {
        this.id = id;
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
}
exports.Player = Player;
//# sourceMappingURL=player.js.map