import {UNOCard} from './unoCard';
import { Socket } from 'socket.io';

export class Player {
  private id: string;
  private socket: Socket;
  private hand: UNOCard[];

  constructor(id: string, socket: Socket) {
    this.id = id;
    this.socket = socket;
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
}
