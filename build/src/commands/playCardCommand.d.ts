import { Player } from '../models/player';
import { GameCommand } from './gameCommand';
import { Card } from '../models/card';
export declare class PlayCardCommand<TCard extends Card> implements GameCommand {
    private player;
    private card;
    private playCard;
    constructor(player: Player<TCard>, card: TCard, playCard: () => void);
    execute(): void;
}
