import { Player } from './player';
import { GameState } from '../types/GameState';
import { Observer } from '../types/Observer';
export declare class Game {
    private players;
    private currentPlayerIndex;
    private turnCounter;
    private deck;
    private discardPile;
    private direction;
    private observers;
    constructor(players: Player[]);
    addObserver(observer: Observer): void;
    removeObserver(observer: Observer): void;
    notifyObservers(): void;
    start(): void;
    private dealStartingHands;
    performAction(action: string, player: Player, cardData?: {
        id: number;
        suit: string;
        rank: string;
    }): void;
    private drawCard;
    private playCard;
    private getDiscardPile;
    private flipTopCard;
    getCurrentGameState(): GameState;
    getCurrentTurnPlayerId(): string;
    private getStartingPlayerIndex;
    private setNextPlayerIndex;
    private isValidPlay;
}
