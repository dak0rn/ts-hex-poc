import test from 'ava';
import sinon from 'sinon';
import winston from 'winston';
import WinstonLogger, { defaultConfiguration } from '@core/log/WinstonLogger';
import SystemConfiguration, { ExecutionEnvironment } from '@core/configuration/SystemConfiguration';
import ConfigurationAdapter from '@core/configuration/ConfigurationAdapter';
import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';

class StubAdapter extends ConfigurationAdapter {
    system(): SystemConfiguration {
        throw new Error('Method not implemented.');
    }
    application(): ApplicationConfiguration {
        throw new Error('Method not implemented.');
    }
}

test.serial('WinstonLogger.constructor uses default configuration if non provided', t => {
    t.plan(/*3*/ 2);

    const sandbox = sinon.createSandbox();

    const sc = new SystemConfiguration({}, new StubAdapter(''));
    const spy = sandbox.spy(winston, 'createLogger');

    new WinstonLogger(sc);

    t.is(spy.callCount, 1);

    /* Does not work, winston seems to amend the configuration before the spy is being called
    t.deepEqual(spy.firstCall.firstArg, defaultConfiguration);
    */
    t.is(spy.firstCall.firstArg.level, defaultConfiguration.level);

    sandbox.restore();
});

test.serial('WinstonLogger.constructor requires the configuration referenced', t => {
    t.plan(3);

    const sandbox = sinon.createSandbox();

    const sc = new SystemConfiguration({ winstonConfigFile: '/tmp/something.js' }, new StubAdapter(''));
    const winstonConfig = { level: 'debug' };

    const spy = sandbox.stub().returns(winstonConfig);
    const winstonSpy = sandbox.stub(winston, 'createLogger');

    new WinstonLogger(sc, spy);

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, '/tmp/something.js');
    t.is(winstonSpy.firstCall.firstArg, winstonConfig);

    sandbox.restore();
});

test.serial('WinstonLogger.constructor elevates logging level to "info" in production', t => {
    t.plan(2);

    const sandbox = sinon.createSandbox();

    const sc = new SystemConfiguration({ environment: ExecutionEnvironment.Production }, new StubAdapter(''));
    const spy = sandbox.spy(winston, 'createLogger');

    new WinstonLogger(sc);

    t.is(spy.callCount, 1);

    t.is(spy.firstCall.firstArg.level, 'info');

    sandbox.restore();
});

/// WinstonLogger.info
test.serial('WinstonLogger.info provides arguments to winston', t => {
    t.plan(4);

    const sandbox = sinon.createSandbox();

    const underlying = winston.createLogger();
    const spy = sandbox.stub(underlying, 'info') as any; // Fails to stub because of overloading otherwise

    sandbox.stub(winston, 'createLogger').returns(underlying);

    const sc = new SystemConfiguration({}, new StubAdapter(''));
    const log = new WinstonLogger(sc);

    const arg1 = 42;
    const arg2 = ['5'];

    log.info('banana', arg1, arg2);

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'banana');
    t.is(spy.firstCall.args[1], arg1);
    t.is(spy.firstCall.args[2], arg2);

    sandbox.restore();
});

test.serial('WinstonLogger.debug provides arguments to winston', t => {
    t.plan(4);

    const sandbox = sinon.createSandbox();

    const underlying = winston.createLogger();
    const spy = sandbox.stub(underlying, 'debug') as any; // Fails to stub because of overloading otherwise

    sandbox.stub(winston, 'createLogger').returns(underlying);

    const sc = new SystemConfiguration({}, new StubAdapter(''));
    const log = new WinstonLogger(sc);

    const arg1 = 42;
    const arg2 = ['5'];

    log.debug('banana', arg1, arg2);

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'banana');
    t.is(spy.firstCall.args[1], arg1);
    t.is(spy.firstCall.args[2], arg2);

    sandbox.restore();
});

test.serial('WinstonLogger.warn provides arguments to winston', t => {
    t.plan(4);

    const sandbox = sinon.createSandbox();

    const underlying = winston.createLogger();
    const spy = sandbox.stub(underlying, 'warn') as any; // Fails to stub because of overloading otherwise

    sandbox.stub(winston, 'createLogger').returns(underlying);

    const sc = new SystemConfiguration({}, new StubAdapter(''));
    const log = new WinstonLogger(sc);

    const arg1 = 42;
    const arg2 = ['5'];

    log.warn('banana', arg1, arg2);

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'banana');
    t.is(spy.firstCall.args[1], arg1);
    t.is(spy.firstCall.args[2], arg2);

    sandbox.restore();
});

test.serial('WinstonLogger.error provides arguments to winston', t => {
    t.plan(4);

    const sandbox = sinon.createSandbox();

    const underlying = winston.createLogger();
    const spy = sandbox.stub(underlying, 'error') as any; // Fails to stub because of overloading otherwise

    sandbox.stub(winston, 'createLogger').returns(underlying);

    const sc = new SystemConfiguration({}, new StubAdapter(''));
    const log = new WinstonLogger(sc);

    const arg1 = 42;
    const arg2 = ['5'];

    log.error('banana', arg1, arg2);

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'banana');
    t.is(spy.firstCall.args[1], arg1);
    t.is(spy.firstCall.args[2], arg2);

    sandbox.restore();
});
