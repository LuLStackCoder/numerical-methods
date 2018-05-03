const math = require('mathjs');

function CDF_f(x,y,h){
    return (y[0] - 8 * y[1] + 8 * y[3] + y[4])/(12 * h);
}

function CDF_s(x,y,h){
    return (-y[0] + 16 * y[1] - 30 * y[2] + 16 * y[3] - y[4])/(12 * h^2);
}

let x = 0.2;
let h = 1;
let y = [-0.20136, 0, 0.20136, 0.41152, 0.6435];

console.log('x* = ', x);
console.log('y = ', y);
console.log('first Derivative = ', CDF_f(x,y,h));
console.log('second Derivative = ', CDF_s(x,y,h));