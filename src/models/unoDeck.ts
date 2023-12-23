import {Deck} from './deck';
import {UNOCard} from './unoCard';
import {CardFactory} from '../utils/cardFactory';

export class UNODeck extends Deck<UNOCard> {
  constructor(cards: UNOCard[] = []) {
    super(cards);
  }

  init(): void {
    const cards: UNOCard[] = [];
    const colors = ['Red', 'Blue', 'Green', 'Yellow'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const actionCards = ['Draw', 'Reverse', 'Skip'];
    const wildCards = ['Card', 'Draw'];

    // for (const color of colors) {
    //   for (const number of numbers) {
    //     cards.push(CardFactory.createNumberCard(number, color));
    //     if (number !== '0') {
    //       cards.push(CardFactory.createNumberCard(number, color));
    //     }
    //   }

    //   for (const action of actionCards) {
    //     cards.push(CardFactory.createActionCard(action, color));
    //     cards.push(CardFactory.createActionCard(action, color));
    //   }
    // }

    for (let i = 0; i < 4; i++) {
      cards.push(CardFactory.createWildCard(wildCards[0]));
      cards.push(CardFactory.createWildCard(wildCards[1]));
    }

    this.setCards(cards);
  }
}
