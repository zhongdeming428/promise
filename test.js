const { MyPromise } = require('./dist/index.js');

const myPro = new MyPromise((res, rej) => {
    res(123);
}).then(5, undefined).then(err => {
    console.log(err)
});