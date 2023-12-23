import {Card} from './card';

export class UNOCard extends Card {
  constructor(number: string, color: string, value: number) {
    super(number, color, value);
  }

  getNumber(): string {
    return this.getRank();
  }

  getColor(): string {
    return this.getSuit();
  }

  cardPlayableOnTop(cardToPlay: UNOCard) {
    return this.getNumber() === cardToPlay.getNumber() || this.getColor() === cardToPlay.getColor() || cardToPlay.getColor() === 'Wild'
  }

  isWildCard(): boolean {
    return this.getColor() === "Wild"
  }
}
