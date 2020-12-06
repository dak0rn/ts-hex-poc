import ThreadLocal, { defaultStorage } from '@internal/lib/ThreadLocal';
import test from 'ava';
import { container, DependencyContainer } from 'tsyringe';
import sinon from 'sinon';

test('ThreadLocal.constructor sets the store correctly', t => {
    t.plan(1);

    const tl = new ThreadLocal(42);
    t.is(tl.store, 42);
});

/*
 * The async execution context is tested in two fashions:
 *
 * 1. Through actually verifying the context works
 * 2. Through verifying the correct functions are called correctly
 *
 * That ensures that if the API changes, we notice that immediately.
 */

test.cb('ThreadLocal.run runs function in its own async execution context', t => {
    t.plan(2);

    // There does not seem to be a way better than this for ava.js
    const done = (function () {
        let count = 0;

        return function () {
            count++;
            if (count >= 2) {
                t.end();
            }
        };
    })();

    function assert(expected: any, timeout: number = 0) {
        return function () {
            setTimeout(function () {
                t.is(ThreadLocal.getStore(), expected);
                done();
            }, timeout);
        };
    }

    const tl1 = new ThreadLocal(42);
    const tl2 = new ThreadLocal('value');

    setTimeout(function () {
        // This function is started first but waits
        // so that the second one can do its assertions
        //
        // That is an ugly way to simulate multi-threading
        tl1.run(assert(42, 200));
    });

    tl2.run(assert('value'));
});

/**
 * This test assesses the functionality that is provided by combining ThreadLocal
 * with ApplicationContext.
 *
 * That allows to use have a web server with user sessions accessible through dependency
 * injection even though they are request scoped.
 */
test.cb('ThreadLocal.run works with IoC container', t => {
    t.plan(2);

    // There does not seem to be a way better than this for ava.js
    const done = (function () {
        let count = 0;

        return function () {
            count++;
            if (count >= 2) {
                t.end();
            }
        };
    })();

    function assert(token: string, expected: any, timeout: number = 0) {
        return function () {
            setTimeout(function () {
                const cont = ThreadLocal.getStore() as DependencyContainer;

                t.is(cont.resolve(token), expected);
                done();
            }, timeout);
        };
    }

    const child1 = container.createChildContainer();
    child1.register('test', { useValue: 'result' });

    const child2 = container.createChildContainer();
    child2.register('test', { useValue: 'soup' });

    const tl1 = new ThreadLocal(child1);
    const tl2 = new ThreadLocal(child2);

    setTimeout(function () {
        // This function is started first but waits
        // so that the second one can do its assertions
        //
        // That is an ugly way to simulate multi-threading
        tl1.run(assert('test', 'result', 200));
    });

    tl2.run(assert('test', 'soup'));
});

test('ThreadLocal.run uses container correctly', t => {
    t.plan(3);

    const sandbox = sinon.createSandbox();
    const spy = sandbox.stub(defaultStorage, 'run');

    function cb() {}

    const tl = new ThreadLocal(42);
    tl.run(cb);

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 42);
    t.is(spy.firstCall.lastArg, cb);

    sandbox.restore();
});

test('ThreadLocal.getStore returns the thread-local store', t => {
    t.plan(2);

    const sandbox = sinon.createSandbox();
    const spy = sandbox.stub(defaultStorage, 'getStore').returns(42);

    const value = ThreadLocal.getStore();

    t.is(spy.callCount, 1);
    t.is(value, 42);

    sandbox.restore();
});
