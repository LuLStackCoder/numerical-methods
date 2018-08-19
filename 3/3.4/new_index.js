const math = require("mathjs");
const fs = require("fs");
const readline = require('readline');
const numeric = require('numeric');
const os = require("os");
const fileContent = fs.readFileSync("data.txt", "utf8");
const arr = fileContent.split(os.EOL);
const stream1 = fs.createWriteStream("datapaste.txt");
let value = process.argv[2];
if (value === undefined)
    value = 2.0;


function getPoints(arr) {
    let x = [];
    let y = [];
    arr.forEach(function (v) {
        if (v !== arr[arr.length - 1])
            x = v.split(",");
        else
            y = v.split(",");
    });
    x = math.number(x);
    y = math.number(y);
    return [x, y];
}


function firstDer(x, y, x0, k) {
    let num1 = (y[k + 1] - y[k]) / (x[k + 1] - x[k]);
    let num2 = (y[k + 2] - y[k + 1]) / (x[k + 2] - x[k + 1]) - num1;
    num2 = num2 / (x[k + 2] - x[k]);
    return num1 + num2 * (2 * x0 - x[k] - x[k + 1]);
}


function secondDer(x, y, k) {
    let num1 = (y[k + 2] - y[k + 1]) / (x[k + 2] - x[k + 1])
    let num2 = (y[k + 1] - y[k]) / (x[k + 1] - x[k])
    return 2 * (num1 - num2) / (x[k + 2] - x[k])
}


function divideLine(vec) {
    let segment = [];
    for (let i = 1; i < vec.length; i++) {
        segment.push([vec[i - 1], vec[i]]);
    }
    return segment;
}

function main() {
    let array = getPoints(arr);
    let k = 0;
    let x = array[0];
    let y = array[1];
    let lineSegment = divideLine(x);
    for (let i = 0; i < lineSegment.length; i++) {
        if (lineSegment[i][0] <= value && value <= lineSegment[i][1]) {
            break;
        }
        k++;
    }
    let res1 = firstDer(x, y, value, k);
    let res2 = secondDer(x, y, k)
    console.log("f'(" + value + ") = " + res1);
    console.log("f''(" + value + ") = " + res2);
    stream1.write("f'(" + value + ") = " + res1 + "\n");
    stream1.write("f''(" + value + ") = " + res2)
}

main();