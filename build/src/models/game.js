"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const unoDeck_1 = require("./unoDeck");
const drawCardCommand_1 = require("../commands/drawCardCommand");
const playCardCommand_1 = require("../commands/playCardCommand");
const additionalActionCommand_1 = require("../commands/additionalActionCommand");
const unoPlayer_1 = require("./unoPlayer");
class Game {
    constructor(players) {
        this.observers = [];
        this.players = players;
        this.currentPlayerIndex = 0;
        this.deck = new unoDeck_1.UNODeck();
        this.discardPile = [];
        this.isClockwiseTurnOrder = true;
        this.deck.init();
        this.deck.shuffle();
        this.activeColor = null;
        this.activeNumber = null;
        this.lastActionCard = {
            type: '',
            processed: true,
        };
        this.isPlayerActionRequired = false;
        this.needsDrawAction = false;
        this.needsDrawFourAction = false;
        this.isChallengeInProgress = false;
        this.playerWonChallenge = false;
    }
    addObserver(observer) {
        this.observers.push(observer);
    }
    removeObserver(observer) {
        this.observers = this.observers.filter((obs) => obs != observer);
    }
    notifyObservers() {
        for (let observer of this.observers) {
            observer.update(this.getCurrentGameState());
        }
    }
    notifyPlayerAdditionalAction(actionRequired) {
        for (let observer of this.observers) {
            observer.requirePlayerAdditionalAction(actionRequired);
        }
    }
    notifyAsymmetricState(state) {
        for (let observer of this.observers) {
            observer.updateAsymmetricState(state);
        }
    }
    notifyNextTurn() {
        for (let observer of this.observers) {
            observer.nextTurnStart();
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
        this.notifyNextTurn();
    }
    dealStartingHands() {
        // TODO: Fix this back to 7
        for (let i = 0; i < 2; i++) {
            for (const player of this.players) {
                this.performAction('draw', player);
            }
        }
    }
    performAction(action, player, data) {
        let command = null;
        console.log('Performing an Action', action, data);
        switch (action) {
            case 'draw':
                command = new drawCardCommand_1.DrawCardCommand(player, () => this.drawCard());
                break;
            case 'play':
                if (data) {
                    console.log('Got a PlayCardCommand', player.getId(), data);
                    const cardToPlay = player.findCard(data);
                    if (cardToPlay && this.isValidPlay(cardToPlay)) {
                        // check valid play
                        command = new playCardCommand_1.PlayCardCommand(player, cardToPlay, () => this.playCard(cardToPlay));
                        if (cardToPlay.isWildCard()) {
                            this.notifyPlayerAdditionalAction('chooseColor');
                            this.isPlayerActionRequired = true;
                            if (cardToPlay.isWildDrawFour()) {
                                console.log('Wild Draw Four Played!');
                                this.needsDrawFourAction = true;
                            }
                        }
                        if (cardToPlay.isActionCard()) {
                            console.log('Action Card Played');
                            this.lastActionCard.type = cardToPlay.getNumber();
                            this.lastActionCard.processed = false;
                        }
                    }
                    else {
                        console.error('Invalid card played');
                    }
                }
                break;
            case 'additionalAction':
                console.log('performing another action');
                let callback = null;
                if ((data === null || data === void 0 ? void 0 : data.action) && (data === null || data === void 0 ? void 0 : data.value)) {
                    const actionValue = data.value;
                    switch (data.action) {
                        case 'colorChosen':
                            console.log('Player chose a color');
                            callback = () => this.setActiveColor(actionValue);
                            break;
                        case 'handleChallenge':
                            if (data.value === 'true') {
                                console.log('Player challenged Draw Four');
                                callback = () => this.resolveChallenge(this.doesChallengeWin());
                                break;
                            }
                            else {
                                console.log('Player declined Draw Four Challenge');
                                callback = () => this.resolveNoChallenge();
                                break;
                            }
                    }
                    if (callback) {
                        command = new additionalActionCommand_1.AdditionalActionCommand(callback);
                    }
                    this.isPlayerActionRequired = false;
                }
                break;
        }
        if (command) {
            command.execute();
            // possibly don't need this notify, will test later
            this.notifyObservers();
            // Don't end turn if another action is required,
            // a draw action is taking place, or a player won a challenge
            if (!this.isPlayerActionRequired &&
                !this.needsDrawAction &&
                !this.playerWonChallenge) {
                this.endTurn();
            }
            else if (this.playerWonChallenge) {
                this.playerWonChallenge = false;
            }
        }
        else {
            console.error(`Action '${action}' is not recognized or rule validation failed`);
        }
    }
    doesChallengeWin() {
        return true;
    }
    endTurn() {
        this.notifyObservers();
        this.checkUno();
        this.checkActionCard();
        this.startNextTurn();
        this.checkDrawFourChallengeNeeded();
    }
    checkUno() {
        console.log('CurrentPlayerIdx:', this.currentPlayerIndex);
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer instanceof unoPlayer_1.UNOPlayer && currentPlayer.hasUno()) {
            console.log('A player has UNO! Player:', this.currentPlayerIndex);
            this.notifyAsymmetricState('uno');
        }
    }
    checkActionCard() {
        if (!this.isPlayerActionRequired) {
            if (!this.lastActionCard.processed) {
                this.handleActionCard(this.lastActionCard.type);
            }
        }
    }
    startNextTurn() {
        this.setNextPlayerIndex();
        this.notifyNextTurn();
    }
    checkDrawFourChallengeNeeded() {
        if (this.needsDrawFourAction && !this.isChallengeInProgress) {
            // Handle beginning a challenge on next turn
            this.notifyPlayerAdditionalAction('challenge');
            this.isChallengeInProgress = true;
        }
    }
    resolveChallenge(challengeResult) {
        if (challengeResult) {
            // Draw 4 for previous player, as challenger won
            this.handleDrawN(this.getPreviousPlayer(), 4);
            this.notifyPlayerAdditionalAction('challengeWin');
            this.playerWonChallenge = true;
        }
        else {
            // Draw 6 for currnet player, as challenger lost
            this.handleDrawN(this.getCurrentPlayer(), 6);
        }
        this.isChallengeInProgress = false;
        this.needsDrawFourAction = false;
    }
    resolveNoChallenge() {
        // Draw four for current player, as they did not challenge Draw4
        this.handleDrawN(this.getCurrentPlayer(), 4);
        this.needsDrawFourAction = false;
        this.isChallengeInProgress = false;
    }
    setActiveColor(color) {
        this.activeColor = color;
    }
    drawCard() {
        return this.deck.draw();
    }
    playCard(card) {
        this.discardPile.push(card);
        this.notifyObservers();
    }
    flipTopCard() {
        const topCard = this.drawCard();
        topCard.toggleVisible();
        this.discardPile.unshift(topCard);
    }
    getCurrentGameState() {
        const gameState = {
            players: this.players.map((player) => ({
                id: player.getId(),
                hand: player.getHand(),
                cardCount: player.getHandSize(),
            })),
            discardPile: this.discardPile,
            activeColor: this.activeColor,
            activeNumber: this.activeNumber,
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
        const incrementer = this.isClockwiseTurnOrder ? 1 : -1;
        const playerCount = this.players.length;
        this.currentPlayerIndex =
            (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
        console.log('Next player is:', this.currentPlayerIndex);
    }
    getNextPlayerIndex() {
        const incrementer = this.isClockwiseTurnOrder ? 1 : -1;
        const playerCount = this.players.length;
        return (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
    }
    getPreviousPlayerIndex() {
        const incrementer = !this.isClockwiseTurnOrder ? 1 : -1;
        const playerCount = this.players.length;
        return (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
    }
    getCurrentPlayer() {
        console.log('players:', this.players);
        console.log('currentPlayerIndex', this.currentPlayerIndex);
        return this.players[this.currentPlayerIndex];
    }
    getPreviousPlayer() {
        return this.players[this.getPreviousPlayerIndex()];
    }
    getNextPlayer() {
        return this.players[this.getNextPlayerIndex()];
    }
    isValidPlay(card) {
        return true;
        // const topCard = this.discardPile[this.discardPile.length - 1];
        // return topCard.cardPlayableOnTop(card);
    }
    handleDrawN(player, cardsToDraw) {
        // Need this flag to avoid turn skipping on action execution
        this.needsDrawAction = true;
        for (let i = 0; i < cardsToDraw; i++) {
            this.performAction('draw', player);
        }
        this.needsDrawAction = false;
    }
    handleActionCard(actionType) {
        switch (actionType) {
            case 'Draw2':
                this.handleDrawN(this.players[this.getNextPlayerIndex()], 2);
                break;
            case 'Skip':
                this.currentPlayerIndex += this.isClockwiseTurnOrder ? 1 : -1;
                break;
            case 'Reverse':
                this.isClockwiseTurnOrder = !this.isClockwiseTurnOrder;
                break;
        }
        this.lastActionCard.processed = true;
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map