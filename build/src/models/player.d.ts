import { UNOCard } from './unoCard';
export declare class Player {
    private id;
    private hand;
    constructor(id: string);
    drawCard(card: UNOCard): void;
    playCard(): void;
    addCardToHand(card: UNOCard): void;
    printHand(): void;
}
