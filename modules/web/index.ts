import WebServer from './WebServer';

export default {
    getClass(): { new (...args: any[]): any } {
        return WebServer;
    }
};
