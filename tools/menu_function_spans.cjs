// One-time migration parser: use the Acorn version bundled with Node itself.
const fs = require('node:fs');
const bundled = process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'];
if (!bundled) throw new Error('Use Node 22 for the one-time source migration');
const mod = {exports:{}};
new Function('exports','module',bundled)(mod.exports,mod);
const text=fs.readFileSync(process.argv[2],'utf8');
const ast=mod.exports.parse(text,{ecmaVersion:'latest',sourceType:'script'});
const nodes=process.argv[3]==='bootstrap' ? ast.body[0].expression.callee.body.body : ast.body;
const index=i=>Array.from(text.slice(0,i)).length;
console.log(JSON.stringify(nodes.filter(n=>n.type==='FunctionDeclaration').map(n=>({name:n.id.name,start:index(n.start),end:index(n.end)}))));
