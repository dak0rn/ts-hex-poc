import { ApplicationServer } from '@core/lib/ApplicationServer';
import test from 'ava';
import sinon from 'sinon';
import { boot } from '@core/boot';

test('boot starts the application server', t => {
    t.plan(2);

    class MockApplicationServer extends ApplicationServer {
        constructor() {
            super();
        }

        startup(): Promise<unknown> {
            t.pass();
            return Promise.resolve();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const spy = sandbox.stub(ApplicationServer, 'getInstance').returns(new MockApplicationServer());

    boot();

    t.is(spy.callCount, 1);
});
