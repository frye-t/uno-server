import {UNOCard} from '../models/unoCard';

export class CardFactory {
  static createNumberCard(number: string, color: string): UNOCard {
    return new UNOCard(number, color, parseInt(number, 10));
  }

  static createActionCard(action: string, color: string): UNOCard {
    return new UNOCard(action, color, 20);
  }

  static createWildCard(type: string): UNOCard {
    return new UNOCard(type, 'Wild', 40);
  }
}