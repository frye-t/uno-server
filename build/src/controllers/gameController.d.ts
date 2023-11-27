import { Player } from '../models/player';
export declare class GameController {
    private game;
    private eventManager;
    constructor(players: Player[]);
    startGame(): void;
    handlePlayerAction(action: string, player: Player): void;
}
