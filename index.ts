import type { CallbackObj, Executor, OnFulfilledFunc, onRejectedFunc, PromiseStatus, RejectFunc, ResolveFunc } from './types';

class MyPromise<T = void> {
  private status: PromiseStatus = 'PENDING';
  private value: T;
  private reason: any;
  private onResolveCallbacks: Array<OnFulfilledFunc<T>> = [];
  private onRejectCallbacks: Array<onRejectedFunc> = [];

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
    this.onResolveCallbacks.forEach(onResolveCallback => onResolveCallback(value));
  }

  public reject (reason: any) {
    if (this.status !== 'PENDING') {
      return;
    }
    this.reason = reason;
    this.status = 'REJECTED';
    this.onRejectCallbacks.forEach(onRejectCallback => onRejectCallback(reason));
  }

  public then (onFulfilled?: OnFulfilledFunc<T>, onReject?: onRejectedFunc) {
    const validOnFulfilledFunc = onFulfilled && typeof onFulfilled === 'function' ? onFulfilled : (v => v);
    const validOnRejectFunc = onReject && typeof onReject === 'function' ? onReject : (r => { throw r });

    const newPro = new MyPromise((resolve, reject) => {
      if (this.status === 'PENDING') {
        this.onRejectCallbacks.push(reason => {
          setTimeout(() => {
            try {
              const retReason = validOnRejectFunc(reason);
              this.resolvePromise(newPro, retReason, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
        this.onResolveCallbacks.push(value => {
          setTimeout(() => {
            try {
              const retValue = validOnFulfilledFunc(value);
              this.resolvePromise(newPro, retValue, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
        return;
      }

      if (this.status === 'FULFILLED') {
        setTimeout(() => {
          try {
            const retValue = validOnFulfilledFunc(this.value);
            this.resolvePromise(newPro, retValue, resolve, reject);
          } catch (err) {
            reject(err);
          } finally {
            return;
          } 
        });
      }

      if (this.status === 'REJECTED') {
        setTimeout(() => {
          try {
            const retReason = validOnRejectFunc(this.reason);
            this.resolvePromise(newPro, retReason, resolve, reject);
          } catch (err) {
            reject(err);
          } finally {
            return;
          } 
        });
      }
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

  public static resolve = (value: any): MyPromise<any> => {
    return new MyPromise((res) => res(value));
  }

  public static reject = (reason: any): MyPromise<any> => {
    return new MyPromise((_, rej) => rej(reason));
  }

  public static all = (promises: MyPromise<any>[]) => {
    return new MyPromise((resolve, reject) => {
      const values = Array(promises.length);
      let fulfilledCount = 0;
      const getOnFulfilled = (index: number) => value => {
        values[index] = value;
        fulfilledCount++;
        if (fulfilledCount === promises.length) {
          resolve(values);
        }
      };

      promises.forEach((promise, idx) => {
        promise.then(getOnFulfilled(idx), reject);
      });
    });
  }

  public static race = (promises: MyPromise<any>[]) => {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => promise.then(resolve, reject));
    });
  }

  private resolvePromise (
    promise: MyPromise,
    value: any,
    resolve: ResolveFunc,
    reject: RejectFunc  
  ) {
    let called = false;
    if (promise === value) {
      throw new TypeError('返回了相同的 promise');
    }
    if (value instanceof MyPromise) {
      value.then(
        retValue => this.resolvePromise(promise, retValue, resolve, reject),
        reject
      );
      return;
    }
    try {
      if (value !== null && ['function', 'object'].includes(typeof value)) {
        const then = value.then;
        if (typeof then === 'function') {
          then.call(
            value,
            retValue => {
              if (called) {
                return;
              }
              called = true;
              this.resolvePromise(promise, retValue, resolve, reject);
            },
            reason => {
              if (called) {
                return;
              }
              called = true;
              reject(reason);
            }
          );
          return;
        }
      }
      resolve(value);
    } catch (err) {
      if (called) {
        return;
      }
      called = true;
      reject(err);
    }
  }
}

const deferred = () => {
  const deferred = {} as {
    promise: MyPromise;
    resolve: ResolveFunc;
    reject: RejectFunc;
  };
  deferred.promise = new MyPromise((res, rej) => {
    deferred.resolve = res;
    deferred.reject = rej;
  });
  return deferred;
};
export {
  MyPromise,
  deferred
}