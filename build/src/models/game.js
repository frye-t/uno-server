"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const unoDeck_1 = require("./unoDeck");
const drawCardCommand_1 = require("../commands/drawCardCommand");
const playCardCommand_1 = require("../commands/playCardCommand");
class Game {
    constructor(players) {
        this.observers = [];
        this.players = players;
        this.currentPlayerIndex = 0;
        this.turnCounter = 1;
        this.deck = new unoDeck_1.UNODeck();
        this.discardPile = [];
        this.direction = 'clockwise';
        this.deck.init();
        this.deck.shuffle();
    }
    addObserver(observer) {
        this.observers.push(observer);
    }
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs != observer);
    }
    notifyObservers() {
        for (let observer of this.observers) {
            observer.update(this.getCurrentGameState());
        }
    }
    start() {
        this.dealStartingHands();
        for (const player of this.players) {
            player.printHand();
        }
        this.flipTopCard();
        this.currentPlayerIndex = this.getStartingPlayerIndex();
        this.notifyObservers();
    }
    dealStartingHands() {
        for (let i = 0; i < 7; i++) {
            for (const player of this.players) {
                this.performAction('draw', player);
            }
        }
    }
    performAction(action, player, cardData) {
        let command = null;
        switch (action) {
            case 'draw':
                command = new drawCardCommand_1.DrawCardCommand(player, () => this.drawCard());
                break;
            case 'play':
                if (cardData) {
                    console.log("Got a PlayCardCommand", player.getId(), cardData);
                    const cardToPlay = player.findCard(cardData);
                    if (cardToPlay && this.isValidPlay(cardToPlay)) { // check valid play
                        command = new playCardCommand_1.PlayCardCommand(player, cardToPlay, () => this.playCard(cardToPlay));
                        this.setNextPlayerIndex();
                    }
                    else {
                        console.error("Invalid card played");
                    }
                }
                break;
        }
        if (command) {
            command.execute();
        }
        else {
            console.error(`Action '${action}' is not recognized or rule validation failed`);
        }
    }
    drawCard() {
        return this.deck.draw();
    }
    playCard(card) {
        this.discardPile.push(card);
        this.notifyObservers();
    }
    getDiscardPile() {
        return this.discardPile;
    }
    flipTopCard() {
        const topCard = this.drawCard();
        topCard.toggleVisible();
        this.discardPile.unshift(topCard);
    }
    getCurrentGameState() {
        const gameState = {
            players: this.players.map(player => ({
                id: player.getId(),
                hand: player.getHand(),
                cardCount: player.getHandSize(),
            })),
            discardPile: this.discardPile,
        };
        return gameState;
    }
    getCurrentTurnPlayerId() {
        return this.players[this.currentPlayerIndex].getId();
    }
    getStartingPlayerIndex() {
        return Math.floor(Math.random() * this.players.length);
    }
    setNextPlayerIndex() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        console.log("Next player is:", this.currentPlayerIndex);
    }
    isValidPlay(card) {
        const topCard = this.discardPile[this.discardPile.length - 1];
        return topCard.cardPlayableOnTop(card);
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map