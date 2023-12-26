import { Server } from 'socket.io';
import { GameController } from '../controllers/gameController';
import { Player } from '../models/player';
import PlayerController from '../controllers/playerController';
export interface GameFactory<T extends Player> {
    createGameController(io: Server, roomCode: string, playerController: PlayerController<T>): GameController<Player>;
    createPlayerController(): PlayerController<T>;
}
