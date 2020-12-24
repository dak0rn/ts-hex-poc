import test from 'ava';
import BaseSession from '../..//BaseSession';
import MemoryBackend from '../../backends/MemoryBackend';

test('MemoryBackend.put stores in a Map in memory', t => {
    t.plan(1);

    class MockSession extends BaseSession {
        public deserialize(input: string): void {}

        public serialize(): string {
            return 'banana!';
        }
        public get surrogateKey(): string {
            return '__banana__';
        }
    }

    const banana = new MockSession();

    class MockBackend extends MemoryBackend {
        public assert(): void {
            t.is(this.store.get('__banana__'), banana.serialize());
        }
    }

    const m = new MockBackend();
    m.put(banana);
    m.assert();
});

test('MemoryBackend.fetch retrieves a session from the store', async t => {
    t.plan(3);

    class MockSession extends BaseSession {
        public deserialize(input: string): void {
            t.is(input, 'banana!');
        }

        public serialize(): string {
            return 'banana!';
        }
        public get surrogateKey(): string {
            return '__banana__';
        }
    }

    const banana = new MockSession();
    const apple = new MockSession();
    const m = new MemoryBackend();
    m.put(banana);

    const status = await m.fetch('__banana__', apple);

    t.true(status);
    t.deepEqual(apple, banana);
});

test('MemoryBackend.fetch returns false if session does not exist', async t => {
    t.plan(1);

    class MockSession extends BaseSession {
        public deserialize(input: string): void {
            t.fail();
        }

        public serialize(): string {
            return 'banana!';
        }
        public get surrogateKey(): string {
            return '__banana__';
        }
    }

    const m = new MemoryBackend();
    const result = await m.fetch('banana!', new MockSession());

    t.is(result, false);
});
