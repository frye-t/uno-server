import { Player } from './player';
import { UNOCard } from './unoCard';
import { UNODeck } from './unoDeck';
import { DrawCardCommand } from '../commands/drawCardCommand';
import { GameState } from '../types/GameState';
import { Observer } from '../types/Observer';
import { GameCommand } from '../commands/gameCommand';
import { PlayCardCommand } from '../commands/playCardCommand';
import { ActionData } from '../types/ActionData';
import { AdditionalActionCommand } from '../commands/additionalActionCommand';
import { UNOPlayer } from './unoPlayer';
import { Card } from './card';
import { Deck } from './deck';
import PlayerController from '../controllers/playerController';

export class Game<
  TPlayer extends Player<TCard>,
  TCard extends Card,
  TDeck extends Deck<TCard>,
> {
  private players: TPlayer[];
  private playerMap: Map<string, TPlayer>;
  private playerController: PlayerController<TPlayer, TCard>;
  private turnOrder: string[];
  private currentPlayerIndex: number;
  private deck: TDeck;
  private discardPile: TCard[];
  private isClockwiseTurnOrder: boolean;
  private isPlayerActionRequired: boolean;
  private activeColor: string | null;
  private activeNumber: string | null;
  private lastActionCard: { type: string; processed: boolean };

  // Flags for controlling turn start/end
  private needsDrawAction: boolean;
  private needsDrawFourAction: boolean;
  private isChallengeInProgress: boolean;
  private playerWonChallenge: boolean;

  private playerDeclaredUno: boolean;
  private dontEndTurn: boolean;

  private observers: Observer<TCard>[] = [];
  constructor(
    players: TPlayer[],
    deck: TDeck,
    playerController: PlayerController<TPlayer, TCard>
  ) {
    this.players = players;
    console.log(this.players);

    this.playerMap = new Map();
    this.players.forEach((player) => {
      this.playerMap.set(player.getId(), player);
    });
    console.log('!!!PLAYER MAP!!!');
    console.log(this.playerMap);

    this.playerController = playerController;

    this.turnOrder = playerController.getPlayerIds();
    this.currentPlayerIndex = 0;
    this.deck = deck;
    this.discardPile = [];

    this.isClockwiseTurnOrder = true;
    if (this.deck instanceof UNODeck) {
      this.deck.init();
    }
    this.deck.shuffle();
    this.activeColor = null;
    this.activeNumber = null;
    this.lastActionCard = {
      type: '',
      processed: true,
    };
    this.isPlayerActionRequired = false;
    this.needsDrawAction = false;
    this.needsDrawFourAction = false;
    this.isChallengeInProgress = false;
    this.playerWonChallenge = false;

    this.playerDeclaredUno = false;
    this.dontEndTurn = false;
  }

  addObserver(observer: Observer<TCard>) {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer<TCard>) {
    this.observers = this.observers.filter((obs) => obs != observer);
  }

  notifyObservers() {
    for (let observer of this.observers) {
      observer.update(this.getCurrentGameState());
    }
  }

  notifyPlayerAdditionalAction(actionRequired: string) {
    for (let observer of this.observers) {
      observer.requirePlayerAdditionalAction(actionRequired);
    }
  }

  notifyAsymmetricState(state: string) {
    console.log("NOTIFYING AN ASYMEMTRIC STATE:", state)
    for (let observer of this.observers) {
      observer.updateAsymmetricState(state);
    }
  }

  notifySymmetricState(state: string) {
    for (let observer of this.observers) {
      observer.updateSymmetricState(state);
    }
  }

  notifyRoundOver() {
    for (let observer of this.observers) {
      observer.updateRoundOver();
    }
  }

  notifyNextTurn(canUno?: boolean) {
    for (let observer of this.observers) {
      observer.nextTurnStart(canUno, 'canUno');
    }
  }

  shuffleTurnOrder() {
    for (let i = this.turnOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [this.turnOrder[i], this.turnOrder[j]] = [
        this.turnOrder[j],
        this.turnOrder[i],
      ];
    }

    console.log('SHUFFLED TURN ORDER:', this.turnOrder);
  }

  start(): void {
    // this.shuffleTurnOrder();
    this.dealStartingHands();

    for (const player of this.players) {
      player.printHand();
    }

    this.currentPlayerIndex = this.getStartingPlayerIndex();
    const actionRequired = this.flipTopCard();
    this.notifyObservers();
    console.log('CurrentPlayerIdx:', this.currentPlayerIndex);
    console.log(this.turnOrder);
    this.notifyNextTurn();

    if (actionRequired) {
      this.notifyPlayerAdditionalAction('chooseColor');
      this.isPlayerActionRequired = true;
    }
  }

  private dealStartingHands(): void {
    // TODO: Change this back to 7 cards
    this.needsDrawAction = true;
    for (let i = 0; i < 3; i++) {
      for (const player of this.players) {
        this.performAction('draw', player);
      }
    }
    this.needsDrawAction = false;
  }

  performAction(action: string, player: TPlayer, data?: ActionData): void {
    // TODO: This needs serious refactoring
    let command: GameCommand | null = null;
    // console.log('Performing an Action', action, data);
    switch (action) {
      case 'draw':
        command = new DrawCardCommand(player, () => this.drawCard());
        break;
      case 'play':
        if (data) {
          console.log('Got a PlayCardCommand', player.getId(), data);
          const cardToPlay = player.findCard(data);
          console.log('Got a card to play:', cardToPlay);
          if (cardToPlay && this.isValidPlay(cardToPlay)) {
            // check valid play
            command = new PlayCardCommand(player, cardToPlay, () =>
              this.playCard(cardToPlay)
            );
            if (cardToPlay instanceof UNOCard) {
              if (cardToPlay.isWildCard()) {
                this.notifyPlayerAdditionalAction('chooseColor');
                this.isPlayerActionRequired = true;
                if (cardToPlay.isWildDrawFour()) {
                  console.log('Wild Draw Four Played!');
                  this.needsDrawFourAction = true;
                }
              }
              if (cardToPlay.isActionCard()) {
                console.log('Action Card Played');
                this.lastActionCard.type = cardToPlay.getNumber();
                this.lastActionCard.processed = false;
              }
            }
          } else {
            console.error('Invalid card played');
          }
        }
        break;
      case 'additionalAction':
        console.log('performing another action');
        let callback: (() => void) | null = null;
        if (data?.action && data?.value) {
          const actionValue: string = data.value;
          switch (data.action) {
            case 'colorChosen':
              console.log('Player chose a color:', actionValue);
              callback = () => this.setActiveColor(actionValue);
              break;
            case 'handleChallenge':
              console.log('In handle challenge');
              if (data.value === 'true') {
                console.log('Player challenged Draw Four');
                callback = () => this.resolveChallenge(this.doesChallengeWin());
                break;
              } else {
                console.log('Player declined Draw Four Challenge');
                callback = () => this.resolveNoChallenge();
                break;
              }
            case 'declareUno':
              console.log('A player declared UNO!:', player);
              callback = () => this.handleDeclareUno();
              // this.playerDeclaredUno = true;
              this.dontEndTurn = true;;
              break;
            case 'callUndeclaredUno':
              console.log(
                'Someone called player out on not declaring UNO!',
                data.value
              );
              callback = () => this.handleCallUndeclaredUno(data.value);
              this.dontEndTurn = true;
              break;
          }
          if (callback) {
            command = new AdditionalActionCommand(callback);
          }
          this.isPlayerActionRequired = false;
        }
        break;
    }

    if (command) {
      console.log('Executing a command:', command);
      command.execute();
      // possibly don't need this notify, will test later
      // this.notifyObservers();
      // Don't end turn if another action is required,
      // a draw action is taking place, or a player won a challenge
      console.log("DONTENDTURN:", this.dontEndTurn)
      if (
        !this.isPlayerActionRequired &&
        !this.needsDrawAction &&
        !this.playerWonChallenge &&
        !this.playerDeclaredUno &&
        !this.dontEndTurn
      ) {
        console.log('Going to end turn');
        this.endTurn();
      } else if (this.playerWonChallenge) {
        console.log('Looking at player won Challenge');
        this.playerWonChallenge = false;
        this.notifyObservers();
      } else {
        // Occurs on Draw4 played
        console.log('Some other case');
        if (this.playerDeclaredUno) {
          console.log('Disabled UNO Flag');
          this.playerDeclaredUno = false;
        }

        if (this.dontEndTurn && !this.needsDrawAction) {
          this.dontEndTurn = false;
        }
      }
    } else {
      console.error(
        `Action '${action}' is not recognized or rule validation failed`
      );
    }
  }

  private handleCallUndeclaredUno(playerId: string | undefined) {
    let player;
    if (playerId) {
      player = this.playerController.getPlayerById(playerId);
    }
    if (player) {
      this.handleDrawN(player, 2);
      this.notifySymmetricState('calledUndeclaredUno');
      this.notifyObservers();
    }
  }

  private handleDeclareUno() {
    console.log('DO SOMETHING, maybe inform other players that UNO');
    const player = this.getCurrentPlayer();
    if (player instanceof UNOPlayer) {
      player.setDeclaredUno(true);
    }
    this.notifyAsymmetricState('uno');
  }

  private doesChallengeWin(): boolean {
    return false;
  }

  private endTurn(): void {
    // this.notifyObservers();
    console.log('ending turn');
    // TODO: Fix bug with Wild-Draw4 giving UNO
    this.checkUno();

    if (this.checkEmptyHand()) {
      // do sometihng
    } else {
      this.checkActionCard();
      console.log('Last action card:', this.lastActionCard);
      this.startNextTurn();
      this.checkDrawFourChallengeNeeded();
    }
    this.notifyObservers();
  }

  private checkUno() {
    console.log('CurrentPlayerIdx:', this.currentPlayerIndex);
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer instanceof UNOPlayer && currentPlayer.hasUno()) {
      console.log('A player has UNO! Player:', this.currentPlayerIndex);
    }
  }

  private checkEmptyHand(): boolean {
    const currentPlayer = this.getCurrentPlayer();
    // console.log('currentPlayer:', currentPlayer);
    console.log('Checking for empty hand');
    if (currentPlayer instanceof UNOPlayer && currentPlayer.hasEmptyHand()) {
      console.log('A player emptied their hand', this.currentPlayerIndex);
      // this.notifyAsymmetricState('roundOver');
      this.notifyRoundOver();
      return true;
    }
    return false;
  }

  private checkActionCard() {
    if (!this.isPlayerActionRequired) {
      if (!this.lastActionCard.processed) {
        this.handleActionCard(this.lastActionCard.type);
      }
    }
  }

  private startNextTurn() {
    const prevPlayer = this.getCurrentPlayer();
    // console.log('PREV PLAYER:', prevPlayer);
    // if (prevPlayer instanceof UNOPlayer) {
    //   console.log('CHECKING UNO PLAYER');
    //   console.log('HAS UNO:', prevPlayer.hasUno());
    //   console.log('HAS DECLARED UNO:', prevPlayer.hasDeclaredUno());
    //   console.log(prevPlayer);
    // }
    if (
      prevPlayer instanceof UNOPlayer &&
      prevPlayer.hasUno() &&
      !prevPlayer.hasDeclaredUno()
    ) {
      this.notifyAsymmetricState('undeclaredUno');
    }

    this.setNextPlayerIndex();
    const player = this.getCurrentPlayer();

    const topCard = this.discardPile[this.discardPile.length - 1];
    const canUno =
      player instanceof UNOPlayer && player?.canUno(topCard, this.activeColor);

    console.log('Next Player Can UNO:', canUno);
    this.notifyNextTurn(canUno);
  }

  private checkDrawFourChallengeNeeded() {
    if (this.needsDrawFourAction && !this.isChallengeInProgress) {
      // Handle beginning a challenge on next turn
      this.notifyPlayerAdditionalAction('challenge');
      this.isChallengeInProgress = true;
    }
  }

  private resolveChallenge(challengeResult: boolean): void {
    if (challengeResult) {
      // Draw 4 for previous player, as challenger won
      this.handleDrawN(this.getPreviousPlayer(), 4);
      this.notifyPlayerAdditionalAction('challengeWin');
      this.playerWonChallenge = true;
    } else {
      // Draw 6 for currnet player, as challenger lost
      const player = this.getCurrentPlayer();
      if (player) {
        this.handleDrawN(player, 6);
      }
    }
    this.isChallengeInProgress = false;
    this.needsDrawFourAction = false;
  }

  private resolveNoChallenge(): void {
    // Draw four for current player, as they did not challenge Draw4
    const player = this.getCurrentPlayer();
    if (player) {
      this.handleDrawN(player, 4);
    }
    this.needsDrawFourAction = false;
    this.isChallengeInProgress = false;
  }

  private setActiveColor(color: string) {
    console.log('Setting Active Color:', color);
    this.activeColor = color;
  }

  private drawCard(): TCard {
    return this.deck.draw();
  }

  private playCard(card: TCard): void {
    this.discardPile.push(card);
    // this.notifyObservers();
  }

  private flipTopCard(): boolean {
    const topCard = this.drawCard();
    let actionRequired = false;
    this.activeColor = topCard.getSuit();
    this.activeNumber = topCard.getRank();
    topCard.toggleVisible();
    this.discardPile.unshift(topCard);

    console.log('STARTING ACTIVE NUMBER:', this.activeNumber);
    switch (this.activeNumber) {
      case 'Draw2':
        const player = this.getCurrentPlayer();
        if (player) {
          this.handleDrawN(player, 2);
        }
        this.currentPlayerIndex += this.isClockwiseTurnOrder ? 1 : -1;
        break;
      case 'Skip':
        this.currentPlayerIndex += this.isClockwiseTurnOrder ? 1 : -1;
        break;
      case 'Reverse':
        this.isClockwiseTurnOrder = !this.isClockwiseTurnOrder;
        break;
      case 'Card':
        actionRequired = true;
        break;
      case 'Draw4':
        this.deck.insertMiddle(topCard);
        this.deck.shuffle();
        actionRequired = this.flipTopCard();
        break;
    }

    return actionRequired;
  }

  getCurrentGameState(): GameState<TCard> {
    const gameState = {
      players: this.players.map((player) => ({
        id: player.getId(),
        hand: player.getHand(),
        cardCount: player.getHandSize(),
      })),
      discardPile: this.discardPile,
      activeColor: this.activeColor,
      activeNumber: this.activeNumber,
      turnOrder: this.turnOrder,
    };

    // this.players.forEach((player) => {
    //   console.log(player.getHand());
    // });

    // console.log("Game State:", gameState);
    // console.log("Checksum:", this.checksum(gameState));
    return gameState;
  }

  getCurrentTurnPlayerId(): string {
    return this.turnOrder[this.currentPlayerIndex];
  }

  private getStartingPlayerIndex(): number {
    // return Math.floor(Math.random() * this.players.length);
    // Now shuffling turn order, so it should just be the first player in the turn order
    return 0;
  }

  private setNextPlayerIndex(): void {
    const incrementer = this.isClockwiseTurnOrder ? 1 : -1;
    const playerCount = this.players.length;
    this.currentPlayerIndex =
      (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
    console.log('Next player is:', this.currentPlayerIndex);
  }

  private getNextPlayerIndex(): number {
    const incrementer = this.isClockwiseTurnOrder ? 1 : -1;
    const playerCount = this.players.length;
    return (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
  }

  private getPreviousPlayerIndex(): number {
    const incrementer = !this.isClockwiseTurnOrder ? 1 : -1;
    const playerCount = this.players.length;
    return (this.currentPlayerIndex + incrementer + playerCount) % playerCount;
  }

  private getCurrentPlayer(): TPlayer | undefined {
    // console.log('players:', this.players);
    console.log('currentPlayerIndex', this.currentPlayerIndex);
    return this.playerMap.get(this.turnOrder[this.currentPlayerIndex]);
    // return this.players[this.currentPlayerIndex];
  }

  private getPreviousPlayer(): TPlayer {
    return this.players[this.getPreviousPlayerIndex()];
  }

  private getNextPlayer(): TPlayer | undefined {
    return this.playerMap.get(this.turnOrder[this.getNextPlayerIndex()]);
  }

  private isValidPlay(card: TCard): boolean {
    // return true;
    const topCard = this.discardPile[this.discardPile.length - 1];
    // return true;
    const playable =
      topCard.getRank() === card.getRank() ||
      topCard.getSuit() === card.getSuit() ||
      card.getSuit() === 'Wild' ||
      card.getSuit() === this.activeColor;

    return true;
    // return playable;
  }

  private handleDrawN(player: TPlayer, cardsToDraw: number): void {
    // Need this flag to avoid turn skipping on action execution
    this.needsDrawAction = true;
    for (let i = 0; i < cardsToDraw; i++) {
      this.performAction('draw', player);
    }
    this.needsDrawAction = false;
  }

  private handleActionCard(actionType: string): void {
    switch (actionType) {
      case 'Draw2':
        const player = this.getNextPlayer();
        console.log(player);
        if (player) {
          this.handleDrawN(player, 2);
        }
        this.currentPlayerIndex += this.isClockwiseTurnOrder ? 1 : -1;
        break;
      case 'Skip':
        this.currentPlayerIndex += this.isClockwiseTurnOrder ? 1 : -1;
        break;
      case 'Reverse':
        this.isClockwiseTurnOrder = !this.isClockwiseTurnOrder;
        break;
    }

    this.lastActionCard.processed = true;
  }
}
