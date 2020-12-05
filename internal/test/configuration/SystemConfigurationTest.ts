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

/// SystemConfiguration.validate

test('SystemConfiguration.validate throws if no module folder is set', t => {
    t.plan(1);

    const sc = new SystemConfiguration({}, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if module folder name is empty', t => {
    t.plan(1);

    const sc = new SystemConfiguration({ moduleFolder: '' }, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if module[] is set but not an array', t => {
    t.plan(1);

    const sc = new SystemConfiguration({ moduleFolder: 'test', modules: true }, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate does not throw for valid configuration', t => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: []
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.notThrows(sc.validate.bind(sc));
});

/// SytemConfiguration.get
test('SystemConfiguration.get returns the correct items for simple paths', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: []
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.get('moduleFolder'), 'test');
});

test('SystemConfiguration.get returns the correct items for nested paths', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: ['target']
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.get('modules.0'), 'target');
});

/// SystemConfiguration.moduleFolder

test('SystemConfiguration.moduleFolder returns the moduleFolder from the config provided', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.moduleFolder(), 'test');
});

/// SystemConfiguration.modules

test('SystemConfiguration.modules returns the module list from the configuration', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: ['web', 'database', 'testing']
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.deepEqual(sc.modules(), valid.modules);
});
