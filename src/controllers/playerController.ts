import { Socket } from 'socket.io';
import { Player } from '../models/player';

class PlayerController {
  private players: Map<string, Player>;
  private sockets: Map<string, Socket>;

  constructor() {
    this.players = new Map();
    this.sockets = new Map();
  }

  addPlayer(socket: Socket) {
    const newPlayerId = this.generatePlayerId()
    const newPlayer = new Player(newPlayerId);
    this.players.set(newPlayerId, newPlayer);
    this.sockets.set(newPlayerId, socket);
    console.log("in PC adding player")
  }

  getPlayers() {
    return Array.from(this.players.values());
  }

  getPlayerById(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getPlayerSocketById(playerId: string): Socket | undefined {
    return this.sockets.get(playerId);
  }

  getPlayerBySocket(socket: Socket): Player | undefined {
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

  private generatePlayerId(): string {
    return (this.players.size + 1).toString();
  }
}

export default PlayerController;