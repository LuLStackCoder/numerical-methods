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
    eps = 0.1;


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
    n = vec.length;
    return [array, vec];
}


function equiv_form(matrix, b) {
    let alpha = math.zeros(n, n)._data;
    let beta = [];
    for (let i = 0; i < n; i++) {
        beta.push(b[i] / matrix[i][i]);
        for (let j = 0; j < n; j++) {
            if (i !== j)
                alpha[i][j] = -matrix[i][j] / matrix[i][i];
        }
    }
    return [alpha, beta];
}


function iter_solve(alpha, beta) {
    let x = beta;
    let k = 0;
    let koef = norm(alpha) / (1 - norm(alpha));
    let x_next;
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
    let k = 0;
    let b = decompose(alpha)[0];
    let c = math.subtract(alpha, b);
    let koef = norm(alpha) / (1 - norm(alpha));
    let tmp1 = math.multiply(math.inv(math.subtract(math.eye(n, n)._data, b)), c);
    let tmp2 = math.multiply(math.inv(math.subtract(math.eye(n, n)._data, b)), beta);
    let x = tmp2;
    let x_next;
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
    let currMatrix = matrix;
    let max = [];
    let normValue = 0;
    if (matrix[0][0] === undefined) {
        currMatrix.sort(function (a, b) {
            return b - a;
        });
        return currMatrix[0];
    }
    for (let i = 0; i < n; i++) {
        max[i] = 0;
        for (let j = 0; j < n; j++) {
            max[i] += math.abs(currMatrix[i][j]);
        }
    }
    for (let i = 0; i < max.length; i++) {
        if (max[i] > normValue) {
            normValue = max[i];
        }
    }
    return normValue;
}


function matrixParse(matrix) {
    return math.round(matrix, precision(eps));
}


function precision(x) {
    let count = 0;
    while (x < 1) {
        x *= 10;
        count++;
    }
    return count;
}


function decompose(matrix) {
    let tril = math.zeros(n, n)._data;
    let triu = math.zeros(n, n)._data;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i <= j)
                triu[i][j] = matrix[i][j];
            if (i > j)
                tril[i][j] = matrix[i][j];
        }
    }
    return [tril, triu];
}


function main() {
    let linSyst = getMatrix(arr);
    let array = linSyst[0];
    let b = linSyst[1];
    console.log("Eps: " + eps);
    console.log("A: ");
    console.log(array);
    stream1.write("Eps: " + eps + "\n");
    stream1.write("A: ");
    array.forEach(function (v) {
        stream1.write(v.join(', ') + '\n');
    });
    let eqForm = equiv_form(array, b);
    let alpha = eqForm[0];
    let beta = eqForm[1];
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
    let result_iter = iter_solve(alpha, beta);
    let result_seidel = seidel(array, alpha, beta);
    let countI = result_iter[0];
    let sol_iter = result_iter[1];
    let countS = result_seidel[0];
    let sol_seidel = result_seidel[1];
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
