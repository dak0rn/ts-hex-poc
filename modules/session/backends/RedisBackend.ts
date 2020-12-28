import ioredis from 'ioredis';
import BaseSession from '../BaseSession';
import SessionBackend from '../SessionBackend';
import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import SystemLogger from '@core/log/SystemLogger';
import { inject, injectable } from '@core/ioc/Decorators';

export class RedisSessionBackendMisconfiguredError extends Error {}

export class RedisUnreachableError extends Error {
    constructor() {
        super('Redis could not be reached under the configured address');
    }
}

/**
 * Session backend for redis
 */
@injectable()
export default class RedisBackend extends SessionBackend {
    protected connection: ioredis.Redis;
    protected log: SystemLogger;

    public static redisClass: { new (...args: any[]): any } = ioredis;

    /**
     * Creates a new RedisBackend
     */
    constructor(
        @inject('core.ApplicationConfiguration') conf: ApplicationConfiguration,
        @inject('core.SystemLogger') log: SystemLogger
    ) {
        super();

        this.log = log.createChild('SESSION/REDIS');

        const redisUrl = conf.get('session.redisUrl') as string;

        if (!redisUrl)
            throw new RedisSessionBackendMisconfiguredError(
                'No session.redisUrl key has been set in the application configuration'
            );

        this.log.info('Connecting...');

        this.connection = new RedisBackend.redisClass(redisUrl);
    }

    /**
     * Verifies the connection to Redis using a PING request
     */
    protected async setup(): Promise<void> {
        try {
            this.log.info('Performing connection verification...');

            const pong = await this.connection.ping();
            if ('pong' !== pong.toLowerCase()) throw new Error(`Reply was not "pong" but "${pong}"`);
        } catch (err) {
            this.log.error('Failed to communicate with the redis server', err);
            throw new RedisUnreachableError();
        }

        this.log.info('Successfully connected');
    }

    public async put(session: BaseSession): Promise<void> {
        await this.connection.set(session.surrogateKey, session.serialize());
    }

    public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
        const result = await this.connection.get(key);

        if (null === result) {
            return false;
        }

        obj.deserialize(result);

        return true;
    }
}
