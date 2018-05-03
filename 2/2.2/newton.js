var math = require('mathjs');

function f1(x,y){
  return math.multiply(0.1, math.pow(x,2)) + x + math.multiply(0.2, math.pow(y,2)) - 0.3;
}
// console.log(f1(0,0));
function f2(x,y){
  return math.multiply(0.2 ,  math.pow(x,2)) + y - math.multiply(0.1, math.multiply(x,y)) - 0.7;
}
// console.log(f2(0,0));
function df1dx(xp, yp){
  return math.derivative('0.1*x^2 + x + 0.2*y^2 - 0.3', 'x' ).eval({x:xp,y:yp});
}
function df1dy(xp, yp){
  return math.derivative('0.1*x^2 + x + 0.2*y^2 - 0.3', 'y' ).eval({x:xp,y:yp});
}
function df2dx(xp, yp){
  return math.derivative('0.2*x^2 + y - 0.1*x*y - 0.7','x').eval({x:xp, y:yp});
}
function df2dy(xp, yp){
  return math.derivative('0.2*x^2 + y - 0.1*x*y - 0.7','y').eval({x:xp, y:yp});
}
// console.log(df1dx(0,0) + ' ' + df1dy(0,0));
// console.log(df2dx(0,0) + ' ' + df2dy(0,0));
function jacobi(x,y){
  return [ [df1dx(x,y), df1dy(x,y)], [ df2dx(x,y), df2dy(x,y)] ];
}
// console.log(jacobi(0,0));

function newton(fn1, fn2, jac,x0 ,eps){
  let x1 = math.subtract(x0, math.multiply( math.inv(jac(x0[0],x0[1])), [ fn1(x0[0], x0[1]), fn2(x0[0], x0[1]) ] )  );
  while(math.norm( math.subtract(x1,x0), 'inf' ) > eps ){
      x0 = x1;
      x1 = math.subtract(x0, math.multiply( math.inv(jac(x0[0],x0[1])), [ fn1(x0[0], x0[1]), fn2(x0[0], x0[1]) ] )  );
      // console.log(x1);
  }
  return x1;
}
  
{//newton
  console.log(' newton ');
  let eps = 0.0000000000001;
  let x0 = [0.25, 0.75];
  console.log(newton(f1,f2,jacobi,x0,eps));  
}

function fi(x,y){
  return [( 0.3 - 0.1*x*x - 0.2*y*y ), ( 0.7 - 0.2*x*x + 0.1 * x * y) ]; 
}

function iteration(fin, x0, eps){
  let x1 = fin(x0[0], x0[1]);
  while(math.norm( math.subtract(x1,x0), 'inf' ) > eps){
    x0 = x1;
    x1 = fin(x0[0], x0[1]);
  }
  return x1;
}

{//iteration 
  console.log(' iteration ');
  let eps = 0.0000000000001;
  let x0 = [0.25, 0.75];
  console.log(iteration(fi, x0, eps));
}




