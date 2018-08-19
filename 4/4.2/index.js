const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const math = require("mathjs");
const fs = require("fs");
const readline = require('readline');
const numeric = require('numeric');
const os = require("os");
const stream1 = fs.createWriteStream("datapaste.txt");


let p_x;
let q_x = 1;
let f = 0;
let N = 5;
let x0 = 0.0;
let x1 = 0.2;
let x2 = 0.4;
let x3 = 0.6;
let x4 = 0.8;
let x5 = 1.0;
let h = 0.1;

function solve() {

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
