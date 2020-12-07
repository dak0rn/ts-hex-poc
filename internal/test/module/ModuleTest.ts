import test from 'ava';
import sinon from 'sinon';
import Module, { MissingModuleException, MissingModulePathException } from '@internal/module/Module';
import ApplicationContext from '@internal/ioc/ApplicationContext';
import { constructor } from 'tsyringe/dist/typings/types';
import { ApplicationModuleLauncher } from '@internal/types/modules';

const DummyModule = {
    getClass(): { new (...args: any[]): any } {
        return class {};
    }
};

test.skip('Module uses require by default', t => {
    t.plan(1);
    const m = new Module();

    /*
     * That does not work, neither with t.is()
     */
    t.true(m.loader === require);
});

/// Module.load

test('Module.load loads the module using the loader configured', t => {
    t.plan(1);

    const m = new Module();
    m.modulePath = '/tmp/banana';
    m.loader = function (p: string) {
        t.is(p, '/tmp/banana/index.ts');
        return DummyModule;
    };

    m.load();
});

test('Module.load stores the loaded module', t => {
    t.plan(1);

    class MockModule extends Module {
        test() {
            t.is(this.mod, DummyModule);
        }
    }

    const m = new MockModule();
    m.modulePath = '/tmp/banana';
    m.loader = function (p: string) {
        return DummyModule;
    };

    m.load();
    m.test();
});

test('Module.load only loads the module once.', t => {
    t.plan(0);

    const m = new Module();
    m.modulePath = '/tmp/banana';
    m.loader = function () {};

    m.load();

    m.loader = function () {
        t.fail();
    };
    m.load();
});

test('Module.load throws if no module path is set', t => {
    t.plan(1);

    const m = new Module();

    m.loader = function () {};

    t.throws(m.load.bind(m), { instanceOf: MissingModulePathException });
});

test('Module.load throws if loader throws', t => {
    t.plan(1);

    const m = new Module();

    m.modulePath = '/tmp/banana';
    m.loader = function () {
        throw new Error();
    };

    t.throws(m.load.bind(m), { instanceOf: MissingModuleException });
});

/// Module.getClass

test("Module.getClass calls module's getClass()", t => {
    t.plan(2);

    class Stub {}

    const localDummy = Object.assign({}, DummyModule);
    const spy = sinon.stub(localDummy, 'getClass').returns(Stub);

    const m = new Module();
    m.modulePath = '/tmp/banana';
    m.loader = function () {
        return localDummy;
    };

    m.load();
    const klass = m.getClass();

    t.is(spy.callCount, 1);
    t.is(klass, Stub);
});


/// Module.launch
test('Module.launch invokes the module\'s launch method', t => {
    t.plan(3);

    class MockLauncher implements ApplicationModuleLauncher {
        launch(): void {
            t.pass();
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

        getClass(): { new(...args:any[]): any } {
            t.pass();
            return MockLauncher;
        }

        _execute() {
            this.launch(new MockApplicationContext());
        }
    }

    const mm = new MockModule();
    mm._execute();

})