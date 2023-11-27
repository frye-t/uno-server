"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
class EventManager {
    constructor() {
        this.listeners = {};
    }
    subscribe(eventType, listener) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(listener);
    }
    publish(eventType, data) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(listener => listener(data));
        }
    }
}
exports.EventManager = EventManager;
//# sourceMappingURL=eventManager.js.map