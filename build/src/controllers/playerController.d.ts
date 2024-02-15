import { Socket } from 'socket.io';
import { Player } from '../models/player';
import { Card } from '../models/card';
declare class PlayerController<T extends Player<Card>, TCard extends Card> {
    private players;
    private sockets;
    private createPlayerFn;
    private currentPlayerId;
    private currentTurnPlayerId;
    constructor(createPlayerFn: () => T);
    addPlayer(socket: Socket, player: T): void;
    removePlayer(playerId: string): void;
    createPlayer(isHost: boolean): T;
    getPlayers(): Array<T>;
    getPlayerNames(): Array<string>;
    getNumberOfPlayers(): number;
    getPlayerById(playerId: string): T | undefined;
    getPlayerIds(): string[];
    getPlayerSocketById(playerId: string): Socket | undefined;
    getPlayerBySocket(socket: Socket): T | undefined;
    getPlayerIdBySocket(socket: Socket): string | undefined;
    generatePlayerId(): string;
    resetHands(): void;
}
export default PlayerController;
