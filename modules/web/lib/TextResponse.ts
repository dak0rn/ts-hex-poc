import { Response } from './Response';
import { Response as ExpressResponse } from 'express';

/**
 * A {@link TextResponse} was supposed to be send to the client
 * even though no body has been set
 */
export class TextBodyNotSetError extends Error {
    constructor() {
        super('No response set for text response');
    }
}

/**
 * A response that sends a plain text response to the client
 */
export class TextResponse extends Response {
    /**
     * The body to be send to the client
     */
    protected _body: string | null;

    constructor(res: ExpressResponse) {
        super(res);
        this._body = null;
    }

    /**
     * Sets the body for the client
     *
     * @param body The body to send
     * @return this
     */
    public body(body: string): this {
        this.guard();
        this._body = body;
        return this;
    }

    protected streamResponse(): void {
        this.guard();

        this.res.type('text/plain');
        this.res.send(this.body);
    }
}
