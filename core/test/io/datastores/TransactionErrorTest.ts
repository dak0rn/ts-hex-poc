import { TransactionError } from '@core/io/datastores/TransactionError';
import test from 'ava';

test('TransactionError.case returns the cause set', t => {
    t.plan(1);

    const err = new TransactionError('banana');
    t.is(err.cause, 'banana');
});
