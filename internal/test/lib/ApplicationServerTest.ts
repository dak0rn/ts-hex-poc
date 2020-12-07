import test from 'ava';
import sinon from 'sinon';
import ConfigurationFactory from '@internal/configuration/ConfigurationFactory';
import RootApplicationContext from '@internal/ioc/RootApplicationContext';
import ApplicationServer, { CONFIG_FILE } from '@internal/lib/ApplicationServer';
import SystemConfiguration from '@internal/configuration/SystemConfiguration';
import ConfigurationAdapter from '@internal/configuration/ConfigurationAdapter';
import ApplicationConfiguration from '@internal/configuration/ApplicationConfiguration';
import SystemLogger, { LogAdapter } from '@internal/log/SystemLogger';
import SystemLoggerFactory from '@internal/log/SystemLoggerFactory';
import ApplicationContext from '@internal/ioc/ApplicationContext';
import { constructor } from 'tsyringe/dist/typings/types';

class StubLogAdapter implements LogAdapter {
    info(message: string, ...meta: any[]): void {}
    debug(message: string, ...meta: any[]): void {}
    error(message: string, ...meta: any[]): void {}
    warn(message: string, ...meta: any[]): void {}
}

const stubLogger = new SystemLogger(new StubLogAdapter());

test('ApplicationServer.getInstance returns a cached instance', t => {
    t.plan(3);

    class MockApplicationServer extends ApplicationServer {
        public static _instance(): ApplicationServer | null {
            return MockApplicationServer.instance;
        }
    }

    t.is(MockApplicationServer._instance(), null);

    const first = ApplicationServer.getInstance();

    t.is(MockApplicationServer._instance(), first);
    t.is(ApplicationServer.getInstance(), first);
});

test('ApplicationServer.assemble correctly assembles the application context', t => {
    t.plan(14);

    let stubSC: any = null;
    let stubAC: any = null;

    class StubAdapter extends ConfigurationAdapter {
        constructor() {
            super('');
        }

        system(): SystemConfiguration {
            return stubSC;
        }
        application(): ApplicationConfiguration {
            return stubAC;
        }
    }

    class StubSystemConfiguration extends SystemConfiguration {
        constructor() {
            super({}, new StubAdapter());
        }
    }

    class StubApplicationConfiguration extends ApplicationConfiguration {
        constructor() {
            super({}, new StubAdapter());
        }
    }

    class MockApplicationContext extends ApplicationContext {
        constructor() {
            super(null);
        }

        registerValue(key: string, value: any): void {}
        register<T>(key: string, value: constructor<T>): void {}
    }

    class SystemUnderTest extends ApplicationServer {
        constructor() {
            super();
        }

        _execute() {
            this.assembleContext('banana');
        }
    }

    stubSC = new StubSystemConfiguration();
    stubAC = new StubApplicationConfiguration();

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const mockAC = new MockApplicationContext();

    const confSpy = sandbox.stub(ConfigurationFactory, 'getInstance').returns(new StubAdapter());
    const logSpy = sandbox.stub(SystemLoggerFactory, 'createInstance').returns(stubLogger);
    const acSpy = sandbox.stub(RootApplicationContext, 'getInstance').returns(mockAC);
    const rvSpy = sandbox.stub(mockAC, 'registerValue');
    const rSpy = sandbox.stub(mockAC, 'register');

    new SystemUnderTest()._execute();

    t.is(confSpy.callCount, 1);
    t.is(confSpy.firstCall.firstArg, 'banana');

    t.is(logSpy.callCount, 1);
    t.is(acSpy.callCount, 1);

    t.is(rvSpy.callCount, 4);

    t.is(rSpy.callCount, 0);

    t.is(rvSpy.getCall(0).firstArg, 'SystemConfiguration');
    t.is(rvSpy.getCall(0).lastArg, stubSC);

    t.is(rvSpy.getCall(1).firstArg, 'ApplicationConfiguration');
    t.is(rvSpy.getCall(1).lastArg, stubAC);

    t.is(rvSpy.getCall(2).firstArg, 'ApplicationContext');
    t.is(rvSpy.getCall(2).lastArg, mockAC);

    t.is(rvSpy.getCall(3).firstArg, 'SystemLogger');
    t.is(rvSpy.getCall(3).lastArg, stubLogger);
});

test('ApplicationServer.startup invokes setup functions', t => {
    t.plan(1);

    class MockApplicationContext extends ApplicationContext {
        constructor() {
            super(null);
        }

        registerValue(key: string, value: any): void {}
        register<T>(key: string, value: constructor<T>): void {}
        resolve(key: string): any {
            return stubLogger;
        }
    }

    class MockApplicationServer extends ApplicationServer {
        constructor() {
            super();
        }

        protected assembleContext(path: string) {
            t.is(path, CONFIG_FILE);

            return new MockApplicationContext();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(console);

    const mas = new MockApplicationServer();

    mas.startup();
});