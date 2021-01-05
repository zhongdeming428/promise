const { MyPromise } = require('./dist/index.js');

MyPromise
    .resolve(123)
    .then(value => console.log(value));

MyPromise
    .reject(321)
    .then(v => console.log('v', v), r => console.log('r', r));

MyPromise.all([
    new MyPromise(r => setTimeout(() => {
        r(1);   
    }), 100),
    new MyPromise(r => setTimeout(() => {
        r(2);
    }, 1000)),
    new MyPromise(r => setTimeout(() => {
        r(3);
    }, 1500))
]).then(v => console.log(v))

MyPromise.race([
    new MyPromise((r, j) => setTimeout(() => {
        j(1);
    }), 1000),
    new MyPromise(r => setTimeout(() => {
        r(2);
    }, 1000)),
    new MyPromise(r => setTimeout(() => {
        r(3);
    }, 1500))
]).then(v => console.log(v), r => console.log('r', r))