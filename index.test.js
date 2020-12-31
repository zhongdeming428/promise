const { MyPromise } = require('./dist/index.js');

module.exports = {
  deferred: function () {
    const dfd = {};
    dfd.promise = new MyPromise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
}