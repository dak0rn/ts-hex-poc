import test from 'ava';
import sinon from 'sinon';
import { container } from 'tsyringe';
import ApplicationContext from '@core/ioc/ApplicationContext';
import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import ConfigurationAdapter from '@core/configuration/ConfigurationAdapter';
import SystemConfiguration from '@core/configuration/SystemConfiguration';
import SessionBackend, { availableBackends } from '../SessionBackend';
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

test.serial('SessionBackend.getInstance throws if no session backend is configured', t => {
    t.plan(1);

    // Create an empty application configuration
    const ac = new ApplicationContext(container.createChildContainer());
    const conf = new ApplicationConfiguration({}, new StubAdapter());

    ac.registerValue('ApplicationConfiguration', conf);

    t.throws(function () {
        SessionBackend.getInstance();
    });
});

test.serial('SessionBackend.getInstance creates a new backend as configured', t => {
    t.plan(1);

    class BananaBackend extends SessionBackend {
        public async put(session: BaseSession): Promise<void> {
            throw new Error('Method not implemented.');
        }
        public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
            throw new Error('Method not implemented.');
        }
        protected init(): void {}

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

    ac.registerValue('ApplicationConfiguration', conf);

    availableBackends['banana'] = () => BananaBackend;

    t.teardown(function () {
        delete availableBackends['banana'];
        sandbox.restore();
    });

    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);

    const instance = SessionBackend.getInstance();

    t.true(instance instanceof BananaBackend);
});

test.serial('SessionBackend.getInstance uses the singleton pattern', t => {
    t.plan(1);

    class BananaBackend extends SessionBackend {
        public async put(session: BaseSession): Promise<void> {
            throw new Error('Method not implemented.');
        }
        public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
            throw new Error('Method not implemented.');
        }
        protected init(): void {}

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

    ac.registerValue('ApplicationConfiguration', conf);

    availableBackends['banana'] = () => BananaBackend;

    t.teardown(function () {
        delete availableBackends['banana'];
        sandbox.restore();
    });
    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);

    t.is(SessionBackend.getInstance(), SessionBackend.getInstance());
});

test.serial('SessionBackend.getInstance resolves the backend in the ApplicationContext', t => {
    t.plan(3);

    t.is(AccessSessionBackend.__get(), null);

    class BananaBackend extends SessionBackend {
        public async put(session: BaseSession): Promise<void> {
            throw new Error('Method not implemented.');
        }
        public async fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean> {
            throw new Error('Method not implemented.');
        }
        protected init(): void {}

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

    ac.registerValue('ApplicationConfiguration', conf);

    availableBackends['banana'] = () => BananaBackend;

    t.teardown(function () {
        delete availableBackends['banana'];
        sandbox.restore();
    });

    const spy = sandbox.stub(ac, 'resolve').returns(conf);
    sandbox.stub(ApplicationContext, 'getInstance').returns(ac);

    SessionBackend.getInstance();

    t.is(spy.callCount, 2);
    t.is(spy.getCall(1).firstArg, BananaBackend);
});
