const math = require("mathjs");
const fs = require("fs");
const readline = require('readline');
const numeric = require('numeric');
const os = require("os");
const fileContent = fs.readFileSync("data.txt", "utf8");
const arr = fileContent.split(os.EOL);
const stream1 = fs.createWriteStream("datapaste.txt");
var n;
var eps = process.argv[2];
if (eps === undefined)
    eps = 0.001;
var eigenvalues;
var prevRoot = 0;
var currRoot = 0;
var imEv = [];


function getMatrix(arr) {
    let array = [];
    arr.forEach(function (v) {
        array.push(v.split(","));
    });
    array = math.number(array);
    n = array.length;
    return array;
}


function decompose(r) {
    var q = math.eye(n, n)._data;
    var h = null;
    for (var i = 0; i < n - 1; i++) {
        h = householder(math.transpose(r)[i], i);
        q = math.multiply(q, h);
        r = math.multiply(h, r);
    }
    return [q, r];
}


function householder(matrix, k) {
    var v = math.zeros(n, n)._data;
    v[k][0] = math.add(matrix[k], math.sign(matrix[k]) * math.norm(matrix.slice(k)));
    for (var i = k + 1; i < n; i++) {
        v[i][0] = matrix[i];
    }
    var tmp = math.divide(math.multiply(v, math.transpose(v)), math.multiply(math.transpose(v)[0], math.transpose(v)[0]));
    var h = math.subtract(math.eye(n, n)._data, math.multiply(2, tmp));
    return h;
}

function algorithm(matrix) {
    a = math.clone(matrix);
    var flag = true;
    while (true) {
        var q = decompose(a)[0];
        var r = decompose(a)[1];
        a = math.multiply(r, q);
        var test = check(a);
        if (test !== undefined && test !== null) {
            return [test, a];
        }
    }
    return 0;
}


function check(matrix) {
    var real = math.zeros(n)._data;
    var img = math.zeros(n)._data;
    var mask = math.zeros(n)._data;

    for (var i in mask) {
        mask[i] = true;
    }
    var Roots = [];
    for (var j = 0; j < n; j++) {
        var tmp = 0;
        var tmp1 = 0;
        for (var i = j + 1; i < n; i++) {
            tmp += math.square(matrix[i][j]);
        }
        for (var k = j + 2; k < n; k++) {
            tmp1 += math.square(matrix[k][j]);
        }
        for (var k = 0; k < j; k++) {
            tmp += math.square(matrix[j][k]);
        }
        tmp = math.sqrt(tmp);
        tmp1 = math.sqrt(tmp1);
        if (tmp <= eps * 10) {
            real[j] = true;
        }
        if (tmp1 <= eps * 10) {
            img[j] = true;
        }
    }

    if (math.deepEqual(real, mask)) {
        return math.diag(matrix);
    }
    for (var i = 0; i < n - 1; i++) {
        if (real[i + 1] !== true) {
            Roots = solve(-(matrix[i][i] + matrix[i + 1][i + 1]), matrix[i][i] * matrix[i + 1][i + 1] - matrix[i + 1][i] * matrix[i][i + 1]);
            imEv.push(i);
        }
    }
    currRoot = Roots[1];
    if (math.abs(math.subtract(currRoot, prevRoot)) <= eps) {
        for (var i = 0; i < n; i++) {
            if (real[i] === true) {
                Roots.unshift(matrix[i][i]);
            }
        }
        return Roots;
    }
    else prevRoot = currRoot;
    return null;
}


function solve(b, c) {
    var result = math.divide(math.add(-b, math.sqrt(math.pow(b, 2) - (4 * c))), 2);
    var result2 = math.divide(math.subtract(-b, math.sqrt(math.pow(b, 2) - (4 * c))), 2);
    return [result, result2];
}


function matrixParse(matrix) {
    return math.round(matrix, precision(eps));
}


function precision(x) {
    var count = 0;
    while (x < 1) {
        x *= 10;
        count++;
    }
    return count;
}


function main() {
    var array = getMatrix(arr);
    var qMatrix = decompose(array)[0];
    var rMatrix = decompose(array)[1];
    var ending = algorithm(array);
    var lambda = ending[0];
    var lastA = ending[1];
    var eigvec = math.multiply(math.eye(n)._data, lambda[0]);
    var Al = math.subtract(array, eigvec);
    var veczero = math.zeros(n)._data;
    console.log("A: ");
    console.log(array);
    console.log("\n");
    console.log("Q: ");
    console.log(matrixParse(qMatrix));
    console.log("\n");
    console.log("R: ");
    console.log(matrixParse(rMatrix));
    console.log("\n");
    console.log("A0: ");
    console.log(matrixParse(math.multiply(qMatrix, rMatrix)));
    console.log("\n");
    console.log("lastA: ");
    console.log(matrixParse(lastA));
    console.log("\n");
    console.log("Lambda: ");
    console.log(lambda);

    if (numeric.eig(array).E.y !== undefined) {
        for (let i = 0; i < numeric.eig(array).E.x.length; i++) {
            console.log("X" + i + ": ");
            var eigvec = [];
            for (let j = 0; j < numeric.eig(array).E.x.length; j++) {
                eigvec.push(math.complex(numeric.eig(array).E.x[i][j], numeric.eig(array).E.y[i][j]));
            }
            console.log(matrixParse(eigvec));
        }
    }
    else {
        for (let i = 0; i < numeric.eig(array).E.x.length; i++) {
            console.log("X" + i + ": ");
            console.log(matrixParse(numeric.eig(array).E.x[i]));
        }
    }
    stream1.write("A: \n");
    array.forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    stream1.write("\n");
    stream1.write("Q: \n");
    qMatrix.forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    stream1.write("\n");
    stream1.write("R: \n");
    rMatrix.forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    stream1.write("\n");
    stream1.write("A0: \n");
    math.multiply(qMatrix, rMatrix).forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    stream1.write("\n");
    stream1.write("lastA: \n");
    matrixParse(lastA).forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    stream1.write("\n");
    stream1.write("Lambda: \n");
    lambda.forEach(function (v) {
        stream1.write(v + ', ');
    });
}

main();

