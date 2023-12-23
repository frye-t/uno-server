import {UNOCard} from '../models/unoCard';
import {Player} from '../models/player';
import { GameCommand } from './gameCommand';

export class PlayCardCommand implements GameCommand {
  private player: Player;
  private card: UNOCard;
  private playCard: () => void;

  constructor(player: Player, card: UNOCard, playCard: () => void) {
    this.player = player;
    this.card = card;
    this.playCard = playCard;
  }

  execute() {
    // if card is in player's hand and a valid play
    this.player.playCard(this.card);
    this.playCard();
  }
}
