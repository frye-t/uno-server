import { ActionData } from '../types/ActionData';
import { Card } from './card';
export declare class Player<TCard extends Card> {
    private id;
    private name;
    private hand;
    private isHost;
    constructor();
    init(id: string, isHost: boolean): void;
    setName(name: string): void;
    getName(): string;
    getIsHost(): boolean;
    makeHost(): void;
    drawCard(card: TCard): void;
    playCard(card: TCard): void;
    findCard(cardData: ActionData): TCard | null;
    addCardToHand(card: TCard): void;
    printHand(): void;
    getId(): string;
    getHand(): TCard[];
    getHandSize(): number;
    resetHand(): void;
}
