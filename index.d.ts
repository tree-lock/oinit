export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>,
  defaultValue?: T
): OnceInit<T, P>;
export declare abstract class OnceInit<T, P extends Array<any> = void[]> {
  protected observe: T | void;
  protected promise: Promise<T> | null;
  constructor(defaultValue?: T);
  protected abstract initPromise(...param: P): Promise<T>;
  protected initialized: boolean;
  get target(): T | void;
  init(...param: P): Promise<T | void>;
  refresh: (...param: P) => Promise<T | void>;
}
