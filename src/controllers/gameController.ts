import {Game} from '../models/game';
import {Player} from '../models/player';
import {EventManager} from '../services/eventManager';

export class GameController {
  private game: Game;
  private eventManager: EventManager;

  constructor(players: Player[]) {
    this.game = new Game(players);
    this.eventManager = new EventManager();
  }

  startGame(): void {
    console.log('starting game');
    this.game.start();
    const discardPile = this.game.getDiscardPile();
    this.eventManager.publish('gameStarted', {discardPile});
    console.log('Published GameStarted with:', discardPile);
  }

  handlePlayerAction(action: string, player: Player): void {
    this.game.performAction(action, player);
  }
}
