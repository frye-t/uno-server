"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayCardCommand = void 0;
class PlayCardCommand {
    constructor(player, card, playCard) {
        this.player = player;
        this.card = card;
        this.playCard = playCard;
    }
    execute() {
        // if card is in player's hand and a valid play
        this.player.playCard(this.card);
        this.playCard();
    }
}
exports.PlayCardCommand = PlayCardCommand;
//# sourceMappingURL=playCardCommand.js.map