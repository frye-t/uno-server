import { Card } from "./card";
import { Player } from "./player"
import { UNOCard } from "./unoCard";

export class UNOPlayer extends Player<UNOCard> {
  constructor() {
    super()
  }

  hasUno(): boolean {
    return this.getHandSize() === 1;
  }

  hasEmptyHand(): boolean {
    return this.getHandSize() === 0;
  }
}