import { transactional } from '@core/io/datastores/Decorators';
import { TransactionError } from '@core/io/datastores/TransactionError';
import { TransactionManager } from '@core/io/datastores/TransactionManager';
import { TransactionManagerRegistry } from '@core/io/datastores/TransactionManagerRegistry';
import test from 'ava';
import sinon from 'sinon';

const mockTM = {
    async begin(): Promise<any> {},
    async commit(): Promise<any> {},
    async rollback(): Promise<any> {},
    type: 'banana',
    equals(): boolean {
        return false;
    }
} as TransactionManager<any>;

// @transactional
test.serial('@transactional overwrites the original function with another function', t => {
    t.plan(1);

    const desc: PropertyDescriptor = {
        value: 42
    };

    const sut = transactional()({}, 'something', desc) as PropertyDescriptor;

    t.not(sut.value, 42);
});

test.serial('@transactional uses the default manager for happy paths correctly', async t => {
    t.plan(8);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const beginSpy = sandbox.stub(mockTM, 'begin').returns(Promise.resolve('pineapple'));
    const commitSpy = sandbox.spy(mockTM, 'commit');
    const self = {};

    sandbox.stub(TransactionManagerRegistry, 'getInstance').returns({
        forName(name: string): any {
            t.fail();
            return mockTM;
        },
        get default(): any {
            t.pass();
            return mockTM;
        }
    } as TransactionManagerRegistry);

    const desc: PropertyDescriptor = {
        async value(a: any, b: any): Promise<string> {
            t.is(a, 'banana');
            t.is(b, 'apple');
            t.is(this, self);

            return 'lemon';
        }
    };

    const newDesc = transactional()({}, 'something', desc) as PropertyDescriptor;

    const ret = await newDesc.value.call(self, 'banana', 'apple');

    t.is(ret, 'lemon');
    t.is(beginSpy.callCount, 1);
    t.is(commitSpy.callCount, 1);
    t.is(commitSpy.firstCall.firstArg, 'pineapple');
});

test.serial('@transactional uses the requested manager for happy paths correctly', async t => {
    t.plan(9);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const beginSpy = sandbox.stub(mockTM, 'begin').returns(Promise.resolve('pineapple'));
    const commitSpy = sandbox.spy(mockTM, 'commit');
    const rollbackSpy = sandbox.spy(mockTM, 'rollback');
    const self = {};

    sandbox.stub(TransactionManagerRegistry, 'getInstance').returns({
        forName(name: string): any {
            t.is(name, 'strawberry');
            return mockTM;
        },
        get default(): any {
            t.fail();
            return mockTM;
        }
    } as TransactionManagerRegistry);

    const desc: PropertyDescriptor = {
        async value(a: any, b: any): Promise<string> {
            t.is(a, 'banana');
            t.is(b, 'apple');
            t.is(this, self);

            return 'lemon';
        }
    };

    const newDesc = transactional('strawberry')({}, 'something', desc) as PropertyDescriptor;

    const ret = await newDesc.value.call(self, 'banana', 'apple');

    t.is(ret, 'lemon');
    t.is(beginSpy.callCount, 1);
    t.is(rollbackSpy.callCount, 0);
    t.is(commitSpy.callCount, 1);
    t.is(commitSpy.firstCall.firstArg, 'pineapple');
});

test.serial('@transactional invokes rollback with default manager if function throws', async t => {
    t.plan(7);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const beginSpy = sandbox.stub(mockTM, 'begin').returns(Promise.resolve('pineapple'));
    const commitSpy = sandbox.spy(mockTM, 'commit');
    const rollbackSpy = sandbox.spy(mockTM, 'rollback');
    const self = {};
    const err = new Error();

    sandbox.stub(TransactionManagerRegistry, 'getInstance').returns({
        forName(name: string): any {},
        get default(): any {
            return mockTM;
        }
    } as TransactionManagerRegistry);

    const desc: PropertyDescriptor = {
        async value(): Promise<never> {
            throw err;
        }
    };

    const newDesc = transactional()({}, 'something', desc) as PropertyDescriptor;

    await t.throwsAsync(
        async function () {
            await newDesc.value.call(self);
        },
        { is: err }
    );

    t.is(beginSpy.callCount, 1);
    t.is(commitSpy.callCount, 0);
    t.is(rollbackSpy.callCount, 1);
    t.is(rollbackSpy.firstCall.args[1], 'pineapple');

    const providedError = rollbackSpy.firstCall.firstArg as TransactionError;

    t.true(providedError instanceof TransactionError);
    t.is(providedError.cause, err);
});

test.serial('@transactional invokes rollback with requested manager if function throws', async t => {
    t.plan(8);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const beginSpy = sandbox.stub(mockTM, 'begin').returns(Promise.resolve('pineapple'));
    const commitSpy = sandbox.spy(mockTM, 'commit');
    const rollbackSpy = sandbox.spy(mockTM, 'rollback');
    const self = {};
    const err = new Error();

    sandbox.stub(TransactionManagerRegistry, 'getInstance').returns({
        forName(name: string): any {
            t.is(name, 'strawberry');
            return mockTM;
        },
        get default(): any {
            t.fail();
            return mockTM;
        }
    } as TransactionManagerRegistry);

    const desc: PropertyDescriptor = {
        async value(): Promise<never> {
            throw err;
        }
    };

    const newDesc = transactional('strawberry')({}, 'something', desc) as PropertyDescriptor;

    await t.throwsAsync(
        async function () {
            await newDesc.value.call(self);
        },
        { is: err }
    );

    t.is(beginSpy.callCount, 1);
    t.is(commitSpy.callCount, 0);
    t.is(rollbackSpy.callCount, 1);
    t.is(rollbackSpy.firstCall.args[1], 'pineapple');

    const providedError = rollbackSpy.firstCall.firstArg as TransactionError;

    t.true(providedError instanceof TransactionError);
    t.is(providedError.cause, err);
});

