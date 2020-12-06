import test from 'ava';
import sinon from 'sinon';
import ModuleLoader, { ModuleLoadingFailedException } from '@internal/module/ModuleLoader';
import ConfigurationAdapter from '@internal/configuration/ConfigurationAdapter';
import SystemConfiguration from '@internal/configuration/SystemConfiguration';
import ApplicationConfiguration from '@internal/configuration/ApplicationConfiguration';
import { ApplicationModule } from '@internal/types/modules';

class StubAdapter extends ConfigurationAdapter {
    system(): SystemConfiguration {
        throw new Error('Method not implemented.');
    }
    application(): ApplicationConfiguration {
        throw new Error('Method not implemented.');
    }
}

test('ModuleLoader.load loads modules with the configured loader', t => {
    t.plan(4);

    const sc = new SystemConfiguration({ moduleFolder: 'fake-path', modules: ['a', 'b', 'c'] }, new StubAdapter(''));
    const ml = new ModuleLoader(sc);

    const loader = sinon.stub().returns({});
    ml.loader = loader;

    ml.load();

    t.is(loader.callCount, 3);
    t.true(loader.getCall(0).args[0].endsWith('fake-path/a/index.ts'));
    t.true(loader.getCall(1).args[0].endsWith('fake-path/b/index.ts'));
    t.true(loader.getCall(2).args[0].endsWith('fake-path/c/index.ts'));
});

test('ModuleLoader.load returns the provided modules', t => {
    t.plan(4);

    class ModuleStub implements ApplicationModule {
        getClass(): new (...args: any[]) => any {
            throw new Error('Method not implemented.');
        }
    }

    const sc = new SystemConfiguration({ moduleFolder: 'fake-path', modules: ['a', 'b', 'c'] }, new StubAdapter(''));
    const ml = new ModuleLoader(sc);

    const loader = sinon.stub();
    const mod1 = new ModuleStub();
    const mod2 = new ModuleStub();
    const mod3 = new ModuleStub();

    loader.onCall(0).returns(mod1);
    loader.onCall(1).returns(mod2);
    loader.onCall(2).returns(mod3);

    ml.loader = loader;

    const modules = ml.load();

    t.is(modules.length, 3);
    t.is(modules[0], mod1);
    t.is(modules[1], mod2);
    t.is(modules[2], mod3);
});

test('ModuleLoader.load throws ModuleLoadingFailedException upon Errors thrown', t => {
    t.plan(2);

    class ModuleStub implements ApplicationModule {
        getClass(): new (...args: any[]) => any {
            throw new Error('Method not implemented.');
        }
    }

    const sc = new SystemConfiguration({ moduleFolder: 'fake-path', modules: ['a'] }, new StubAdapter(''));
    const ml = new ModuleLoader(sc);

    const loader = sinon.stub();

    loader.onCall(0).throws(new Error('banana'));
    ml.loader = loader;

    try {
        ml.load();
    } catch (err) {
        t.true(err instanceof ModuleLoadingFailedException);
        t.true((err as Error).message.includes('banana'));
    }
});

test('ModuleLoader.load throws ModuleLoadingFailedException upon non-Errors thrown', t => {
    t.plan(1);

    class ModuleStub implements ApplicationModule {
        getClass(): new (...args: any[]) => any {
            throw new Error('Method not implemented.');
        }
    }

    const sc = new SystemConfiguration({ moduleFolder: 'fake-path', modules: ['a'] }, new StubAdapter(''));
    const ml = new ModuleLoader(sc);

    const loader = sinon.stub();

    loader.onCall(0).throws(42);
    ml.loader = loader;

    try {
        ml.load();
    } catch (err) {
        t.true(err instanceof ModuleLoadingFailedException);
    }
});
