"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawCardCommand = void 0;
class DrawCardCommand {
    constructor(player, drawCard) {
        this.player = player;
        this.drawCard = drawCard;
    }
    execute() {
        const card = this.drawCard();
        this.player.addCardToHand(card);
    }
}
exports.DrawCardCommand = DrawCardCommand;
//# sourceMappingURL=drawCardCommand.js.map