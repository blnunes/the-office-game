const {test}=require('node:test'),assert=require('node:assert/strict');
const Game=require('../engine.js');
test('proposta estratégica concluída continua contando depois da virada do dia',()=>{
  const g=new Game();g.s.rank=6;g.s.time=480;g.s.lastTaskOutcome={id:'strategy',won:true,quality:70};
  g.advance(1440);
  assert.equal(g.requirements().find(r=>r.label==='Proposta estratégica de qualidade').ok,true);
});
