import type { CallbackObj, Executor, OnFulfilledFunc, onRejectedFunc, PromiseStatus, ResolveFunc } from './types';

class MyPromise<T = void> {
  private status: PromiseStatus = 'PENDING';
  private value: T;
  private reason: any;
  private callbacks: CallbackObj<T>[] = [];

  constructor (exector: Executor<T>) {
    try {
      exector(
        this.resolve.bind(this),
        this.reject.bind(this)
      );
    } catch (err) {
      this.reject(err);
    }
  }

  public resolve (value: T) {
    if (this.status !== 'PENDING') {
      return;
    }
    this.value = value;
    this.status = 'FULFILLED';
    this.callbacks.forEach(cb => this.handle(cb));
  }

  public reject (reason: any) {
    if (this.status !== 'PENDING') {
      return;
    }
    this.reason = reason;
    this.status = 'REJECTED';
    this.callbacks.forEach(cb => this.handle(cb));
  }

  public then (onFulfilled?: OnFulfilledFunc<T>, onRejected?: onRejectedFunc) {
    const newPro = new MyPromise((resolve: ResolveFunc, reject) => {
      this.handle({
        onFulfilled,
        onRejected,
        resolve,
        reject,
        // 通过闭包获取当前 then 返回的 promise，在之后的处理中进行比较
        getPreviousPromise() {
          return newPro;
        }
      });
    });
    return newPro;
  }

  public catch (onRejected: onRejectedFunc) {
    return this.then(null, onRejected);
  }

  public finally (onDone: () => void) {
    return this.then(
      val => onDone(),
      reason => onDone()
    );
  }

  public static resolve = () => {

  }

  public static reject = () => {

  }

  public static all = () => {

  }

  public static race = () => {

  }

  private handle (cb: CallbackObj<T>) {
    if (this.status === 'PENDING') {
      this.callbacks.push(cb);
      return;
    }

    const fulfilled = this.status === 'FULFILLED';
    const callback = fulfilled
      ? (cb.onFulfilled && typeof cb.onFulfilled === 'function' ? cb.onFulfilled : (v => v))
      : (cb.onRejected && typeof cb.onRejected === 'function' ? cb.onRejected : (v => { throw v }));
    const valueOrReason = fulfilled
      ? this.value
      : this.reason;

    setTimeout(() => {
      try {
        let ret = callback(valueOrReason);
        const previousPro = cb.getPreviousPromise();
        if (ret === previousPro) {
          cb.reject(new TypeError('返回了相同的 Promise 实例'));
        }
        if (['function', 'object'].includes(typeof ret)) {
          const then = ret.then;
          if (typeof then === 'function') {
            then.call(
              ret,
              retValue => cb.resolve(retValue),
              retReason => cb.reject(retReason)
            );
            return;
          }
        }
        cb.resolve(ret);
      } catch (err) {
        cb.reject(err);
      }
    });
  }
}

export { MyPromise };
