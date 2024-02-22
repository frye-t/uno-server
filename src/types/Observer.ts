import { Card } from "../models/card";
import { GameState } from "./GameState";

export interface Observer<TCard extends Card> {
  update(gameState: GameState<TCard>): void;
  requirePlayerAdditionalAction(actionRequired: string): void;
  updateAsymmetricState(state: string): void;
  updateSymmetricState(state: string): void;
  nextTurnStart(specialCondition?: boolean, message?: string): void;
  updateRoundOver(): void;
}