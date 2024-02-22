import { Card } from "./card";
import { Player } from "./player"
import { UNOCard } from "./unoCard";

export class UNOPlayer extends Player<UNOCard> {
  private declaredUno: boolean;

  constructor() {
    super()
    this.declaredUno = false;
  }

  hasUno(): boolean {
    console.log("Checking hand size");
    console.log(this.getHandSize());
    return this.getHandSize() === 1;
  }

  hasEmptyHand(): boolean {
    return this.getHandSize() === 0;
  }

  canUno(topCard: Card, activeColor: string | null): boolean {
    if (this.getHandSize() !== 2) {
      this.declaredUno = false;
      return false;
    }

    return true;
    // return this.hand.some(
    //   (card) =>
    //     topCard.getRank() === card.getRank() ||
    //     topCard.getSuit() === card.getSuit() ||
    //     card.getSuit() === 'Wild' ||
    //     card.getSuit() === activeColor
    // );
  }

  setDeclaredUno(value: boolean) {
    this.declaredUno = value;
  }

  hasDeclaredUno(): boolean {
    return this.declaredUno;
  }
}