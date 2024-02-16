import { Game } from '../models/game';
import { Player } from '../models/player';
import { Socket, Server } from 'socket.io';
import { GameState } from '../types/GameState';
import PlayerController from './playerController';
import { Observer } from '../types/Observer';
import { Card } from '../models/card';
import { Deck } from '../models/deck';
export declare class GameController<TPlayer extends Player<TCard>, TCard extends Card, TDeck extends Deck<TCard>> implements Observer<TCard> {
    private io;
    private roomCode;
    private game;
    private playerController;
    private isNewGameSetup;
    private playersLoaded;
    constructor(io: Server, roomCode: string, playerController: PlayerController<TPlayer, TCard>);
    update(gameState: GameState<TCard>): void;
    playerLoaded(player: TPlayer): void;
    requirePlayerAdditionalAction(actionRequired: string): void;
    updateRoundOver(): void;
    updateAsymmetricState(state: string): void;
    nextTurnStart(): void;
    bindSocketEvents(): void;
    playerJoined(socket: Socket, isHost: boolean): void;
    setupGame(game: Game<TPlayer, TCard, TDeck>): void;
    startGame(): void;
    private initiateTurn;
    handlePlayerAction(action: string, player: TPlayer, cardData?: {
        id: number;
        suit: string;
        rank: string;
    }): void;
    private notifyPlayerTurnStatus;
    private sendStateToPlayers;
    generateChecksum(gameState: GameState<TCard>): number;
    private sendMessage;
    private sendMessageToRoom;
    private sendMessageToOthers;
}
