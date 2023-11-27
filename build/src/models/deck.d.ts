import { Card } from './card';
export declare class Deck<T extends Card> {
    private cards;
    constructor(cards?: T[]);
    protected setCards(cards: T[]): void;
    shuffle(): void;
    draw(): T;
    printDeck(): void;
    printTopFive(): void;
    insertTop(card: T): void;
    insertBottom(card: T): void;
    insertMiddle(card: T): number;
    size(): number;
    peek(index?: number): T;
    clear(): void;
    isEmpty(): boolean;
    clone(): Deck<T>;
    merge(otherDeck: Deck<T>): void;
    drawMultiple(num: number): T[];
    countCardType(predicate: (card: T) => boolean): number;
}
