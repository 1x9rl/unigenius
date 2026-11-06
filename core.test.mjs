import assert from 'node:assert/strict';
import { solve } from '../.core-test/solver.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
close(Number(solve('mach',{velocity:'340',sound:'340'}).result),1);
close(Number(solve('compression',{v1:'500',v2:'50'}).result),10);
close(Number(solve('density',{mass:'10',volume:'2'}).result),5);
close(Number(solve('ideal-gas',{pressure:'101325',volume:'0.024465',temperature:'300'}).result),0.993817); // approx mol
close(Number(solve('heat',{mass:'2',cp:'1000',delta:'10'}).result),20000);
assert.throws(()=>solve('density',{mass:'1',volume:'0'}));
console.log('Core calculation checks passed (5 formulas + invalid input guard).');
