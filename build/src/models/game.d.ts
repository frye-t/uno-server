import { Player } from './player';
import { UNOCard } from './unoCard';
import { GameState } from '../types';
export declare class Game {
    private players;
    private currentPlayerIndex;
    private deck;
    private discardPile;
    private direction;
    constructor(players: Player[]);
    start(): void;
    private dealStartingHands;
    performAction(action: string, player: Player): void;
    drawCard(): UNOCard;
    getDiscardPile(): UNOCard[];
    private flipTopCard;
    getCurrentGameState(): GameState;
    getCurrentTurnPlayerId(): string;
    private getStartingPlayerIndex;
}
