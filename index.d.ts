export default function oi<T>(promise: () => Promise<T>, defaultValue?: T): OnceInit<T, void>;
export default function oi<T, P>(promise: (param: P) => Promise<T>, defaultValue?: T): OnceInit<T, P>;
export declare abstract class OnceInit<T, P = void> {
    private observe;
    private promise;
    constructor(defaultValue?: T);
    protected abstract initPromise(param: P): Promise<T>;
    private initialized;
    get target(): T | undefined;
    init(param: P): Promise<T | undefined>;
    refresh: (param: P) => Promise<T | void>;
}
