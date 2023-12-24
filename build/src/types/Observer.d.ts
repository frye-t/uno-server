import { GameState } from "./GameState";
export interface Observer {
    update(gameState: GameState): void;
    requirePlayerAdditionalAction(actionRequired: string): void;
    nextTurnStart(): void;
}
