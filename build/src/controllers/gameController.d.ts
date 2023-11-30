import { Player } from "../models/player";
import { Socket, Server } from "socket.io";
export declare class GameController {
    private io;
    private roomCode;
    private players;
    private sockets;
    private game;
    constructor(io: Server, roomCode: string);
    bindSocketEvents(): void;
    playerJoined(socket: Socket): void;
    private generatePlayerId;
    startGame(): void;
    private initiateTurn;
    private notifyPlayerTurnStatus;
    private sendMessage;
    private sendMessageToRoom;
    private sendStateToPlayers;
    handlePlayerAction(action: string, player: Player): void;
}
