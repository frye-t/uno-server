import { Game } from '../models/game';
import { Player } from '../models/player';
import { EventManager } from '../services/eventManager';
import { Socket, Server } from 'socket.io';
import { GameState } from '../types/GameState';
import PlayerController from './playerController';
import { Observer } from '../types/Observer';
// import shortUUID from 'short-uuid';

export class GameController implements Observer {
  private io: Server;
  private roomCode: string;
  private players: Player[];
  private sockets: Map<string, Socket>;
  private game: Game | null = null;
  private playerController: PlayerController;
  private isNewGameSetup: boolean = false;

  constructor(io: Server, roomCode: string, playerController: PlayerController) {
    this.io = io;
    this.roomCode = roomCode;
    this.players = [];
    this.sockets = new Map();
    this.playerController = playerController;
    this.bindSocketEvents();
  }

  update(gameState: GameState): void {
    this.sendStateToPlayers(gameState);

    if (this.isNewGameSetup) {
      this.isNewGameSetup = false;
    }
  }

  requirePlayerAdditionalAction(actionRequired: string): void {
    console.log("Need additional action:", actionRequired);
    const playerId = this.game?.getCurrentTurnPlayerId();
    if (playerId){
      this.sendMessage(playerId, actionRequired)
    }
  }

  nextTurnStart(): void {
    this.initiateTurn();
  }

  bindSocketEvents() {}

  playerJoined(socket: Socket): void {
    // const newPlayerId = this.generatePlayerId();
    // const player = new Player(newPlayerId);
    // this.players.push(player);
    // this.sockets.set(newPlayerId, socket);
    this.playerController.addPlayer(socket);
    this.sendMessageToRoom('playerJoined', null);
  }

  // private generatePlayerId(): string {
  //   return (this.players.length + 1).toString();
  // }

  startGame(): void {
    this.game = new Game(this.playerController.getPlayers());
    this.game.addObserver(this);
    this.isNewGameSetup = true;
    this.game.start();
    this.sendMessageToRoom('gameStarted', null);

    // this.updateGameStateToClients();
    // this.initiateTurn();
  }

  // private updateGameStateToClients() {
  //   if (this.game) {
  //     const gameState = this.game.getCurrentGameState();
  //     this.sendStateToPlayers(gameState);
  //   } else {
  //     console.error('Game is not initialized');
  //   }
  // }

  private initiateTurn() {
    if (this.game) {
      const currentTurnPlayerId = this.game?.getCurrentTurnPlayerId();
      const players = this.playerController.getPlayers();
      for (const player of players) {
        const playerId = player.getId();
        const isCurrentTurn = currentTurnPlayerId === playerId;
        this.notifyPlayerTurnStatus(
          playerId,
          isCurrentTurn,
          currentTurnPlayerId
        );
      }
    } else {
      console.error('Game is not initialized');
    }
  }

  handlePlayerAction(action: string, player: Player, cardData?: { id: number, suit: string, rank: string }): void {
    if (!this.game) {
      console.error('Game is not initialized');
      return;
    }

    if (cardData) {
      this.game.performAction(action, player, cardData);
    } else {
      this.game.performAction(action, player);
    }
  }

  private notifyPlayerTurnStatus(
    playerId: string,
    isCurrentTurn: boolean,
    currentTurnPlayerId: string
  ) {
    if (isCurrentTurn) {
      this.sendMessage(playerId, 'turnStart');
    } else {
      this.sendMessage(playerId, 'turnWaiting', currentTurnPlayerId);
    }
  }

  private sendStateToPlayers(gameState: GameState): void {
    const players = this.playerController.getPlayers();
    for (const player of players) {
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

      this.sendMessage(playerId, 'gameState', JSON.stringify(playerGameState));
    }
  }

  private sendMessage(playerId: string, messageType: string, data?: any) {
    // const socket = this.sockets.get(playerId);
    const socket = this.playerController.getPlayerSocketById(playerId);

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
}
