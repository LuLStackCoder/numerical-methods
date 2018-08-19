const math = require('mathjs');
const runge = require('integrate-adaptive-simpson');
const fs = require("fs");
const stream1 = fs.createWriteStream("data_out.txt");

const myFunc = x => x / (((2 * x) + 7) * ((3 * x) + 4));

function rectangleMethod(a, b, h, f) {
    let result = 0;
    for(let i = a + h; i <= b ; i += h){
        result += (h * f( (i + i - h) / 2 ));
    }
    return math.abs(result);
}

function trapezoidalMethod(a, b, h, f) {
    let result = 0;
    for (var i = a + h; i <= b; i += h) {
        result += (h * (f(i) + f(i - h)) );
    }
    return math.abs(result / 2);
}

function simpsonsMethod(a, b, h, f) {
    let result = f(a);
    let count = 1;
    for(let i = a + h; i < b; i+=h){
        let tmp = f(i);
        if(count % 2 == 0){
            result += tmp * 2;
        }else{
            result += tmp * 4;
        }
        count++;
    }
    result += f(b);
    return math.abs(result * h / 3);
}
function rung(f, a, b, h) {
    let result = f(a);
    let k = 0;
    for (let i = a + h; i <= b; i += h) {
        result += ((f(i) + f(i - h)));
        k++;
    }
    return result / (k ** 4 - 1);
}

const x0 = -1;
const x1 = 1;
const h0 = 0.5;
const h1 = 0.25;
let result = [];
let result1 =[];

console.log('(a,b) = ' + x0 + ',' + x1 + '; h = ' + h0 );
console.log('rectangleMethod ');
result.push(rectangleMethod(x0,x1,h0,myFunc))
console.log(result[0]);
console.log('trapezoidalMethod');
result.push(trapezoidalMethod(x0,x1,h0,myFunc))
console.log(result[1]);
console.log('simpsonsMethod');
result.push(simpsonsMethod(x0,x1,h0,myFunc))
console.log(result[2]);
console.log('  ');
console.log('(a,b) = ' + x0 + ',' + x1 + '; h = ' + h1 );
console.log('rectangleMethod ');
result1.push(rectangleMethod(x0,x1,h1,myFunc))
console.log(result1[0]);
console.log('trapezoidalMethod');
result1.push(trapezoidalMethod(x0,x1,h1,myFunc))
console.log(result1[1]);
console.log('simpsonsMethod');
result1.push(simpsonsMethod(x0,x1,h1,myFunc))
console.log(result1[2]);
console.log('  ');
console.log('Runge - Romberg');
console.log('rectangleMethod');
console.log(result[0] + (result[0] - result1[0])/(2*2 - 1));
console.log('trapezoidalMethod');
console.log(result[1] + (result[1] - result1[1])/(2*2 - 1));
console.log('simpson');
console.log(result[2] + (result[2] - result1[2])/(2*2 - 1));

console.log(runge(myFunc, -1, 1))