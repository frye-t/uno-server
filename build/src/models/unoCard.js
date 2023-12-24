"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNOCard = void 0;
const card_1 = require("./card");
class UNOCard extends card_1.Card {
    constructor(number, color, value) {
        super(number, color, value);
    }
    getNumber() {
        return this.getRank();
    }
    getColor() {
        return this.getSuit();
    }
    cardPlayableOnTop(cardToPlay) {
        return (this.getNumber() === cardToPlay.getNumber() ||
            this.getColor() === cardToPlay.getColor() ||
            cardToPlay.getColor() === 'Wild');
    }
    isWildCard() {
        return this.getColor() === 'Wild';
    }
    isWildDrawFour() {
        return this.getColor() === 'Wild' && this.getNumber() === 'Draw4';
    }
    isActionCard() {
        const actionCards = ['Draw2', 'Skip', 'Reverse'];
        return actionCards.includes(this.getNumber());
    }
}
exports.UNOCard = UNOCard;
//# sourceMappingURL=unoCard.js.map