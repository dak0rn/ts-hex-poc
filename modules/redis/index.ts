import { RedisProvider } from './RedisProvider';

export default {
    getClass(): { new (...args: any[]): any } {
        return RedisProvider;
    }
};
