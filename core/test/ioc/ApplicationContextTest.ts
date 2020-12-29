import test from 'ava';
import { ApplicationContext } from '@core/ioc/ApplicationContext';
import { container as tsyringContainer } from 'tsyringe';
import sinon from 'sinon';
import { ThreadLocal } from '@core/lib/ThreadLocal';

test('ApplicationContext.constructor creates a new ApplicationContext with the given DependencyContainer', t => {
    t.plan(1);

    const ac = new ApplicationContext(tsyringContainer);

    t.is(ac.container, tsyringContainer);
});

test('ApplicationContext.constructor creates a new ApplicationContext with the root container if none provided', t => {
    t.plan(1);

    const ac = new ApplicationContext(null);
    t.is(ac.container, tsyringContainer);
});

test('ApplicationContext.constructor registers itself within the IoC container using a factory', t => {
    t.plan(3);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const spy = sandbox.stub(tsyringContainer, 'register');

    const ac = new ApplicationContext(null);

    t.is(spy.callCount, 1);
    t.is(spy.firstCall.firstArg, 'core.ApplicationContext');
    t.deepEqual(spy.firstCall.lastArg, { useFactory: ApplicationContext.getInstance });
});

test('ApplicationContext.createChildContext creates a new ApplicationContext with a child IoC container', t => {
    t.plan(2);

    // Providing a value in the global context would have side effects
    // Thus, we use a child container instead
    const ourChild = tsyringContainer.createChildContainer();
    ourChild.register('token', { useValue: 42 });

    const rootAC = new ApplicationContext(ourChild);
    const childAC = rootAC.createChildContext();

    // It is not our container ...
    t.true(childAC.container !== ourChild);

    // ... but it resolves a name in our container, thus being a child
    t.is(childAC.container.resolve('token'), ourChild.resolve('token'));
});

test('ApplicationContext.register registers a class', t => {
    t.plan(2);

    const container = tsyringContainer.createChildContainer();
    const ac = new ApplicationContext(container);

    class Something {}

    ac.register('something-class', Something);

    const viaClass = ac.container.resolve(Something);
    t.true(viaClass instanceof Something);

    const viaName = ac.container.resolve('something-class');
    t.true(viaName instanceof Something);
});

test('ApplicationContext.registerValue registers a value', t => {
    t.plan(1);

    const container = tsyringContainer.createChildContainer();
    const ac = new ApplicationContext(container);

    ac.registerValue('something-value', 42);

    const viaName = ac.container.resolve('something-value');
    t.is(viaName, 42);
});

/// ApplicationContext.resolve

test('ApplicationContext.resolve retrieves classes from the IoC container', t => {
    t.plan(2);

    class Input {}
    const container = tsyringContainer.createChildContainer();
    const ac = new ApplicationContext(container);

    ac.register('input', Input);

    t.true(ac.resolve('input') instanceof Input);
    t.true(ac.resolve(Input) instanceof Input);
});

test('ApplicationContext.resolve retrieves classes from the IoC container through child container', t => {
    t.plan(2);

    class Input {}
    const container = tsyringContainer.createChildContainer();
    const ac = new ApplicationContext(container);
    const child = ac.createChildContext();

    ac.register('input', Input);

    t.true(child.resolve('input') instanceof Input);
    t.true(child.resolve(Input) instanceof Input);
});

test('ApplicationContext.resolve shadows classes in child container', t => {
    t.plan(2);

    class Bad {}
    class Input {}
    const container = tsyringContainer.createChildContainer();
    const ac = new ApplicationContext(container);
    const child = ac.createChildContext();

    ac.register('input', Bad);
    child.register('input', Input);

    t.true(child.resolve('input') instanceof Input);
    t.true(child.resolve(Input) instanceof Input);
});

test('ApplicationContext.resolve retrieves values from the IoC container', t => {
    t.plan(1);

    const container = tsyringContainer.createChildContainer();
    const ac = new ApplicationContext(container);

    ac.registerValue('input', 42);

    t.is(ac.resolve('input'), 42);
});

test('ApplicationContext.resolve retrieves values from the IoC container through child container', t => {
    t.plan(1);

    const container = tsyringContainer.createChildContainer();
    const ac = new ApplicationContext(container);
    const child = ac.createChildContext();

    ac.registerValue('input', 42);

    t.is(child.resolve('input'), 42);
});

test('ApplicationContext.resolve shadows values in child container', t => {
    t.plan(1);

    const container = tsyringContainer.createChildContainer();
    const ac = new ApplicationContext(container);
    const child = ac.createChildContext();

    ac.registerValue('input', 43);
    child.registerValue('input', 42);

    t.is(child.resolve('input'), 42);
});

/// getRootInstance

test('ApplicationContext.getRootInstance returns a singleton ApplicationContext', t => {
    t.plan(1);

    const ac: ApplicationContext = ApplicationContext.getRootInstance();

    t.is(ApplicationContext.getRootInstance(), ac);
});

test('ApplicationContext.getRootInstance returns a singleton ApplicationContext with the root container', t => {
    t.plan(1);

    const ac: ApplicationContext = ApplicationContext.getRootInstance();

    t.is(ac.container, tsyringContainer);
});

/// getInstance
test('ApplicationContext.getInstance returns the root instance outside of thread-local', t => {
    t.plan(1);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    sandbox.stub(ThreadLocal, 'active').returns(false);

    t.is(ApplicationContext.getInstance(), ApplicationContext.getRootInstance());
});

test('ApplicationContext.getInstance creates a new child from the root inside thread-local', t => {
    t.plan(2);

    class Mock extends ApplicationContext {
        createChildContext(): ApplicationContext {
            t.pass();
            return super.createChildContext();
        }
    }

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const root = new Mock(null);

    sandbox.stub(ThreadLocal, 'active').returns(true);
    sandbox.stub(ThreadLocal, 'getStore').returns(new Map<string, any>());
    sandbox.stub(ApplicationContext, 'getRootInstance').returns(root);

    const instance = ApplicationContext.getInstance();

    t.not(instance, root);
});

test('ApplicationContext.getInstance caches child in thread-local store under "ApplicationContext"', t => {
    t.plan(1);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const store = new Map<string, any>();

    sandbox.stub(ThreadLocal, 'active').returns(true);
    sandbox.stub(ThreadLocal, 'getStore').returns(store);

    const instance = ApplicationContext.getInstance();

    t.is(store.get('core.ApplicationContext'), instance);
});

test('ApplicationContext.getInstance uses a cached instance', t => {
    t.plan(1);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const mock = new ApplicationContext(null);

    const store = new Map<string, any>([['core.ApplicationContext', mock]]);

    sandbox.stub(ThreadLocal, 'active').returns(true);
    sandbox.stub(ThreadLocal, 'getStore').returns(store);

    const instance = ApplicationContext.getInstance();

    t.is(instance, mock);
});
