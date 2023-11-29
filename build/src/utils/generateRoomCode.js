"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateRoomCode = (length = 5) => {
    const characters = '0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.default = generateRoomCode;
//# sourceMappingURL=generateRoomCode.js.map