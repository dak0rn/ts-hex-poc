/**
 * Interface declaring methods for serializing and deserializing an object.
 * The type parameter `T` defines the serialization format.
 */
export interface Serializable<T> {
    /**
     * Serializes the current object into type `T`
     *
     * @return Serialized representation
     */
    serialize(): T;

    /**
     * Deserializes from `input` and updates the object's fields
     * accordingly.
     *
     * @param input Serialized object
     */
    deserialize(input: T): void;
}
