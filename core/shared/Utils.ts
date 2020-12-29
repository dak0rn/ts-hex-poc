/**
 * Static utility class
 */
export class Utils {
    /* istanbul ignore next */
    private constructor() {}

    /**
     * Retrieves a value from a nested data structure based on a path given.
     * The path is separated by dots and can contain object keys and array
     * indices.
     *
     * The function does not explicitely check for the existence of keys, that means:
     * - If the only one key (e.g. path='8') is given and that does not exist in data,
     *   undefined will be returned
     * - If a multi-key path is given (e.g. path='8.a.b.c') and one value in that chain
     *   does not exist (or yield null/undefined), the function will throw.
     *
     * @param path Path to retrieve, e.g. "key.anotherKey.0.thirdKey"
     * @param data (Nested) array/object
     */
    public static getDeep(path: string, data: object | any[]): any {
        if ('' === path) {
            return null;
        }

        const parts = path.split('.');
        let current: any = data;

        for (let i = 0; i < parts.length; i++) {
            current = current[parts[i]];
        }

        return current;
    }
}
