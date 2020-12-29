/**
 * Base class for all objects
 */
export class CoreObject {
    /**
     * Creates a new CoreObject
     */
    constructor() {}

    /**
     * Returns a string representation of this CoreObject
     *
     * @return String representation
     */
    public toString(): string {
        return '[CoreObject]';
    }

    /**
     * Determines if `o` is equal to this object.
     * The default comparison is based on identity.
     *
     * @param o Other object
     * @return Whether `o` and `this` are equal
     */
    public equals(o: CoreObject): boolean {
        return this === o;
    }
}
