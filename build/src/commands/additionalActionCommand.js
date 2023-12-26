"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdditionalActionCommand = void 0;
class AdditionalActionCommand {
    constructor(action) {
        this.action = action;
    }
    execute() {
        this.action();
    }
}
exports.AdditionalActionCommand = AdditionalActionCommand;
//# sourceMappingURL=additionalActionCommand.js.map