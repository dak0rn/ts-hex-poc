import { Response } from './Response';
import { Response as ExpressResponse } from 'express';

/**
 * A response that sends a JSON to the client.
 * The body provided will be stringified upon sending to
 * the client.
 */
export class JSONResponse extends Response {
    /**
     * The body to be send to the client
     */
    protected _body: any;

    constructor(res: ExpressResponse | Response) {
        super(res);
        this._body = null;
    }

    /**
     * Sets the body for the client
     *
     * @param body The body to send
     * @return this
     */
    public body(body: any): this {
        this.guard();
        this._body = body;
        return this;
    }

    protected async streamResponse(): Promise<void> {
        this.guard();

        const data = JSON.stringify(this._body);

        this.res.type('json');
        this.res.send(data);
    }
}
