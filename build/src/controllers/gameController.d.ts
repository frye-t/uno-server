import { Player } from '../models/player';
import { Socket, Server } from 'socket.io';
import { GameState } from '../types/GameState';
import PlayerController from './playerController';
import { Observer } from '../types/Observer';
export declare class GameController<T extends Player> implements Observer {
    private io;
    private roomCode;
    private game;
    private playerController;
    private isNewGameSetup;
    constructor(io: Server, roomCode: string, playerController: PlayerController<T>);
    update(gameState: GameState): void;
    requirePlayerAdditionalAction(actionRequired: string): void;
    updateAsymmetricState(state: string): void;
    nextTurnStart(): void;
    bindSocketEvents(): void;
    playerJoined(socket: Socket): void;
    startGame(): void;
    private initiateTurn;
    handlePlayerAction(action: string, player: T, cardData?: {
        id: number;
        suit: string;
        rank: string;
    }): void;
    private notifyPlayerTurnStatus;
    private sendStateToPlayers;
    private sendMessage;
    private sendMessageToRoom;
}
