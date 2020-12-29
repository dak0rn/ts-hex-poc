import test from 'ava';
import { BaseSession } from '../../BaseSession';
import { RedisBackend } from '../../backends/RedisBackend';
import { SystemLogger, LogAdapter } from '@core/log/SystemLogger';
import { ApplicationConfiguration } from '@core/configuration/ApplicationConfiguration';

class StubAdapter implements LogAdapter {
    info(message: string, ...meta: any[]): void {}
    debug(message: string, ...meta: any[]): void {}
    error(message: string, ...meta: any[]): void {}
    warn(message: string, ...meta: any[]): void {}
}

const stubLogger = new SystemLogger(new StubAdapter());

test('RedisBackend.constructor throws if no session.redisUrl is configured', t => {
    t.plan(1);

    const fakeConfig = {
        get() {
            return null;
        }
    };

    t.throws(function () {
        new RedisBackend((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
    });
});

test('RedisBackend.constructor connects with the URL provided', t => {
    t.plan(1);

    const fakeConfig = {
        get() {
            return '__url__';
        }
    };

    class MockIoredis {
        constructor(url: string) {
            t.is(url, '__url__');
        }
    }

    class MockRedisBackend extends RedisBackend {
        constructor() {
            super((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
        }

        protected async checkConnection(): Promise<void> {}
    }

    const old = RedisBackend.redisClass;
    RedisBackend.redisClass = MockIoredis;
    new MockRedisBackend();
    RedisBackend.redisClass = old;
});

test('RedisBackend.setup performs a connection check', async t => {
    t.plan(1);
    const old = RedisBackend.redisClass;
    t.teardown(function () {
        RedisBackend.redisClass = old;
    });

    const fakeConfig = {
        get() {
            return '__url__';
        }
    };

    class MockIoredis {
        constructor() {}

        async ping(): Promise<string> {
            t.pass();
            return 'PONG';
        }
    }

    class MockRedisBackend extends RedisBackend {
        constructor() {
            super((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
        }

        async assert() {
            await this.setup();
        }
    }

    RedisBackend.redisClass = MockIoredis;
    await new MockRedisBackend().assert();
});

test('RedisBackend.setup throws if redis connection throws', async t => {
    t.plan(1);
    const old = RedisBackend.redisClass;
    t.teardown(function () {
        RedisBackend.redisClass = old;
    });

    const fakeConfig = {
        get() {
            return '__url__';
        }
    };

    class MockIoredis {
        constructor() {}

        async ping(): Promise<string> {
            throw new Error();
        }
    }

    class MockRedisBackend extends RedisBackend {
        constructor() {
            super((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
        }
        async assert() {
            await this.setup();
        }
    }

    RedisBackend.redisClass = MockIoredis;

    await t.throwsAsync(async function () {
        await new MockRedisBackend().assert();
    });
});

test('RedisBackend.setup throws if not returning PONG', async t => {
    t.plan(2);
    const old = RedisBackend.redisClass;
    t.teardown(function () {
        RedisBackend.redisClass = old;
    });

    const fakeConfig = {
        get() {
            return '__url__';
        }
    };

    function createIoredisMock(pingReturnValue: string) {
        return class MockIoredis {
            constructor() {}

            async ping(): Promise<string> {
                return pingReturnValue;
            }
        };
    }

    class MockRedisBackend extends RedisBackend {
        constructor() {
            super((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
        }
        async assert() {
            await this.setup();
        }
    }

    RedisBackend.redisClass = createIoredisMock('banana');

    await t.throwsAsync(async function () {
        await new MockRedisBackend().assert();
    });

    RedisBackend.redisClass = createIoredisMock('pong');

    await t.notThrowsAsync(async function () {
        await new MockRedisBackend().assert();
    });
});

test('RedisBackend.put stores the session in redis', async t => {
    t.plan(2);

    const old = RedisBackend.redisClass;
    t.teardown(function () {
        RedisBackend.redisClass = old;
    });

    class MockSession extends BaseSession {
        public deserialize(input: string): void {}

        public serialize(): string {
            return 'banana!';
        }
        public get surrogateKey(): string {
            return '__banana__';
        }
    }

    const fakeConfig = {
        get() {
            return '__url__';
        }
    };

    class MockIoredis {
        constructor() {}

        async set(key: string, value: any): Promise<void> {
            t.is(key, '__banana__');
            t.is(value, 'banana!');
        }
    }

    class MockRedisBackend extends RedisBackend {
        constructor() {
            super((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
        }
    }

    RedisBackend.redisClass = MockIoredis;

    await new MockRedisBackend().put(new MockSession());
});

test('RedisBackend.fetch retrieves the session from redis', async t => {
    t.plan(3);

    const old = RedisBackend.redisClass;
    t.teardown(function () {
        RedisBackend.redisClass = old;
    });

    class MockSession extends BaseSession {
        public deserialize(input: string): void {
            t.is(input, 'banana~~');
        }

        public serialize(): string {
            throw new Error();
        }
        public get surrogateKey(): string {
            throw new Error();
        }
    }

    const fakeConfig = {
        get() {
            return '__url__';
        }
    };

    class MockIoredis {
        constructor() {}

        async get(key: string): Promise<string> {
            t.is(key, '__banana__');
            return 'banana~~';
        }
    }

    class MockRedisBackend extends RedisBackend {
        constructor() {
            super((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
        }
    }

    RedisBackend.redisClass = MockIoredis;

    const result = await new MockRedisBackend().fetch('__banana__', new MockSession());
    t.true(result);
});

test('RedisBackend.fetch throws if .get() throws', async t => {
    t.plan(1);

    const old = RedisBackend.redisClass;
    t.teardown(function () {
        RedisBackend.redisClass = old;
    });

    class MockSession extends BaseSession {
        public deserialize(input: string): void {}

        public serialize(): string {
            throw new Error();
        }
        public get surrogateKey(): string {
            throw new Error();
        }
    }

    const fakeConfig = {
        get() {
            return '__url__';
        }
    };

    class MockIoredis {
        constructor() {}

        async get(key: string): Promise<string> {
            throw new Error();
        }
    }

    class MockRedisBackend extends RedisBackend {
        constructor() {
            super((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
        }
    }

    RedisBackend.redisClass = MockIoredis;

    await t.throwsAsync(async function () {
        await new MockRedisBackend().fetch('__banana__', new MockSession());
    });
});

test('RedisBackend.fetch returns false if no result is returned', async t => {
    t.plan(1);

    const old = RedisBackend.redisClass;
    t.teardown(function () {
        RedisBackend.redisClass = old;
    });

    class MockSession extends BaseSession {
        public deserialize(input: string): void {}

        public serialize(): string {
            throw new Error();
        }
        public get surrogateKey(): string {
            throw new Error();
        }
    }

    const fakeConfig = {
        get() {
            return '__url__';
        }
    };

    class MockIoredis {
        constructor() {}

        async get(key: string): Promise<string | null> {
            return null;
        }
    }

    class MockRedisBackend extends RedisBackend {
        constructor() {
            super((fakeConfig as unknown) as ApplicationConfiguration, stubLogger);
        }
    }

    RedisBackend.redisClass = MockIoredis;

    t.false(await new MockRedisBackend().fetch('__banana__', new MockSession()));
});
