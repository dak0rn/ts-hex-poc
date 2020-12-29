import { SessionProvider } from './SessionProvider';

export default {
    getClass(): { new (...args: any[]): any } {
        return SessionProvider;
    }
};
