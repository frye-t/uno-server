import { GameCommand } from './gameCommand';
export declare class AdditionalActionCommand implements GameCommand {
    private action;
    constructor(action: () => void);
    execute(): void;
}
