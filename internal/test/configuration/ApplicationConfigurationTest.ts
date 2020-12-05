import ApplicationConfiguration from '@internal/configuration/ApplicationConfiguration';
import { InvalidConfigurationException } from '@internal/configuration/Configuration';
import ConfigurationAdapter from '@internal/configuration/ConfigurationAdapter';
import SystemConfiguration from '@internal/configuration/SystemConfiguration';
import test, { ExecutionContext } from 'ava';

class StubAdapter extends ConfigurationAdapter {
    system(): SystemConfiguration {
        throw new Error('Method not implemented.');
    }
    application(): ApplicationConfiguration {
        throw new Error('Method not implemented.');
    }
}

/// ApplicationConfiguration.validate

test('ApplicationConfiguration.validate does not throw', t => {
    t.plan(1);

    const sc = new ApplicationConfiguration({}, new StubAdapter(''));

    t.notThrows(sc.validate.bind(sc));
});

/// ApplicationConfiguration.get
test('ApplicationConfiguration.get returns the correct items for simple paths', (t: ExecutionContext) => {
    t.plan(2);

    const data = {
        apple: 'banana',
        number: 42
    };

    const sc = new ApplicationConfiguration(data, new StubAdapter(''));

    t.is(sc.get('apple'), 'banana');
    t.is(sc.get('number'), 42);
});

test('ApplicationConfiguration.get returns the correct items for nested paths', (t: ExecutionContext) => {
    t.plan(2);

    const data = {
        a: {
            b: {
                c: 5
            },

            nested: ['array', 'array2']
        }
    };

    const sc = new ApplicationConfiguration(data, new StubAdapter(''));

    t.is(sc.get('a.nested.1'), 'array2');
    t.is(sc.get('a.b.c'), 5);
});
