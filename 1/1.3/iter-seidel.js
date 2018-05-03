var math = require("mathjs");
var fs = require("fs");
var readline = require('readline');
var numeric = require('numeric');
fileContent = fs.readFileSync("data.txt", "utf8");
var arr = fileContent.split(" ");
var fileContentB = fs.readFileSync("data2.txt", "utf8");
var arrb = fileContentB.split(" ");
var stream1 = fs.createWriteStream("datapaste.txt");
var n = parseInt(math.sqrt(arr.length));
var array = [];
var b = [];
var k = 0;
var eps = process.argv[2];
if (eps === undefined)
    eps = 0.1;

array = math.zeros(n, n)._data;

for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
        array[i][j] = parseInt(arr[k++]);
    }
}


for (var i = 0; i < n; i++) {
    b.push(parseInt(arrb[i]));
}


function equiv_form(matrix, b) {
    var alpha = math.zeros(n, n)._data;
    var beta = [];
    for (var i = 0; i < n; i++) {
        beta.push(b[i] / matrix[i][i]);
        for (var j = 0; j < n; j++) {
            if (i !== j)
                alpha[i][j] = -matrix[i][j] / matrix[i][i];
        }
    }
    return [alpha, beta];
}


function iter_solve(alpha, beta) {
    var x = beta;
    var k = 0;
    var koef = norm(alpha) / (1 - norm(alpha));
    var x_next;
    if (norm(alpha) > 1) throw new Error("Метод простых итераций не сходится");
    while (true) {
        x_next = (math.add(beta, math.multiply(alpha, x)));
        k++;
        if (koef * norm(math.subtract(x_next, x)) <= eps)
            break;
        x = x_next;
    }
    return [k, x_next];
}


function seidel(matrix, alpha, beta) {
    var k = 0;
    var b = decompose(alpha)[0];
    var c = math.subtract(alpha, b);
    var koef = norm(alpha) / (1 - norm(alpha));
    var tmp1 = math.multiply(math.inv(math.subtract(math.eye(n, n)._data, b)), c);
    var tmp2 = math.multiply(math.inv(math.subtract(math.eye(n, n)._data, b)), beta);
    var x = tmp2;
    var x_next;
    if (norm(alpha) < 1)
        var currEps = (x_next, x) => koef * norm(math.subtract(x_next, x));
    else
        var currEps = (x_next, x) => norm(math.subtract(x_next, x));
    while (true) {
        x_next = math.add(tmp2, math.multiply(tmp1, x));
        k++;
        if (currEps(x_next, x) <= eps)
            break;
        x = x_next;
    }

    return [k, x_next];
}


function norm(matrix) {
    var currMatrix = matrix;
    var max = [];
    var normValue = 0;
    if (matrix[0][0] === undefined) {
        currMatrix.sort(function (a, b) {
            return b - a;
        });
        return currMatrix[0];
    }
    for (var i = 0; i < n; i++) {
        max[i] = 0;
        for (var j = 0; j < n; j++) {
            max[i] += math.abs(currMatrix[i][j]);
        }
    }
    for (var i = 0; i < max.length; i++) {
        if (max[i] > normValue) {
            normValue = max[i];
        }
    }
    return normValue;
}


function matrixParse(matrix) {
    parsedMatrix = math.clone(matrix);
    if (parsedMatrix[0][0] === undefined) {
        for (var i = 0; i < parsedMatrix.length; i++)
            parsedMatrix[i] = parseFloat(matrix[i].toFixed(precision(eps)));
        return parsedMatrix;
    }
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            parsedMatrix[i][j] = parseFloat(matrix[i][j].toFixed(precision(eps)));
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


function decompose(matrix) {
    var tril = math.zeros(n, n)._data;
    var triu = math.zeros(n, n)._data;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            if (i <= j)
                triu[i][j] = matrix[i][j];
            if (i > j)
                tril[i][j] = matrix[i][j];
        }
    }
    return [tril, triu];
}


function main() {
    console.log("Eps: " + eps );
    console.log("A: ");
    console.log(array);
    stream1.write("Eps: " + eps + "\n");
    stream1.write("A: ");
    array.forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    var eqForm = equiv_form(array, b);
    var alpha = eqForm[0];
    var beta = eqForm[1];
    console.log("Alpha: ");
    console.log(matrixParse(alpha));
    console.log("Beta: ");
    console.log(matrixParse(beta));
    stream1.write("\nAlpha:\n");
    matrixParse(alpha).forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    stream1.write("\nBeta:\n");
    matrixParse(beta).forEach(function (v) {
        stream1.write(v + ', ');
    });
    var result_iter = iter_solve(alpha, beta);
    var result_seidel = seidel(array, alpha, beta);
    var countI = result_iter[0];
    var sol_iter = result_iter[1];
    var countS = result_seidel[0];
    var sol_seidel = result_seidel[1];
    console.log("nStepsIter: " + countI + '\n' + "X: ");
    console.log(matrixParse(sol_iter));
    console.log("nStepsSeidel: " + countS + '\n' + "X: ");
    console.log(matrixParse(sol_seidel));
    stream1.write("\n\nnStepsIter: " + countI + '\n' + "X:\n");
    matrixParse(sol_iter).forEach(function (v) {
        stream1.write(v + ', ');
    });
    stream1.write("\n\nnStepsSeidel: " + countS + '\n' + "X:\n");
    matrixParse(sol_seidel).forEach(function (v) {
        stream1.write(v + ', ');
    });
}

main();
