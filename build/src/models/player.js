"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor() {
        this.id = '';
        this.name = '';
        this.hand = [];
        this.isHost = false;
    }
    init(id, isHost) {
        this.id = id;
        this.name = 'Player ' + this.id;
        this.isHost = isHost;
    }
    setName(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
    getIsHost() {
        return this.isHost;
    }
    makeHost() {
        this.isHost = true;
    }
    drawCard(card) {
        this.hand.push(card);
    }
    playCard(card) {
        this.hand = this.hand.filter((c) => c != card);
    }
    findCard(cardData) {
        return (this.hand.find((card) => card.getSuit() === cardData.suit && card.getRank() === cardData.rank) || null);
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
    resetHand() {
        this.hand = [];
    }
    canUno(topCard, activeColor) {
        if (this.hand.length !== 2) {
            return false;
        }
        return this.hand.some((card) => topCard.getRank() === card.getRank() ||
            topCard.getSuit() === card.getSuit() ||
            card.getSuit() === 'Wild' ||
            card.getSuit() === activeColor);
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map