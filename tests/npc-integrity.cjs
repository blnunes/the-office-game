const {test}=require('node:test');
const assert=require('node:assert/strict');
const D=require('../data.js');
const Game=require('../engine.js');
const signature=()=>D.npcs.map(({id,name,floor,job})=>({id,name,floor,job}));
const normalize=name=>name.normalize('NFD').replace(/\p{Diacritic}/gu,'').trim().replace(/\s+/g,' ').toLowerCase();

test('exatamente 70 NPCs e distribuição prevista nos sete andares',()=>{
 assert.equal(D.npcs.length,70);
 assert.deepEqual(Array.from({length:7},(_,f)=>D.npcs.filter(n=>n.floor===f+1).length),[16,14,12,10,8,6,4]);
 assert.equal(D.npcs.filter(n=>n.central).length,17);
});
test('IDs únicos, estáveis e compatíveis com os índices do save',()=>{
 assert.equal(new Set(D.npcs.map(n=>n.id)).size,70);
 D.npcs.forEach((n,i)=>assert.equal(n.id,i));
});
test('cada nome completo identifica uma única pessoa',()=>{
 const groups=new Map();
 for(const n of D.npcs){const key=normalize(n.name);groups.set(key,[...(groups.get(key)||[]),n.id]);}
 const duplicates=[...groups].filter(([,ids])=>ids.length>1);
 assert.deepEqual(duplicates,[],'Nomes completos duplicados: '+JSON.stringify(duplicates));
});
test('30 dias de conversa, descanso e restore não criam NPCs nem trocam relações',()=>{
 const initial=signature(); let g=new Game();
 for(let day=1;day<=30;day++){
  assert.equal(g.day,day);
  assert.equal(g.location(D.npcs[0]),1);
  g.talk(0,'listen');
  assert.equal(g.s.relations[0],Math.min(day*6,100));
  assert(g.s.relations.slice(1).every(value=>value===0));
  const before=JSON.parse(JSON.stringify(g.s));
  g=new Game(before.mode,JSON.parse(JSON.stringify(before)));
  assert.deepEqual(g.s,before);
  assert.deepEqual(signature(),initial);
  assert.equal(g.s.relations.length,70);
  g.nextMorning();
 }
});
test('agendas não colocam a mesma identidade em dois andares; visitantes retornam',()=>{
 let g=new Game();
 for(let day=0;day<3;day++)for(let minute=0;minute<1440;minute+=15){
  // Tempo controlado para cobrir toda a agenda; sem alterar população ou identidades.
  g.s.time=day*1440+minute;
  const active=Array.from({length:7},(_,f)=>D.npcs.filter(n=>g.location(n)===f+1));
  const ids=active.flat().map(n=>n.id);
  assert.equal(new Set(ids).size,ids.length);
  assert(ids.length<=70);
  for(const n of D.npcs){
   let expected=minute<n.start||minute>=n.end?0:n.floor;
   const visit=(D.visits[n.id]||[]).find(v=>minute>=v.from&&minute<v.to);if(expected&&visit)expected=visit.floor;else if(expected===1){const r=g.receptionRoster();if(!r.fixed.includes(n.id)&&n.id!==r.support&&!(n.id===r.visitor&&minute%60>=15&&minute%60<40))expected=0;}assert.equal(g.location(n),expected);
  }
 }
});
test('referências dos rivais correspondem à identidade do catálogo',()=>{
 const g=new Game();
 for(const rival of g.s.rivals)assert.equal(D.npcs[rival.id]?.name,rival.name,'Referência inválida do rival '+rival.name);
});
