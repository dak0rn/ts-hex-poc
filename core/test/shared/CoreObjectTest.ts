import test from 'ava';
import CoreObject from '@core/shared/CoreObject';

test('CoreObject.toString returns [CoreObject]', t => {
    t.plan(1);

    const o = new CoreObject();

    t.is(o.toString(), '[CoreObject]');
});

test('CoreObject.equals compares equality based on identity', t => {
    t.plan(2);

    const o = new CoreObject();
    const p = new CoreObject();

    t.true(o.equals(o));
    t.false(o.equals(p));
});

test('CoreObject.equals is distributive', t => {
    t.plan(2);

    const o = new CoreObject();
    const p = new CoreObject();

    t.false(o.equals(p));
    t.false(p.equals(o));
});
