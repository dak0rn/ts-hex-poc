import test from 'ava';
import sinon from 'sinon';
import { Module, ApplicationModule, ApplicationModuleLauncher } from '@core/module/Module';
import { ApplicationContext } from '@core/ioc/ApplicationContext';
import { constructor } from 'tsyringe/dist/typings/types';

const DummyModule = {
    getClass(): { new (...args: any[]): any } {
        return class {};
    }
};

/// Module.getClass

test("Module.getClass calls module's getClass()", t => {
    t.plan(2);

    class Stub {}

    const localDummy = Object.assign({}, DummyModule);
    const spy = sinon.stub(localDummy, 'getClass').returns(Stub);

    const m = new Module(localDummy as ApplicationModule);

    const klass = m.getClass();

    t.is(spy.callCount, 1);
    t.is(klass, Stub);
});

/// Module.launch
test("Module.launch invokes the module's launch method", async t => {
    t.plan(3);

    class MockLauncher implements ApplicationModuleLauncher {
        prepare(): void {}

        async launch(): Promise<unknown> {
            t.pass();

            return;
        }
    }

    class MockApplicationContext extends ApplicationContext {
        constructor() {
            super(null);
        }

        registerValue(key: string, value: any): void {}
        register<T>(key: string, value: constructor<T>): void {}
        resolve(key: any): any {
            t.is(key, MockLauncher);
            return new MockLauncher();
        }
    }

    class MockModule extends Module {
        constructor() {
            super(DummyModule as ApplicationModule);
        }

        getClass(): { new (...args: any[]): any } {
            t.pass();
            return MockLauncher;
        }
    }

    const mm = new MockModule();
    mm.prepare(new MockApplicationContext());
    await mm.launch();
});

/// Module.prepare
test("Module.prepare invokes the module's prepare method", t => {
    t.plan(3);

    class MockLauncher implements ApplicationModuleLauncher {
        prepare(): void {
            t.pass();
        }

        async launch(): Promise<unknown> {
            t.fail();
            return;
        }
    }

    class MockApplicationContext extends ApplicationContext {
        constructor() {
            super(null);
        }

        registerValue(key: string, value: any): void {}
        register<T>(key: string, value: constructor<T>): void {}
        resolve(key: any): any {
            t.is(key, MockLauncher);
            return new MockLauncher();
        }
    }

    class MockModule extends Module {
        constructor() {
            super(DummyModule as ApplicationModule);
        }

        getClass(): { new (...args: any[]): any } {
            t.pass();
            return MockLauncher;
        }
    }

    const mm = new MockModule();
    mm.prepare(new MockApplicationContext());
});

/// Module.getApplicationModule

test('Module.getApplicationModule returns the ApplicationModule set', t => {
    t.plan(1);

    const appmod = {} as ApplicationModule;
    const m = new Module(appmod);

    t.is(m.getApplicationModule(), appmod);
});
