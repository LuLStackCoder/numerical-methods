const math = require("mathjs");
const fs = require("fs");
const readline = require('readline');
const numeric = require('numeric');
const os = require("os");
const fileContent = fs.readFileSync("data.txt", "utf8");
const arr = fileContent.split(os.EOL);
const stream1 = fs.createWriteStream("datapaste.txt");


function getMatrix(arr) {
    let x = [];
    let y;
    arr.forEach(function (v) {
        if (v !== arr[arr.length - 1])
            x = v.split(",");
        else
            y = v.split(",")[0];
    });
    x = math.number(x);
    y = math.number(y);
    return [x, y];
}

let array = getMatrix(arr);

const x = array[0];
const X = array[1];

function f(x) {
    return math.log(x);
}

function omega(x, xn, wt) {
    let res = 1;
    for (let i = 0; i < xn.length; i++) {
        if (i != wt)
            res *= (x - xn[i]);
    }
    return res;
}

function lagrange(x, fn, pogr) {
    let func = [];
    let ome = [];
    let res = 0;
    for (let i = 0; i < x.length; i++) {
        func[i] = fn(x[i]);
        ome[i] = omega(x[i], x, i);
        func[i] = func[i] / ome[i];
    }

    if (pogr == undefined) {// вывод
        let str = 'L(x) = ';
        str += math.round(func[0], 5) + '*';
        for (let i = 0; i < x.length; i++) {
            if (i != 0 && func[i] > 0)
                str += '+' + math.round(func[i], 5) + '*';
            else if (i != 0) {
                str += math.round(func[i], 5) + '*';
            }
            for (let j = 0; j < x.length; j++) {
                if (i != j)
                    str += '(x - ' + x[j] + ')';
            }
            str += ' ';

        }
        return str;
    }

    for (let i = 0; i < x.length; i++) {
        res += func[i] * omega(pogr, x, i);
    }
    return res;
}

{//lagrange
    console.log(' lagrange ');
    console.log(lagrange(x, f));
    console.log('L(' + X + ') = ' + lagrange(x, f, X));
    stream1.write(lagrange(x, f) + '\n\n');
    stream1.write('L(' + X +') = ' + lagrange(x, f, X) + '\n\n');
}


function fin(xn, fn, k) {
    let result = 0;
    let divisor;
    for (let i = 0; i <= k; i++) {
        divisor = 1;

        for (let j = 0; j <= k; j++) {
            if (i != j)
                divisor *= (xn[i] - xn[j]);
        }

        result += fn(xn[i]) / divisor;
    }
    return result;
}

function P(xn, fn, porg) {
    let func = [];
    let result = 0;
    func[0] = fn(xn[0]);
    for (let i = 1; i < xn.length; i++) {
        func[i] = fin(xn, fn, i);
    }

    if (porg == undefined) {
        let str = 'P(x) = ';
        str += func[0];
        for (let i = 0; i < xn.length; i++) {
            if (i != 0 && func[i] > 0)
                str += ' + ' + func[i];
            else if (i != 0)
                str += ' - ' + math.abs(func[i]);
            for (let j = 0; j < i; j++) {
                if (xn[j] != 0)
                    str += '(x - ' + xn[j] + ')';
                else
                    str += 'x';
            }
        }
        return str;
    }

    result = func[0];
    let mn = 0;
    for (let i = 1; i < xn.length; i++) {
        mn = 1;
        for (let j = 0; j < i; j++) {
            mn *= (porg - xn[j]);

        }
        result += func[i] * mn;
    }
    return result;
}

{ // newton
    console.log(' newton ');
    console.log(P(x, f));
    console.log('P(' + X + ') = ' + P(x, f, X));
    stream1.write(P(x, f) + '\n\n');
    stream1.write('P(' + X + ') = ' + P(x, f, X));
}