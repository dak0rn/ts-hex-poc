import ApplicationConfiguration from '@internal/configuration/ApplicationConfiguration';
import { InvalidConfigurationException } from '@internal/configuration/Configuration';
import ConfigurationAdapter from '@internal/configuration/ConfigurationAdapter';
import SystemConfiguration, { ExecutionEnvironment } from '@internal/configuration/SystemConfiguration';
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

test('SystemConfiguration.validate throws if no log folder is set', t => {
    t.plan(1);

    const sc = new SystemConfiguration({ moduleFolder: 'test' }, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if log is empty', t => {
    t.plan(1);

    const sc = new SystemConfiguration({ moduleFolder: 'test', log: '' }, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if module[] is set but not an array', t => {
    t.plan(1);

    const sc = new SystemConfiguration({ moduleFolder: 'test', modules: true }, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if environment is not set', t => {
    t.plan(1);

    const sc = new SystemConfiguration({ moduleFolder: 'test', modules: [] }, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if environment is set but invalid', t => {
    t.plan(3);

    t.notThrows(function () {
        new SystemConfiguration(
            { moduleFolder: 'test', modules: [], environment: 'production', log: 'winston' },
            new StubAdapter('')
        ).validate();
    });

    t.notThrows(function () {
        new SystemConfiguration(
            { moduleFolder: 'test', modules: [], environment: 'development', log: 'winston' },
            new StubAdapter('')
        ).validate();
    });

    t.throws(
        function () {
            new SystemConfiguration(
                { moduleFolder: 'test', modules: [], environment: 'banana', log: 'winston' },
                new StubAdapter('')
            ).validate();
        },
        { instanceOf: InvalidConfigurationException }
    );
});

test('SystemConfiguration.validate does not throw for valid configuration', t => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: [],
        environment: 'production',
        log: 'winston'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.notThrows(sc.validate.bind(sc));
});

/// SytemConfiguration.get
test('SystemConfiguration.get returns the correct items for simple paths', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: [],
        environment: 'production',
        log: 'winston'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.get('moduleFolder'), 'test');
});

test('SystemConfiguration.get returns the correct items for nested paths', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: ['target'],
        environment: 'production',
        log: 'winston'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.get('modules.0'), 'target');
});

/// SystemConfiguration.moduleFolder

test('SystemConfiguration.moduleFolder returns the moduleFolder from the config provided', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        environment: 'production',
        log: 'winston'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.moduleFolder(), 'test');
});

/// SystemConfiguration.modules

test('SystemConfiguration.modules returns the module list from the configuration', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: ['web', 'database', 'testing'],
        environment: 'production',
        log: 'winston'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.deepEqual(sc.modules(), valid.modules);
});

/// SystemConfiguration.environment

test('SystemConfiguration.environment returns the given environments: production', (t: ExecutionContext) => {
    t.plan(1);

    let valid = {
        moduleFolder: 'test',
        modules: ['web', 'database', 'testing'],
        environment: 'production',
        log: 'winston'
    };

    let sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.environment(), ExecutionEnvironment.Production);
});

test('SystemConfiguration.environment returns the given environments: development', (t: ExecutionContext) => {
    t.plan(1);

    let valid = {
        moduleFolder: 'test',
        modules: ['web', 'database', 'testing'],
        environment: 'development',
        log: 'winston'
    };

    let sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.environment(), ExecutionEnvironment.Development);
});

/// SystemConfiguration.log

test('SystemConfiguration.log returns the set logger', (t: ExecutionContext) => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: ['web', 'database', 'testing'],
        environment: 'production',
        log: 'winston'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.log(), 'winston');
});

/// SystemConfiguration.resolvePathForKey

test('SystemConfiguration.resolvePathForKey returns an absolute path as is', t => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: ['web', 'database', 'testing'],
        environment: 'production',
        log: 'winston',
        target: '/usr/share/config.yaml'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));
    sc.applicationPath = '/tmp';

    t.is(sc.resolvePathForKey('target'), '/usr/share/config.yaml');
});

test('SystemConfiguration.resolvePathForKey returns a relative path resolved to applicationPath', t => {
    t.plan(1);

    const valid = {
        moduleFolder: 'test',
        modules: ['web', 'database', 'testing'],
        environment: 'production',
        log: 'winston',
        target: 'a'
    };

    const sc = new SystemConfiguration(valid, new StubAdapter(''));
    sc.applicationPath = '/tmp';

    t.is(sc.resolvePathForKey('target'), '/tmp/a');
});