test.serial('@transactional invokes rollback with default manager if commit throws', async t => {
    t.plan(7);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const err = new Error();
    const beginSpy = sandbox.stub(mockTM, 'begin').returns(Promise.resolve('pineapple'));
    const commitSpy = sandbox.stub(mockTM, 'commit').throws(err);
    const rollbackSpy = sandbox.spy(mockTM, 'rollback');
    const self = {};

    sandbox.stub(TransactionManagerRegistry, 'getInstance').returns({
        forName(name: string): any {},
        get default(): any {
            return mockTM;
        }
    } as TransactionManagerRegistry);

    const desc: PropertyDescriptor = {
        async value(): Promise<void> {}
    };

    const newDesc = transactional()({}, 'something', desc) as PropertyDescriptor;

    await t.throwsAsync(
        async function () {
            await newDesc.value.call(self);
        },
        { is: err }
    );

    t.is(beginSpy.callCount, 1);
    t.is(commitSpy.callCount, 1);
    t.is(rollbackSpy.callCount, 1);
    t.is(rollbackSpy.firstCall.args[1], 'pineapple');

    const providedError = rollbackSpy.firstCall.firstArg as TransactionError;

    t.true(providedError instanceof TransactionError);
    t.is(providedError.cause, err);
});

test.serial('@transactional invokes rollback with requested manager if commit throws', async t => {
    t.plan(8);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const err = new Error();
    const beginSpy = sandbox.stub(mockTM, 'begin').returns(Promise.resolve('pineapple'));
    const commitSpy = sandbox.stub(mockTM, 'commit').throws(err);
    const rollbackSpy = sandbox.spy(mockTM, 'rollback');
    const self = {};

    sandbox.stub(TransactionManagerRegistry, 'getInstance').returns({
        forName(name: string): any {
            t.is(name, 'strawberry');
            return mockTM;
        },
        get default(): any {
            t.fail();
            return mockTM;
        }
    } as TransactionManagerRegistry);

    const desc: PropertyDescriptor = {
        async value(): Promise<void> {}
    };

    const newDesc = transactional('strawberry')({}, 'something', desc) as PropertyDescriptor;

    await t.throwsAsync(
        async function () {
            await newDesc.value.call(self);
        },
        { is: err }
    );

    t.is(beginSpy.callCount, 1);
    t.is(commitSpy.callCount, 1);
    t.is(rollbackSpy.callCount, 1);
    t.is(rollbackSpy.firstCall.args[1], 'pineapple');

    const providedError = rollbackSpy.firstCall.firstArg as TransactionError;

    t.true(providedError instanceof TransactionError);
    t.is(providedError.cause, err);
});

test.serial('@transactional does not trap rollback errors with default manager', async t => {
    t.plan(7);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const err = new Error();
    const rollbackErr = new Error();
    const beginSpy = sandbox.stub(mockTM, 'begin').returns(Promise.resolve('pineapple'));
    const commitSpy = sandbox.stub(mockTM, 'commit').throws(err);
    const rollbackSpy = sandbox.stub(mockTM, 'rollback').throws(rollbackErr);
    const self = {};

    sandbox.stub(TransactionManagerRegistry, 'getInstance').returns({
        forName(name: string): any {},
        get default(): any {
            return mockTM;
        }
    } as TransactionManagerRegistry);

    const desc: PropertyDescriptor = {
        async value(): Promise<void> {}
    };

    const newDesc = transactional()({}, 'something', desc) as PropertyDescriptor;

    await t.throwsAsync(
        async function () {
            await newDesc.value.call(self);
        },
        { is: rollbackErr }
    );

    t.is(beginSpy.callCount, 1);
    t.is(commitSpy.callCount, 1);
    t.is(rollbackSpy.callCount, 1);
    t.is(rollbackSpy.firstCall.args[1], 'pineapple');

    const providedError = rollbackSpy.firstCall.firstArg as TransactionError;

    t.true(providedError instanceof TransactionError);
    t.is(providedError.cause, err);
});

test.serial('@transactional does not trap rollback errors with requested manager', async t => {
    t.plan(7);

    const sandbox = sinon.createSandbox();
    t.teardown(sandbox.restore.bind(sandbox));

    const err = new Error();
    const rollbackErr = new Error();
    const beginSpy = sandbox.stub(mockTM, 'begin').returns(Promise.resolve('pineapple'));
    const commitSpy = sandbox.stub(mockTM, 'commit').throws(err);
    const rollbackSpy = sandbox.stub(mockTM, 'rollback').throws(rollbackErr);
    const self = {};

    sandbox.stub(TransactionManagerRegistry, 'getInstance').returns({
        forName(name: string): any {
            return mockTM;
        },
        get default(): any {
            t.fail();
            return mockTM;
        }
    } as TransactionManagerRegistry);

    const desc: PropertyDescriptor = {
        async value(): Promise<void> {}
    };

    const newDesc = transactional('strawberry')({}, 'something', desc) as PropertyDescriptor;

    await t.throwsAsync(
        async function () {
            await newDesc.value.call(self);
        },
        { is: rollbackErr }
    );

    t.is(beginSpy.callCount, 1);
    t.is(commitSpy.callCount, 1);
    t.is(rollbackSpy.callCount, 1);
    t.is(rollbackSpy.firstCall.args[1], 'pineapple');

    const providedError = rollbackSpy.firstCall.firstArg as TransactionError;

    t.true(providedError instanceof TransactionError);
    t.is(providedError.cause, err);
});
