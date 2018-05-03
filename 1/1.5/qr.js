var math = require("mathjs");
var fs = require("fs");
var readline = require('readline');
var numeric = require('numeric');
var fileContent = fs.readFileSync("data.txt", "utf8");
var arr = fileContent.split(" ");
var stream1 = fs.createWriteStream("datapaste.txt");
var n = parseInt(math.sqrt(arr.length));
console.log('n: ' + n);
var array = [];
var k = 0;
var eps = process.argv[2];
if (eps === undefined)
    eps = 0.001;
var eigenvalues = math.eye(n, n)._data;
var prevRoot = 0;
var currRoot = 0;
var imEv = [];

array = math.zeros(n, n)._data;

for (var i in array) {
    for (var j in array) {
        array[i][j] = math.eval(arr[k++]);
    }
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
    parsedMatrix = math.clone(matrix);
    if (matrix[0][0] === undefined) {
        for (var i = 0; i < matrix.length; i++) {
            if (parsedMatrix[i].re !== undefined && parsedMatrix[i].im !== undefined) {
                parsedMatrix[i].re = Number(parsedMatrix[i].re.toFixed(precision(eps)));
                parsedMatrix[i].im = Number(parsedMatrix[i].im.toFixed(precision(eps)));
            }
            else matrix[i] = parseFloat(matrix[i].toFixed(precision(eps)));
        }
        return matrix;
    }
    for (var i in parsedMatrix) {
        for (var j in parsedMatrix) {
            if (parsedMatrix[i][j].re !== undefined && parsedMatrix[i][j].im !== undefined) {
                parsedMatrix[i][j].re = Number(parsedMatrix[i][j].re.toFixed(precision(eps)));
                parsedMatrix[i][j].im = Number(parsedMatrix[i][j].im.toFixed(precision(eps)));
            }
            else
                parsedMatrix[i][j] = Number(parsedMatrix[i][j].toFixed(precision(eps)));
        }
    }
    return parsedMatrix;
}


function precision(x) {
    var count = 0;
    while (x < 1) {
        x *= 10;
        count++;
    }
    return count;
}

function eiqvec(matrix, vec) {
    var eigvec;

}


function main() {
    var qMatrix = decompose(array)[0];
    var rMatrix = decompose(array)[1];
    var ending = algorithm(array);
    var lambda = ending[0];
    var lastA = ending[1];
    var eigvec = math.multiply(math.eye(n)._data, lambda[0]);
    var Al = math.subtract(array, eigvec);
    var veczero = math.zeros(n)._data;
    var eigenvec = matrixParse(numeric.eig(array).E.x);
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
    console.log("X: ");
    console.log(eigenvec);

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

