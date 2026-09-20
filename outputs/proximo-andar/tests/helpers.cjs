function arrive(g,id){let t=g.tasks.find(t=>t.id===id);if(!t||!g.go(t.floor))return false;const S=require('../scene.js');let o=g.taskPlace(t);Object.assign(g.s,S.gridPoint({x:o.x+o.w/2,y:o.y+o.h+25},t.floor));return true}
function play(g,id,a){arrive(g,id);if(g.s.meeting){const S=require('../scene.js'),w=new S.World();for(let i=0;i<2400;i++)w.update(g,.05);}if(!g.startTask(id,a))return false;solve(g);return g.s.lastTaskOutcome.won}
function solve(g){let memo=new Map(),sequence=null,loops=0;while(g.s.activeTask&&loops++<150){let m=g.s.activeTask.mini,v;
 if(m.type==='bug')v=m.target;
 if(m.type==='review'){
  // Memoriza apenas cartas que a interface revelou. Não lê cartas fechadas.
  for(let i of [...m.open,...m.matched])memo.set(i,m.cards[i]);
  if(m.open.length===1){let i=m.open[0];v=[...memo].find(([j,x])=>j!==i&&!m.matched.includes(j)&&x===memo.get(i))?.[0];if(v===undefined)v=m.cards.findIndex((_,j)=>!m.matched.includes(j)&&!m.open.includes(j)&&!memo.has(j));if(v<0)v=m.cards.findIndex((_,j)=>!m.matched.includes(j)&&!m.open.includes(j));}
  else {let eligible=[...memo].filter(([i])=>!m.matched.includes(i));let pair=eligible.find(([i,x])=>eligible.some(([j,y])=>j!==i&&x===y)&&!m.open.includes(i));v=pair?.[0];if(v===undefined)v=m.cards.findIndex((_,j)=>!m.matched.includes(j)&&!m.open.includes(j)&&!memo.has(j));if(v<0)v=m.cards.findIndex((_,j)=>!m.matched.includes(j)&&!m.open.includes(j));}
 }
 if(m.type==='feature'){if(m.preview){sequence=[...m.sequence];v='start'}else v=sequence[m.cursor]}
 if(m.type==='incident'){let vals=m.tickets.map((x,i)=>m.cleared.includes(i)?-1:x);v=vals.indexOf(Math.max(...vals))}
 if(m.type==='mentor')v=m.cursor;
 if(m.type==='strategy'){let solution;for(let bits=0;bits<64;bits++){let ids=m.items.map((_,i)=>i).filter(i=>bits&(1<<i));if(ids.reduce((s,i)=>s+m.items[i].cost,0)<=m.budget&&[0,1,2].every(k=>ids.reduce((s,i)=>s+m.items[i].b[k],0)>=m.goal)){solution=ids;break}}v=solution.find(i=>!m.selected.includes(i));if(v===undefined)v='submit';}
 g.miniMove(v);
 }if(loops>=150)throw Error('Minigame não terminou');}
module.exports={play,solve,arrive};
