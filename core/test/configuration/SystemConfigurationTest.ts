import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import { InvalidConfigurationException } from '@core/configuration/Configuration';
import ConfigurationAdapter from '@core/configuration/ConfigurationAdapter';
import SystemConfiguration, { ExecutionEnvironment } from '@core/configuration/SystemConfiguration';
import test, { ExecutionContext } from 'ava';

function validSystemConfiguration(): any {
    return {
        moduleFolder: 'test',
        modules: [],
        environment: 'development',
        log: 'winston',
        defaultTransactionManager: 'something',
        scan: ['something']
    };
}

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

    const sc = new SystemConfiguration(
        {
            moduleFolder: 'test',
            modules: 'banana',
            environment: 'production',
            log: 'winston'
        },
        new StubAdapter('')
    );

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if environment is not set', t => {
    t.plan(1);

    const sc = new SystemConfiguration({ moduleFolder: 'test', modules: [] }, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if environment is set but invalid', t => {
    t.plan(3);

    const config = validSystemConfiguration();

    t.notThrows(function () {
        new SystemConfiguration(
            Object.assign({}, config, { environment: 'production' }),
            new StubAdapter('')
        ).validate();
    });

    t.notThrows(function () {
        new SystemConfiguration(
            Object.assign({}, config, { environment: 'development' }),
            new StubAdapter('')
        ).validate();
    });

    t.throws(
        function () {
            new SystemConfiguration(
                Object.assign({}, config, { environment: 'banana' }),
                new StubAdapter('')
            ).validate();
        },
        { instanceOf: InvalidConfigurationException }
    );
});

test('SystemConfiguration.validate does not throw for valid configuration', t => {
    t.plan(1);

    const sc = new SystemConfiguration(validSystemConfiguration(), new StubAdapter(''));

    t.notThrows(sc.validate.bind(sc));
});

test('SystemConfiguration.validate throws if defaultTransactionManager is not set', t => {
    t.plan(1);

    const valid = validSystemConfiguration();
    delete valid.defaultTransactionManager;

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if scan is not set', t => {
    t.plan(1);

    const valid = validSystemConfiguration();
    delete valid.scan;

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

test('SystemConfiguration.validate throws if scan is empty', t => {
    t.plan(1);

    const valid = validSystemConfiguration();
    valid.scan = [];

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.throws(sc.validate.bind(sc), { instanceOf: InvalidConfigurationException });
});

/// SytemConfiguration.get
test('SystemConfiguration.get returns the correct items for simple paths', (t: ExecutionContext) => {
    t.plan(2);

    const sc = new SystemConfiguration(validSystemConfiguration(), new StubAdapter(''));

    t.is(sc.get('moduleFolder'), 'test');
    t.is(sc.get('log'), 'winston');
});

test('SystemConfiguration.get returns the correct items for nested paths', (t: ExecutionContext) => {
    t.plan(1);

    const valid = validSystemConfiguration();
    valid.modules.push('target');

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.get('modules.0'), 'target');
});

test('SystemConfiguration.get throws if a value does not exist', (t: ExecutionContext) => {
    t.plan(1);

    const sc = new SystemConfiguration(validSystemConfiguration(), new StubAdapter(''));

    t.throws(sc.get.bind(sc, 'a.b.c'));
});

/// SystemConfiguration.moduleFolder

test('SystemConfiguration.moduleFolder returns the moduleFolder from the config provided', (t: ExecutionContext) => {
    t.plan(1);

    const sc = new SystemConfiguration(validSystemConfiguration(), new StubAdapter(''));

    t.is(sc.moduleFolder(), 'test');
});

/// SystemConfiguration.modules

test('SystemConfiguration.modules returns the module list from the configuration', (t: ExecutionContext) => {
    t.plan(1);

    const valid = validSystemConfiguration();
    valid.modules = ['web', 'database', 'testing'];

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.deepEqual(sc.modules(), valid.modules);
});

/// SystemConfiguration.environment

test('SystemConfiguration.environment returns the given environments: production', (t: ExecutionContext) => {
    t.plan(1);

    let valid = validSystemConfiguration();
    valid.environment = 'production';

    let sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.environment(), ExecutionEnvironment.Production);
});

test('SystemConfiguration.environment returns the given environments: development', (t: ExecutionContext) => {
    t.plan(1);

    let valid = validSystemConfiguration();
    valid.environment = 'development';

    let sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.environment(), ExecutionEnvironment.Development);
});

/// SystemConfiguration.log

test('SystemConfiguration.log returns the configured logger', (t: ExecutionContext) => {
    t.plan(1);

    const sc = new SystemConfiguration(validSystemConfiguration(), new StubAdapter(''));

    t.is(sc.log(), 'winston');
});

/// SystemConfiguration.resolvePathForKey

test('SystemConfiguration.resolvePathForKey returns an absolute path as is', t => {
    t.plan(1);

    const valid = validSystemConfiguration();
    valid.target = '/usr/share/config.yaml';

    const sc = new SystemConfiguration(valid, new StubAdapter(''));
    sc.applicationPath = '/tmp';

    t.is(sc.resolvePathForKey('target'), '/usr/share/config.yaml');
});

test('SystemConfiguration.resolvePathForKey returns a relative path resolved to applicationPath', t => {
    t.plan(1);

    const valid = validSystemConfiguration();
    valid.target = 'usr/share/config.yaml';

    const sc = new SystemConfiguration(valid, new StubAdapter(''));
    sc.applicationPath = '/tmp';

    t.is(sc.resolvePathForKey('target'), '/tmp/usr/share/config.yaml');
});

/// SystemConfiguration.resolvePath
test('SystemConfiguration.resolvePath returns an absolute path as is', t => {
    t.plan(1);

    const sc = new SystemConfiguration(validSystemConfiguration(), new StubAdapter(''));
    sc.applicationPath = '/tmp';

    t.is(sc.resolvePath('/usr/share/config.yaml'), '/usr/share/config.yaml');
});

test('SystemConfiguration.resolvePath returns a relative path relative to applicationPath', t => {
    t.plan(1);

    const sc = new SystemConfiguration(validSystemConfiguration(), new StubAdapter(''));
    sc.applicationPath = '/tmp';

    t.is(sc.resolvePath('usr/share/config.yaml'), '/tmp/usr/share/config.yaml');
});

/// SystemConfiguration.defaultTransactionManager

test('SystemConfiguration.defaultTransactionManager returns the default transaction manager configured', t => {
    t.plan(1);

    const valid = validSystemConfiguration();
    valid.defaultTransactionManager = 'pineapple';

    const sc = new SystemConfiguration(valid, new StubAdapter(''));

    t.is(sc.defaultTransactionManager(), 'pineapple');
});

/// SystemConfiguration.projectFolders

test('SystemConfiguration.projectFolders returns a list of absolute paths', t => {
    t.plan(3);

    const valid = validSystemConfiguration();
    valid.scan = ['a', 'b/c', '/d'];

    const sc = new SystemConfiguration(valid, new StubAdapter(''));
    sc.applicationPath = '/tmp';

    const folders = sc.projectFolders();

    t.is(folders[0], '/tmp/a');
    t.is(folders[1], '/tmp/b/c');
    t.is(folders[2], '/d');
});
