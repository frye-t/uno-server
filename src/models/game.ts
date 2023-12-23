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
  private direction: 'clockwise' | 'counterclockwise';
  private isPlayerActionRequired: boolean;
  private activeColor: string | null;
  private activeNumber: string | null;

  private observers: Observer[] = [];

  constructor(players: Player[]) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.turnCounter = 1;
    this.deck = new UNODeck();
    this.discardPile = [];
    this.direction = 'clockwise';
    this.deck.init();
    this.deck.shuffle();
    this.isPlayerActionRequired = false;
    this.activeColor = null;
    this.activeNumber = null;
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
    // Fix this back to 7
    for (let i = 0; i < 2; i++) {
      for (const player of this.players) {
        this.performAction('draw', player);
      }
    }
  }

  performAction(action: string, player: Player, data?: ActionData): void {
    let command: GameCommand | null = null;

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
            }
          } else {
            console.error('Invalid card played');
          }
        }
        break;
      case 'additionalAction':
        let callback: (() => void) | null = null;
        if (data?.action && data?.value) {
          const actionValue: string = data.value;
          switch (data.action) {
            case 'colorChosen':
              callback = () => this.setActiveColor(actionValue);
              break;
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
      this.notifyObservers();
      if (!this.isPlayerActionRequired) {
        this.setNextPlayerIndex();
        this.notifyNextTurn();
      }
    } else {
      console.error(
        `Action '${action}' is not recognized or rule validation failed`
      );
    }
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
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
    console.log('Next player is:', this.currentPlayerIndex);
  }

  private isValidPlay(card: UNOCard): boolean {
    const topCard = this.discardPile[this.discardPile.length - 1];
    return topCard.cardPlayableOnTop(card);
  }
}
