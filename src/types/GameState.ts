import { Card } from "../models/card";
import { UNOCard } from "../models/unoCard";

// export interface GameState {
//   players: Array<{
//     id: string;
//     hand?: UNOCard[];
//     cardCount: number;
//   }>;
//   discardPile: UNOCard[];
// }

export interface GameState<TCard extends Card> {
  players: Array<{
    id: string;
    hand?: TCard[];
    cardCount: number;
  }>;
  discardPile: TCard[];
}