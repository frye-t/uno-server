import { ActionData } from '../types/ActionData';
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

  playCard(card: UNOCard): void {
    this.hand = this.hand.filter(c => c != card);
  }

  findCard(cardData: ActionData): UNOCard | null {
    return this.hand.find(card => card.getColor() === cardData.suit && card.getNumber() === cardData.rank) || null
  }

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
