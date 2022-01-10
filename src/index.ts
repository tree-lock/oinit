export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>
): OInit<T, P>;

export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>,
  defaultValue: T
): InitOInit<T, P>;

export default function oi<T, P extends Array<any> = void[]>(
  ...args: any[]
): OInit<T, P> {
  if (!(args[0] instanceof Function) || args.length > 2 || args.length < 1) {
    throw new Error("Arguments of oi is not supported");
  }
  const promise: (...param: P) => Promise<T> = args[0];
  if (args.length === 1) {
    return new (class extends OInit<T, P> {
      protected initPromise = promise;
    })();
  }
  const defaultValue: T = args[1];
  return new (class extends InitOInit<T, P> {
    protected initPromise = promise;
  })(defaultValue);
}

export abstract class OInit<T, P extends Array<any> = void[]> {
  protected observe: T | undefined;
  protected promise: Promise<T> | null = null;
  protected abstract initPromise(...param: P): Promise<T>;
  protected initialized: boolean = false;

  get target(): T | undefined {
    if (!this.initialized && this.initPromise.length === 0) {
      this.refresh(...([] as unknown as P));
    }
    return this.observe;
  }
  async init(...param: P): Promise<T> {
    if (this.promise) {
      return this.promise.finally(() => this.observe);
    }
    if (!this.initialized) {
      await this.refresh(...param);
    }
    return this.target as T;
  }

  refresh = async (...param: P): Promise<T> => {
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
export abstract class InitOInit<T, P extends Array<any> = void[]> extends OInit<
  T,
  P
> {
  protected declare observe: T;
  get target(): T {
    if (!this.initialized && this.initPromise.length === 0) {
      this.refresh(...([] as unknown as P));
    }
    return this.observe;
  }
  constructor(defaultValue: T) {
    super();
    this.observe = defaultValue;
  }
}
