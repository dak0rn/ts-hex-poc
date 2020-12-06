import ApplicationConfiguration from '@internal/configuration/ApplicationConfiguration';
import ConfigurationAdapter from '@internal/configuration/ConfigurationAdapter';
import SystemConfiguration from '@internal/configuration/SystemConfiguration';
import SystemLoggerFactory from '@internal/log/SystemLoggerFactory';
import WinstonLogger from '@internal/log/WinstonLogger';
import test from 'ava';

class StubAdapter extends ConfigurationAdapter {
    system(): SystemConfiguration {
        throw new Error('Method not implemented.');
    }
    application(): ApplicationConfiguration {
        throw new Error('Method not implemented.');
    }
}

test('SystemLoggerFactory.createInstance creates a new WinstonLogger instance with log=winston', t => {
    t.plan(1);

    const sc = new SystemConfiguration({ log: 'winston' }, new StubAdapter(''));
    const sl = SystemLoggerFactory.createInstance(sc);

    t.true(sl.adapter instanceof WinstonLogger);
});

test('SystemLoggerFactory.createInstance throws it log type is unknown', t => {
    const cases: string[] = ['', 'banana'];

    t.plan(cases.length);

    for (const log of cases) {
        const sc = new SystemConfiguration({ log }, new StubAdapter(''));

        t.throws(SystemLoggerFactory.createInstance.bind(SystemLoggerFactory, sc));
    }
});
