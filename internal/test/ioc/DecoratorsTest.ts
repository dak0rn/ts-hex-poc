import test from 'ava';
import sinon from 'sinon';
import { provide } from '@internal/ioc/Decorators';
import ApplicationContext from '@internal/ioc/ApplicationContext';
import RootApplicationContext from '@internal/ioc/RootApplicationContext';

test('Decorators.provide registers class under name provided', t => {
    t.plan(3);

    const sandbox = sinon.createSandbox();

    const ac = new ApplicationContext(null);

    const spy = sinon.stub(ac, 'register'); // Outside of sandbox as it is a local variable
    sandbox.stub(RootApplicationContext, 'getInstance').returns(ac);

    @provide('subject')
    class Subject {}

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'subject');
    t.is(spy.firstCall.lastArg, Subject);

    sandbox.restore();
});
