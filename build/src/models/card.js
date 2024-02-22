"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
class Card {
    constructor(rank, suit, value, visible = false) {
        this.rank = rank;
        this.suit = suit;
        this.value = value;
        this.visible = visible;
    }
    toString() {
        return `${this.suit}_${this.rank}: ${this.value}`;
    }
    getRank() {
        return this.rank;
    }
    getSuit() {
        return this.suit;
    }
    getValue() {
        return this.value;
    }
    toggleVisible() {
        this.visible = !this.visible;
    }
    cardPlayableOnTop(card) {
        // Override this method
        return false;
    }
}
exports.Card = Card;
//# sourceMappingURL=card.js.map