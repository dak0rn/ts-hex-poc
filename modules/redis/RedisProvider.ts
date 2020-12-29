import { ApplicationModuleLauncher } from '@core/module/Module';
import { inject, injectable } from '@core/ioc/Decorators';
import { ApplicationContext } from '@core/ioc/ApplicationContext';
import { ApplicationConfiguration } from '@core/configuration/ApplicationConfiguration';
import { SystemLogger } from '@core/log/SystemLogger';
import ioredis from 'ioredis';
import { CoreObject } from '@core/shared/CoreObject';
import { RedisAdapter } from './RedisAdapter';

/**
 * No `redis.url` configuration parameter was set in the configuration file
 */
export class NoRedisConnectionError extends Error {
    constructor() {
        super('Configuration parameter redis.url not set in configuration file');
    }
}

/**
 * Module provider for redis
 */
@injectable()
export class RedisProvider extends CoreObject implements ApplicationModuleLauncher {
    /**
     * The connection constructor, defaulting to `ioredis`
     * This is exposed in order to make it configurable for testing and should usually
     * not be changed.
     */
    public static redisClass: { new (...args: any[]): any } = ioredis;

    protected ctx: ApplicationContext;
    protected ac: ApplicationConfiguration;
    protected log: SystemLogger;

    /**
     * The redis connection string
     */
    protected url: string | null;

    constructor(
        @inject('core.ApplicationContext') ctx: ApplicationContext,
        @inject('core.ApplicationConfiguration') ac: ApplicationConfiguration,
        @inject('core.SystemLogger') log: SystemLogger
    ) {
        super();
        this.ctx = ctx;
        this.ac = ac;
        this.log = log.createChild('redis');
        this.url = null;
    }

    async launch(): Promise<unknown> {
        const conn = new RedisProvider.redisClass(this.url);
        const adapter = new RedisAdapter(conn);

        this.log.info('Connecting...');
        this.ctx.registerValue('redis.Connection', adapter);

        return;
    }

    prepare(): void {
        let redisUrl: string;
        try {
            redisUrl = this.ac.get('redis.url') as string;
        } catch (_) {
            throw new NoRedisConnectionError();
        }

        if (!redisUrl) {
            throw new NoRedisConnectionError();
        }

        this.url = redisUrl;
    }
}
