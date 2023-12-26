import { Socket } from 'socket.io';
import { Player } from '../models/player';
declare class PlayerController<T extends Player> {
    private players;
    private sockets;
    private createPlayerFn;
    constructor(createPlayerFn: () => T);
    addPlayer(socket: Socket, player: T): void;
    createPlayer(): T;
    getPlayers(): Array<T>;
    getPlayerById(playerId: string): T | undefined;
    getPlayerSocketById(playerId: string): Socket | undefined;
    getPlayerBySocket(socket: Socket): T | undefined;
    getPlayerIdBySocket(socket: Socket): string | undefined;
    generatePlayerId(): string;
}
export default PlayerController;
