import { Deck } from './deck';
import { UNOCard } from './unoCard';
import { CardFactory } from '../utils/cardFactory';

export class UNODeck extends Deck<UNOCard> {
  constructor(cards: UNOCard[] = []) {
    super(cards);
  }

  init(): void {
    const cards: UNOCard[] = [];
    const colors = ['Red', 'Blue', 'Green', 'Yellow'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const actionCards = ['Draw2', 'Draw2', 'Draw2'];
    // const actionCards = ['Reverse', 'Reverse', 'Reverse'];
    // const actionCards = ['Skip', 'Skip', 'Skip'];
    // const actionCards = ['Draw2', 'Skip', 'Reverse'];
    const wildCards = ['Card', 'Draw4'];

    for (const color of colors) {
        for (const number of numbers) {
          cards.push(CardFactory.createNumberCard(number, color));
          if (number !== '0') {
            cards.push(CardFactory.createNumberCard(number, color));
          }
        }

      // for (const action of actionCards) {
      //   // Remove this inner for loop
      //   for (let i = 0; i < 10; i++) {
      //     // Testing only
      //     cards.push(CardFactory.createActionCard(action, color));
      //     cards.push(CardFactory.createActionCard(action, color));
      //   }
      // }
    }

    // TODO: Change this back to 4
    for (let i = 0; i < 20; i++) {
      // cards.push(CardFactory.createWildCard(wildCards[0]));
      // cards.push(CardFactory.createWildCard(wildCards[1]));
    }

    this.setCards(cards);
  }
}
