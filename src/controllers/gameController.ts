import { Game } from '../models/game';
import { Player } from '../models/player';
import { EventManager } from '../services/eventManager';
import { Socket, Server } from 'socket.io';
import { GameState } from '../types/GameState';
import PlayerController from './playerController';
import { UNOPlayer } from '../models/unoPlayer';
import { Observer } from '../types/Observer';
import { Card } from '../models/card';
import { Deck } from '../models/deck';
// import shortUUID from 'short-uuid';

export class GameController<TPlayer extends Player<TCard>, TCard extends Card, TDeck extends Deck<TCard>> implements Observer<TCard> {
  private io: Server;
  private roomCode: string;
  private game: Game<TPlayer, TCard, TDeck> | null = null;

  private playerController: PlayerController<TPlayer, TCard>;
  private isNewGameSetup: boolean = false;

  constructor(io: Server, roomCode: string, playerController: PlayerController<TPlayer, TCard>) {
    this.io = io;
    this.roomCode = roomCode;
    // this.players = [];
    // this.sockets = new Map();
    this.playerController = playerController;
    this.bindSocketEvents();
  }

  update(gameState: GameState<TCard>): void {
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
  
  updateAsymmetricState(state: string): void {
    const players = this.playerController.getPlayers();
    const currentPlayerId = this.game?.getCurrentTurnPlayerId();
    const selfMessage = state + 'Self'
    for (const player of players) {
      const pId = player.getId();
      if (pId === currentPlayerId) {
        this.sendMessage(pId, selfMessage)
      } else {
        this.sendMessage(pId, state, currentPlayerId)
      }
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
    // const newPlayerId = this.playerController.generatePlayerId();
    // const newPlayer = new UNOPlayer(newPlayerId);
    const newPlayer = this.playerController.createPlayer();
    this.playerController.addPlayer(socket, newPlayer);
    this.sendMessageToRoom('playerJoined', null);
  }

  // private generatePlayerId(): string {
  //   return (this.players.length + 1).toString();
  // }

  startGame(game: Game<TPlayer, TCard, TDeck>): void {
    this.game = game;
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

  handlePlayerAction(action: string, player: TPlayer, cardData?: { id: number, suit: string, rank: string }): void {
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

  private sendStateToPlayers(gameState: GameState<TCard>): void {
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
