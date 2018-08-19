const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const math = require("mathjs");
const fs = require("fs");
const readline = require('readline');
const numeric = require('numeric');
const os = require("os");
const fileContent = fs.readFileSync("data.txt", "utf8");
const arr = fileContent.split(os.EOL);
const stream1 = fs.createWriteStream("datapaste.txt");
let y1 = [];
let y2 = [];
let arr_coef = [];

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
        arr_coef.push(func[i]);
    }
    for (let i = 0; i < x.length; i++) {
        res += func[i] * omega(pogr, x, i);
    }
    return res;
}


function P(xn, fn, porg) {
    let func = [];
    let result = 0;
    func[0] = fn(xn[0]);
    for (let i = 1; i < xn.length; i++) {
        func[i] = phin(xn, fn, i);
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

function phin(xn, fn, k) {
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

function main() {
    //lagrange
    console.log(' Lagrange ');
    let u = [];
    for (let i in x)
        u.push(lagrange(x, f, x[i]));
    console.log(u);
    console.log('L(' + X + ') = ' + lagrange(x, f, X));
    // console.log(math.eval(result1, {x: 5}))
    // newton
    console.log(' Newton ');
    let t = [];
    for (let i in x)
        t.push(P(x, f, x[i]));
    console.log(t)
    console.log('P(' + X + ') = ' + P(x, f, X));
    let ff = [];
    for (let i in x)
        ff.push(Math.log(x[i]));
    console.log(ff);
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    io.on('connection', function (socket) {
        io.emit('log', math.round(x, 2), u, t, ff);
    });

    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
}

main();

