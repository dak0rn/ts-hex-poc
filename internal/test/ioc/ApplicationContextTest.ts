import test from 'ava';
import ApplicationContext from '@internal/ioc/ApplicationContext';
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
