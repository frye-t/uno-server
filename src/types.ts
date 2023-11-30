import { UNOCard } from "./models/unoCard";

export interface GameState {
  players: Array<{
    id: string;
    hand?: UNOCard[];
    cardCount: number;
  }>;
  discardPile: UNOCard[];
}