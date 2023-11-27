import { Deck } from './deck';
import { UNOCard } from './unoCard';
export declare class UNODeck extends Deck<UNOCard> {
    constructor(cards?: UNOCard[]);
    init(): void;
}
