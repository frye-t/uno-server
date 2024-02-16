export class Card {
  private rank: string;
  private suit: string;
  private value: number;
  private visible: boolean;

  constructor(rank: string, suit: string, value: number, visible = false) {
    this.rank = rank;
    this.suit = suit;
    this.value = value;
    this.visible = visible;
  }

  toString(): string {
    return `${this.suit}_${this.rank}: ${this.value}`;
  }

  getRank(): string {
    return this.rank;
  }

  getSuit(): string {
    return this.suit;
  }

  getValue(): number {
    return this.value;
  }

  toggleVisible(): void {
    this.visible = !this.visible;
  }

  cardPlayableOnTop(card: Card): boolean {
    // Override this method
    return false;
  }
}
