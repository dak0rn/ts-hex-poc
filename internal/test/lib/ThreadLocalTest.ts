import ThreadLocal, { defaultStorage } from '@internal/lib/ThreadLocal';
import test from 'ava';

test('ThreadLocal.constructor sets the store correctly', t => {
    t.plan(1);

    const tl = new ThreadLocal(42);
    t.is(tl.store, 42);
});

/**
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

    function createPrint(expected: any, timeout: number = 0) {
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
        tl1.run(createPrint(42, 200));
    });

    tl2.run(createPrint('value'));
});
