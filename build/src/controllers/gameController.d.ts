import { Player } from '../models/player';
import { Socket, Server } from 'socket.io';
export declare class GameController {
    private io;
    private roomCode;
    private players;
    private game;
    private eventManager;
    constructor(io: Server, roomCode: string);
    playerJoined(socket: Socket): void;
    startGame(): void;
    handlePlayerAction(action: string, player: Player): void;
}
