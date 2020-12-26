import test from 'ava';
import sinon from 'sinon';
import ConfigurationFactory from '@core/configuration/ConfigurationFactory';
import ApplicationServer, { CONFIG_FILE } from '@core/lib/ApplicationServer';
import SystemConfiguration from '@core/configuration/SystemConfiguration';
import ConfigurationAdapter from '@core/configuration/ConfigurationAdapter';
import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import SystemLogger, { LogAdapter } from '@core/log/SystemLogger';
import SystemLoggerFactory from '@core/log/SystemLoggerFactory';
import ApplicationContext from '@core/ioc/ApplicationContext';
import { constructor } from 'tsyringe/dist/typings/types';
import ModuleLoader from '@core/module/ModuleLoader';
import Module, { ApplicationModule } from '@core/module/Module';

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
    t.plan(12);

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
    const acSpy = sandbox.stub(ApplicationContext, 'getRootInstance').returns(mockAC);
    const rvSpy = sandbox.stub(mockAC, 'registerValue');
    const rSpy = sandbox.stub(mockAC, 'register');

    new SystemUnderTest()._execute();

    t.is(confSpy.callCount, 1);
    t.is(confSpy.firstCall.firstArg, 'banana');

    t.is(logSpy.callCount, 1);
    t.is(acSpy.callCount, 1);

    t.is(rvSpy.callCount, 3);

    t.is(rSpy.callCount, 0);

    t.is(rvSpy.getCall(0).firstArg, 'SystemConfiguration');
    t.is(rvSpy.getCall(0).lastArg, stubSC);

    t.is(rvSpy.getCall(1).firstArg, 'ApplicationConfiguration');
    t.is(rvSpy.getCall(1).lastArg, stubAC);

    t.is(rvSpy.getCall(2).firstArg, 'SystemLogger');
    t.is(rvSpy.getCall(2).lastArg, stubLogger);
});

test('ApplicationServer.startup invokes setup functions', t => {
    t.plan(2);

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

        protected assembleContext(path: string): void {
            t.is(path, CONFIG_FILE);

            this.ctx = new MockApplicationContext();
        }

        protected launchModules(): Promise<unknown> {
            t.pass();
            return Promise.resolve();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(console);

    const mas = new MockApplicationServer();

    mas.startup();
});

test('ApplicationServer.launchModules launches modules', t => {
    t.plan(4);

    let context: MockApplicationContext;

    class MockApplicationContext extends ApplicationContext {
        constructor() {
            super(null);
        }

        registerValue(key: string, value: any): void {}
        register<T>(key: string, value: constructor<T>): void {}
        resolve(key: string): any {}
    }

    class MockApplicationServer extends ApplicationServer {
        constructor() {
            super();
        }

        _execute(ctx: MockApplicationContext, loader: ModuleLoader) {
            this.ctx = ctx;
            this.launchModules(loader);
        }
    }

    class MockModule extends Module {
        constructor() {
            super({} as ApplicationModule);
        }

        async launch(): Promise<unknown> {
            t.pass();
            return;
        }

        prepare(ctx: ApplicationContext): void {
            t.is(ctx, context);
        }
    }

    class MockModuleLoader extends ModuleLoader {
        constructor() {
            super({} as SystemConfiguration);
        }

        load(): Module[] {
            return [new MockModule(), new MockModule()];
        }
    }

    context = new MockApplicationContext();
    const mas = new MockApplicationServer();
    const mml = new MockModuleLoader();

    mas._execute(context, mml);
});

test('ApplicationServer.launchModules constructs its own loader if not provided', t => {
    t.plan(2);

    let context: MockApplicationContext;

    class StubAdapter extends ConfigurationAdapter {
        constructor() {
            super('');
        }

        system(): SystemConfiguration {
            return {} as SystemConfiguration;
        }
        application(): ApplicationConfiguration {
            return {} as ApplicationConfiguration;
        }
    }

    class StubSystemConfiguration extends SystemConfiguration {
        constructor() {
            super({}, new StubAdapter());
        }

        modules(): string[] {
            // Modules must be an empty array in order to not trigger actual file system interaction
            return [];
        }

        resolvePathForKey(key: string): string {
            if ('moduleFolder' === key) {
                // This will be used from ModuleLoader
                t.pass();

                return '';
            }

            throw new Error('resolvePathForKey with key != moduleFolder');
        }
    }

    class MockApplicationContext extends ApplicationContext {
        constructor() {
            super(null);
        }

        registerValue(key: string, value: any): void {}
        register<T>(key: string, value: constructor<T>): void {}
        resolve(key: string): any {
            if ('SystemConfiguration' === key) {
                // This will be used from ApplicationServer in order to create a ModuleLoader
                t.pass();
                return new StubSystemConfiguration();
            }

            t.fail('Requested something else than SystemConfiguration');
        }
    }

    class MockApplicationServer extends ApplicationServer {
        constructor() {
            super();
        }

        _execute(ctx: MockApplicationContext) {
            this.ctx = ctx;
            this.launchModules();
        }
    }

    context = new MockApplicationContext();
    const mas = new MockApplicationServer();

    mas._execute(context);
});
