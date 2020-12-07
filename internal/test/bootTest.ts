import ApplicationServer from '@internal/lib/ApplicationServer';
import test from 'ava';
import sinon from 'sinon';
import { boot } from '@internal/boot';

test('boot starts the application server', t => {
    t.plan(2);

    class MockApplicationServer extends ApplicationServer {
        constructor() {
            super();
        }

        startup() {
            t.pass();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const spy = sandbox.stub(ApplicationServer, 'getInstance').returns(new MockApplicationServer());

    boot();

    t.is(spy.callCount, 1);
});
