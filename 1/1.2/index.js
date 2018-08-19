const math = require("mathjs");
const fs = require("fs");
const readline = require('readline');
const numeric = require('numeric');
const os = require("os");
const fileContent = fs.readFileSync("data.txt", "utf8");
const arr = fileContent.split(os.EOL);
const stream1 = fs.createWriteStream("datapaste.txt");


function getMatrix(arr) {
    let array = [];
    let vec = [];
    arr.forEach(function (v) {
        if (v !== arr[arr.length - 1])
            array.push(v.split(","));
        else
            vec = v.split(",");
    });
    array = math.number(array);
    vec = math.number(vec);
    let n = vec.length;
    array[0].unshift(0);
    array[array.length - 1].push(0);
    return [array, vec];
}


function tma(matrix, d) {
    let a = matrix[0];
    let b = matrix[1];
    let c = matrix[2];
    let p = [-c[0] / b[0]];
    let q = [d[0] / b[0]];
    let n = d.length;
    x = math.zeros(n + 1)._data;
    for (let i = 1; i < n; i++) {
        p.push(-c[i] / (b[i] + a[i] * p[i - 1]));
        q.push((d[i] - a[i] * q[i - 1]) / (b[i] + a[i] * p[i - 1]));
    }

    for (let i = n - 1; i >= 0; i--) {
        x[i] = p[i] * x[i + 1] + q[i];
    }
    x.pop();
    return x;
}


function matrixParse(matrix) {
    parsedMatrix = math.clone(matrix);
    if (parsedMatrix[0][0] === undefined) {
        for (let i = 0; i < parsedMatrix.length; i++)
            parsedMatrix[i] = Number(matrix[i].toFixed(2));
        return parsedMatrix;
    }
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            parsedMatrix[i][j] = Number(matrix[i][j].toFixed(2));
        }
    }
    return parsedMatrix;
}


function main() {
    let linSyst = getMatrix(arr);
    let array = linSyst[0];
    let vec = linSyst[1];
    let solve = matrixParse(tma(array, vec));
    console.log(solve);
    solve.forEach(function (v) {
        stream1.write(v + ', ');
    });
}

main();