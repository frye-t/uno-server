import { Server } from 'socket.io';
import { GameController } from '../controllers/gameController';
import { Player } from '../models/player';
import PlayerController from '../controllers/playerController';
import { Card } from '../models/card';
import { Deck } from '../models/deck';
import { Game } from '../models/game';

export interface GameFactory<TPlayer extends Player<TCard>, TCard extends Card, TDeck extends Deck<TCard>> {
  createGameController(
    io: Server,
    roomCode: string,
    playerController: PlayerController<TPlayer, TCard>
  ): GameController<TPlayer, TCard, TDeck>;
  createPlayerController(): PlayerController<TPlayer, TCard>;
  createGame(players: TPlayer[], playerController: PlayerController<TPlayer, TCard>): Game<TPlayer, TCard, TDeck>;
}
