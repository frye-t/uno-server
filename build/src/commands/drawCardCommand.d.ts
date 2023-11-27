import { UNOCard } from '../models/unoCard';
import { Player } from '../models/player';
export declare class DrawCardCommand implements GameCommand {
    private player;
    private drawCard;
    constructor(player: Player, drawCard: () => UNOCard);
    execute(): void;
}
