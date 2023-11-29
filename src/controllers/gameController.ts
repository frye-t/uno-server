import {Game} from '../models/game';
import {Player} from '../models/player';
import {EventManager} from '../services/eventManager';
import { Socket, Server } from 'socket.io';

export class GameController {
  private io: Server;
  private roomCode: string;
  private players: Player[];
  private game: Game | null = null;
  private eventManager: EventManager;

  constructor(io: Server, roomCode: string) {
    this.io = io;
    this.roomCode = roomCode;
    this.players = [];
    this.eventManager = new EventManager();
  }

  playerJoined(socket: Socket): void {
    const player = new Player(this.players.length.toString(), socket)
    this.players.push(player);
    this.io.to(this.roomCode).emit('playerJoined');
  }

  startGame(): void {
    this.game = new Game(this.players);
    this.game.start();
    this.io.to(this.roomCode).emit("gameStarted");
    // const discardPile = this.game.getDiscardPile();
  }

  handlePlayerAction(action: string, player: Player): void {
    if (!this.game) {
      console.error('Game is not initialized');
      return;
    }

    this.game.performAction(action, player);
  }
}
