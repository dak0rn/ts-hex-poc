import test from 'ava';
import sinon from 'sinon';
import { provide, inject, injectable, threadLocalFactory } from '@core/ioc/Decorators';
import { inject as tsInject, injectable as tsInjectable } from 'tsyringe';
import ApplicationContext from '@core/ioc/ApplicationContext';
import RootApplicationContext from '@core/ioc/RootApplicationContext';
import ThreadLocal from '@core/lib/ThreadLocal';

const dummyMap = new Map<string, any>();

test('Decorators.provide registers class under name provided', t => {
    t.plan(3);

    const sandbox = sinon.createSandbox();

    const ac = new ApplicationContext(null);

    const spy = sinon.stub(ac, 'register'); // Outside of sandbox as it is a local variable
    sandbox.stub(RootApplicationContext, 'getInstance').returns(ac);

    @provide('subject')
    class Subject {}

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'subject');
    t.is(spy.firstCall.lastArg, Subject);

    sandbox.restore();
});

test('Decorators.inject is tsyringe.inject', t => {
    t.plan(1);
    t.is(inject, tsInject);
});

test('Decorators.injectable is tsyringe.injectable', t => {
    t.plan(1);
    t.is(injectable, tsInjectable);
});

test('Decorators.threadLocalFactory overwrites an existing factory method', t => {
    t.plan(1);

    const factoryFn = function (): Mock {
        return {} as Mock;
    };

    @threadLocalFactory('something')
    class Mock {
        static getInstance = factoryFn;
    }

    t.true(Mock.getInstance !== factoryFn);
});

test('Decorators.threadLocalFactory factory returns instance from thread-local cache', t => {
    t.plan(1);

    @threadLocalFactory('something')
    class Mock {
        static getInstance(): Mock {
            return new Mock();
        }
    }

    const mockInstance = new Mock();

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'getStore').returns(
        new Map<string, any>([['something', mockInstance]])
    );

    const result = Mock.getInstance();

    t.is(result, mockInstance);
});

test('Decorators.threadLocalFactory factory creates a new instance if non cached', t => {
    t.plan(3);

    @threadLocalFactory('something')
    class Mock {
        constructor() {
            t.pass();
        }

        static getInstance(): Mock {
            return new Mock();
        }
    }

    const mockInstance = new Mock();

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'getStore').returns(
        new Map<string, any>([['anotherkey', mockInstance]])
    );

    const result = Mock.getInstance();

    t.true(result !== mockInstance);
});

test('Decorators.threadLocalFactory factory creates a new instance if not in thread-local mode', t => {
    t.plan(1);

    @threadLocalFactory('something')
    class Mock {
        constructor() {
            t.pass();
        }

        static getInstance(): Mock {
            return new Mock();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'getStore').returns(dummyMap);

    Mock.getInstance();
});

test('Decorators.threadLocalFactory factory uses a provided factory function if not in thread-local mode', t => {
    t.plan(1);

    function create(): Mock {
        t.pass();
        return new Mock();
    }

    @threadLocalFactory('something', create)
    class Mock {
        static getInstance(): Mock {
            t.fail();
            return new Mock();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'getStore').returns(dummyMap);

    Mock.getInstance();
});

test('Decorators.threadLocalFactory factory returns instance from thread-local cache with factory function provided', t => {
    t.plan(1);

    function create(): Mock {
        t.fail();
        return new Mock();
    }

    @threadLocalFactory('something', create)
    class Mock {
        constructor() {
            t.pass();
        }

        static getInstance(): Mock {
            t.fail();
            return new Mock();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'getStore').returns(
        new Map<string, any>([['something', new Mock()]])
    );

    Mock.getInstance();
});

test('Decorators.threadLocalFactory factory creates a new instance using the function provided if non cached', t => {
    t.plan(1);

    function create(): Mock {
        t.pass();
        return new Mock();
    }

    @threadLocalFactory('something', create)
    class Mock {
        static getInstance(): Mock {
            t.fail();
            return new Mock();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'getStore').returns(new Map<string, any>());

    Mock.getInstance();
});
