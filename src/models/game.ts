import { Player } from './player';
import { UNOCard } from './unoCard';
import { UNODeck } from './unoDeck';
import { DrawCardCommand } from '../commands/drawCardCommand';
import { GameState } from '../types/GameState';
import { Observer } from '../types/Observer';
import { GameCommand } from '../commands/gameCommand';
import { PlayCardCommand } from '../commands/playCardCommand';
import { ActionData } from '../types/ActionData';
import { AdditionalActionCommand } from '../commands/additionalActionCommand';
import { UNOPlayer } from './unoPlayer';
import { Card } from './card';
import { Deck } from './deck';
import PlayerController from '../controllers/playerController';

export class Game<TPlayer extends Player<TCard>, TCard extends Card, TDeck extends Deck<TCard>> {
  private players: TPlayer[];
  private playerMap: Map<string, TPlayer>;
  private playerController: PlayerController<TPlayer, TCard>;
  private turnOrder: string[];
  private currentPlayerIndex: number;
  private deck: TDeck;
  private discardPile: TCard[];
  private isClockwiseTurnOrder: boolean;
  private isPlayerActionRequired: boolean;
  private activeColor: string | null;
  private activeNumber: string | null;
  private lastActionCard: { type: string; processed: boolean };

  // Flags for controlling turn start/end
  private needsDrawAction: boolean;
  private needsDrawFourAction: boolean;
  private isChallengeInProgress: boolean;
  private playerWonChallenge: boolean;

  private observers: Observer<TCard>[] = [];
  constructor(players: TPlayer[], deck: TDeck, playerController: PlayerController<TPlayer, TCard>) {
    this.players = players;
    console.log(this.players);

    this.playerMap = new Map();
    this.players.forEach(player => {
      this.playerMap.set(player.getId(), player);
    })
    console.log("!!!PLAYER MAP!!!")
    console.log(this.playerMap);

    this.playerController = playerController;

    this.turnOrder = playerController.getPlayerIds();
    this.currentPlayerIndex = 0;
    this.deck = deck;
    this.discardPile = [];

    this.isClockwiseTurnOrder = true;
    if (this.deck instanceof UNODeck) {
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

  addObserver(observer: Observer<TCard>) {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer<TCard>) {
    this.observers = this.observers.filter((obs) => obs != observer);
  }

  notifyObservers() {
    for (let observer of this.observers) {
      observer.update(this.getCurrentGameState());
    }
  }

  notifyPlayerAdditionalAction(actionRequired: string) {
    for (let observer of this.observers) {
      observer.requirePlayerAdditionalAction(actionRequired);
    }
  }

  notifyAsymmetricState(state: string) {
    for (let observer of this.observers) {
      observer.updateAsymmetricState(state);
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

  start(): void {
    this.shuffleTurnOrder()
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

  private dealStartingHands(): void {
    this.needsDrawAction = true;
    for (let i = 0; i < 7; i++) {
      for (const player of this.players) {
        this.performAction('draw', player);
      }
    }
    this.needsDrawAction = false;
  }

  performAction(action: string, player: TPlayer, data?: ActionData): void {
    // TODO: This needs serious refactoring
    let command: GameCommand | null = null;
    // console.log('Performing an Action', action, data);
    switch (action) {
      case 'draw':
        command = new DrawCardCommand(player, () => this.drawCard());
        break;
      case 'play':
        if (data) {
          console.log('Got a PlayCardCommand', player.getId(), data);
          const cardToPlay = player.findCard(data);
          console.log("Got a card to play:", cardToPlay);
          if (cardToPlay && this.isValidPlay(cardToPlay)) {
            // check valid play
            command = new PlayCardCommand(player, cardToPlay, () =>
              this.playCard(cardToPlay)
            );
            if (cardToPlay instanceof UNOCard) {
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
          } else {
            console.error('Invalid card played');
          }
        }
        break;
      case 'additionalAction':
        console.log('performing another action');
        let callback: (() => void) | null = null;
        if (data?.action && data?.value) {
          const actionValue: string = data.value;
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
              } else {
                console.log('Player declined Draw Four Challenge');
                callback = () => this.resolveNoChallenge();
                break;
              }
          }
          if (callback) {
            command = new AdditionalActionCommand(callback);
          }
          this.isPlayerActionRequired = false;
        }
        break;
    }

    if (command) {
      command.execute();
      // possibly don't need this notify, will test later
      // this.notifyObservers();
      // Don't end turn if another action is required,
      // a draw action is taking place, or a player won a challenge
      if (
        !this.isPlayerActionRequired &&
        !this.needsDrawAction &&
        !this.playerWonChallenge
      ) {
        this.endTurn();
      } else if (this.playerWonChallenge) {
        this.playerWonChallenge = false;
        this.notifyObservers();
      }
    } else {
      console.error(
        `Action '${action}' is not recognized or rule validation failed`
      );
    }
  }

  private doesChallengeWin(): boolean {
    return true;
  }

  private endTurn(): void {
    // this.notifyObservers();

    // TODO: Fix bug with Wild-Draw4 giving UNO
    this.checkUno();

    
    if (this.checkEmptyHand()) {
      // do sometihng
    } else {
      this.checkActionCard();
      console.log("Last action card:", this.lastActionCard)
      this.startNextTurn();
      this.checkDrawFourChallengeNeeded();
    }
    this.notifyObservers();
  }

  private checkUno() {
    console.log('CurrentPlayerIdx:', this.currentPlayerIndex);
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer instanceof UNOPlayer && currentPlayer.hasUno()) {
      console.log('A player has UNO! Player:', this.currentPlayerIndex);
      this.notifyAsymmetricState('uno');
    }
  }

  private checkEmptyHand(): boolean {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer instanceof UNOPlayer && currentPlayer.hasEmptyHand()) {
      console.log('A player emptied their hand', this.currentPlayerIndex);
      this.notifyAsymmetricState('roundOver');
      return true;
    }
    return false;
  }

  private checkActionCard() {
    if (!this.isPlayerActionRequired) {
      if (!this.lastActionCard.processed) {
        this.handleActionCard(this.lastActionCard.type);
      }
    }
  }

  private startNextTurn() {
    this.setNextPlayerIndex();
    this.notifyNextTurn();
  }

  private checkDrawFourChallengeNeeded() {
    if (this.needsDrawFourAction && !this.isChallengeInProgress) {
      // Handle beginning a challenge on next turn
      this.notifyPlayerAdditionalAction('challenge');
      this.isChallengeInProgress = true;
    }
  }

  private resolveChallenge(challengeResult: boolean): void {
    if (challengeResult) {
      // Draw 4 for previous player, as challenger won
      this.handleDrawN(this.getPreviousPlayer(), 4);
      this.notifyPlayerAdditionalAction('challengeWin');
      this.playerWonChallenge = true;
    } else {
      // Draw 6 for currnet player, as challenger lost
      this.handleDrawN(this.getCurrentPlayer(), 6);
    }
    this.isChallengeInProgress = false;
    this.needsDrawFourAction = false;
  }

  private resolveNoChallenge(): void {
    // Draw four for current player, as they did not challenge Draw4
    this.handleDrawN(this.getCurrentPlayer(), 4);
    this.needsDrawFourAction = false;
    this.isChallengeInProgress = false;
  }

  private setActiveColor(color: string) {
    this.activeColor = color;
  }

  private drawCard(): TCard {
    return this.deck.draw();
  }

  private playCard(card: TCard): void {
    this.discardPile.push(card);
    this.notifyObservers();
  }

  private flipTopCard(): void {
    const topCard = this.drawCard();
    this.activeColor = topCard.getSuit();
    this.activeNumber = topCard.getRank();
    topCard.toggleVisible();
    this.discardPile.unshift(topCard);
  }

  getCurrentGameState(): GameState<TCard> {
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
    })

    console.log("Game State:", gameState);
    // console.log("Checksum:", this.checksum(gameState));
    return gameState;
  }

