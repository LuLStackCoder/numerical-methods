'use strict'
const app      = require             ('express'               )()          ;
const http     = require             ('http'                  ).Server(app);
const io       = require             ('socket.io'             )(http)      ;
const math     = require             ('mathjs'                )            ;
const fs       = require             ('fs'                    )            ;
const stream   = fs.createWriteStream("data_output_runge.txt" )            ;
const readline = require             ('readline'              )            ;
const numeric  = require             ('numeric'               )            ;
const os       = require             ("os"                    )            ;
const opn      = require             ('opn'                   )            ;
const stream_graph   = fs.createWriteStream("../graph_runge.txt" )            ;



const f = (x, y, z) => z;
const g = (x, y, z) => (-4) * x * z - (4 * x * x + 2) * y;
const ex_func = (x) => (1 + x) * math.exp((-1) * x * x);

const k1 = (x, y, z, step) => step * f(x, y, z);
const l1 = (x, y, z, step) => step * g(x, y, z);

const k2 = (x, y, z, step) => step * f(x + 0.5 * step, y + 0.5 * k1(x,y,z,step), z + 0.5 * l1(x,y,z,step));
const l2 = (x, y, z, step) => step * g(x + 0.5 * step, y + 0.5 * k1(x,y,z,step), z + 0.5 * l1(x,y,z,step));

const k3 = (x, y, z, step) => step * f(x + 0.5 * step, y + 0.5 * k2(x,y,z,step), z + 0.5 * l2(x,y,z,step));
const l3 = (x, y, z, step) => step * g(x + 0.5 * step, y + 0.5 * k2(x,y,z,step), z + 0.5 * l2(x,y,z,step));

const k4 = (x, y, z, step) => step * f(x + step, y + k3(x,y,z,step), z + l3(x,y,z,step));
const l4 = (x, y, z, step) => step * g(x + step, y + k3(x,y,z,step), z + l3(x,y,z,step));

function runge(interval, step, st_point_y, st_point_z) {
  let a = interval[0];
  let b = interval[1];
  let n = (b - a) / step + 1;
  let result = [numeric.linspace(a,b,n), [], [] ];
  
  result[1].push(st_point_y);
  result[2].push(st_point_z);
  
  for(let i = 1; i < n; i++){
    let delta_y = ( k1(result[0][i - 1], result[1][i - 1], result[2][i - 1], step) 
    + 2 * k2(result[0][i - 1], result[1][i - 1], result[2][i - 1], step) 
    + 2 * k3(result[0][i - 1], result[1][i - 1], result[2][i - 1], step) 
    + k4(result[0][i - 1], result[1][i - 1], result[2][i - 1], step) ) / 6;
    
    let delta_z = ( l1(result[0][i - 1], result[1][i - 1], result[2][i - 1], step) 
    + 2 * l2(result[0][i - 1], result[1][i - 1], result[2][i - 1], step) 
    + 2 * l3(result[0][i - 1], result[1][i - 1], result[2][i - 1], step) 
    + l4(result[0][i - 1], result[1][i - 1], result[2][i - 1], step) ) / 6;
    
    result[1].push(result[1][i - 1] + delta_y);
    result[2].push(result[2][i - 1] + delta_z);
  }
  
  return result;
}

function calc_ex(start, end, step){

  let a = start;
  let b = end;
  let result = [];
  while(a < b){
    result.push(ex_func(a));
    a += step;
  }
  return result;
}
function main(start, end, step, start_point_y, start_point_z) {
  if(isNaN(start)){
    start = 0;
  }
  if(isNaN(end)){
    end = 1;
  }
  if(isNaN(step)){
    step = 0.1;
  }
  if(isNaN(start_point_y)){
    start_point_y = 1;
  }
  if(isNaN(start_point_z)){
    start_point_z = 1;
  }
  
  const output = runge([start, end], step, start_point_y, start_point_z);
  const ex = calc_ex(start, end, step);
  const deviation = math.abs(math.subtract(output[1], ex));
  const _deviation = math.norm(deviation, 'inf');
  
  console.log('y = ', output[1]);
  console.log('');
  console.log('ex = ', ex);
  console.log('');
  console.log('deviation = ',_deviation);
  
  
  stream.write(' y = ' + '\n')
  output[1].forEach( v => stream.write(v + '\n' ));
  output[1].forEach( v => stream_graph.write(v + '\n' ));
  stream.write('ex = ' + '\n');
  ex.forEach( v => stream.write(v + '\n'));
  stream.write('deviation = ' + '\n');
  deviation.forEach( v => stream.write( v + '\n'));
  
  return [output[0], output[1], ex];
}

const start = Number(process.argv[2]);
const end = Number(process.argv[3]);
const step = Number(process.argv[4]);
const start_point_y = Number(process.argv[5]);
const start_point_z = Number(process.argv[6]);

let output = main(start, end, step, start_point_y, start_point_z );

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
  io.emit('log', output[0], output[1], output[2] );
});


http.listen(3000, function () {
  console.log('listening on *:3000');
});

opn('http://localhost:3000');