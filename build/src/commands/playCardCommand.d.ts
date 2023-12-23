import { UNOCard } from '../models/unoCard';
import { Player } from '../models/player';
import { GameCommand } from './gameCommand';
export declare class PlayCardCommand implements GameCommand {
    private player;
    private card;
    private playCard;
    constructor(player: Player, card: UNOCard, playCard: () => void);
    execute(): void;
}
