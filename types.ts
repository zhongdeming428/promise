import { MyPromise } from "index";

/**resolve 函数类型 */
export type ResolveFunc = (value: any) => void;

/**reject 函数类型 */
export type RejectFunc<T = any> = (reason: T) => void;

export type OnFulfilledFunc<T> = (value?: T) => any;

export type onRejectedFunc = (reason?: any) => any;

/**传递给 Promise 函数的参数 */
export type Executor<T> = (resolve: ResolveFunc, reject: RejectFunc) => any;

export type PromiseStatus = 'PENDING' | 'FULFILLED' | 'REJECTED';

export type ThenFunc = (OnFulfilledFunc, onRejectedFunc) => MyPromise;

export interface CallbackObj<T> {
  onFulfilled: OnFulfilledFunc<T>;
  onRejected: onRejectedFunc;
  resolve: ResolveFunc;
  reject: RejectFunc;
  getPreviousPromise: () => MyPromise;
}