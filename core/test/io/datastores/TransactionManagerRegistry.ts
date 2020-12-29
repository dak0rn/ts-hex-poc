import { SystemConfiguration } from '@core/configuration/SystemConfiguration';
import { TransactionManager } from '@core/io/datastores/TransactionManager';
import {
    DefaultTransactionManagerDoesNotExistError,
    DuplicateTransactionManagerError,
    TransactionManagerDoesNotExistError,
    TransactionManagerRegistry
} from '@core/io/datastores/TransactionManagerRegistry';
import { ApplicationContext } from '@core/ioc/ApplicationContext';
import test from 'ava';
import sinon from 'sinon';

const mockConfig = {
    defaultTransactionManager() {
        return 'banana';
    }
} as SystemConfiguration;

class BaseMockTMR extends TransactionManagerRegistry {
    constructor() {
        super(mockConfig);
    }
}

/// TransactionManagerRegistry.getInstance
test('TransactionManagerRegistry.getInstance creates a new instance using the ApplicationContext', t => {
    t.plan(4);

    class MockTMR extends TransactionManagerRegistry {
        static get _i(): any {
            return TransactionManagerRegistry.instance;
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ApplicationContext, 'getRootInstance').returns({
        resolve(klass: any): any {
            t.is(klass, TransactionManagerRegistry);
            return 42;
        }
    } as ApplicationContext);

    t.is(MockTMR._i, null);

    const instance = TransactionManagerRegistry.getInstance();

    t.is(MockTMR._i, 42);
    t.is(instance, (42 as unknown) as TransactionManagerRegistry);
});

test('TransactionManagerRegistry.getInstance returns a singleton', t => {
    t.plan(1);

    class MockTMR extends TransactionManagerRegistry {
        static __prepare(): void {
            TransactionManagerRegistry.instance = (42 as unknown) as TransactionManagerRegistry;
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ApplicationContext, 'getRootInstance').set(() => t.fail());

    MockTMR.__prepare();

    const instance = TransactionManagerRegistry.getInstance();

    t.is(instance, (42 as unknown) as TransactionManagerRegistry);
});

/// TransactionManagerRegistry.constructor
test('TransactionManagerRegistry.constructor keeps the default transaction manager', t => {
    t.plan(1);

    class MockTMR extends TransactionManagerRegistry {
        constructor() {
            super(mockConfig);
            t.is(this.defaultManager, 'banana');
        }
    }

    new MockTMR();
});

/// TransactionManagerRegistry.register
test('TransactionManagerRegistry.register adds the given manager to its registry', t => {
    t.plan(2);

    const stub = {
        type: 'banana'
    } as TransactionManager<any>;

    class MockTMR extends BaseMockTMR {
        __prepare(): void {
            t.false(this.registry.has('banana'));
        }

        __finalize(): void {
            t.is(this.registry.get('banana'), stub);
        }
    }

    const mock = new MockTMR();
    mock.__prepare();
    mock.register(stub);
    mock.__finalize();
});

test('TransactionManagerRegistry.register throws if manager with that name is already registered', t => {
    t.plan(1);

    const stub = {
        type: 'banana'
    } as TransactionManager<any>;

    class MockTMR extends BaseMockTMR {
        constructor() {
            super();

            this.registry.set('banana', stub);
        }
    }

    const mock = new MockTMR();
    t.throws(
        function () {
            mock.register(stub);
        },
        { instanceOf: DuplicateTransactionManagerError }
    );
});

/// TransactionManagerRegistry.default
test('TransactionManagerRegistry.default returns the default transaction manager', t => {
    t.plan(1);

    const stub = {
        type: 'banana'
    } as TransactionManager<any>;

    const mock = new BaseMockTMR();
    mock.register(stub);

    t.is(mock.default, stub);
});

test('TransactionManagerRegistry.default throws if default transaction manager is not registered', t => {
    t.plan(1);

    const mock = new BaseMockTMR();

    t.throws(
        function () {
            mock.default;
        },
        { instanceOf: DefaultTransactionManagerDoesNotExistError }
    );
});

/// TransactionManagerRegistry.forName
test('TransactionManagerRegistry.forName returns the transaction manager with the given name', t => {
    t.plan(1);

    const stub = {
        type: 'banana'
    } as TransactionManager<any>;

    const mock = new BaseMockTMR();
    mock.register(stub);

    t.is(mock.forName('banana'), stub);
});

test('TransactionManagerRegistry.forName throws if transaction manager does not exist', t => {
    t.plan(1);

    const mock = new BaseMockTMR();

    t.throws(
        function () {
            mock.forName('apple');
        },
        { instanceOf: TransactionManagerDoesNotExistError }
    );
});
