import { Server } from "socket.io";
import { UNOPlayer } from "../models/unoPlayer";
import { GameFactory } from "./gameFactory";
import { GameController } from "../controllers/gameController";
import PlayerController from "../controllers/playerController";
export declare class UNOGameFactory implements GameFactory<UNOPlayer> {
    createGameController(io: Server, roomCode: string, playerController: PlayerController<UNOPlayer>): GameController<UNOPlayer>;
    createPlayerController(): PlayerController<UNOPlayer>;
}
