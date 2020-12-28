import CoreObject from '@core/shared/CoreObject';
import { Response as ExpressResponse, CookieOptions } from 'express';

/**
 * Indicates that the response has already been frozen and cannot
 * be modified any more.
 */
export class ResponseFrozenError extends Error {
    constructor() {
        super('Response has already been frozen.');
    }
}

/**
 * Generic response object
 * This class is extended by specific response types (binary/json/...).
 *
 */
export class Response extends CoreObject {
    /**
     * The wrapped response
     */
    protected res: ExpressResponse;

    /**
     * Indicating whether the response has already been returned to
     * the client after which it is no longer modifiable.
     */
    protected frozen: boolean;

    /**
     * Type of the file
     */
    protected fileType: string | null;

    /**
     * Creates a new {@link Response} wrapping the given response.
     * Uses a request object from `express` internally, will use the
     * wrapped response if a {@link Response} is given.
     *
     * @param res Response to wrap
     */
    constructor(res: ExpressResponse | Response) {
        super();
        this.res = res instanceof Response ? res.res : res;
        this.frozen = false;
        this.fileType = null;
    }

    /**
     * Returns the status code, defaulting to 200, set by
     * {@link #status}
     */
    public get statusCode(): number {
        return this.res.statusCode;
    }

    /**
     * Sets the status code of the response
     *
     * @param code Status to set
     * @return this
     */
    public status(code: number): this {
        this.guard();
        this.res.status(code);
        return this;
    }

    /**
     * Sets the header with the given name to the given value
     *
     * @param name Header name
     * @param value Header value
     * @return this
     */
    public header(name: string, value: string | number | string[]): this {
        this.guard();
        this.res.setHeader(name, value);
        return this;
    }

    /**
     * Sets a cookie
     * The optional cookie options allow to configure the behavior of the cookie:
     *
     * - domain	    String	            Domain name for the cookie. Defaults to the domain name of the app.
     * - expires	Date	            Expiry date of the cookie in GMT. If not specified or set to 0, creates a session cookie.
     * - encode	    Function            A synchronous function used for cookie value encoding. Defaults to encodeURIComponent.
     * - maxAge	    Number	            Convenient option for setting the expiry time relative to the current time in milliseconds.
     * - httpOnly	Boolean	            Flags the cookie to be accessible only by the web server.
     * - secure	    Boolean	            Marks the cookie to be used with HTTPS only.
     * - path	    String	            Path for the cookie. Defaults to “/”.
     * - signed	    Boolean	            Indicates if the cookie should be signed.
     * - sameSite	Boolean | String	Value of the “SameSite” Set-Cookie attribute.
     *
     *
     * @param name Name of the cookie to set
     * @param value Value to set
     * @param options Optional options
     * @return this
     */
    public cookie(name: string, value: any, options?: CookieOptions): this {
        this.guard();
        if (options) {
            this.res.cookie(name, value, options);
        } else {
            this.res.cookie(name, value);
        }

        return this;
    }

    /**
     * Performs a redirect to the given URL.
     *
     * @param url URL to redirect to
     * @param status Status code to use for the redirect
     * @return this
     */
    public redirect(url: string, status: number = 302): this {
        this.guard();
        this.res.redirect(url, status);
        return this;
    }

    /**
     * Sets the content-type of the response
     * Use that to set the type explicitely if
     * - a file is being send without attachment mode; or
     * - the content type is different than what the file name given to {@link #name} implies
     *
     * This method allows for shortcuts, refer to {@link https://github.com/broofa/mime#mimegettypepathorextension}
     * or {@link https://expressjs.com/en/4x/api.html#res.type}.
     *
     * @param type Type to set
     * @return this
     */
    public type(type: string): this {
        this.fileType = type;
        return this;
    }

    /**
     * Sends the response back to the client
     */
    protected async streamResponse(): Promise<void> {
        throw new Error('Cannot send Response directly to the client, use a child class instead'); // TODO: Error class
    }

    /**
     * Finalizes the response and sends it back to the client
     * Will set the response to being frozen and any method changing
     * state will throw.
     */
    public async finalizeAndSend(): Promise<void> {
        this.guard();

        if (this.fileType) {
            this.res.type(this.fileType);
        }

        await this.streamResponse();

        this.frozen = true;
    }

    /**
     * Throws if the response has already been frozen
     * Use that method before doing any modifying actions in sub classes.
     */
    protected guard(): void {
        if (this.frozen) {
            throw new ResponseFrozenError();
        }
    }
}
