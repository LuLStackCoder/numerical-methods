const math = require("mathjs");
const fs = require("fs");
const stream1 = fs.createWriteStream("datapaste.txt");
let eps = process.argv[2];
if (eps === undefined) {
    eps = 0.0001;
}


function f(x) {
    return math.cos(x) + 0.25 * x - 0.5;
}

function df(xp) {
    return math.derivative('cos(x)+0.25x-0.5', 'x').eval({x: xp});
}

function phi(x) {
    return math.acos(0.5 - 0.25 * x);
}


function newton(fn, dfn, x0, eps) {
    let x1 = x0 - fn(x0) / dfn(x0);
    let iter = 0
    while (math.abs(x1 - x0) > eps) {
        x0 = x1;
        x1 = x1 - fn(x0) / dfn(x0);
        iter++;
    }

    return [x1, iter];
}

function calcq(a, b) {
    let x = [];
    let y = [];
    for (var i = a; i < b; i += 0.01) {
        x.push(i);
        y.push(math.derivative('acos(0.5 - 0.25x)', 'x').eval({x: i}));
    }
    let q = math.max(y);
    return q;
}


function iteration(phin, x0, eps, q) {
    let x1 = phin(x0);
    let iter = 0;
    while (math.abs(x1 - x0) * q / (1 - q) > eps) {
        x0 = x1;
        x1 = phin(x0);
        iter++;
    }
    return [x1, iter];
}

function secant(fn, x0, x1 , eps){
    let x2 = x1 - fn(x1)*(x1 - x0)/(fn(x1) - fn(x0));
    let iter = 1;
    while( math.abs(x2 - x1) > eps ){
        x0 = x1;
        x1 = x2;
        x2 = x1 - fn(x1)*(x1 - x0)/(fn(x1) - fn(x0));
        iter++;
    }
    return [x2, iter];
}

function dichotomy(a, b, eps){
    let c;
    let iter = 0;
    while(b - a > 2 * eps){
        c = (a+b)/2;
        iter++;
        if( f(b) * f(c) < 0)
            a = c;
        else
            b = c;
        iter++;
    }
    return [(a + b)/2, iter>>1];
}

function main() {
    {
        //newton
        console.log('\n');
        console.log(' newton ');
        stream1.write(' newton \n');
        const x0 = 1.1;
        const a = 1;
        const b = 2;
        console.log('a = ' + a + '\n' + 'b = ' + b + '\n' + 'eps = ' + eps + ' \nx0 = ' + x0);
        console.log(newton(f, df, x0, eps)[0]);
        console.log('iteration = ', newton(f, df, x0, eps)[1]);
        console.log('\n');
        stream1.write('a = ' + a + '\n' + 'b = ' + b + '\n' + 'eps = ' + eps + ' \nx0 = ' + x0);
        stream1.write("\nx = " + newton(f, df, x0, eps)[0] + '\n');
        stream1.write('iteration = ' + newton(f, df, x0, eps)[1]);
        stream1.write('\n\n');
    }
    {
        //iteration
        console.log(' iteration ');
        stream1.write(' iteration \n');
        const a = 1;
        const b = 2;
        const x0 = 1.1;
        const q = calcq(a, b);

        console.log('a = ' + a + '\n' + 'b = ' + b + '\n' + 'eps = ' + eps + ' \nx0 = ' + x0);
        console.log(iteration(phi, x0, eps, q)[0]);
        console.log('iteration = ', iteration(phi, x0, eps, q)[1]);
        stream1.write('a = ' + a + '\n' + 'b = ' + b + '\n' + 'eps = ' + eps + ' \nx0 = ' + x0);
        stream1.write("\nx = " + iteration(phi, x0, eps, q)[0] + '\n');
        stream1.write('iteration = ' + iteration(phi, x0, eps, q)[1]);
    }
    //secant
    {
        console.log(' secant \n');
        stream1.write(' \nsecant \n');
        const a = 1;
        const b = 2;
        const x0 = 1.2;
        const x1 = 1.21;
        console.log('a = ' + a + '\n' + 'b = ' + b + '\n' + 'eps = ' + eps + ' \nx0 = ' + x0);
        console.log("x = " + secant(f, x0, x1,  eps)[0]);
        console.log('iteration = ' + secant(f, x0, x1, eps)[1]);
        stream1.write('a = ' + a + '\n' + 'b = ' + b + '\n' + 'eps = ' + eps + ' \nx0 = ' + x0 + '\nx1 = ' + x0 );
        stream1.write("\nx = " + secant(f, x0, x1,  eps)[0] + '\n');
        stream1.write('iteration = ' + secant(f, x0, x1, eps)[1]);
    }
    dichotomy
    {
        console.log(' \ndichotomy \n');
        stream1.write(' \ndichotomy \n');
        const a = 1;
        const b = 2;
        console.log('a = ' + a + '\n' + 'b = ' + b + '\n' + 'eps = ' + eps);
        stream1.write('a = ' + a + '\n' + 'b = ' + b + '\n' + 'eps = ' + eps);
        console.log("\nx = " + dichotomy(a, b,  eps)[0] + '\n');
        console.log('iteration = ' + dichotomy(a, b, eps)[1]);
        stream1.write("\nx = " + dichotomy(a, b,  eps)[0] + '\n');
        stream1.write('iteration = ' + dichotomy(a, b, eps)[1]);
    }
    return 0;
}

main();