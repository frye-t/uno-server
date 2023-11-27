import { UNOCard } from '../models/unoCard';
export declare class CardFactory {
    static createNumberCard(number: string, color: string): UNOCard;
    static createActionCard(action: string, color: string): UNOCard;
    static createWildCard(type: string): UNOCard;
}
