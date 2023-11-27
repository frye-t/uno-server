import {Player} from './player';
import {UNOCard} from './unoCard';
import {UNODeck} from './unoDeck';
import {DrawCardCommand} from '../commands/drawCardCommand';

export class Game {
  private players: Player[];
  private currentPlayerIndex: number;
  private deck: UNODeck;
  private discardPile: UNOCard[];
  private direction: 'clockwise' | 'counterclockwise';

  constructor(players: Player[]) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.deck = new UNODeck();
    this.discardPile = [];
    this.direction = 'clockwise';
    this.deck.init();
    this.deck.shuffle();
  }

  start(): void {
    this.dealStartingHands();

    for (const player of this.players) {
      player.printHand();
    }

    this.flipTopCard();
  }

  private dealStartingHands(): void {
    for (let i = 0; i < 7; i++) {
      for (const player of this.players) {
        this.performAction('draw', player);
      }
    }
  }

  performAction(action: string, player: Player): void {
    let command: GameCommand | null = null;

    switch (action) {
      case 'draw':
        command = new DrawCardCommand(player, () => this.deck.draw());
        break;
    }

    if (command) {
      command.execute();
    } else {
      console.error(`Action '${action}' is not recognized`);
    }
  }

  drawCard(): UNOCard {
    return this.deck.draw();
  }

  getDiscardPile(): UNOCard[] {
    return this.discardPile;
  }

  private flipTopCard(): void {
    const topCard = this.deck.draw();
    topCard.toggleVisible();
    this.discardPile.unshift(topCard);
  }
}
