export declare class EventManager {
    private listeners;
    subscribe(eventType: string, listener: Function): void;
    publish(eventType: string, data?: object): void;
}
