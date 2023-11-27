import {Card} from './card';

export class Deck<T extends Card> {
  private cards: T[];

  constructor(cards: T[] = []) {
    this.cards = cards;
  }

  protected setCards(cards: T[]): void {
    this.cards = cards;
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): T {
    if (this.cards.length === 0) {
      throw new Error('No more cards in the deck');
    }
    return this.cards.shift()!;
  }

  printDeck(): void {
    this.cards.forEach((c, i) => {
      console.log(`${i}:`, c.toString());
    });
    console.log(this.cards.length);
  }

  printTopFive(): void {
    for (let i = 0; i < 5; i++) {
      console.log(this.cards[i].toString());
    }
  }

  insertTop(card: T): void {
    this.cards.unshift(card);
  }

  insertBottom(card: T): void {
    this.cards.push(card);
  }

  insertMiddle(card: T): number {
    const deckSize = this.cards.length;
    const half = Math.floor(deckSize / 2);

    let offset = Math.floor(half / 3);
    if (deckSize <= 10) offset = Math.floor(deckSize / 4);

    const min = half - offset;
    const max = half + offset;
    const index = Math.floor(Math.random() * (max - min + 1)) + min;
    this.cards.splice(index, 0, card);

    return index;
  }

  size(): number {
    return this.cards.length;
  }

  peek(index = 0): T {
    if (index < 0 || index >= this.cards.length) {
      throw new Error('Index out of bounds');
    }
    return this.cards[index];
  }

  clear(): void {
    this.cards = [];
  }

  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  clone(): Deck<T> {
    return new Deck<T>([...this.cards]);
  }

  merge(otherDeck: Deck<T>): void {
    this.cards = [...this.cards, ...otherDeck.cards];
  }

  drawMultiple(num: number): T[] {
    if (num > this.cards.length) {
      throw new Error('Not enough cards in the deck');
    }
    return Array.from({length: num}, () => this.draw());
  }

  countCardType(predicate: (card: T) => boolean): number {
    return this.cards.filter(predicate).length;
  }
}
