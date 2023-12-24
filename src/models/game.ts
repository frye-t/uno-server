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

export class Game {
  private players: Player[];
  private currentPlayerIndex: number;
  private turnCounter: number;
  private deck: UNODeck;
  private discardPile: UNOCard[];
  private isClockwiseTurnOrder: boolean;
  private isPlayerActionRequired: boolean;
  private activeColor: string | null;
  private activeNumber: string | null;
  private lastActionCard: { type: string; processed: boolean };
  private needsDrawAction: boolean;
  private needsDrawFourAction: boolean;
  private isChallengeInProgress: boolean;
  private playerWonChallenge: boolean;

  private observers: Observer[] = [];

  constructor(players: Player[]) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.turnCounter = 1;
    this.deck = new UNODeck();
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

  private resetActionState() {
    this.isPlayerActionRequired = false;
    this.needsDrawAction = false;
    this.needsDrawFourAction = false;
    this.isChallengeInProgress = false;
    this.playerWonChallenge = false;
  }

  addObserver(observer: Observer) {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer) {
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

  notifyNextTurn() {
    for (let observer of this.observers) {
      observer.nextTurnStart();
    }
  }

  start(): void {
    this.dealStartingHands();

    for (const player of this.players) {
      player.printHand();
    }

    this.flipTopCard();
    this.currentPlayerIndex = this.getStartingPlayerIndex();
    this.notifyObservers();
    this.notifyNextTurn();
  }

  private dealStartingHands(): void {
    // TODO: Fix this back to 7
    for (let i = 0; i < 7; i++) {
      for (const player of this.players) {
        this.performAction('draw', player);
      }
    }
  }

  performAction(action: string, player: Player, data?: ActionData): void {
    let command: GameCommand | null = null;
    console.log('Performing an Action', action, data);
    switch (action) {
      case 'draw':
        command = new DrawCardCommand(player, () => this.drawCard());
        break;
      case 'play':
        if (data) {
          console.log('Got a PlayCardCommand', player.getId(), data);
          const cardToPlay = player.findCard(data);
          if (cardToPlay && this.isValidPlay(cardToPlay)) {
            // check valid play
            command = new PlayCardCommand(player, cardToPlay, () =>
              this.playCard(cardToPlay)
            );
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
          }
          if (callback) {
            command = new AdditionalActionCommand(callback);
          }
          this.isPlayerActionRequired = false;
        }
        break;
      // TODO: Refactor to CommandPattern and AdditionalAction
      case 'challengeDrawFour':
        console.log("Player challenged Draw Four")
        this.resolveChallenge(this.doesChallengeWin());
        // Above code will be refactored into command
        command = new AdditionalActionCommand(() => {});
        break;
      case 'discardChallenge':
        this.handleDrawN(this.players[this.currentPlayerIndex], 4);
        // Above code will be refactored into command
        command = new AdditionalActionCommand(() => {});
        this.isPlayerActionRequired = false;
        this.needsDrawFourAction = false;
        this.isChallengeInProgress = false;
        break;
    }

    if (command) {
      command.execute();
      this.notifyObservers();
      console.log("NeedsDrawAction:", this.needsDrawAction);
      if (!this.isPlayerActionRequired && !this.needsDrawAction) {
        this.endTurn();
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
    this.notifyObservers();

    if (!this.isPlayerActionRequired) {
      if (!this.lastActionCard.processed) {
        this.handleActionCard(this.lastActionCard.type);
      }
    }
    if (this.needsDrawFourAction && !this.isChallengeInProgress) {
      console.log("D4A")
      this.setNextPlayerIndex();
      this.notifyNextTurn();
      this.notifyPlayerAdditionalAction('challenge');
      this.isChallengeInProgress = true;
    } else if (!this.isPlayerActionRequired && !this.playerWonChallenge) {
      console.log("Next Turn");
      this.playerWonChallenge = false;
      this.setNextPlayerIndex();
      this.notifyNextTurn();
    } else if (this.playerWonChallenge) {
      this.playerWonChallenge = false;
    }
  }

  private resolveChallenge(challengeResult: boolean): void {
    if (challengeResult) {
      this.handleDrawN(this.players[this.getPreviousPlayerIndex()], 4);
      this.notifyPlayerAdditionalAction('challengeWin');
      this.playerWonChallenge = true;
    } else {
      this.handleDrawN(this.players[this.currentPlayerIndex], 6);
      this.isChallengeInProgress = false;
      this.needsDrawFourAction = false;
      // this.endTurn();
    }
    this.isChallengeInProgress = false;
    this.needsDrawFourAction = false;
  }

  private setActiveColor(color: string) {
    this.activeColor = color;
  }

  private drawCard(): UNOCard {
    return this.deck.draw();
  }

  private playCard(card: UNOCard): void {
    this.discardPile.push(card);
    this.notifyObservers();
  }

  private getDiscardPile(): UNOCard[] {
    return this.discardPile;
  }

  private flipTopCard(): void {
    const topCard = this.drawCard();
    topCard.toggleVisible();
    this.discardPile.unshift(topCard);
  }

  getCurrentGameState(): GameState {
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

  getCurrentTurnPlayerId(): string {
    return this.players[this.currentPlayerIndex].getId();
  }

  private getStartingPlayerIndex(): number {
    return Math.floor(Math.random() * this.players.length);
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

  private isValidPlay(card: UNOCard): boolean {
    return true;
    // const topCard = this.discardPile[this.discardPile.length - 1];
    // return topCard.cardPlayableOnTop(card);
  }

  private handleDrawN(player: Player, cardsToDraw: number): void {
    this.needsDrawAction = true;
    for (let i = 0; i < cardsToDraw; i++) {
      this.performAction('draw', player);
    }
    this.needsDrawAction = false;
  }

  private handleActionCard(actionType: string): void {
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
