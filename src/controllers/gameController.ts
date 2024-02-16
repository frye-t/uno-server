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

export class GameController<
  TPlayer extends Player<TCard>,
  TCard extends Card,
  TDeck extends Deck<TCard>,
> implements Observer<TCard>
{
  private io: Server;
  private roomCode: string;
  private game: Game<TPlayer, TCard, TDeck> | null = null;

  private playerController: PlayerController<TPlayer, TCard>;
  private isNewGameSetup: boolean = false;

  private playersLoaded: number;

  constructor(
    io: Server,
    roomCode: string,
    playerController: PlayerController<TPlayer, TCard>
  ) {
    this.io = io;
    this.roomCode = roomCode;
    // this.players = [];
    // this.sockets = new Map();
    this.playerController = playerController;
    this.bindSocketEvents();

    this.playersLoaded = 0;
  }

  update(gameState: GameState<TCard>): void {
    this.sendStateToPlayers(gameState);

    if (this.isNewGameSetup) {
      this.isNewGameSetup = false;
    }
  }

  playerLoaded(player: TPlayer) {
    this.playersLoaded += 1;
    const playerId = player.getId();
    this.sendMessage(playerId, 'informPlayerId', { playerId });

    if (this.playersLoaded === this.playerController.getNumberOfPlayers()) {
      this.sendMessageToRoom('allPlayersLoaded', {
        playerCount: this.playerController.getNumberOfPlayers(),
      });
    }
  }

  requirePlayerAdditionalAction(actionRequired: string): void {
    console.log('Need additional action:', actionRequired);
    const playerId = this.game?.getCurrentTurnPlayerId();
    if (playerId) {
      this.sendMessage(playerId, actionRequired);
    }
  }

  updateRoundOver() {
    const players = this.playerController.getPlayers();
    const currentPlayerId = this.game?.getCurrentTurnPlayerId();

    for (const player of players) {
      this.sendMessage(player.getId(), "roundOver", {playerId: currentPlayerId})
    }
  }

  updateAsymmetricState(state: string): void {
    const players = this.playerController.getPlayers();
    const currentPlayerId = this.game?.getCurrentTurnPlayerId();
    const selfMessage = state + 'Self';
    for (const player of players) {
      const pId = player.getId();
      if (pId === currentPlayerId) {
        console.log('Sending Message:', selfMessage);
        this.sendMessage(pId, selfMessage);
      } else {
        console.log('Sending Message:', state);
        this.sendMessage(pId, state, currentPlayerId);
      }
    }
  }

  nextTurnStart(): void {
    this.initiateTurn();
  }

  bindSocketEvents() {}

  playerJoined(socket: Socket, isHost: boolean): void {
    const newPlayer = this.playerController.createPlayer(isHost);
    this.playerController.addPlayer(socket, newPlayer);
    const playerName = newPlayer.getName();
    const playerId = newPlayer.getId();
    isHost = newPlayer.getIsHost();
    this.sendMessageToOthers(playerId, 'playerJoined', {
      playerName,
      playerId,
      isHost,
    });
  }

  setupGame(game: Game<TPlayer, TCard, TDeck>): void {
    this.game = game;
    this.game.addObserver(this);
    this.isNewGameSetup = true;
    this.sendMessageToRoom('gameStarted', null);

    console.log('PlayerIDs:', this.playerController.getPlayerIds());
  }

  startGame() {
    this.game?.start();
  }

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

  handlePlayerAction(
    action: string,
    player: TPlayer,
    cardData?: { id: number; suit: string; rank: string }
  ): void {
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
      console.log('emitting gameState!');
      // console.log("Checksum:", this.generateChecksum(playerGameState))
      playerGameState.checksum = this.generateChecksum(playerGameState);
      // console.log("Sending this game state:", playerGameState)
      this.sendMessage(playerId, 'gameState', JSON.stringify(playerGameState));
    }
  }

  generateChecksum(gameState: GameState<TCard>): number {
    const str = JSON.stringify(gameState);
    // console.log(str);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }

    return hash >>> 0;
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

  private sendMessageToOthers(sender: string, messageType: string, data?: any) {
    const players = this.playerController
      .getPlayers()
      .filter((p) => p.getId() !== sender);
    players.forEach((player) => {
      const socket = this.playerController.getPlayerSocketById(player.getId());
      socket?.emit('playerJoined', data);
    });
  }
}
