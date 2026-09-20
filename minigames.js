(function(root){
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function shuffle(a,r){return a.map(v=>({v,k:r()})).sort((a,b)=>a.k-b.k).map(x=>x.v)}
function create(type,seed=1,difficulty=1){const r=random(seed);let s={type,difficulty,status:'playing',mistakes:0,lives:3,round:0,selected:[],r};
if(type==='bug'){s.size=9+difficulty*3;s.target=Math.floor(r()*s.size);s.rounds=2+difficulty}
if(type==='review'){s.lives=5+Math.min(difficulty,3);s.cards=shuffle(Array.from({length:3+Math.min(difficulty,3)},(_,i)=>[i,i]).flat(),r);s.matched=[];s.open=[]}
if(type==='feature'){s.sequence=Array.from({length:3+difficulty},()=>Math.floor(r()*4));s.preview=true;s.cursor=0}
if(type==='incident'){s.tickets=shuffle(Array.from({length:3+difficulty},(_,i)=>i+1),r);s.cleared=[]}
if(type==='mentor'){s.steps=shuffle([0,1,2,3],r);s.cursor=0;s.rounds=difficulty}
if(type==='strategy'){s.budget=8;s.goal=3;s.items=[{cost:2,b:[2,0,1],icon:'⚙',name:'Automatizar'},{cost:2,b:[0,2,1],icon:'♧',name:'Capacitar'},{cost:2,b:[1,1,2],icon:'❧',name:'Otimizar recursos'},{cost:3,b:[3,0,0],icon:'↗',name:'Expandir'},{cost:3,b:[0,3,0],icon:'♥',name:'Contratar'},{cost:3,b:[0,0,3],icon:'☀',name:'Energia limpa'}];}
delete s.r;return s}
function fail(s){s.mistakes++;if(s.mistakes>=s.lives)s.status='lost'}
function act(s,value){if(s.status!=='playing')return s;
if(s.type==='bug'){if(value===s.target){s.round++;if(s.round>=s.rounds)s.status='won';else s.target=(s.target*7+3+s.round)%s.size}else fail(s)}
if(s.type==='review'){if(s.matched.includes(value)||s.open.includes(value)||!Number.isInteger(value)||value<0||value>=s.cards.length)return s;if(s.open.length===2)s.open=[];s.open.push(value);if(s.open.length===2){if(s.cards[s.open[0]]===s.cards[s.open[1]]){s.matched.push(...s.open);s.open=[];if(s.matched.length===s.cards.length)s.status='won'}else fail(s)}}
if(s.type==='feature'){if(value==='start'){s.preview=false;return s}if(s.preview)return s;if(value===s.sequence[s.cursor]){s.cursor++;if(s.cursor===s.sequence.length)s.status='won'}else fail(s)}
if(s.type==='incident'){if(s.cleared.includes(value))return s;let highest=Math.max(...s.tickets.filter((_,i)=>!s.cleared.includes(i)));if(s.tickets[value]===highest){s.cleared.push(value);if(s.cleared.length===s.tickets.length)s.status='won'}else fail(s)}
if(s.type==='mentor'){if(value===s.cursor){s.cursor++;if(s.cursor===4){s.round++;if(s.round>=(s.rounds||1))s.status='won';else s.cursor=0}}else fail(s)}
if(s.type==='strategy'){if(value==='submit'){let cost=s.selected.reduce((a,i)=>a+s.items[i].cost,0),b=[0,1,2].map(k=>s.selected.reduce((a,i)=>a+s.items[i].b[k],0));if(cost<=s.budget&&b.every(x=>x>=s.goal)){s.round++;if(s.round>=s.difficulty)s.status='won';else{s.selected=[];s.items=s.items.map(v=>({...v,b:[v.b[2],v.b[0],v.b[1]]}));s.items=s.items.slice(2).concat(s.items.slice(0,2));s.budget=8;}}else fail(s)}else if(Number.isInteger(value)&&s.items[value]){s.selected=s.selected.includes(value)?s.selected.filter(i=>i!==value):[...s.selected,value]}}
return s}
const api={create,act};root.MINI=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
