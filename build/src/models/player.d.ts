import { UNOCard } from './unoCard';
import { Socket } from 'socket.io';
export declare class Player {
    private id;
    private socket;
    private hand;
    constructor(id: string, socket: Socket);
    drawCard(card: UNOCard): void;
    playCard(): void;
    addCardToHand(card: UNOCard): void;
    printHand(): void;
    getId(): string;
}
