"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const unoDeck_1 = require("./unoDeck");
const drawCardCommand_1 = require("../commands/drawCardCommand");
class Game {
    constructor(players) {
        this.players = players;
        this.currentPlayerIndex = 0;
        this.deck = new unoDeck_1.UNODeck();
        this.discardPile = [];
        this.direction = 'clockwise';
        this.deck.init();
        this.deck.shuffle();
    }
    start() {
        this.dealStartingHands();
        for (const player of this.players) {
            player.printHand();
        }
        this.flipTopCard();
    }
    dealStartingHands() {
        for (let i = 0; i < 7; i++) {
            for (const player of this.players) {
                this.performAction('draw', player);
            }
        }
    }
    performAction(action, player) {
        let command = null;
        switch (action) {
            case 'draw':
                command = new drawCardCommand_1.DrawCardCommand(player, () => this.deck.draw());
                break;
        }
        if (command) {
            command.execute();
        }
        else {
            console.error(`Action '${action}' is not recognized`);
        }
    }
    drawCard() {
        return this.deck.draw();
    }
    getDiscardPile() {
        return this.discardPile;
    }
    flipTopCard() {
        const topCard = this.deck.draw();
        topCard.toggleVisible();
        this.discardPile.unshift(topCard);
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map