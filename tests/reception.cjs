const {test}=require('node:test'),assert=require('node:assert/strict');
const Game=require('../engine.js'),D=require('../data.js'),S=require('../scene.js');
test('recepção limita presença habitual e atribui postos únicos ao plantão',()=>{
 let g=new Game();for(let day=0;day<7;day++)for(let minute=480;minute<1080;minute+=5){
  g.s.time=day*1440+minute;
  const present=D.npcs.filter(n=>g.location(n)===1);
  // O quadro rotativo da recepção nunca passa de 4; visitas nomeadas de outros andares (ex.: Eva/Artur no almoço) não contam nessa cota.
  const residents=present.filter(n=>n.floor===1);assert(residents.length<=4);
  const staff=residents.filter(n=>n.id!==g.receptionRoster().visitor).map(n=>g.npcView(n));
  assert.equal(new Set(staff.map(n=>n.slot)).size,staff.length);
  for(const n of staff)assert(!S.blocked(S.home(n).x,S.home(n).y,1));
 }
});
test('com relógio correndo, colegas chegam ao café, conversam e voltam ao trabalho',()=>{
 const g=new Game(),w=new S.World();g.s.story.events.reception='declined';g.s.time=660;
 let coffee=false,conversation=false,returned=false;
 for(let i=0;i<3600;i++){g.advance(.05);w.update(g,.05);
  const staff=[...w.people.values()].filter(p=>p.id===1||p.id===g.receptionRoster().support);
  coffee ||= staff.some(p=>p.coffee&&p.arrived);
  conversation ||= staff.some(p=>p.partner!==null);
  returned ||= conversation&&staff.some(p=>p.arrived&&!p.coffee&&p.activity.includes('suporte'));
 }
 assert(coffee,'chegada ao café');assert(conversation,'conversa presencial');assert(returned,'retorno ao posto');
});
