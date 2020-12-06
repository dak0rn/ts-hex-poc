import test from 'ava';
import RootApplicationContext from '@internal/ioc/RootApplicationContext';
import ApplicationContext from '@internal/ioc/ApplicationContext';
import { container } from 'tsyringe';

test('RootApplicationContext.getInstance returns a singleton ApplicationContext', t => {
    t.plan(1);

    const ac: ApplicationContext = RootApplicationContext.getInstance();

    t.is(RootApplicationContext.getInstance(), ac);
});

test('RootApplicationContext.getInstance returns a singleton ApplicationContext with the root container', t => {
    t.plan(1);

    const ac: ApplicationContext = RootApplicationContext.getInstance();

    t.is(ac.container, container);
});
