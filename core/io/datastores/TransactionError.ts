/**
 * Represents an error occured while executing within a transaction
 */
export class TransactionError extends Error {
    protected _cause: any;

    /**
     * Creates a new {@link TransactionError} with the given cause
     * as underlying error
     *
     * @param cause Underlying cause
     */
    constructor(cause: any) {
        super();
        this._cause = cause;
    }

    public get cause(): any {
        return this._cause;
    }
}
