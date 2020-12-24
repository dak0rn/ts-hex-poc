import test from 'ava';
import sinon from 'sinon';
import { provide, inject, injectable, provideFactory, threadLocalSingleton } from '@core/ioc/Decorators';
import { inject as tsInject, injectable as tsInjectable } from 'tsyringe';
import ApplicationContext from '@core/ioc/ApplicationContext';
import ThreadLocal from '@core/lib/ThreadLocal';

const dummyMap = new Map<string, any>();

test('Decorators.provide registers class under name provided', t => {
    t.plan(3);

    const sandbox = sinon.createSandbox();

    const ac = new ApplicationContext(null);

    const spy = sinon.stub(ac, 'register'); // Outside of sandbox as it is a local variable
    sandbox.stub(ApplicationContext, 'getRootInstance').returns(ac);

    @provide('subject')
    class Subject {}

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'subject');
    t.is(spy.firstCall.lastArg, Subject);

    sandbox.restore();
});

test('Decorators.provideFactory registers factory under name provided', t => {
    t.plan(3);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const ac = new ApplicationContext(null);

    const spy = sinon.stub(ac, 'register'); // Outside of sandbox as it is a local variable
    sandbox.stub(ApplicationContext, 'getRootInstance').returns(ac);

    class Subject {
        @provideFactory('subject')
        public static factory() {}
    }

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'subject');
    t.is(spy.firstCall.lastArg, Subject.factory);
});

test('Decorators.provideFactory throws if factory function has arguments', t => {
    t.plan(1);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const ac = new ApplicationContext(null);

    const spy = sinon.stub(ac, 'register'); // Outside of sandbox as it is a local variable
    sandbox.stub(ApplicationContext, 'getRootInstance').returns(ac);

    t.throws(
        function () {
            class Subject {
                @provideFactory('subject')
                public static factory(a: any) {}
            }
        },
        null,
        'Cannot decorate Subject.factory with @provideFactory because it expects arguments.'
    );
});

test('Decorators.inject is tsyringe.inject', t => {
    t.plan(1);
    t.is(inject, tsInject);
});

test('Decorators.injectable is tsyringe.injectable', t => {
    t.plan(1);
    t.is(injectable, tsInjectable);
});

/// Decorators.threadLocalSingleton

test('Decorators.threadLocalSingleton executes singleton factory on first call', t => {
    t.plan(2);

    class Mock {
        public static m = new Mock();

        @threadLocalSingleton('banana')
        static getInstance(): Mock {
            t.pass();
            return Mock.m;
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'active').returns(false);

    const result = Mock.getInstance();

    t.is(result, Mock.m);
});

test('Decorators.threadLocalSingleton does not cache singleton if not in thread-local mode', t => {
    t.plan(4);

    class Mock {
        @threadLocalSingleton('banana')
        static getInstance(): Mock {
            t.pass();
            return new Mock();
        }
    }
    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'active').returns(false);

    const first = Mock.getInstance();

    t.truthy(first);
    t.not(first, Mock.getInstance());
});

test('Decorators.threadLocalSingleton caches singleton if in thread-local mode', t => {
    t.plan(3);

    class Mock {
        @threadLocalSingleton('banana')
        static getInstance(): Mock {
            t.pass();
            return new Mock();
        }
    }

    const store = new Map<string, any>();

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'active').returns(true);
    sandbox.stub(ThreadLocal, 'getStore').returns(store);

    const first = Mock.getInstance();

    t.truthy(first);

    t.is(store.get('banana'), first);
});

test('Decorators.threadLocalSingleton returns cached singleton if in thread-local mode', t => {
    t.plan(1);

    class Mock {
        @threadLocalSingleton('banana')
        static getInstance(): Mock {
            t.fail();
            return new Mock();
        }
    }

    const store = new Map<string, any>([['banana', new Mock()]]);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'active').returns(true);
    sandbox.stub(ThreadLocal, 'getStore').returns(store);

    const result = Mock.getInstance();

    t.is(store.get('banana'), result);
});
