import { Card } from './card';
export declare class UNOCard extends Card {
    constructor(number: string, color: string, value: number);
    getNumber(): string;
    getColor(): string;
    cardPlayableOnTop(cardToPlay: UNOCard): boolean;
    isWildCard(): boolean;
    isWildDrawFour(): boolean;
    isActionCard(): boolean;
}
