import {Player} from '../models/player';
import { GameCommand } from './gameCommand';
import { Card } from '../models/card';

export class DrawCardCommand<TCard extends Card> implements GameCommand {
  private player: Player<TCard>;
  private drawCard: () => TCard;

  constructor(player: Player<TCard>, drawCard: () => TCard) {
    this.player = player;
    this.drawCard = drawCard;
  }

  execute() {
    const card = this.drawCard();
    this.player.addCardToHand(card);
  }
}
