import {UNOCard} from '../models/unoCard';
import {Player} from '../models/player';

export class DrawCardCommand implements GameCommand {
  private player: Player;
  private drawCard: () => UNOCard;

  constructor(player: Player, drawCard: () => UNOCard) {
    this.player = player;
    this.drawCard = drawCard;
  }

  execute() {
    const card = this.drawCard();
    this.player.addCardToHand(card);
  }
}
