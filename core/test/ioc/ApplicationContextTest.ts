import test from 'ava';
import ApplicationContext from '@core/ioc/ApplicationContext';
import { container as tsyringContainer } from 'tsyringe';

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

test('ApplicationContext.constructor registers itself within the IoC container', t => {
    t.plan(2);

    const ac = new ApplicationContext(null);

    t.is(ac.resolve('ApplicationContext'), ac);

    const childAc = ac.createChildContext();

    // The child context shadows the parent
    t.is(childAc.resolve('ApplicationContext'), childAc);
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
