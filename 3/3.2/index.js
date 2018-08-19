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
let value = process.argv[2];
if (value === undefined)
    value = 0.8;


function getMatrix(arr) {
    let x = [];
    let y = [];
    arr.forEach(function (v) {
        if (v !== arr[arr.length - 1])
            x = v.split(",");
        else
            y = v.split(",");
    });
    x = math.number(x);
    y = math.number(y);
    return [x, y];
}


function tma(matrix, d) {
    matrix = math.transpose(matrix);
    let a = matrix[0];
    let b = matrix[1];
    let c = matrix[2];
    let p = [-c[0] / b[0]];
    let q = [d[0] / b[0]];
    let n = d.length;
    let x = math.zeros(n + 1)._data;
    for (let i = 1; i < n; i++) {
        p.push(-c[i] / (b[i] + a[i] * p[i - 1]));
        q.push((d[i] - a[i] * q[i - 1]) / (b[i] + a[i] * p[i - 1]));
    }
    for (let i = n - 1; i >= 0; i--) {
        x[i] = p[i] * x[i + 1] + q[i];
    }
    x.pop();
    return x;
}


function spline(x, y) {
    let n = x.length;
    let h = [];
    let tmp = [];
    for (let i = 1; i < n; i++) {
        h.push(x[i] - x[i - 1]);
    }

    let matrix = [[0, 2 * (h[0] + h[1]), h[1]]];
    let b = [3 * ((y[2] - y[1]) / h[1] - (y[1] - y[0]) / h[0])];

    for (let i = 1; i < n - 3; i++) {
        tmp = [h[i], 2 * (h[i] + h[i + 1]), h[i + 1]];
        matrix.push(tmp);
        b.push(3 * ((y[i + 2] - y[i + 1]) / h[i + 1] - (y[i + 1] - y[i]) / h[i]));
    }

    matrix.push([h[h.length - 2], 2 * (h[h.length - 2] + h[h.length - 1]), 0]);
    b.push(3 * ((y[y.length - 1] - y[y.length - 2]) / h[h.length - 1] - (y[y.length - 2] - y[y.length - 3]) / h[h.length - 2]));

    let c = tma(matrix, b);
    let a = [];
    b = [];
    let d = [];
    c.unshift(0);

    for (let i = 1; i < n; i++) {
        a.push(y[i - 1])
        if (i < n - 1) {
            d.push((c[i] - c[i - 1]) / (3 * h[i - 1]));
            b.push((y[i] - y[i - 1]) / h[i - 1] - h[i - 1] * (c[i] + 2 * c[i - 1]) / 3);
        }
    }

    b.push((y[y.length - 1] - y[y.length - 2]) / h[h.length - 1] - 2 * h[h.length - 1] * c[c.length - 1] / 3);
    d.push((y[y.length - 1] - y[y.length - 2]) / h[h.length - 1] - 2 * h[h.length - 1] * c[c.length - 1] / 3);
    return [a, b, c, d];
}


function polyval(x0, x, k, coef) {
    let a = coef[0];
    let b = coef[1];
    let c = coef[2];
    let d = coef[3];

    let tmp = (x0 - x[k]);
    return a[k] + b[k] * tmp + c[k] * math.pow(tmp, 2) + d[k] * math.pow(tmp, 3);
}


function pol(x, x_n, coef) {
    let k = 0;
    let lineSegment = divideLine(x);

    for (let i = 0; i < lineSegment.length; i++) {
        if (lineSegment[i][0] <= x_n && x_n <= lineSegment[i][1]) {
            break;
        }
        k++;
    }
    return polyval(x_n, x, k, coef)
}


function divideLine(vec) {
    let segment = [];
    for (let i = 1; i < vec.length; i++) {
        segment.push([vec[i - 1], vec[i]]);
    }
    return segment;
}


function main() {
    let array = getMatrix(arr);
    let x = array[0];
    let y = array[1];
    let coef = spline(x, y);

    let t = [];
    let y_value = pol(x, value, coef);

    for (let i = 0; i < x.length; i++) {
        t.push(pol(x, x[i], coef));
    }

    console.log("y(x): " + t);
    console.log("f(" + value + ") = " + y_value);

    stream1.write("y(x): " + t + "\n\n");
    stream1.write("x: " + x + "\n");
    stream1.write("y: " + y + "\n\n");
    stream1.write("a: " + math.round(coef[0], 4) + "\n");
    stream1.write("b: " + math.round(coef[1], 4) + "\n");
    stream1.write("c: " + math.round(coef[2], 4) + "\n");
    stream1.write("d: " + math.round(coef[3], 4) + "\n\n");
    stream1.write("f(" + value + ") = " + y_value);

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    io.on('connection', function (socket) {
        io.emit('log', math.round(x, 2), t, y);
    });

    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
}

main();