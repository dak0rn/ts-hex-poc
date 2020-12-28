import CoreObject from '@core/shared/CoreObject';
import ioredis from 'ioredis';

/**
 * Façade on top of a redis connection
 */
export class RedisAdapter extends CoreObject {
    /**
     * The underlying connection
     */
    protected connection: ioredis.Redis;

    /**
     * Creates a new {@link RedisAdapter} with the given connection
     *
     * @param connection Redis connection
     */
    constructor(connection: ioredis.Redis) {
        super();
        this.connection = connection;
    }

    // TODO: Write methods here

    get() {}

    set(key: string, value: any): this {
        this.connection.set(key, value);
        return this;
    }

    expire() {}
}
