"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardFactory = void 0;
const unoCard_1 = require("../models/unoCard");
class CardFactory {
    static createNumberCard(number, color) {
        return new unoCard_1.UNOCard(number, color, parseInt(number, 10));
    }
    static createActionCard(action, color) {
        return new unoCard_1.UNOCard(action, color, 20);
    }
    static createWildCard(type) {
        return new unoCard_1.UNOCard(type, 'Wild', 40);
    }
}
exports.CardFactory = CardFactory;
//# sourceMappingURL=cardFactory.js.map