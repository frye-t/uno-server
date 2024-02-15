import { Socket } from 'socket.io';
import { Player } from '../models/player';
import { Card } from '../models/card';

class PlayerController<T extends Player<Card>, TCard extends Card> {
  private players: Map<string, T>;
  private sockets: Map<string, Socket>;
  private createPlayerFn: () => T;
  private currentPlayerId: number;
  private currentTurnPlayerId: string;

  constructor(createPlayerFn: () => T) {
    this.players = new Map();
    this.sockets = new Map();
    this.createPlayerFn = createPlayerFn;
    this.currentPlayerId = 1;

    this.currentTurnPlayerId = '0';
  }

  addPlayer(socket: Socket, player: T) {
    console.log('Calling addPlayer');
    const newPlayerId = player.getId();
    // const newPlayer = new Player(newPlayerId);
    this.players.set(newPlayerId, player);
    this.sockets.set(newPlayerId, socket);
    console.log('in PC adding player');
  }

  removePlayer(playerId: string) {
    console.log('Deleting Player:', playerId);
    this.players.delete(playerId);
    this.sockets.delete(playerId);
  }

  createPlayer(isHost: boolean): T {
    console.log('Calling createPlayer');
    const player = this.createPlayerFn();
    const id = this.generatePlayerId();
    player.init(id, isHost);
    return player;
  }

  getPlayers(): Array<T> {
    return Array.from(this.players.values());
  }

  getPlayerNames(): Array<string> {
    console.log(this.getPlayers());
    return this.getPlayers().map((player) => player.getName());
  }

  getNumberOfPlayers(): number {
    return Array.from(this.players.values()).length;
  }

  getPlayerById(playerId: string): T | undefined {
    return this.players.get(playerId);
  }

  getPlayerIds(): string[] {
    return Array.from(this.players.keys());
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
    const id = this.currentPlayerId;
    this.currentPlayerId++;
    return id.toString();
  }

  resetHands() {
    for (const player of this.players.values()) {
      player.resetHand();
    }
  }
}

export default PlayerController;
