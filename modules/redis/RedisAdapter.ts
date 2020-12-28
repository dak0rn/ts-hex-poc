import CoreObject from '@core/shared/CoreObject';
import ioredis from 'ioredis';

export class RedisAdapter extends CoreObject {
    protected connection: ioredis.Redis;

    constructor(connection: ioredis.Redis) {
        super();
        this.connection = connection;
    }

    get() {}

    set(key: string, value: any): this {
        this.connection.set(key, value);
        return this;
    }

    expire() {}
}
