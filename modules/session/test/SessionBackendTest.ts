import test from 'ava';
import sinon from 'sinon';
import { container } from 'tsyringe';
import ApplicationContext from '@core/ioc/ApplicationContext';
import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import ConfigurationAdapter from '@core/configuration/ConfigurationAdapter';
import SystemConfiguration from '@core/configuration/SystemConfiguration';
import SessionBackend, {
    availableBackends,
    SessionBackendNotConfiguredError,
    SessionBackendNotSupportedError
} from '../SessionBackend';
import BaseSession from '../BaseSession';

class StubAdapter extends ConfigurationAdapter {
    constructor() {
        super('');
    }

    system(): SystemConfiguration {
        throw new Error('Method not implemented.');
    }
    application(): ApplicationConfiguration {
        throw new Error('Method not implemented.');
    }
}

class AccessSessionBackend extends SessionBackend {
    public async put(session: BaseSession): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    public static __reset(): void {
        SessionBackend._instance = null;
    }

    public static __get(): any {
        return SessionBackend._instance;
    }
}

test.beforeEach(function () {
    // Reset the singleton reference
    AccessSessionBackend.__reset();
});

test.serial('SessionBackend.getInstance throws if it cannot access session key', async t => {
    t.plan(2);

    // Create an empty application configuration
    const ac = new ApplicationContext(container.createChildContainer());
    const conf = new ApplicationConfiguration({}, new StubAdapter());

    ac.registerValue('core.ApplicationConfiguration', conf);

    const sandbox = sinon.createSandbox();
    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);
    t.teardown(sandbox.restore.bind(sandbox));

    const err = await t.throwsAsync(async function (): Promise<any> {
        await SessionBackend.getInstance();
    });

    t.true(err instanceof SessionBackendNotConfiguredError);
});

test.serial('SessionBackend.getInstance throws if no backend is configued', async t => {
    t.plan(2);

    // Create an empty application configuration
    const ac = new ApplicationContext(container.createChildContainer());
    const conf = new ApplicationConfiguration({ session: {} }, new StubAdapter());

    ac.registerValue('core.ApplicationConfiguration', conf);

    const sandbox = sinon.createSandbox();
    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);
    t.teardown(sandbox.restore.bind(sandbox));

    const err = await t.throwsAsync(async function (): Promise<any> {
        await SessionBackend.getInstance();
    });

    t.true(err instanceof SessionBackendNotConfiguredError);
});

test.serial('SessionBackend.getInstance throws configured backend does not exist', async t => {
    t.plan(2);

    // Create an empty application configuration
    const ac = new ApplicationContext(container.createChildContainer());
    const conf = new ApplicationConfiguration({ session: { backend: 'banana!' } }, new StubAdapter());

    ac.registerValue('core.ApplicationConfiguration', conf);

    const sandbox = sinon.createSandbox();
    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);
    t.teardown(sandbox.restore.bind(sandbox));

    const err = await t.throwsAsync(async function (): Promise<any> {
        await SessionBackend.getInstance();
    });

    t.true(err instanceof SessionBackendNotSupportedError);
});

test.serial('SessionBackend.getInstance creates a new backend as configured', async t => {
    t.plan(1);

    class BananaBackend extends SessionBackend {
        public async put(session: BaseSession): Promise<void> {
            throw new Error('Method not implemented.');
        }
        public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
            throw new Error('Method not implemented.');
        }

        protected store(key: string, object: BaseSession): void {}

        protected retrieve(key: string): BaseSession {
            return {} as BaseSession;
        }
    }

    const baseConfig = {
        session: {
            backend: 'banana'
        }
    };
    const ac = new ApplicationContext(container.createChildContainer());
    const conf = new ApplicationConfiguration(baseConfig, new StubAdapter());
    const sandbox = sinon.createSandbox();

    ac.registerValue('core.ApplicationConfiguration', conf);

    availableBackends['banana'] = () => BananaBackend;

    t.teardown(function () {
        delete availableBackends['banana'];
        sandbox.restore();
    });

    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);

    const instance = await SessionBackend.getInstance();

    t.true(instance instanceof BananaBackend);
});

test.serial('SessionBackend.getInstance uses the singleton pattern', async t => {
    t.plan(2);

    class BananaBackend extends SessionBackend {
        public async put(session: BaseSession): Promise<void> {
            throw new Error('Method not implemented.');
        }
        public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
            throw new Error('Method not implemented.');
        }
        protected store(key: string, object: BaseSession): void {}

        protected retrieve(key: string): BaseSession {
            return {} as BaseSession;
        }
    }

    const baseConfig = {
        session: {
            backend: 'banana'
        }
    };
    const ac = new ApplicationContext(container.createChildContainer());
    const conf = new ApplicationConfiguration(baseConfig, new StubAdapter());
    const sandbox = sinon.createSandbox();

    ac.registerValue('core.ApplicationConfiguration', conf);

    availableBackends['banana'] = () => BananaBackend;

    t.teardown(function () {
        delete availableBackends['banana'];
        sandbox.restore();
    });
    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);

    const first = await SessionBackend.getInstance();
    const second = await SessionBackend.getInstance();

    t.true(first instanceof BananaBackend);
    t.is(first, second);
});

test.serial('SessionBackend.getInstance resolves the backend in the ApplicationContext', async t => {
    t.plan(3);

    t.is(AccessSessionBackend.__get(), null);

    class BananaBackend extends SessionBackend {
        public async put(session: BaseSession): Promise<void> {
            throw new Error('Method not implemented.');
        }
        public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
            throw new Error('Method not implemented.');
        }
        protected store(key: string, object: BaseSession): void {}

        protected retrieve(key: string): BaseSession {
            return {} as BaseSession;
        }
    }

    const baseConfig = {
        session: {
            backend: 'banana'
        }
    };
    const ac = new ApplicationContext(container.createChildContainer());
    const conf = new ApplicationConfiguration(baseConfig, new StubAdapter());

    const sandbox = sinon.createSandbox();

    ac.registerValue('core.ApplicationConfiguration', conf);

    availableBackends['banana'] = () => BananaBackend;

    t.teardown(function () {
        delete availableBackends['banana'];
        sandbox.restore();
    });

    const spy = sandbox.stub(ac, 'resolve').onFirstCall().returns(conf).returns(new BananaBackend());

    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);

    await SessionBackend.getInstance();

    t.is(spy.callCount, 2);
    t.is(spy.getCall(1).firstArg, BananaBackend);
});

test.serial('SessionBackend.invokes the setup function', async t => {
    t.plan(1);

    let callCount = 0;
    class BananaBackend extends SessionBackend {
        public async put(session: BaseSession): Promise<void> {}
        public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
            throw new Error('Method not implemented.');
        }
        protected store(key: string, object: BaseSession): void {}

        protected retrieve(key: string): BaseSession {
            return {} as BaseSession;
        }

        protected async setup(): Promise<void> {
            if (callCount++ > 0) {
                t.fail();
            } else {
                t.pass();
            }
        }
    }

    const baseConfig = {
        session: {
            backend: 'banana'
        }
    };
    const ac = new ApplicationContext(container.createChildContainer());
    const conf = new ApplicationConfiguration(baseConfig, new StubAdapter());
    const sandbox = sinon.createSandbox();

    ac.registerValue('core.ApplicationConfiguration', conf);

    availableBackends['banana'] = () => BananaBackend;

    t.teardown(function () {
        delete availableBackends['banana'];
        sandbox.restore();
    });
    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);

    await SessionBackend.getInstance();
    await SessionBackend.getInstance();
});
