export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>,
  defaultValue?: T
): OnceInit<T, P>;

export default function oi<T, P extends Array<any> = void[]>(
  ...args: any[]
): OnceInit<T, P> {
  if (!(args[0] instanceof Function) || args.length > 2 || args.length < 1) {
    throw new Error("Arguments of oi is not supported");
  }
  const promise: (...param: P) => Promise<T> = args[0];
  if (args.length === 1) {
    return new (class extends OnceInit<T, P> {
      protected initPromise = promise;
    })();
  }
  const defaultValue: T = args[1];
  return new (class extends OnceInit<T, P> {
    protected initPromise = promise;
  })(defaultValue);
}

export abstract class OnceInit<T, P extends Array<any> = void[]> {
  protected observe: T | void;
  protected promise: Promise<T> | null = null;
  constructor(defaultValue?: T) {
    this.observe = defaultValue;
  }
  protected abstract initPromise(...param: P): Promise<T>;
  protected initialized: boolean = false;

  get target(): T | void {
    if (!this.initialized && this.initPromise.length === 0) {
      this.refresh(...([] as unknown as P));
    }
    return this.observe;
  }
  async init(...param: P): Promise<T | void> {
    if (this.promise) {
      return this.promise.finally(() => this.observe);
    }
    if (!this.initialized) {
      await this.refresh(...param);
    }
    return this.target;
  }

  refresh = async (...param: P): Promise<T | void> => {
    if (!this.promise) {
      this.promise = this.initPromise(...param);
      this.observe = await this.promise;
      this.promise = null;
      this.initialized = true;
      return this.observe;
    } else {
      return this.promise.finally(() => {
        return this.observe;
      });
    }
  };
}
