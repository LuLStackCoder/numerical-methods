var math = require("mathjs");
var fs = require("fs");
var readline = require('readline');
var fileContent = fs.readFileSync("data.txt", "utf8");
var arr = fileContent.split(" ");
var stream1 = fs.createWriteStream("datapaste.txt");
var n = parseInt(math.sqrt(arr.length));
var array = [];
var k = 0;
var eps = process.argv[2];
if (eps === undefined)
    eps = 0.001;
var eigenvalues = math.eye(n, n)._data;

array = math.zeros(n, n)._data;

for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
        array[i][j] = parseInt(arr[k++]);
    }
}

function findMax(matrix) {
    var max = 0;
    var iMax = 0;
    var jMax = 0;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
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
    var i = findMax(matrix)[0];
    var j = findMax(matrix)[1];
    if (t(matrix)) {
        var rotatematrix = math.eye(n, n)._data;
        var phi;
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
    var count = 0;
    while (x < 1) {
        x *= 10;
        count++;
    }
    return count;
}

function matrixParse(matrix) {
    if (matrix[0][0] === undefined) {
        for (var i = 0; i < matrix.length; i++)
            matrix[i] = parseFloat(matrix[i].toFixed(precision(eps)));
        return matrix;
    }
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            matrix[i][j] = parseFloat(matrix[i][j].toFixed(precision(eps)));
        }
    }
    return matrix;
}

function t(matrix) {
    var tmp = 0;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            if (i !== j) {
                tmp += math.square(matrix[i][j]);
            }
        }
    }
    if (math.sqrt(tmp) > eps)
        return true;
}


function main() {
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

    var sol = valueJac(array);

    for (var i = 0; i < n; i++) {
        console.log("lambda" + (i + 1) + " : " + matrixParse(sol)[i]);
        console.log("X" + (i + 1) + " : " + " [" + matrixParse(math.transpose(eigenvalues)[i]) + "] ");
        console.log("\n");
    }

    for (var i = 0; i < n; i++) {
        stream1.write("lambda" + (i + 1) + " : " + matrixParse(sol)[i]);
        stream1.write("\n");
        stream1.write("X" + (i + 1) + " : " + " [" + matrixParse(math.transpose(eigenvalues)[i]) + "] ");
        stream1.write("\n");
    }
}

main();