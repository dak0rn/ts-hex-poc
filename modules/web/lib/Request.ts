import CoreObject from '@core/shared/CoreObject';
import type { Request as ExpressRequest } from 'express';

export type PathParamName = string;
export type QueryParamName = string;

/**
 * An HTTP request
 */
export class Request extends CoreObject {
    /**
     * The wrapped request from `express`
     */
    protected req: ExpressRequest;

    protected _params: Map<PathParamName, string> | null;
    protected _query: Map<QueryParamName, string> | null;

    /**
     * Creates a new {@link Request} wrapping the given request object from `express`
     *
     * @param underlying Request object to wrap
     */
    constructor(underlying: ExpressRequest) {
        super();
        this.req = underlying;

        this._params = null;
        this._query = null;
    }

    public equals(other: Request): boolean {
        return this.req === other.req;
    }

    public toString(): string {
        return `[HTTP request: ${this.method} ${this.path}]`;
    }

    /**
     * The request's body
     * The return type depends on the type of incoming data as it may be
     * transformed by a middleware.
     *
     * @return Request body
     */
    public get body(): any {
        return this.req.body;
    }

    /**
     * The request's HTTP method, lower case
     *
     * @return Request method
     */
    public get method(): string {
        return this.req.method.toLowerCase();
    }

    /**
     * The request's path
     *
     * @return Request path
     */
    public get path(): string {
        return this.req.path;
    }

    /**
     * {@link Map} of path arguments with the key being the named parameter
     * and the value being the actual value from the request's path.
     */
    public get params(): Map<PathParamName, string> {
        if (!this._params) {
            this._params = new Map<PathParamName, string>();

            for (const key in this.req.params) {
                this._params.set(key, this.req.params[key]);
            }
        }

        return this._params!;
    }

    /**
     * {@link Map} of URL query parameters
     */
    public get query(): Map<QueryParamName, any> {
        if (!this._query) {
            this._query = new Map<QueryParamName, string>();

            for (const key in this.req.query) {
                this._query.set(key, this.req.query[key] as any);
            }
        }

        return this._query;
    }

    /**
     * Whether the connection is using a secure protocol
     */
    public get secure(): boolean {
        return this.req.secure;
    }

    /**
     * Checks if the given content type is accepted by the client per
     * its `Accept` header.
     *
     * @param contentType Content type to check
     * @return Whether it is accepted
     */
    public accepts(contentType: string): boolean {
        const response = this.req.accepts(contentType);
        return !!response;
    }

    /**
     * Returns the value of the given header field
     * `header` is case-insensitive and will handle both `Referer`
     * and `Referrer` as per express' documentation.
     *
     * @param header Header field
     * @return Header value
     */
    public getHeader(header: string): string | undefined {
        return this.req.get(header);
    }
}
