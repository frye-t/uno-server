import { Player } from "./player";
import { UNOCard } from "./unoCard";
export declare class UNOPlayer extends Player<UNOCard> {
    constructor();
    hasUno(): boolean;
    hasEmptyHand(): boolean;
}
