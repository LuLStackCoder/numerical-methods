'use strict'
const math = require('mathjs');
const fs = require("fs");
const readline = require('readline');
const numeric = require('numeric');
const os = require("os");

function CDF_f(x, y, h) {
    return (y[0] - 8 * y[1] + 8 * y[3] + y[4]) / (12 * h);
}

function CDF_s(x, y, h) {
    return (-y[0] + 16 * y[1] - 30 * y[2] + 16 * y[3] - y[4]) / (12 * h ^ 2);
}

function main(x, points, step) {

    if (step == undefined) {
        step = 1;
    }

    let firstDer = CDF_f(x, points, step);
    let secondDer = CDF_s(x, points, step);


    return [firstDer, secondDer];
}

const fileContent = fs.readFileSync("data.txt", "utf8");
let arr = fileContent.split(os.EOL);
const stream1 = fs.createWriteStream("data_out.txt");
let x = process.argv[2];
if (x == undefined) {
    x = 0;
}
const points = math.number(arr[1].split(','));

const result = main(x, points, process.argv[3]);
console.log('first Der ', result[0]);
console.log('second Der ', result[1]);
console.log('x = ', x);
console.log('points = ', points);
stream1.write('first Der ' + result[0]);
stream1.write('\nsecond Der ' + result[1]);
stream1.write('\nx = ' + x + '\n');
points.forEach(function (v) {
    stream1.write(v + ', ');
});


