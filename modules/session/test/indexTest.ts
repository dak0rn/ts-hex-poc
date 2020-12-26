import test from 'ava';
import index from '../index';
import SessionProvider from '../SessionProvider';

test('session.index returns SessionProvider', t => {
    t.plan(1);

    t.is(index.getClass(), SessionProvider);
});
