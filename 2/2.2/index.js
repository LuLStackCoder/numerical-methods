'use strict'

const math = require("mathjs");
const fs = require("fs");
const stream1 = fs.createWriteStream("datapaste.txt");
var eps = process.argv[2];
if (eps === undefined) {
    eps = 0.001;
}
console.log('eps = ' + eps);

function f1(x, y) {
    return x - math.cos(y) - 1;
}

function f2(x, y) {
    return y - math.log(x + 1) - 2;
}

function df1dx(xp, yp) {
    return math.derivative('x-cos(y)-1', 'x').eval({x: xp, y: yp});
}

function df1dy(xp, yp) {
    return math.derivative('x-cos(y)-1', 'y').eval({x: xp, y: yp});
}

function df2dx(xp, yp) {
    return math.derivative('y-log(x+1)-2', 'x').eval({x: xp, y: yp});
}

function df2dy(xp, yp) {
    return math.derivative('y-log(x+1)-2', 'y').eval({x: xp, y: yp});
}


function jacobi(x, y) {
    return [[df1dx(x, y), df1dy(x, y)], [df2dx(x, y), df2dy(x, y)]];
}


function newton(fn1, fn2, jac, x0, eps) {
    let x1 = math.subtract(x0, math.multiply(math.inv(jac(x0[0], x0[1])), [fn1(x0[0], x0[1]), fn2(x0[0], x0[1])]));
    let iter = 0;
    while (math.norm(math.subtract(x1, x0), 'inf') > eps) {
        x0 = x1;
        x1 = math.subtract(x0, math.multiply(math.inv(jac(x0[0], x0[1])), [fn1(x0[0], x0[1]), fn2(x0[0], x0[1])]));
        iter++;
    }
    return [x1, iter];
}


function phi(x, y) {
    return [(1 + math.cos(y)), (2 + math.log(x + 1))];
}

function phidiff(xp, yp) {
    let diff = math.zeros(2, 2)._data;
    diff[0][0] = math.derivative('1 + cos(y)', 'x').eval({x: xp, y: yp});
    diff[0][1] = math.derivative('1 + cos(y)', 'y').eval({x: xp, y: yp});
    diff[1][0] = math.derivative('2 + log(x + 1)', 'x').eval({x: xp, y: yp});
    diff[1][1] = math.derivative('2 + log(x + 1)', 'y').eval({x: xp, y: yp});
    return diff;
}

function calcq(a, b) {
    let x = [];
    let y = [];
    let massdiff = [];
    let massnorm = [];
    for (let i = a[0]; i < a[1]; i += 0.01) {
        x.push(i);
    }
    for (let i = b[0]; i < b[1]; i += 0.01) {
        y.push(i);
    }
    for (let i = 0; i < x.length; i++) {
        massdiff.push(phidiff(x[i], y[i]));

    }
    for (let i = 0; i < massdiff.length; i++) {
        massnorm.push(math.norm(massdiff[i], 'inf'));
    }
    let q = math.max(massnorm);
    return q;
}


function iteration(phin, x0, y0, eps) {
    let q = calcq(x0, y0);
    let x1 = phin(x0[0], x0[1]);
    let iter = 0;
    while (math.norm(math.subtract(x1, x0), 'inf') * q / (1 - q) > eps) {
        x0 = x1;
        x1 = phin(x0[0], x0[1]);
        iter++;
    }
    return [x1, iter>>2];
}
function main()
{
    {//newton
        console.log(' newton ');
        stream1.write(' newton ');
        const x0 = [0.25, 0.75];
        console.log('x: ');
        console.log(newton(f1, f2, jacobi, x0, eps)[0]);
        console.log('iter = ' + newton(f1, f2, jacobi, x0, eps)[1]);
        stream1.write('\nx: ' + newton(f1, f2, jacobi, x0, eps)[0]);
        stream1.write('\niter = ' + newton(f1, f2, jacobi, x0, eps)[1]);
    }
    {//iteration
        console.log(' iteration ');
        stream1.write('\n\n iteration ');
        const x0 = [0.25, 0.75];
        const y0 = [2, 2.5];
        console.log('x: ')
        console.log(iteration(phi, x0, y0, eps)[0]);
        console.log('iter = ' + math.round(iteration(phi, x0, y0, eps)[1]))
        stream1.write('\nx: ' +  iteration(phi, x0, y0, eps)[0]);
        stream1.write('\niter = ' + iteration(phi, x0, y0, eps)[1])
    }
}

main();


