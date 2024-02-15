import { Server } from "socket.io";
import { UNOPlayer } from "../models/unoPlayer";
import { GameFactory } from "./gameFactory";
import { GameController } from "../controllers/gameController";
import PlayerController from "../controllers/playerController";
import { UNOCard } from "../models/unoCard";
import { UNODeck } from "../models/unoDeck";
import { Game } from "../models/game";

export class UNOGameFactory implements GameFactory<UNOPlayer, UNOCard, UNODeck> {
  createGameController(io: Server, roomCode:string, playerController: PlayerController<UNOPlayer, UNOCard>):GameController<UNOPlayer, UNOCard, UNODeck> {
    return new GameController<UNOPlayer, UNOCard, UNODeck>(io, roomCode, playerController);
  }

  createPlayerController(): PlayerController<UNOPlayer, UNOCard> {
    return new PlayerController<UNOPlayer, UNOCard>(() => new UNOPlayer());
  }

  createGame(players: UNOPlayer[], playerController: PlayerController<UNOPlayer, UNOCard>): Game<UNOPlayer, UNOCard, UNODeck> {
    const unoDeck = new UNODeck();
    return new Game<UNOPlayer, UNOCard, UNODeck>(players, unoDeck, playerController);
  }
}