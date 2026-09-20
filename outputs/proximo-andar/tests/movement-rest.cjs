const {play}=require('./helpers.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const D=require('../data.js'),Game=require('../engine.js'),S=require('../scene.js');

test('quatro direções, passos por distância e parada imediata contra parede',()=>{
 for(const [dx,dy,dir] of [[1,0,'right'],[-1,0,'left'],[0,1,'down'],[0,-1,'up']]){let b={x:480,y:320};S.move(b,dx,dy,.1);assert.equal(b.facing,dir);assert(b.moving);assert(Math.abs(b.stride-15)<.001);S.move(b,0,0,.1);assert(!b.moving);assert.equal(b.facing,dir)}
 let b={x:40,y:320};S.move(b,-1,0,.1);assert.equal(b.x,40);assert(!b.moving);assert.equal(b.stride,0);
});
test('velocidade diagonal normalizada e independente de 30/60/120 FPS',()=>{
 let results=[];for(let fps of [30,60,120]){let b={x:480,y:320};for(let i=0;i<fps;i++)S.move(b,0,1,1/fps);results.push(b.y)}for(let y of results)assert(Math.abs(y-470)<.001);
 let b={x:100,y:300};assert(Math.abs(S.move(b,1,1,.1)-15)<.001);
});
test('busca de caminho contorna mesas e não atravessa obstáculos',()=>{
 let from={x:480,y:490},to=S.gridPoint({x:120,y:180}),route=S.path(from,to);assert(route.length>0);let b={...from};for(let p of route){assert(!S.blocked(p.x,p.y));for(let i=0;i<300&&Math.hypot(p.x-b.x,p.y-b.y)>1;i++){let dist=Math.hypot(p.x-b.x,p.y-b.y);S.move(b,p.x-b.x,p.y-b.y,Math.min(1/60,dist/150));assert(!S.blocked(b.x,b.y))}}assert(Math.hypot(b.x-to.x,b.y-to.y)<2);
});
test('NPCs caminham de verdade, pausam em conversa e não duplicam no renderizador',()=>{
 let g=new Game(),w=new S.World();g.advance(90);w.update(g,0);const original=new Map([...w.people].map(([id,p])=>[id,{x:p.x,y:p.y}]));for(let i=0;i<2400;i++)w.update(g,1/60);assert([...w.people].some(([id,p])=>Math.hypot(p.x-(original.get(id)?.x||480),p.y-(original.get(id)?.y||140))>50));assert.equal(w.people.size,D.npcs.filter(n=>g.location(n)===1).length);
 let p=w.people.get(0),before={x:p.x,y:p.y};w.update(g,1,0);assert.equal(p.x,before.x);assert.equal(p.y,before.y);assert(!p.moving);
 g.go(2);for(let i=0;i<2400;i++)w.update(g,1/60);assert.equal(w.people.size,14);g.go(1);for(let i=0;i<2400;i++)w.update(g,1/60);assert.equal(w.people.size,D.npcs.filter(n=>g.location(n)===1).length);
});
test('retrato e sprite conservam aparência única e quatro desenhos distintos',()=>{
 assert.equal(new Set(D.npcs.map(n=>JSON.stringify(n.appearance))).size,70);
 let rendered=[];for(let dir of ['up','down','left','right']){let calls=[],c=new Proxy({},{get:(_,k)=>(...a)=>calls.push([k,...a]),set:()=>true});S.sprite(c,0,0,D.npcs[0].appearance,dir,12,true);rendered.push(JSON.stringify(calls))}assert.equal(new Set(rendered).size,4);
});
test('20h + oito horas de sono volta 08h; espera não concede sono extra',()=>{
 let g=new Game();g.advance(720);g.s.energy=10;g.s.fatigue=70;g.endDay(8);assert.equal(g.hour,480);assert.equal(g.day,2);assert.equal(g.s.energy,100);assert(Math.abs(g.s.fatigue-6)<.001);
 let h=new Game();h.advance(720);h.s.energy=10;h.s.fatigue=10;h.endDay(4);assert.equal(h.hour,480);assert(h.s.energy<100);assert.equal(h.s.fatigue,28);
});
test('madrugada tem motivo explícito de bloqueio; tarefa não cobra energia nem tempo',()=>{
 let g=new Game();g.advance(1200);let time=g.s.time,energy=g.s.energy;assert.match(g.workReason('bug'),/fechado/);assert.equal(play(g,'bug','segura'),false);assert.equal(g.s.time,time);assert.equal(g.s.energy,energy);
});

 test('save do cenário restaura posições, direção, passos e rotas sem compartilhar referências',()=>{
 let g=new Game(),w=new S.World();w.update(g,0);for(let i=0;i<120;i++)w.update(g,1/60);let state=w.snapshot(),restored=new S.World(state);assert.deepEqual(restored.snapshot(),state);restored.update(g,1/60);assert.deepEqual(w.snapshot(),state);assert.equal(new Set(restored.people.keys()).size,restored.people.size);
 });
