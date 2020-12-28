import { ApplicationModuleLauncher } from '@core/module/Module';
import { inject, injectable } from '@core/ioc/Decorators';
import ApplicationContext from '@core/ioc/ApplicationContext';
import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import SystemLogger from '@core/log/SystemLogger';
import ioredis from 'ioredis';
import CoreObject from '@core/shared/CoreObject';
import { RedisAdapter } from './RedisAdapter';

@injectable()
export class RedisProvider extends CoreObject implements ApplicationModuleLauncher {
    public static redisClass: { new (...args: any[]): any } = ioredis;

    protected ctx: ApplicationContext;
    protected ac: ApplicationConfiguration;
    protected log: SystemLogger;
    protected url: string | null;

    constructor(
        @inject('ApplicationContext') ctx: ApplicationContext,
        @inject('ApplicationConfiguration') ac: ApplicationConfiguration,
        @inject('SystemLogger') log: SystemLogger
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

        this.ctx.registerValue('redis.Connection', adapter);

        return;
    }

    prepare(): void {
        const redisURL = this.ac.get('redis.url') as string;

        if (!redisURL) throw new Error('');

        this.url = redisURL;
    }
}
