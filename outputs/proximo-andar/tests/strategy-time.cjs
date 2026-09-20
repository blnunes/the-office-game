const {test}=require('node:test'),assert=require('node:assert/strict');
const Game=require('../engine.js');
test('proposta estratégica não começa tarde demais para terminar no expediente',()=>{
  const g=new Game();g.s.rank=6;g.s.time=19*60;g.s.energy=100;g.workflow.stage=3;
  assert.match(g.workReason('strategy'),/tempo útil/);
  assert.equal(g.startTask('strategy','colaborativa'),false);
  assert.equal(g.s.activeTask,undefined);
});