  getCurrentTurnPlayerId(): string {
    return this.turnOrder[this.currentPlayerIndex]
  }

  private getStartingPlayerIndex(): number {
    // return Math.floor(Math.random() * this.players.length);
    // Now shuffling turn order, so it should just be the first player in the turn order
    return 0;
  }

  private setNextPlayerIndex(): void {
    const incrementer = this.isClockwiseTurnOrder ? 1 : -1;
    const playerCount = this.players.length;
    this.currentPlayerIndex =
      (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
    console.log('Next player is:', this.currentPlayerIndex);
  }

  private getNextPlayerIndex(): number {
    const incrementer = this.isClockwiseTurnOrder ? 1 : -1;
    const playerCount = this.players.length;
    return (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
  }

  private getPreviousPlayerIndex(): number {
    const incrementer = !this.isClockwiseTurnOrder ? 1 : -1;
    const playerCount = this.players.length;
    return (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
  }

  private getCurrentPlayer(): TPlayer {
    console.log('players:', this.players);
    console.log('currentPlayerIndex', this.currentPlayerIndex);
    return this.players[this.currentPlayerIndex];
  }

  private getPreviousPlayer(): TPlayer {
    return this.players[this.getPreviousPlayerIndex()];
  }

  private getNextPlayer(): TPlayer | undefined {
    return this.playerMap.get(this.turnOrder[this.getNextPlayerIndex()])
  }

  private isValidPlay(card: TCard): boolean {
    // return true;
    console.log("here");
    const topCard = this.discardPile[this.discardPile.length - 1];
    console.log("topCard:", topCard)
    console.log("card:", card);
    return topCard.cardPlayableOnTop(card);
  }

  private handleDrawN(player: TPlayer, cardsToDraw: number): void {
    // Need this flag to avoid turn skipping on action execution
    this.needsDrawAction = true;
    for (let i = 0; i < cardsToDraw; i++) {
      this.performAction('draw', player);
    }
    this.needsDrawAction = false;
  }

  private handleActionCard(actionType: string): void {
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
