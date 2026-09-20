const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../minigames.js');

test('proposta estratégica tem solução válida e soma mínimos corretamente',()=>{
  const m=M.create('strategy',1);
  [0,1,2].forEach(i=>M.act(m,i));
  assert.deepEqual(m.selected,[0,1,2]);
  assert.equal(m.items.slice(0,3).reduce((n,x)=>n+x.cost,0),6);
  assert.deepEqual([0,1,2].map(k=>m.selected.reduce((n,i)=>n+m.items[i].b[k],0)),[3,3,4]);
  M.act(m,'submit');
  assert.equal(m.status,'won');
});
