import {UNOCard} from './unoCard';
import { Socket } from 'socket.io';

export class Player {
  private id: string;
  private hand: UNOCard[];

  constructor(id: string) {
    this.id = id;
    this.hand = [];
  }

  drawCard(card: UNOCard): void {
    this.hand.push(card);
  }

  playCard(): void {}

  addCardToHand(card: UNOCard): void {
    this.hand.push(card);
  }

  printHand(): void {
    console.log(`Player ${this.id}'s hand:`, this.hand)
  }

  getId(): string {
    return this.id;
  }

  getHand(): UNOCard[] {
    return this.hand.slice();
  }

  getHandSize(): number {
    return this.hand.length;
  }
}
