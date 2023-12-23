import { GameState } from "./GameState";
export interface Observer {
    update(gameState: GameState): void;
}
