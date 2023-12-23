import { Socket } from 'socket.io';
import { Player } from '../models/player';
declare class PlayerController {
    private players;
    private sockets;
    constructor();
    addPlayer(socket: Socket): void;
    getPlayers(): Player[];
    getPlayerById(playerId: string): Player | undefined;
    getPlayerSocketById(playerId: string): Socket | undefined;
    getPlayerBySocket(socket: Socket): Player | undefined;
    getPlayerIdBySocket(socket: Socket): string | undefined;
    private generatePlayerId;
}
export default PlayerController;
