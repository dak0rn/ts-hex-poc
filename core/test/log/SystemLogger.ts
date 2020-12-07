import SystemLogger, { LogAdapter } from '@core/log/SystemLogger';
import test from 'ava';
import sinon from 'sinon';

class StubAdapter implements LogAdapter {
    info(message: string, ...meta: any[]): void {}
    debug(message: string, ...meta: any[]): void {}
    error(message: string, ...meta: any[]): void {}
    warn(message: string, ...meta: any[]): void {}
}

test('SystemLogger.constructor creates a new SystemLogger with the given LogAdapter', t => {
    t.plan(1);

    const sa = new StubAdapter();

    const sl = new SystemLogger(sa);

    t.is(sl.adapter, sa);
});

test('SystemLogger.info forwards arguments correctly', t => {
    t.plan(5);

    const sa = new StubAdapter();
    const sandbox = sinon.createSandbox();

    const spy = sandbox.spy(sa, 'info');

    const sl = new SystemLogger(sa);
    sl.info('Banana', 1, 2, 3);

    t.is(spy.callCount, 1);

    t.is(spy.firstCall.firstArg, 'Banana');
    t.is(spy.firstCall.args[1], 1);
    t.is(spy.firstCall.args[2], 2);
    t.is(spy.firstCall.args[3], 3);

    sandbox.restore();
});

test('SystemLogger.debug forwards arguments correctly', t => {
    t.plan(5);

    const sa = new StubAdapter();
    const sandbox = sinon.createSandbox();

    const spy = sandbox.spy(sa, 'debug');

    const sl = new SystemLogger(sa);
    sl.debug('Banana', 1, 2, 3);

    t.is(spy.callCount, 1);

    t.is(spy.firstCall.firstArg, 'Banana');
    t.is(spy.firstCall.args[1], 1);
    t.is(spy.firstCall.args[2], 2);
    t.is(spy.firstCall.args[3], 3);

    sandbox.restore();
});

test('SystemLogger.warn forwards arguments correctly', t => {
    t.plan(5);

    const sa = new StubAdapter();
    const sandbox = sinon.createSandbox();

    const spy = sandbox.spy(sa, 'warn');

    const sl = new SystemLogger(sa);
    sl.warn('Banana', 1, 2, 3);

    t.is(spy.callCount, 1);

    t.is(spy.firstCall.firstArg, 'Banana');
    t.is(spy.firstCall.args[1], 1);
    t.is(spy.firstCall.args[2], 2);
    t.is(spy.firstCall.args[3], 3);

    sandbox.restore();
});

test('SystemLogger.error forwards arguments correctly', t => {
    t.plan(5);

    const sa = new StubAdapter();
    const sandbox = sinon.createSandbox();

    const spy = sandbox.spy(sa, 'error');

    const sl = new SystemLogger(sa);
    sl.error('Banana', 1, 2, 3);

    t.is(spy.callCount, 1);

    t.is(spy.firstCall.firstArg, 'Banana');
    t.is(spy.firstCall.args[1], 1);
    t.is(spy.firstCall.args[2], 2);
    t.is(spy.firstCall.args[3], 3);

    sandbox.restore();
});
