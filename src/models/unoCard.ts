import { Card } from './card';

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
    console.log('now here');
    console.log('Trying to validate', cardToPlay);
    console.log('Playable on top of', this);
    return (
      this.getNumber() === cardToPlay.getNumber() ||
      this.getColor() === cardToPlay.getColor() ||
      cardToPlay.getColor() === 'Wild'
    );
  }

  isWildCard(): boolean {
    return this.getColor() === 'Wild';
  }

  isWildDrawFour(): boolean {
    return this.getColor() === 'Wild' && this.getNumber() === 'Draw4';
  }

  isActionCard(): boolean {
    const actionCards = ['Draw2', 'Skip', 'Reverse'];
    return actionCards.includes(this.getNumber());
  }
}
