import ApplicationContext from '@core/ioc/ApplicationContext';
import test from 'ava';
import sinon from 'sinon';
import SessionBackend from '../SessionBackend';
import SessionProvider from '../SessionProvider';

test('SessionProvider.constructor assigns the given context', t => {
    t.plan(1);

    const ac = (42 as unknown) as ApplicationContext;

    class MockSP extends SessionProvider {
        __assert() {
            t.is(this.ctx, ac);
        }
    }

    const mock = new MockSP(ac);
    mock.__assert();
});

test('SessionProvider.launch triggers the SessionBackend singleton instantiation', async t => {
    t.plan(1);

    const ac = (42 as unknown) as ApplicationContext;

    const sandbox = sinon.createSandbox();
    const spy = sandbox.stub(SessionBackend, 'getInstance');

    const mock = new SessionProvider(ac);
    await mock.launch();

    t.is(spy.callCount, 1);
});
