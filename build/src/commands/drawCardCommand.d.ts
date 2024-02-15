import { Player } from '../models/player';
import { GameCommand } from './gameCommand';
import { Card } from '../models/card';
export declare class DrawCardCommand<TCard extends Card> implements GameCommand {
    private player;
    private drawCard;
    constructor(player: Player<TCard>, drawCard: () => TCard);
    execute(): void;
}
