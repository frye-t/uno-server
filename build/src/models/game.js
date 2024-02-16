"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const unoCard_1 = require("./unoCard");
const unoDeck_1 = require("./unoDeck");
const drawCardCommand_1 = require("../commands/drawCardCommand");
const playCardCommand_1 = require("../commands/playCardCommand");
const additionalActionCommand_1 = require("../commands/additionalActionCommand");
const unoPlayer_1 = require("./unoPlayer");
class Game {
    constructor(players, deck, playerController) {
        this.observers = [];
        this.players = players;
        console.log(this.players);
        this.playerMap = new Map();
        this.players.forEach(player => {
            this.playerMap.set(player.getId(), player);
        });
        console.log("!!!PLAYER MAP!!!");
        console.log(this.playerMap);
        this.playerController = playerController;
        this.turnOrder = playerController.getPlayerIds();
        this.currentPlayerIndex = 0;
        this.deck = deck;
        this.discardPile = [];
        this.isClockwiseTurnOrder = true;
        if (this.deck instanceof unoDeck_1.UNODeck) {
            this.deck.init();
        }
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
    notifyRoundOver() {
        for (let observer of this.observers) {
            observer.updateRoundOver();
        }
    }
    notifyNextTurn() {
        for (let observer of this.observers) {
            observer.nextTurnStart();
        }
    }
    shuffleTurnOrder() {
        for (let i = this.turnOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.turnOrder[i], this.turnOrder[j]] = [this.turnOrder[j], this.turnOrder[i]];
        }
        console.log("SHUFFLED TURN ORDER:", this.turnOrder);
    }
    start() {
        this.shuffleTurnOrder();
        this.dealStartingHands();
        for (const player of this.players) {
            player.printHand();
        }
        this.flipTopCard();
        this.currentPlayerIndex = this.getStartingPlayerIndex();
        this.notifyObservers();
        console.log("CurrentPlayerIdx:", this.currentPlayerIndex);
        console.log(this.turnOrder);
        this.notifyNextTurn();
    }
    dealStartingHands() {
        // TODO: Change this back to 7 cards
        this.needsDrawAction = true;
        for (let i = 0; i < 2; i++) {
            for (const player of this.players) {
                this.performAction('draw', player);
            }
        }
        this.needsDrawAction = false;
    }
    performAction(action, player, data) {
        // TODO: This needs serious refactoring
        let command = null;
        // console.log('Performing an Action', action, data);
        switch (action) {
            case 'draw':
                command = new drawCardCommand_1.DrawCardCommand(player, () => this.drawCard());
                break;
            case 'play':
                if (data) {
                    console.log('Got a PlayCardCommand', player.getId(), data);
                    const cardToPlay = player.findCard(data);
                    console.log("Got a card to play:", cardToPlay);
                    if (cardToPlay && this.isValidPlay(cardToPlay)) {
                        // check valid play
                        command = new playCardCommand_1.PlayCardCommand(player, cardToPlay, () => this.playCard(cardToPlay));
                        if (cardToPlay instanceof unoCard_1.UNOCard) {
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
            console.log("Executing a command");
            command.execute();
            // possibly don't need this notify, will test later
            // this.notifyObservers();
            // Don't end turn if another action is required,
            // a draw action is taking place, or a player won a challenge
            if (!this.isPlayerActionRequired &&
                !this.needsDrawAction &&
                !this.playerWonChallenge) {
                console.log("Going to end turn");
                this.endTurn();
            }
            else if (this.playerWonChallenge) {
                console.log("Looking at player won Challenge");
                this.playerWonChallenge = false;
                this.notifyObservers();
            }
            else {
                console.log("Some other case");
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
        // this.notifyObservers();
        // TODO: Fix bug with Wild-Draw4 giving UNO
        this.checkUno();
        if (this.checkEmptyHand()) {
            // do sometihng
        }
        else {
            this.checkActionCard();
            console.log("Last action card:", this.lastActionCard);
            this.startNextTurn();
            this.checkDrawFourChallengeNeeded();
        }
        this.notifyObservers();
    }
    checkUno() {
        console.log('CurrentPlayerIdx:', this.currentPlayerIndex);
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer instanceof unoPlayer_1.UNOPlayer && currentPlayer.hasUno()) {
            console.log('A player has UNO! Player:', this.currentPlayerIndex);
            this.notifyAsymmetricState('uno');
        }
    }
    checkEmptyHand() {
        const currentPlayer = this.getCurrentPlayer();
        console.log("currentPlayer:", currentPlayer);
        console.log("Checking for empty hand");
        if (currentPlayer instanceof unoPlayer_1.UNOPlayer && currentPlayer.hasEmptyHand()) {
            console.log('A player emptied their hand', this.currentPlayerIndex);
            // this.notifyAsymmetricState('roundOver');
            this.notifyRoundOver();
            return true;
        }
        return false;
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
            const player = this.getCurrentPlayer();
            if (player) {
                this.handleDrawN(player, 6);
            }
        }
        this.isChallengeInProgress = false;
        this.needsDrawFourAction = false;
    }
    resolveNoChallenge() {
        // Draw four for current player, as they did not challenge Draw4
        const player = this.getCurrentPlayer();
        if (player) {
            this.handleDrawN(player, 4);
        }
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
        this.activeColor = topCard.getSuit();
        this.activeNumber = topCard.getRank();
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
            turnOrder: this.turnOrder,
        };
        this.players.forEach(player => {
            console.log(player.getHand());
        });
        // console.log("Game State:", gameState);
        // console.log("Checksum:", this.checksum(gameState));
        return gameState;
    }
    getCurrentTurnPlayerId() {
        return this.turnOrder[this.currentPlayerIndex];
    }
    getStartingPlayerIndex() {
        // return Math.floor(Math.random() * this.players.length);
        // Now shuffling turn order, so it should just be the first player in the turn order
        return 0;
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
        return this.playerMap.get(this.turnOrder[this.currentPlayerIndex]);
        // return this.players[this.currentPlayerIndex];
    }
    getPreviousPlayer() {
        return this.players[this.getPreviousPlayerIndex()];
    }
    getNextPlayer() {
        return this.playerMap.get(this.turnOrder[this.getNextPlayerIndex()]);
    }
    isValidPlay(card) {
        // return true;
        const topCard = this.discardPile[this.discardPile.length - 1];
        return true;
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
                const player = this.getNextPlayer();
                console.log(player);
                if (player) {
                    this.handleDrawN(player, 2);
                }
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