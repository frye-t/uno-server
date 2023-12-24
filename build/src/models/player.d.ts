import { ActionData } from '../types/ActionData';
import { UNOCard } from './unoCard';
export declare class Player {
    private id;
    private hand;
    constructor(id: string);
    drawCard(card: UNOCard): void;
    playCard(card: UNOCard): void;
    findCard(cardData: ActionData): UNOCard | null;
    addCardToHand(card: UNOCard): void;
    printHand(): void;
    getId(): string;
    getHand(): UNOCard[];
    getHandSize(): number;
}
