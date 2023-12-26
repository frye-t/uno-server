import {Player} from '../models/player';
import { GameCommand } from './gameCommand';
import { Card } from '../models/card';

export class PlayCardCommand<TCard extends Card> implements GameCommand {
  private player: Player<TCard>;
  private card: TCard;
  private playCard: () => void;

  constructor(player: Player<TCard>, card: TCard, playCard: () => void) {
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
