var math = require("mathjs");
var fs = require("fs");
var readline = require('readline');
var numeric = require('numeric');
var os = require("os");
fileContent = fs.readFileSync("data.txt", "utf8");
var arr = fileContent.split(os.EOL);
var stream1 = fs.createWriteStream("datapaste.txt");


function getMatrix(arr) {
    var array = [];
    var vec = [];
    arr.forEach(function (v) {
        if (v !== arr[arr.length - 1])
            array.push(v.split(","));
        else
            vec = v.split(",");
    });
    array = math.number(array);
    vec = math.number(vec);
    var n = vec.length;
    array[0].unshift(0);
    array[array.length - 1].push(0);
    return [array, vec];
}


function tma(matrix, d) {
    var a = matrix[0];
    var b = matrix[1];
    var c = matrix[2];
    var p = [-c[0] / b[0]];
    var q = [d[0] / b[0]];
    var n = d.length;
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
        for (var i = 0; i < parsedMatrix.length; i++)
            parsedMatrix[i] = Number(matrix[i].toFixed(2));
        return parsedMatrix;
    }
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            parsedMatrix[i][j] = Number(matrix[i][j].toFixed(2));
        }
    }
    return parsedMatrix;
}


function main() {
    var linSyst = getMatrix(arr);
    var array = linSyst[0];
    var vec = linSyst[1];
    var solve = matrixParse(tma(array, vec));
    console.log(solve);
    solve.forEach(function (v) {
        stream1.write(v + ', ');
    });
}

main();