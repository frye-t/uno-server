import { Card } from "../models/card";
export interface GameState<TCard extends Card> {
    players: Array<{
        id: string;
        hand?: TCard[];
        cardCount: number;
    }>;
    discardPile: TCard[];
    checksum?: number;
}
