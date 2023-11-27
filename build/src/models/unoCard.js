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
}
exports.UNOCard = UNOCard;
//# sourceMappingURL=unoCard.js.map