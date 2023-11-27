export declare class Card {
    private rank;
    private suit;
    private value;
    private visible;
    constructor(rank: string, suit: string, value: number, visible?: boolean);
    toString(): string;
    getRank(): string;
    getSuit(): string;
    getValue(): number;
    toggleVisible(): void;
}
