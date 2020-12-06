import test from 'ava';
import sinon from 'sinon';
import Module, { MissingModuleException, MissingModulePathException } from '@internal/lib/Module';
import { ApplicationModuleRegistry } from '@internal/types/modules';

const DummyModule = {
    registerProjectMatchers(registry: ApplicationModuleRegistry): void {},

    getClass(): { new (...args: any[]): any } {
        return class {};
    }
};

test('Module uses global.require by default', t => {
    t.plan(1);
    const m = new Module();

    t.is(m.loader, global.require);
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

/// Module.registerProjectMatchers

test("Module.registerProjectMatchers calls module's registerProjectMatchers()", t => {
    t.plan(2);

    class RegistryStub implements ApplicationModuleRegistry {
        registerNameMatcher(expression: RegExp): void {
            throw new Error('Method not implemented.');
        }
        registerContentMatcher(expression: RegExp): void {
            throw new Error('Method not implemented.');
        }
    }

    const localDummy = Object.assign({}, DummyModule);
    const registry = new RegistryStub();
    const spy = sinon.spy(localDummy, 'registerProjectMatchers');

    const m = new Module();
    m.modulePath = '/tmp/banana';
    m.loader = function () {
        return localDummy;
    };

    m.load();
    m.registerProjectMatchers(registry);

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, registry);
});

test("Module.getClass calls module's getClass()", t => {
    t.plan(2);

    class RegistryStub implements ApplicationModuleRegistry {
        registerNameMatcher(expression: RegExp): void {
            throw new Error('Method not implemented.');
        }
        registerContentMatcher(expression: RegExp): void {
            throw new Error('Method not implemented.');
        }
    }

    const localDummy = Object.assign({}, DummyModule);
    const registry = new RegistryStub();
    const spy = sinon.stub(localDummy, 'getClass').returns(RegistryStub);

    const m = new Module();
    m.modulePath = '/tmp/banana';
    m.loader = function () {
        return localDummy;
    };

    m.load();
    const klass = m.getClass();

    t.is(spy.callCount, 1);
    t.is(klass, RegistryStub);
});
