import test from 'ava';
import ConfigurationFactory, { MissingAdapterException } from '@internal/configuration/ConfigurationFactory';
import IniAdapter from '@internal/configuration/IniAdapter';

test('ConfigurationFactory.getInstance: returns a IniAdaptor for .ini files', t => {
    t.plan(1);

    const adapter = ConfigurationFactory.getInstance('test.ini');

    t.true(adapter instanceof IniAdapter);
});

test('ConfigurationFactory.getInstance: throws if unknown file type is provided', t => {
    t.plan(1);

    t.throws(
        function () {
            ConfigurationFactory.getInstance('someting.txt');
        },
        { instanceOf: MissingAdapterException }
    );
});
