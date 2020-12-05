import test from 'ava';
import Utils from '../../shared/Utils';

test('Utils.getDeep returns null with empty path', t => {
    t.plan(1);

    t.is(Utils.getDeep('', {}), null);
});

test('Utils.getDeep returns correct value from simple object', t => {
    t.plan(1);

    const input = {
        key: 'banana'
    };

    t.is(Utils.getDeep('key', input), 'banana');
});

test('Utils.getDeep returns correct value from simple array', t => {
    t.plan(1);

    const input = ['banana'];

    t.is(Utils.getDeep('0', input), 'banana');
});

test('Utils.getDeep returns correct value from nested object', t => {
    t.plan(1);

    const input = {
        a: {
            b: {
                c: {
                    key: 'banana'
                }
            }
        }
    };

    t.is(Utils.getDeep('a.b.c.key', input), 'banana');
});

test('Utils.getDeep returns correct value from nested array', t => {
    t.plan(1);

    const input = [[['banana']]];

    t.is(Utils.getDeep('0.0.0', input), 'banana');
});

test('Utils.getDeep returns correct value from nested object with arrays', t => {
    t.plan(1);

    const input = {
        a: {
            b: [
                null,
                {
                    key: 'banana'
                }
            ]
        }
    };

    t.is(Utils.getDeep('a.b.1.key', input), 'banana');
});

test('Utils.getDeep returns correct value from nested array with objects', t => {
    t.plan(1);

    const input = [
        'wrong',
        {
            r: ['donkey kong', 'next', { key: 'banana' }]
        }
    ];

    t.is(Utils.getDeep('1.r.2.key', input), 'banana');
});

test('Utils.getDeep throws if nested key is missing', t => {
    t.plan(1);

    const input = [
        'wrong',
        {
            r: ['donkey kong', 'next', { key: 'banana' }]
        }
    ];

    t.throws(Utils.getDeep.bind(null, '12.1', input));
});
