const math = require("mathjs");
const fs = require("fs");
const readline = require('readline');
const numeric = require('numeric');
const os = require("os");
const fileContent = fs.readFileSync("data.txt", "utf8");
const arr = fileContent.split(os.EOL);
const stream1 = fs.createWriteStream("datapaste.txt");
var n;
var eigenvalues;
var eps = process.argv[2];
if (eps === undefined)
    eps = 0.001;


function getMatrix(arr) {
    let array = [];
    arr.forEach(function (v) {
        array.push(v.split(","));
    });
    array = math.number(array);
    n = array.length;
    return array;
}

function findMax(matrix) {
    let max = 0;
    let iMax = 0;
    let jMax = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && math.abs(matrix[i][j]) > math.abs(max)) {
                max = math.abs(matrix[i][j]);
                iMax = i;
                jMax = j;
            }
        }
    }
    return [iMax, jMax];
}

function valueJac(matrix) {
    let i = findMax(matrix)[0];
    let j = findMax(matrix)[1];
    if (t(matrix)) {
        let rotatematrix = math.eye(n, n)._data;
        let phi;
        if (matrix[i][i] !== matrix[j][j])
            phi = math.atan(2 * matrix[i][j] / (matrix[i][i] - matrix[j][j])) / 2;
        else
            phi = math.pi / 4;
        rotatematrix[i][i] = math.cos(phi);
        rotatematrix[j][j] = math.cos(phi);
        rotatematrix[i][j] = -math.sin(phi);
        rotatematrix[j][i] = math.sin(phi);
        matrix = math.multiply(math.transpose(rotatematrix), matrix, rotatematrix);
        eigenvalues = math.multiply(eigenvalues, rotatematrix);
        return valueJac(matrix);
    }
    else return math.diag(matrix);
}


function precision(x) {
    let count = 0;
    while (x < 1) {
        x *= 10;
        count++;
    }
    return count;
}

function matrixParse(matrix) {
    return math.round(matrix, precision(eps));
}

function t(matrix) {
    let tmp = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                tmp += math.square(matrix[i][j]);
            }
        }
    }
    if (math.sqrt(tmp) > eps)
        return true;
}


function main() {
    let array = getMatrix(arr);
    console.log("eps: " + eps);
    console.log("Размерность: " + n);
    console.log("Матрица:");
    console.log(array);
    console.log("\n");

    stream1.write("eps: " + eps);
    stream1.write("\n");
    stream1.write("Размерность: " + n);
    stream1.write("\n");
    stream1.write("Матрица:");
    stream1.write("\n");

    array.forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    stream1.write("\n");
    eigenvalues = math.eye(n, n)._data;
    let sol = valueJac(array);

    for (let i = 0; i < n; i++) {
        console.log("lambda" + (i + 1) + " : " + matrixParse(sol)[i]);
        console.log("X" + (i + 1) + " : " + " [" + matrixParse(math.transpose(eigenvalues)[i]) + "] ");
        console.log("\n");
    }

    for (let i = 0; i < n; i++) {
        stream1.write("lambda" + (i + 1) + " : " + matrixParse(sol)[i]);
        stream1.write("\n");
        stream1.write("X" + (i + 1) + " : " + " [" + matrixParse(math.transpose(eigenvalues)[i]) + "] ");
        stream1.write("\n");
    }
}

main();