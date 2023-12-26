import { ActionData } from '../types/ActionData';
import {UNOCard} from './unoCard';
import { Card } from './card';
import { Socket } from 'socket.io';

export class Player<TCard extends Card> {
  private id: string;
  private hand: TCard[];

  constructor() {
    this.id = '';
    this.hand = [];
  }

  init(id: string) {
    this.id = id;
  }

  drawCard(card: TCard): void {
    this.hand.push(card);
  }

  playCard(card: TCard): void {
    this.hand = this.hand.filter(c => c != card);
  }

  findCard(cardData: ActionData): TCard | null {
    return this.hand.find(card => card.getSuit() === cardData.suit && card.getRank() === cardData.rank) || null
  }

  addCardToHand(card: TCard): void {
    this.hand.push(card);
  }

  printHand(): void {
    console.log(`Player ${this.id}'s hand:`, this.hand)
  }

  getId(): string {
    return this.id;
  }

  getHand(): TCard[] {
    return this.hand.slice();
  }

  getHandSize(): number {
    return this.hand.length;
  }

  resetHand(): void {
    this.hand = [];
  }
}
