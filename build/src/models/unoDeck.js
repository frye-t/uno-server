"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNODeck = void 0;
const deck_1 = require("./deck");
const cardFactory_1 = require("../utils/cardFactory");
class UNODeck extends deck_1.Deck {
    constructor(cards = []) {
        super(cards);
    }
    init() {
        const cards = [];
        const colors = ['Red', 'Blue', 'Green', 'Yellow'];
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        // const actionCards = ['Draw2', 'Reverse', 'Skip'];
        const actionCards = ['Reverse', 'Reverse', 'Reverse'];
        // const actionCards = ['Skip', 'Skip', 'Skip'];
        // const actionCards = ['Draw2', 'Skip', 'Reverse'];
        const wildCards = ['Card', 'Draw4'];
        for (const color of colors) {
            for (const number of numbers) {
                cards.push(cardFactory_1.CardFactory.createNumberCard(number, color));
                if (number !== '0') {
                    cards.push(cardFactory_1.CardFactory.createNumberCard(number, color));
                }
            }
            for (const action of actionCards) {
                // Remove this inner for loop
                for (let i = 0; i < 10; i++) {
                    // Testing only
                    cards.push(cardFactory_1.CardFactory.createActionCard(action, color));
                    cards.push(cardFactory_1.CardFactory.createActionCard(action, color));
                }
            }
        }
        // TODO: Change this back to 4
        // for (let i = 0; i < 20; i++) {
        //   cards.push(CardFactory.createWildCard(wildCards[0]));
        //   cards.push(CardFactory.createWildCard(wildCards[1]));
        // }
        this.setCards(cards);
    }
}
exports.UNODeck = UNODeck;
//# sourceMappingURL=unoDeck.js.map