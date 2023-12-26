"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor() {
        this.id = '';
        this.hand = [];
    }
    init(id) {
        this.id = id;
    }
    drawCard(card) {
        this.hand.push(card);
    }
    playCard(card) {
        this.hand = this.hand.filter(c => c != card);
    }
    findCard(cardData) {
        return this.hand.find(card => card.getColor() === cardData.suit && card.getNumber() === cardData.rank) || null;
    }
    addCardToHand(card) {
        this.hand.push(card);
    }
    printHand() {
        console.log(`Player ${this.id}'s hand:`, this.hand);
    }
    getId() {
        return this.id;
    }
    getHand() {
        return this.hand.slice();
    }
    getHandSize() {
        return this.hand.length;
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map