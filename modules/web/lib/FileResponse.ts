import { Response } from './Response';
import { Response as ExpressResponse } from 'express';
import { Readable } from 'stream';

/**
 * A {@link FileResponse} was supposed to be sent to the
 * client even though no file body has been set
 */
export class FileBodyNotSet extends Error {
    constructor() {
        super('No file body has been set');
    }
}

/**
 * A {@link FileResponse} is an HTTP response that returns a file to the
 * user. This type of response is typically used for file downloads.
 * File downloads are returned to the user either as an inline file which
 * will be displayed in the user's browser if possible (PDF, images, ...) or
 * as an attachment (see {@link FileResponse#attachment}).
 *
 * While technically possible to return XML or JSON as API responses using this
 * class, it is typically better to use the designated response types instead.
 */
export class FileResponse extends Response {
    /**
     * Keeps track on the mode this {@link FileResponse} is operating in
     * as there is no simple way of getting that information from {@link #res}.
     */
    protected attachmentMode: boolean;

    /**
     * Name of the file to send
     */
    protected filename: string | null;

    /**
     * Body of the file to send
     */
    protected fileBody: string | Buffer | Readable | null;

    /**
     * Creates a new {@link FileResponse} wrapping the given express response
     * Sets the content-disposition mode to attachment.
     *
     * @param res Express response to wrap
     */
    constructor(res: ExpressResponse) {
        super(res);

        this.attachmentMode = true;
        this.filename = null;
        this.fileBody = null;
    }

    /**
     * Sets the file response to be send as attachment
     *
     * @return this
     */
    public attachment(): this {
        this.guard();
        this.attachmentMode = true;
        return this;
    }

    /**
     * Sets the file response to be send as inline document
     *
     * @return this
     */
    public inline(): this {
        this.guard();
        this.attachmentMode = false;
        return this;
    }

    /**
     * Sets the name of the file
     * The file name will be used to determine the content-type
     * and will be send to the client in the `content-disposition` header
     *
     * @param name Name to set
     * @return this
     */
    public name(name: string): this {
        this.guard();
        this.filename = name;
        return this;
    }

    /**
     * Sets the body of the file
     *
     * @param body Body of the file
     * @return this
     */
    public body(body: string | Buffer | Readable): this {
        this.guard();
        this.fileBody = body;
        return this;
    }

    protected streamResponse(): void {
        this.guard();

        // It does not work if we do not have a body
        if (!this.fileBody) {
            throw new FileBodyNotSet();
        }

        // Set the header
        if (this.attachmentMode) {
            if (this.filename) {
                this.res.attachment(this.filename);
            }
            {
                this.res.attachment();
            }
        }

        // Set the file type if set explicitely
        if (this.fileType) {
            this.res.type(this.fileType);
        }

        // In case of a stream, we pipe it into res
        if (this.fileBody instanceof Readable) {
            this.fileBody.pipe(this.res);
        } else {
            this.res.send(this.fileBody);
        }
    }
}
