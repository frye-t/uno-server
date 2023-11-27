export class EventManager {
  private listeners: Record<string, Function[]> = {};

  subscribe(eventType: string, listener: Function) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);
  }

  publish(eventType: string, data?: object) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(listener => listener(data));
    }
  }
}
