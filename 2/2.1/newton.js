var math = require("mathjs");
var fs = require("fs");


function f(x){
  return math.exp(2*x) + 3*x - 4;
}

function df(xp){
  return math.derivative('e^2x + 3*x - 4', 'x').eval({x:xp});
}

function fi(x){
  return math.log(4 - 3*x)/2;
}

function dichotomy(a, b, eps){
  let c;
  while(b - a > 2 * eps){
    c = (a+b)/2;
    if( f(b) * f(c) < 0)
      a = c;
    else
      b = c;
  }
  return (a + b)/2;
}

function newton( fn, dfn, x0 , eps ){
  let x1 = x0 - fn(x0)/dfn(x0);
  while(math.abs(x1 - x0)> eps){
    x0 = x1;
    x1 = x1 - fn(x0)/dfn(x0);
  }
  
  return x1;
}

function secant(fn, x0, x1 , eps){
  let x2 = x1 - fn(x1)*(x1 - x0)/(fn(x1) - f(x0)); 
  while( math.abs(x2 - x1) > eps ){
    x0 = x1;
    x1 = x2;
    x2 = x1 - fn(x1)*(x1 - x0)/(fn(x1) - f(x0));
  }

  return x2; 
}

function iteration( fin, x0 , eps ){
  let x1 = fin(x0);
  while( math.abs(x1 - x0) > eps){
    x0 = x1;
    x1 = fin(x0);
  }
  return x1;
}

console.log('');

{ // dichotomy
let a = 0.4;
let b = 0.6;
let eps = 0.0000001;

console.log(' dichotomy ' + '\n' + 'a = ' + a + ' b = ' + b + '\n' + 'x = ' +  dichotomy(a,b,eps) );
console.log('');
}

{//newton
  let x0 = 0.6;
  let eps = 0.0000001;

  console.log(' newton ' + '\n' + 'x0 = ' + x0 + ' eps = ' + eps + '\n' + newton(f, df, x0, eps));
  console.log('');
}

{//secant
  let x0 = 0.6;
  let x1 = 0.56;
  let eps = 0.0000001;

  console.log(' secant ' + '\n' + 'x0 = '+ x0 + ' x1 = ' + x1 + ' eps = ' + eps + '\n' + secant(f, x0, x1, eps ));
  console.log('');
}

{//iteration
  let x0 = 0.6;
  let eps = 0.0000001;

  console.log(' iteration ' + '\n' + 'x0 = '+ x0 + ' eps = ' + eps + '\n' + iteration(fi, x0, eps ));
  console.log('');
}