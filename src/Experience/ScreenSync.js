/**
 * ScreenSync
 * Shared event bus synchronizing PC ultrawide screen and Laptop screen.
 * PC terminal logs emit agent step events; Laptop multi-agent DAG lights up in real time.
 */

class ScreenSync {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (err) {
                console.error(`Error in ScreenSync handler for ${event}:`, err);
            }
        });
    }
}

const screenSync = new ScreenSync();
export default screenSync;
