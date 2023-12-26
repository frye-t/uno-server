import { Socket } from 'socket.io';
import { Player } from '../models/player';
import { Card } from '../models/card';

class PlayerController<T extends Player<Card>, TCard extends Card> {
  private players: Map<string, T>;
  private sockets: Map<string, Socket>;
  private createPlayerFn: () => T;

  constructor(createPlayerFn: () => T) {
    this.players = new Map();
    this.sockets = new Map();
    this.createPlayerFn = createPlayerFn;
  }

  addPlayer(socket: Socket, player: T) {
    const newPlayerId = this.generatePlayerId()
    // const newPlayer = new Player(newPlayerId);
    this.players.set(newPlayerId, player);
    this.sockets.set(newPlayerId, socket);
    console.log("in PC adding player")
  }

  createPlayer(): T  {
    const player = this.createPlayerFn();
    const id = this.generatePlayerId();
    player.init(id);
    return player;
  }

  getPlayers(): Array<T> {
    return Array.from(this.players.values());
  }

  getPlayerById(playerId: string): T | undefined {
    return this.players.get(playerId);
  }

  getPlayerSocketById(playerId: string): Socket | undefined {
    return this.sockets.get(playerId);
  }

  getPlayerBySocket(socket: Socket): T | undefined {
    for (const [playerId, playerSocket] of this.sockets.entries()) {
      if (playerSocket === socket) {
        return this.players.get(playerId);
      }
    }

    return undefined;
  }

  getPlayerIdBySocket(socket: Socket): string | undefined {
    for (const [playerId, playerSocket] of this.sockets.entries()) {
      if (playerSocket === socket) {
        return playerId;
      }
    }

    return undefined;
  }

  generatePlayerId(): string {
    return (this.players.size + 1).toString();
  }

  resetHands() {
    for (const player of this.players.values()) {
      player.resetHand();
    }
  }
}

export default PlayerController;