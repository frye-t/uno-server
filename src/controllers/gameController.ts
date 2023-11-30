import { Game } from "../models/game";
import { Player } from "../models/player";
import { EventManager } from "../services/eventManager";
import { Socket, Server } from "socket.io";
import { GameState } from "../types";
import shortUUID from "short-uuid";

export class GameController {
  private io: Server;
  private roomCode: string;
  private players: Player[];
  private sockets: Map<string, Socket>;
  private game: Game | null = null;

  constructor(io: Server, roomCode: string) {
    this.io = io;
    this.roomCode = roomCode;
    this.players = [];
    this.sockets = new Map();
    this.bindSocketEvents();
  }

  bindSocketEvents() {}

  playerJoined(socket: Socket): void {
    const newPlayerId = this.generatePlayerId();
    const player = new Player(newPlayerId);
    this.players.push(player);
    this.sockets.set(newPlayerId, socket);
    this.sendMessageToRoom("playerJoined", null);
  }

  private generatePlayerId(): string {
    return (this.players.length + 1).toString();
  }

  startGame(): void {
    this.game = new Game(this.players);
    this.game.start();
    this.sendMessageToRoom("gameStarted", null);
    const gameState = this.game.getCurrentGameState();
    this.sendStateToPlayers(gameState);

    const currentTurnPlayerId = this.game.getCurrentTurnPlayerId();
    this.initiateTurn(currentTurnPlayerId);
  }

  private initiateTurn(currentTurnPlayerId: string) {
    for (const player of this.players) {
      const playerId = player.getId();
      const isCurrentTurn = currentTurnPlayerId === playerId;
      this.notifyPlayerTurnStatus(playerId, isCurrentTurn, currentTurnPlayerId);
    }
  }

  private notifyPlayerTurnStatus(
    playerId: string,
    isCurrentTurn: boolean,
    currentTurnPlayerId: string
  ) {
    if (isCurrentTurn) {
      this.sendMessage(playerId, "turnStart");
    } else {
      this.sendMessage(playerId, "turnWaiting", currentTurnPlayerId);
    }
  }

  private sendMessage(playerId: string, messageType: string, data?: any) {
    const socket = this.sockets.get(playerId);

    if (!socket) {
      console.error(`Socket not found for player ${playerId}`);
      return;
    }

    try {
      socket.emit(messageType, data);
    } catch (error) {
      console.error(
        `Failed to send ${messageType} message to player ${playerId}:`,
        error
      );
    }
  }

  private sendMessageToRoom(messageType: string, data?: any) {
    this.io.to(this.roomCode).emit(messageType, data);
  }

  private sendStateToPlayers(gameState: GameState): void {
    for (const player of this.players) {
      const playerId = player.getId();

      const playerGameState = {
        ...gameState,
        players: gameState.players.map((p) => {
          if (p.id === playerId) {
            return { id: p.id, cardCount: p.cardCount, hand: p.hand };
          } else {
            return { id: p.id, cardCount: p.cardCount };
          }
        }),
      };
      
      this.sendMessage(playerId, "gameState", JSON.stringify(playerGameState));
    }
  }

  handlePlayerAction(action: string, player: Player): void {
    if (!this.game) {
      console.error("Game is not initialized");
      return;
    }

    this.game.performAction(action, player);
  }
}
