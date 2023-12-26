import { ActionData } from '../types/ActionData';
import { UNOCard } from './unoCard';
export declare class Player {
    private id;
    private hand;
    constructor();
    init(id: string): void;
    drawCard(card: UNOCard): void;
    playCard(card: UNOCard): void;
    findCard(cardData: ActionData): UNOCard | null;
    addCardToHand(card: UNOCard): void;
    printHand(): void;
    getId(): string;
    getHand(): UNOCard[];
    getHandSize(): number;
}
