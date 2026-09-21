(function(root){
let activeFloor=2;const D=()=>root.DATA;const layout=f=>D().layouts[(f||activeFloor)-1];function setFloor(f){activeFloor=f}
function blocked(x,y,f=activeFloor){return x<40||x>920||y<118||y>548||layout(f).objects.some(o=>x>o.x-12&&x<o.x+o.w+12&&y>o.y-10&&y<o.y+o.h+8)}
// Uma célula "livre" (não só não-bloqueada) tem uma folga mínima ao redor — evita escolher rotas ou destinos
// exatamente em cima de uma fronteira de mobília, onde uma pessoa a pé (que se move em linha contínua, não em saltos
// de grelha) fica presa a poucos pixels de entrar na área bloqueada mesmo sem nunca "atravessar" nada.
function clear(x,y,f=activeFloor){return !blocked(x,y,f)&&!blocked(x-6,y,f)&&!blocked(x+6,y,f)&&!blocked(x,y-6,f)&&!blocked(x,y+6,f)}
function gridPoint(point,f=activeFloor,occupied=[],clearance=30){let best=null,score=Infinity;for(let y=120;y<=540;y+=20)for(let x=40;x<=920;x+=20){let d=(x-point.x)**2+(y-point.y)**2;if(d<score&&clear(x,y,f)&&occupied.every(p=>Math.hypot(p.x-x,p.y-y)>=clearance)){score=d;best={x,y}}}return best||{x:480,y:140}}
function safe(point,f=activeFloor){return clear(point.x,point.y,f)?{x:point.x,y:point.y}:gridPoint(point,f)}
function facing(dx,dy,previous='down'){return !dx&&!dy?previous:Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up'}
function move(body,dx,dy,dt,speed=150,people=[]){let len=Math.hypot(dx,dy),distance=0;if(len){body.facing=facing(dx,dy,body.facing);let steps=Math.max(1,Math.ceil(dt*speed/5));for(let i=0;i<steps;i++){let x=body.x+dx/len*speed*dt/steps,y=body.y+dy/len*speed*dt/steps,oldX=body.x,oldY=body.y;if(!blocked(x,body.y)&&people.every(p=>p===body||Math.hypot(x-p.x,body.y-p.y)>=24))body.x=x;if(!blocked(body.x,y)&&people.every(p=>p===body||Math.hypot(body.x-p.x,y-p.y)>=24))body.y=y;distance+=Math.hypot(body.x-oldX,body.y-oldY)}}body.moving=distance>.01;body.stride=(body.stride||0)+distance;return distance}
// Oito direções (com guarda contra cortar quinas) em vez de só 4 — rotas deixam de subir em "escada" e ficam mais diretas, menos filas de correções de eixo.
const NEIGHBORS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function path(from,to,people=[]){to=gridPoint(to);let candidates=[];for(let y=120;y<=540;y+=20)for(let x=40;x<=920;x+=20)if(clear(x,y)&&Math.hypot(x-from.x,y-from.y)<85)candidates.push({x,y});candidates.sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y));let origin=candidates.find(q=>{let probe={...from},d=Math.hypot(q.x-from.x,q.y-from.y);move(probe,q.x-from.x,q.y-from.y,d/150,150,people);return Math.hypot(probe.x-q.x,probe.y-q.y)<.1;})||gridPoint(from,activeFloor,people);let grid=20,start=[origin.x/grid,origin.y/grid],end=[to.x/grid,to.y/grid],key=p=>p.join(','),queue=[start],prev=new Map([[key(start),null]]),found=false;for(let i=0;i<queue.length;i++){let p=queue[i];if(key(p)===key(end)){found=true;break}for(let d of NEIGHBORS){if(d[0]&&d[1]&&(blocked((p[0]+d[0])*grid,p[1]*grid)||blocked(p[0]*grid,(p[1]+d[1])*grid)))continue;let q=[p[0]+d[0],p[1]+d[1]],k=key(q);if(!prev.has(k)&&clear(q[0]*grid,q[1]*grid)&&people.every(b=>Math.hypot(q[0]*grid-b.x,q[1]*grid-b.y)>=26)){prev.set(k,p);queue.push(q)}}}if(!found)return [];let route=[],p=end;while(key(p)!==key(start)){route.unshift({x:p[0]*grid,y:p[1]*grid});p=prev.get(key(p))}route.unshift(origin);return route}
// Só desvia quando não existe caminho direto agora (evita jogar fora uma rota boa por um desvio ao acaso) e nunca desfaz
// o desvio anterior no ciclo seguinte (era a causa do "direita esquerda direita esquerda": o desvio era sorteado de novo
// a cada tentativa). Presa por tempo suficiente, a pessoa larga o corredor lotado e anda até a célula livre mais próxima.
function unstick(p,people){p.stuckStreak=(p.stuckStreak||0)+1;let fresh=path(p,p.destination,people);if(fresh.length){p.route=fresh;p.stuckStreak=0;p.lastDetour=null;return}const opposite={r:'l',l:'r',d:'u',u:'d'};let alternatives=[{x:p.x+70,y:p.y,dir:'r'},{x:p.x-70,y:p.y,dir:'l'},{x:p.x,y:p.y+70,dir:'d'},{x:p.x,y:p.y-70,dir:'u'}].filter(q=>clear(q.x,q.y)&&q.dir!==opposite[p.lastDetour]&&people.every(b=>Math.hypot(q.x-b.x,q.y-b.y)>=26));alternatives.sort((a,b)=>Math.hypot(a.x-p.destination.x,a.y-p.destination.y)-Math.hypot(b.x-p.destination.x,b.y-p.destination.y));let detour=alternatives[0];if(detour){p.lastDetour=detour.dir;p.route=path(p,detour,people).concat(path(detour,p.destination,people));}if(p.stuckStreak>3){let rescue=people.filter(b=>b.arrived||b.moving);let escape=gridPoint(p,activeFloor,rescue,26);p.route=path(p,escape,rescue).concat(path(escape,p.destination,rescue));p.stuckStreak=0;p.lastDetour=null;}}
function home(n){let p=layout(n.floor).seats[n.slot];return safe({x:p[0],y:p[1]},n.floor)}
function coffeePoint(f=activeFloor){let o=layout(f).objects.find(o=>o.type==='coffee');return o?gridPoint({x:o.x+o.w/2,y:o.y+o.h+28},f):null}
function destination(n,time,visit){let hour=time%1440,h=home(n);if((n.id===15||n.id===31)&&activeFloor===3&&hour>=900&&hour<945)return {x:n.id===15?410:460,y:350,activity:'articulando uma candidatura',chat:n.id===15?'Nosso nome primeiro.':'E o crédito dele?'};
// Só as duas visitas de almoço nomeadas (Eva, Artur) vão até o café da recepção — não o andar inteiro de executivos.
if(visit&&(n.id===61||n.id===67)&&hour>=720&&hour<810)return {...coffeePoint(),activity:'em pausa para café',coffee:true};
if(visit)return {...safe({x:350+(n.id%5)*100,y:505}),activity:(D().visits[n.id]||[]).find(v=>hour>=v.from&&hour<v.to)?.reason||'encontrando outras equipes'};const next=(D().visits[n.id]||[]).find(v=>hour>=v.from-8&&hour<v.from);if(next)return {x:480,y:140,activity:'indo ao andar '+next.floor};
// Two short, staggered breaks. Most of the day belongs to the assigned workstation.
let first=570+(n.slot%7)*18,second=870+(n.slot%6)*20,isBreak=(hour>=first&&hour<first+18)||(hour>=second&&hour<second+18);if(n.id===0)isBreak=hour>=750&&hour<770;
if(!isBreak)return {...h,activity:n.id===0?'recebendo visitantes':n.floor===3?'monitorando serviços':n.floor>=4?'planejando com a equipe':'trabalhando'};
let coffee=layout().objects.find(o=>o.type==='coffee')||layout().objects.find(o=>o.type==='sofa');let spot=coffee?{x:coffee.x+coffee.w/2,y:coffee.y+coffee.h+28}:{x:640,y:510};
// Havendo mesinha junto à máquina, a pausa é sentada à mesa — não de pé ao lado do balcão.
// O raio de 90px mantém quem tem compromisso marcado ao alcance da máquina.
let seats=layout().objects.filter(o=>o.type==='cafetable').flatMap(chairSeats).filter(v=>Math.hypot(v.x-spot.x,v.y-spot.y)<90);
if(seats.length)spot=seats[n.slot%seats.length];
return {...safe(spot),activity:'em pausa para café',coffee:true};}
class World{
// Cada andar guarda o seu próprio Map de posições (this.floors), não só a planta ativa — trocar de andar e voltar
// retoma de onde ficou, em vez de reiniciar a animação de chegada pelo elevador todas as vezes.
constructor(saved){this.floors={};if(saved?.navigation===4&&saved.floors){for(const f in saved.floors)this.floors[f]=new Map(JSON.parse(JSON.stringify(saved.floors[f])));}else if(saved?.people){this.floors[saved.floor||0]=new Map(JSON.parse(JSON.stringify(saved.people)));if(saved.navigation!==3)for(let p of this.floors[saved.floor||0].values()){p.goal='';p.route=[];p.requestKey='';}}this.floor=saved?.floor||0;this.people=this.floors[this.floor]||(this.floors[this.floor]=new Map());this.queueClock=0;this.nextArrival=0;}
snapshot(){let floors={};for(const f in this.floors)floors[f]=JSON.parse(JSON.stringify([...this.floors[f]]));return {navigation:4,floor:this.floor,floors}}
update(game,dt,pausedId=null){this.queueClock+=dt;setFloor(game.s.floor);if(this.floor!==game.s.floor){this.floor=game.s.floor;this.people=this.floors[this.floor]||(this.floors[this.floor]=new Map());this.nextArrival=this.queueClock;}const visible=D().npcs.filter(n=>game.location(n)===this.floor).sort((a,b)=>Game.noise(a.id,game.day,19)-Game.noise(b.id,game.day,19)).map(n=>game.npcView(n)),ids=new Set(visible.map(n=>n.id));for(let id of this.people.keys())if(!ids.has(id))this.people.delete(id);for(const n of visible){let p=this.people.get(n.id);if(!p){if(this.queueClock<this.nextArrival)continue;this.nextArrival=this.queueClock+.45+Game.noise(n.id,game.day,92)*.7;
// Elevador é para subir entre andares; o térreo (andar 1) tem gente entrando pela porta da frente, embaixo.
let h=this.floor===1?{x:480,y:520}:{x:480,y:140};h=gridPoint(h,this.floor,[game.s,...this.people.values()]);p={...h,id:n.id,facing:'down',stride:0,moving:false,route:[],goal:'',activity:'chegando'};this.people.set(n.id,p)}if(blocked(p.x,p.y)||[game.s,...this.people.values()].some(q=>q!==p&&Math.hypot(q.x-p.x,q.y-p.y)<23.9)){Object.assign(p,gridPoint(p,this.floor,[game.s,...this.people.values()].filter(q=>q!==p)));p.goal='';p.requestKey=''}if(n.id===pausedId){p.moving=false;p.facing=facing(game.s.x-p.x,game.s.y-p.y);continue}let routine=game.routine(n),dest;if(n.floor===this.floor){let coffee=coffeePoint();dest=routine.onBreak&&coffee?{...coffee,coffee:true,activity:'em pausa para café'}:{...home(n),activity:n.floor===1?(n.id===0?'recebendo visitantes':n.id===1?'conferindo solicitações de operações':n.slot===2?'atendendo chamados de suporte':'aguardando atendimento'):routine.chief?'supervisionando a seção':'trabalhando'};if(n.floor!==1&&routine.chief&&coffee&&Math.floor(game.hour)%45<12)dest={...coffee,activity:'verificando as pausas da seção'};}else dest=destination(n,game.s.time,true);let appointment=game.s.appointments.find(a=>a.id===n.id&&!a.done&&game.s.time>=a.at-10&&game.s.time<=a.at+45);if(appointment)dest={...coffeePoint(),coffee:true,activity:'esperando você para o café'};let meeting=game.s.meeting;if(meeting&&meeting.day===game.day&&meeting.invited.includes(n.id)&&game.s.time>=meeting.readyAt){let task=game.tasks?.find(t=>t.id===meeting.id);if(task){let o=game.taskPlace(task);dest={...gridPoint({x:o.x+o.w/2,y:o.y+o.h+35}),activity:"aguardando a reunião"};}}let story=game.storyOffer?.();if(!appointment&&!meeting?.invited.includes(n.id)&&story&&story.npc===n.id&&(!game.s.story?.events?.[story.id]||game.s.story?.events?.[story.id]==='done')){let distance=Math.hypot(p.x-game.s.x,p.y-game.s.y);if(distance<58)p.waitingForPlayer=true;if(distance>90)p.waitingForPlayer=false;if(p.waitingForPlayer){p.route=[];p.moving=false;p.facing=facing(game.s.x-p.x,game.s.y-p.y);dest={x:p.x,y:p.y,activity:'quer falar com você'};}else{if(!p.approachAnchor||Math.hypot(p.approachAnchor.x-game.s.x,p.approachAnchor.y-game.s.y)>60){p.approachAnchor={x:game.s.x,y:game.s.y};let angle=Math.atan2(p.y-game.s.y,p.x-game.s.x);p.approachTarget=gridPoint({x:game.s.x+Math.cos(angle)*48,y:game.s.y+Math.sin(angle)*48});}dest={...p.approachTarget,activity:'quer falar com você'};}}else{p.waitingForPlayer=false;p.approachAnchor=null;}
let requestKey=Math.round(dest.x/20)+','+Math.round(dest.y/20)+':'+dest.activity;if(requestKey!==p.requestKey){let reserved=[...this.people.values()].filter(v=>v.id!==p.id&&v.destination).map(v=>v.destination);p.destination=gridPoint(dest,this.floor,[game.s,...reserved],60);p.requestKey=requestKey;p.goal=p.destination.x+','+p.destination.y;p.route=p.waitingForPlayer?[]:path(p,p.destination);p.bestDist=Infinity;p.stuckTime=0;}p.plannedActivity=dest.activity;p.coffee=!!dest.coffee;p.plannedChat=dest.chat;p.chat=null;
// A body can wiggle a pixel or two every frame near a crowded chokepoint, which keeps resetting
// blockedFor/stuckStreak forever without ever really getting closer. Track genuine progress toward
// the destination separately, so unstick() can still escalate to its no-nonsense rescue route.
let dNow=p.destination?Math.hypot(p.x-p.destination.x,p.y-p.destination.y):0;if(dNow<(p.bestDist??Infinity)-4){p.bestDist=dNow;p.stuckTime=0}else if(!p.waitingForPlayer)p.stuckTime=(p.stuckTime||0)+dt;
let point=p.route[0];if(point&&dt>0){let dx=point.x-p.x,dy=point.y-p.y,dist=Math.hypot(dx,dy),speed=38+n.id%7;if(dist<1){p.route.shift();p.moving=p.route.length>0}else{let people=[game.s,...this.people.values()].filter(q=>q!==p);let moved=move(p,dx,dy,Math.min(dt,dist/speed),speed,people);if(moved<.01)p.blockedFor=(p.blockedFor||0)+dt;else{p.blockedFor=0;p.stuckStreak=0;p.lastDetour=null;}if(p.blockedFor>.7){p.blockedFor=0;if(p.stuckTime>3)p.stuckStreak=4;unstick(p,people);}}}else if(dt>0){p.moving=false;if(!p.waitingForPlayer&&p.destination&&dNow>3){p.blockedFor=(p.blockedFor||0)+dt;if(p.blockedFor>.7){p.blockedFor=0;if(p.stuckTime>3)p.stuckStreak=4;unstick(p,[game.s,...this.people.values()].filter(q=>q!==p));}}}}
if(game.s.meeting){let m=game.s.meeting,t=game.tasks?.find(t=>t.id===m.id);if(t&&t.floor===this.floor){let o=game.taskPlace(t);m.present=m.invited.filter(id=>{let p=this.people.get(id);return p&&!p.route.length&&Math.hypot(p.x-(o.x+o.w/2),p.y-(o.y+o.h+35))<210;});}}
// Activities describe arrival, never just intent. Dialogue requires a nearby partner.
for(let p of this.people.values()){let arrived=p.destination&&Math.hypot(p.x-p.destination.x,p.y-p.destination.y)<3;p.arrived=!!arrived;if(arrived&&!p.coffee)p.facing=p.id===0?'down':'up';p.activity=arrived?p.plannedActivity:p.coffee?'indo à máquina de café':'a caminho';p.chat=null;p.partner=null;}
if(dt>0){let sim=game.society();for(let p of this.people.values()){if(p.coffee&&p.arrived)sim.people[p.id].breakMinutes+=dt;}let chief=this.people.get(game.sectionChief(this.floor));if(chief)for(let p of this.people.values()){let state=sim.people[p.id],key=game.day+':pause:'+p.id;if(p.id!==chief.id&&p.coffee&&p.arrived&&state.breakMinutes>40&&Math.hypot(chief.x-p.x,chief.y-p.y)<140&&!sim.choices[key]){sim.choices[key]=true;state.prestige=Math.max(0,state.prestige-3);game.log(D().npcs[chief.id].name+' registrou pausa excessiva de '+D().npcs[p.id].name+': prestígio −3.');}}}let available=[...this.people.values()].filter(p=>p.arrived&&p.id!==pausedId);
for(let p of available){if(p.partner!==null)continue;let other=available.find(q=>q.id!==p.id&&q.partner===null&&Math.hypot(q.x-p.x,q.y-p.y)<85&&((p.coffee&&q.coffee)||(p.plannedChat&&q.plannedChat)||game.society().people[p.id].anger>0));if(!other)continue;p.partner=other.id;other.partner=p.id;p.facing=facing(other.x-p.x,other.y-p.y);other.facing=facing(p.x-other.x,p.y-other.y);p.activity='conversando com '+D().npcs[other.id].name;other.activity='conversando com '+D().npcs[p.id].name;let turn=Math.floor(game.s.time/5)%2;let speaker=turn?p:other;if(game.spreadGossip(p.id,other.id))speaker.chat='Não gostei de como me tratou.';else if(game.spreadGossip(other.id,p.id))speaker.chat='Precisava falar sobre isso.';else speaker.chat=speaker.plannedChat||null;}
} 
}
function round(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke()}
function face(c,a,dir,portrait=false){
 const side=dir==='left'||dir==='right',sign=dir==='left'?-1:1,back=dir==='up',style=a.style||0;
 // Loose hair sits behind the face; an open hairline and separate ears avoid a hood silhouette.
 if(style===1){round(c,-10,-31,4,23,2,a.hair);round(c,6,-31,4,23,2,a.hair);ellipse(c,0,-31,9,4,a.hair);}
 if(style===3){ellipse(c,back?0:-10,-20,4,9,a.hair);round(c,-12,-24,4,2,1,'#e5bc73');}
 ellipse(c,0,-22,a.jaw||8.5,10.5,a.skin);
 if(!side){ellipse(c,-9,-22,1.8,3,a.skin);ellipse(c,9,-22,1.8,3,a.skin);}
 if(back){round(c,-9,-33,18,style===1?23:16,6,a.hair);line(c,[[-5,-30],[-6,-22]],'#ffffff22',.8);return;}
 if(style===2){for(let i=-7;i<=7;i+=3.5)ellipse(c,i,-31-Math.cos(i)*.8,3.6,3.7,a.hair);}
 else if(style===4){ellipse(c,-3,-31,7,3,a.hair);round(c,-9,-29,3,7,2,a.hair);}
 else{ellipse(c,0,-31,9,4,a.hair);line(c,[[-7,-31],[-2,-28],[4,-30]],a.hair,3);if(style===1){round(c,-10,-28,3,16,1,a.hair);round(c,7,-28,3,16,1,a.hair);}}
 if(side){ellipse(c,sign*8,-21,2.5,2,a.skin);ellipse(c,sign*3,-23,1,1.4,'#28313f');line(c,[[sign*1,-26],[sign*6,-26]],a.hair,a.brows||1);line(c,[[sign*4,-16],[sign*7,-16]],'#965e53',.8);if(a.beard)line(c,[[sign*7,-18],[sign*4,-13],[0,-14]],a.hair,2);}
 else{for(let x of [-3.5,3.5]){ellipse(c,x,-23,1,1.4,'#293443');line(c,[[x-2,-26],[x+1.5,-26.5]],a.hair,a.brows||1);}line(c,[[0,-22],[-1,-19],[1,-19]],'#8b5c4933',1);if(a.beard){line(c,[[-6,-18],[-5,-14],[0,-12],[5,-14],[6,-18]],a.hair,2.4);}line(c,[[-2,-16],[0,-15.5],[2,-16]],'#955f53',1);}
 if(a.glasses){c.strokeStyle='#263747';c.lineWidth=1;if(side)c.strokeRect(sign<0?-7:0,-25,7,5);else{c.strokeRect(-7,-25,6,5);c.strokeRect(1,-25,6,5);line(c,[[-1,-23],[1,-23]],'#263747',1);}}
 if(a.accessory===1){ellipse(c,-10,-18,1,1.7,'#e6b758');ellipse(c,10,-18,1,1.7,'#e6b758');}
}
function sprite(c,x,y,a,dir='down',stride=0,moving=false,selected=false){let phase=Math.sin(stride/11),swing=moving?phase*4:0,bob=moving?Math.abs(phase)*1.4:0;const vertical=dir==='up'||dir==='down';c.save();c.translate(x,y);ellipse(c,0,11,14,4,'#20363d30');if(selected){c.strokeStyle='#f7d687';c.lineWidth=1.5;c.beginPath();c.ellipse(0,11,17,6,0,0,Math.PI*2);c.stroke()}c.translate(0,-bob);const side=dir==='left'||dir==='right';round(c,-6,0,5,10+swing,2,'#39495a');round(c,1,0,5,10-swing,2,'#39495a');round(c,-7,8+swing,7,4,2,'#233341');round(c,1,8-swing,7,4,2,'#233341');round(c,side?-7:vertical?-8:-10,-14,side?14:vertical?16:20,18,5,a.shirt);round(c,side?-3:-13,-11+swing,5,14,3,a.shirt);ellipse(c,side?0:-10.5,3+swing,2.6,3,a.skin);if(!side){round(c,8,-11-swing,5,14,3,a.shirt);ellipse(c,10.5,3-swing,2.6,3,a.skin)}if(dir!=='up'){line(c,[[-3,-13],[0,-9],[3,-13]],'#eee4ce',2);line(c,[[0,-8],[0,1]],'#ffffff55',1);round(c,4,-7,3,5,1,'#e9d7a9')}face(c,a,dir);c.restore()}
function spritePolished(c,x,y,a,dir='down',stride=0,moving=false,selected=false){
 const phase=moving?Math.sin(stride/11):0,step=moving?Math.cos(stride/11):0,side=dir==='left'||dir==='right',back=dir==='up',lean=side?(dir==='right'?phase*.8:-phase*.8):0;
 c.save();c.translate(x+lean,y-Math.abs(phase)*.8);ellipse(c,0,11,14,4,'#20363d30');if(selected){c.strokeStyle='#f7d687';c.lineWidth=1.5;c.beginPath();c.ellipse(0,11,17,6,0,0,Math.PI*2);c.stroke();}
 // Quatro poses de caminhada: contato, baixo, passagem e alto. O peso alterna nos quadris.
 const front=step*4,backLeg=-step*3;round(c,-6,0,5,10+front*.35,2,'#39495a');round(c,1,0,5,10+backLeg*.35,2,'#263b49');round(c,-8+front,9,8,4,2,'#1d2f3e');round(c,0+backLeg,9,8,4,2,'#263a48');
 if(side){round(c,dir==='right'?-5:-9,-15,14,19,5,a.shirt);round(c,dir==='right'?4:-9,-10+front*.45,4,13,2,a.shirt);round(c,dir==='right'?-9:5,-10+backLeg*.35,4,12,2,'#2f5660');ellipse(c,dir==='right'?7:-7,1+front*.35,2.7,3,a.skin);}
 else{round(c,-9,-15,18,19,6,a.shirt);round(c,-13,-10+front*.4,5,13,2,a.shirt);round(c,8,-10+backLeg*.35,5,13,2,a.shirt);}
 // Pescoço e cabeça ficam separados do tronco para não parecer um bloco deslizante.
 round(c,-3,-19,6,7,2,a.skin);face(c,a,dir,false);if(side){let sx=dir==='right'?1:-1;line(c,[[sx*3,-8],[sx*7,-3]],'#d9e4ce55',1);}
 c.restore();}
function spriteWalk(c,x,y,a,dir='down',stride=0,moving=false,selected=false){let p=moving?Math.sin(stride/10):0,q=moving?Math.cos(stride/10):0,side=dir==='left'||dir==='right',sx=dir==='left'?-1:1;c.save();c.translate(x+(side?sx*p*.9:0),y-Math.abs(p));ellipse(c,0,11,14,4,'#20363d30');if(selected){c.strokeStyle='#f7d687';c.lineWidth=1.5;c.beginPath();c.ellipse(0,11,17,6,0,0,Math.PI*2);c.stroke()}let a1=p*5,a2=-p*5;round(c,-6+a1*.35,0,5,11,2,'#39495a');round(c,1+a2*.35,0,5,11,2,'#263b49');round(c,-9+a1,9,9,4,2,'#1d2f3e');round(c,-1+a2,9,9,4,2,'#263a48');if(side){c.save();c.scale(sx,1);c.rotate(p*.035);round(c,-5,-16,14,20,5,a.shirt);line(c,[[5,-9],[10+q*3,-3]],a.skin,3);line(c,[[-5,-9],[-10-q*3,-3]],'#315360',3);c.restore()}else{round(c,-9,-16,18,20,6,a.shirt);line(c,[[-8,-10+a1*.2],[-13-q*2,1]],a.skin,3);line(c,[[8,-10+a2*.2],[13+q*2,1]],a.skin,3)}round(c,-3,-21,6,7,2,a.skin);face(c,a,dir,false);c.restore()}
function spriteNatural(c,x,y,a,dir='down',stride=0,moving=false,selected=false){let p=moving?Math.sin(stride/11):0,side=dir==='left'||dir==='right',sx=dir==='left'?-1:1;c.save();c.translate(x,y-Math.abs(p)*.7);ellipse(c,0,11,14,4,'#20363d30');if(selected){c.strokeStyle='#f7d687';c.lineWidth=1.5;c.beginPath();c.ellipse(0,11,17,6,0,0,Math.PI*2);c.stroke()}if(side){
 // Side silhouette: torso stays upright, arms swing subtly, and each shoe points in travel direction.
 round(c,-6,-16,14,20,5,a.shirt);let lead=p>0?2:-2,trail=-lead;
 round(c,-3,-2+p*1.1,5,12,2,'#39495a');round(c,1,-2-p*1.1,5,12,2,'#263b49');
 round(c,sx*(3+lead),8,7,6,3,'#263b49');round(c,sx*(-3+trail),8,7,6,3,'#39495a');
 line(c,[[sx*3,-10],[sx*(6+p*1.4),-2]],a.skin,2.4);line(c,[[-sx*3,-10],[-sx*(5-p*1.1),-2]],'#315360',2.2)
 }else{round(c,-9,-16,18,20,6,a.shirt);let lift=p*2;round(c,-6,-1+lift,5,12,2,'#39495a');round(c,1,-1-lift,5,12,2,'#263b49');round(c,-7,-1+lift,7,4,2,'#f1bd45');round(c,0,-1-lift,7,4,2,'#e9b33b');line(c,[[-8,-10+lift],[-10-p*2,0]],a.skin,3);line(c,[[8,-10-lift],[10+p*2,0]],a.skin,3)}round(c,-3,-21,6,7,2,a.skin);c.save();c.translate(0,-2);c.scale(1.08,1.08);face(c,a,dir,false);c.restore();c.restore()}
function spriteSideNatural(c,x,y,a,dir='down',stride=0,moving=false,selected=false){let side=dir==='left'||dir==='right',sx=dir==='left'?-1:1,p=moving?Math.sin(stride/11):0;c.save();c.translate(x+(side?sx*p*.35:0),y-Math.abs(p)*.5);ellipse(c,0,11,14,4,'#20363d30');if(selected){c.strokeStyle='#f7d687';c.lineWidth=1.5;c.beginPath();c.ellipse(0,11,17,6,0,0,Math.PI*2);c.stroke()}if(side){round(c,-5,-16,13,20,5,a.shirt);round(c,-3,-1+p*1.2,5,12,2,'#39495a');round(c,0,-1-p*1.2,5,12,2,'#263b49');round(c,sx*(2+Math.max(0,p)*1.5),10,10,3,2,'#1d2f3e');round(c,sx*(-3+Math.max(0,-p)*1.5),10,10,3,2,'#263a48');line(c,[[sx*3,-10],[sx*(6+p*.8),-1]],a.skin,2.2);line(c,[[-sx*3,-10],[-sx*(5+p*.8),-1]],'#315360',2.2)}else{round(c,-9,-16,18,20,6,a.shirt);let lift=p*2;round(c,-6,-1+lift,5,12,2,'#39495a');round(c,1,-1-lift,5,12,2,'#263b49');round(c,-7,-1+lift,7,4,2,'#1d2f3e');round(c,0,-1-lift,7,4,2,'#263a48');line(c,[[-8,-10+lift],[-10-p*2,0]],a.skin,3);line(c,[[8,-10-lift],[10+p*2,0]],a.skin,3)}round(c,-3,-21,6,7,2,a.skin);face(c,a,dir,false);c.restore()}
function spriteSideFinal(c,x,y,a,dir='down',stride=0,moving=false,selected=false){let side=dir==='left'||dir==='right',sx=dir==='left'?-1:1,p=moving?Math.sin(stride/11):0;c.save();c.translate(x,y-Math.abs(p)*.35);if(side)c.scale(sx,1);ellipse(c,0,11,14,4,'#20363d30');if(selected){c.strokeStyle='#f7d687';c.lineWidth=1.5;c.beginPath();c.ellipse(0,11,17,6,0,0,Math.PI*2);c.stroke()}if(side){round(c,-5,-16,13,20,5,a.shirt);round(c,-3,-1+p*1.1,5,12,2,'#39495a');round(c,1,-1-p*1.1,5,12,2,'#263b49');round(c,2+Math.max(0,p)*2,9,10,4,2,'#1d2f3e');round(c,-3+Math.max(0,-p)*2,9,10,4,2,'#263a48');line(c,[[3,-10],[6+p,-2]],a.skin,2);line(c,[[-3,-10],[-6-p,-2]],'#315360',2)}else{round(c,-9,-16,18,20,6,a.shirt);let lift=p*2;round(c,-6,-1+lift,5,12,2,'#39495a');round(c,1,-1-lift,5,12,2,'#263b49');round(c,-7,-1+lift,7,4,2,'#1d2f3e');round(c,0,-1-lift,7,4,2,'#263a48');line(c,[[-8,-10+lift],[-10-p*2,0]],a.skin,3);line(c,[[8,-10-lift],[10+p*2,0]],a.skin,3)}round(c,-3,-21,6,7,2,a.skin);face(c,a,dir,false);c.restore()}
function faceDirectional(c,a,dir){let side=dir==='left'||dir==='right',sx=dir==='left'?-1:1;if(dir==='up'){round(c,-9,-33,18,19,7,a.hair);return}if(side){round(c,-9,-33,18,8,5,a.hair);ellipse(c,sx*8,-21,2.5,2,a.skin);ellipse(c,sx*3,-23,1.1,1.5,'#293443');line(c,[[sx*1,-26],[sx*7,-26]],a.hair,1.4);if(a.beard)line(c,[[sx*7,-18],[sx*4,-13],[0,-14]],a.hair,2);return}round(c,-9,-33,18,8,5,a.hair);ellipse(c,-3.5,-23,1.2,1.7,'#293443');ellipse(c,3.5,-23,1.2,1.7,'#293443');line(c,[[-2,-26],[2,-26]],a.hair,1.2);line(c,[[0,-22],[0,-18]],'#8d5c4e77',1);line(c,[[-2,-16],[0,-15],[2,-16]],'#955f53',1);if(a.beard)line(c,[[-6,-18],[-5,-14],[0,-12],[5,-14],[6,-18]],a.hair,2.2)}
function portrait(canvas,n){
 canvas.width=320;canvas.height=360;let c=canvas.getContext('2d'),a=n.appearance;c.scale(2,2);c.clearRect(0,0,160,180);c.imageSmoothingEnabled=true;
 const bg=['#294c60','#594c63','#375b50','#66563f'][n.id%4];round(c,0,0,160,180,12,bg);
 for(let i=0;i<6;i++)line(c,[[12+i*29,0],[i*29-30,180]],'#ffffff08',12);
 ellipse(c,82,72,62,63,'#ffffff13');round(c,12,152,136,25,7,'#182b3633');
 let long=a.style===1||a.style===3;if(long){ellipse(c,80,74,37,45,a.hair);round(c,43,60,15,61,6,a.hair);round(c,102,60,15,61,6,a.hair);}
 // Tailored clothes, visible neck and asymmetric fabric folds.
 c.fillStyle=a.shirt;c.beginPath();c.moveTo(19,180);c.quadraticCurveTo(20,132,57,127);c.lineTo(102,127);c.quadraticCurveTo(139,132,142,180);c.fill();
 line(c,[[26,172],[37,147],[46,142]],'#ffffff20',3);line(c,[[118,143],[127,173]],'#14283944',3);
 round(c,66,106,28,32,8,a.skin);round(c,67,108,26,10,5,'#59332128');
 c.fillStyle='#efe9da';c.beginPath();c.moveTo(56,128);c.lineTo(73,141);c.lineTo(67,156);c.lineTo(48,132);c.fill();c.beginPath();c.moveTo(101,128);c.lineTo(87,141);c.lineTo(92,156);c.lineTo(109,133);c.fill();
 line(c,[[80,145],[80,178]],'#20303b33',1);for(let y=151;y<177;y+=11)ellipse(c,82,y,1.2,1.2,'#d9dac5');
 round(c,108,151,11,17,2,'#d9d9bb');round(c,111,154,5,5,1,bg);line(c,[[111,162],[116,162]],'#68766b',1);
 ellipse(c,47,83,6,10,a.skin);ellipse(c,112,83,6,10,a.skin);
 c.fillStyle=a.skin;c.beginPath();c.moveTo(48,65);c.bezierCurveTo(47,42,112,40,113,66);c.lineTo(108,101);c.quadraticCurveTo(99,119,80,122);c.quadraticCurveTo(58,117,51,100);c.closePath();c.fill();
 c.fillStyle='#5e30231b';c.beginPath();c.moveTo(108,71);c.lineTo(103,99);c.quadraticCurveTo(95,111,80,117);c.lineTo(80,122);c.quadraticCurveTo(103,117,108,101);c.fill();
 // Hair has a separate hairline, strands and highlights, rather than surrounding the chin.
 c.fillStyle=a.hair;c.beginPath();c.moveTo(45,77);c.bezierCurveTo(35,30,111,18,116,66);c.lineTo(109,82);c.lineTo(104,58);c.quadraticCurveTo(84,68,60,54);c.lineTo(51,81);c.closePath();c.fill();
 if(a.style===2)for(let i=0;i<7;i++)ellipse(c,49+i*10,47-Math.sin(i/6*Math.PI)*10,9,9,a.hair);
 if(a.style===3){ellipse(c,118,58,12,18,a.hair);line(c,[[111,64],[123,65]],'#d7ae64',3);}
 line(c,[[53,49],[67,40],[83,38]],'#ffffff22',2.5);line(c,[[60,51],[76,45],[99,45]],'#ffffff15',1.5);
 let upset=n.mood==='angry',brow=a.brows||1;
 for(let x of [64,95]){line(c,[[x-8,73+(upset?2:0)],[x,71],[x+7,73]],a.hair,brow+1);ellipse(c,x,82,8,4.1,'#f2eee0');ellipse(c,x+1,82,3.3,4,'#536c60');ellipse(c,x+1,82,1.8,3,'#202f35');ellipse(c,x+2,80.5,.9,1,'#ffffff');line(c,[[x-8,81],[x-2,78],[x+6,80]],'#503c38',1.2);}
 line(c,[[80,83],[77,96],[83,97]],'#8d5c4e77',1.6);line(c,[[77,99],[81,100]],'#ffffff33',1);
 ellipse(c,59,97,7,3,'#b9695520');ellipse(c,101,97,7,3,'#b9695520');
 if(a.beard){c.strokeStyle=a.hair;c.lineWidth=5;c.beginPath();c.moveTo(55,99);c.quadraticCurveTo(57,114,80,118);c.quadraticCurveTo(102,113,106,99);c.stroke();for(let i=0;i<6;i++)line(c,[[66+i*5,114],[67+i*5,110]],'#ffffff22',.7);}
 c.strokeStyle='#874f4b';c.lineWidth=1.6;c.beginPath();c.moveTo(71,106);c.quadraticCurveTo(80,upset?102:111,90,106);c.stroke();
 if(a.glasses){c.strokeStyle='#273844';c.lineWidth=2;c.strokeRect(53,76,22,14);c.strokeRect(84,76,22,14);line(c,[[75,80],[84,80]],'#273844',2);line(c,[[54,78],[47,77]],'#273844',1);}
 if(a.accessory===1){ellipse(c,47,93,2,3,'#d9b261');ellipse(c,112,93,2,3,'#d9b261');}
 c.strokeStyle='#d8bd80';c.lineWidth=1;c.strokeRect(5,5,150,170);
}
function text(c,t,x,y,size=12,color='#324b4e'){c.font='600 '+size+'px system-ui';c.textAlign='center';c.fillStyle=color;c.fillText(t,x,y)}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=(n>>16)+amt,g=(n>>8&255)+amt,b=(n&255)+amt;r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b;return '#'+(1<<24|r<<16|g<<8|b).toString(16).slice(1)}
// Relógio de parede real (segundos), para animações de ambiente que não dependem do relógio do jogo (que só avança a cada minuto).
function now(){return(typeof performance!=='undefined'?performance.now():Date.now())/1000}
// Ponto exato da cadeira por objeto: usado tanto para desenhar a cadeira como para posicionar quem está sentado nela — nunca dessincronizados.
function chairSpot(o,from){const{x,y,w,h,type}=o;const nearest=list=>!from?list[0]:list.reduce((a,b)=>Math.hypot(b.x-from.x,b.y-from.y)<Math.hypot(a.x-from.x,a.y-from.y)?b:a);if(type==='reception')return{x:x+128,y:y-7};if(['desk','executive','console'].includes(type))return{x:x+w*.5,y:y+h+18};if(type==='cafetable')return nearest(chairSeats(o));if(type==='armchair')return{x:x+w/2,y:y+h/2+5};if(type==='sofa')return nearest([{x:x+w*.27,y:y+h*.66},{x:x+w*.73,y:y+h*.66}]);return null}
// Chão em pranchas: tons alternados + juntas em pixel duro (sem gradiente/blur), no espírito de um RPG 2D top-down.
function floor(c,l){const base=l.theme,light=shade(base,20),seam=shade(base,-38),dark=shade(base,-20),tile=40;round(c,0,108,960,492,0,base);
 for(let y=108,ry=0;y<600;y+=tile,ry++){for(let x=0,rx=0;x<960;x+=tile,rx++){if((rx+ry)%2)c.fillStyle=light,c.fillRect(x,y,tile,tile);}}
 c.fillStyle=seam;c.globalAlpha=.55;for(let y=108;y<=600;y+=tile)c.fillRect(0,y,960,1);for(let x=0;x<=960;x+=tile)c.fillRect(x,108,1,492);c.globalAlpha=1;
 for(let i=0;i<22;i++){const kx=20+(i*151)%940,ky=128+(i*113)%452;c.fillStyle=dark;c.globalAlpha=.28;c.beginPath();c.ellipse(kx,ky,2.4,3,0,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
function plant(c,x,y){if(root.OFFICE_ART?.draw(c,'plant',x-16,y-17,32,35))return;round(c,x-10,y,20,18,4,'#ba866a');line(c,[[x,y],[x,y-25]],'#527155',3);ellipse(c,x-9,y-15,11,6,'#6c9470');ellipse(c,x+8,y-24,11,7,'#8aac7d');ellipse(c,x-3,y-32,7,10,'#648866')}
// ---------------------------------------------------------------------------
// Mobília desenhada em código (nada de assets externos). Convenção de vista:
// o tampo/assento é visto de cima, o que está pousado nele é visto de frente.
// É o atalho habitual dos RPG 2D — lê-se bem a esta escala (um boneco tem 52px).
// ---------------------------------------------------------------------------
// Tipos só de cenário: não abrem menu (ver near() em app.js) nem mostram legenda.
const QUIET=['plant','garden','partition','lowtable','cabinet','counter','printer'];
function slab(c,x,y,w,h,top,edge){const r=6,lip=8;
 // Tampo com espessura: a aresta da frente é mais escura, para a mesa deixar de ser um retângulo liso.
 round(c,x,y+h-lip,w,lip+1,r,shade(edge,-14));round(c,x,y,w,h-lip+3,r,top);
 c.globalAlpha=.16;c.fillStyle=edge;for(let i=1;i*13<h-lip;i++)c.fillRect(x+5,y+i*13,w-10,1);c.globalAlpha=1;
 round(c,x+3,y+2,w-6,3,2,shade(top,20));
}
function legs(c,x,y,w,h,color){round(c,x+4,y+h-4,5,7,2,color);round(c,x+w-9,y+h-4,5,7,2,color)}
function screenLines(c,x,y,w,h,seed){
 // Conteúdo do ecrã: linhas curtas de "código"/planilha, com um cursor que pisca.
 const palette=['#8fd3b0','#e8c98a','#9fc2e0','#d6a7b4','#c9d6cf'];
 for(let i=0;i*5+4<h-3;i++){const len=((seed*7+i*13)%5+2)/8*(w-8);
  c.fillStyle=palette[(seed+i)%5];c.globalAlpha=.85;c.fillRect(x+3+((i%3)*3),y+3+i*5,len,2);}
 c.globalAlpha=(Math.sin(now()*3+seed)>0)?.9:.15;c.fillStyle='#f4e7c6';
 c.fillRect(x+4,y+3+Math.floor((h-8)/5)*5,4,2);c.globalAlpha=1;
}
function monitor(c,cx,baseY,w,tint='#1b2c3a'){
 // Monitor com base, haste, moldura e ecrã aceso — o "computador mal desenhado" de antes era só um retângulo.
 const h=w*.66,top=baseY-w*.2-h,seed=Math.abs(Math.round(cx))%5;
 ellipse(c,cx,baseY,w*.24,w*.065,'#2b3843');round(c,cx-w*.06,baseY-w*.22,w*.12,w*.24,2,'#46555f');
 round(c,cx-w/2,top,w,h,3,'#26333d');round(c,cx-w/2+2,top+2,w-4,h-5,2,shade(tint,Math.sin(now()*1.6+seed)*5));
 screenLines(c,cx-w/2+3,top+3,w-6,h-7,seed);
 round(c,cx-w/2+2,top+2,w-4,2,1,'#3f5f70');ellipse(c,cx+w/2-4,baseY-w*.2-3,1.2,1.2,'#8fd3b0');
}
function keyboard(c,cx,y,w){
 round(c,cx-w/2,y,w,w*.3,2,'#cfcec0');round(c,cx-w/2,y,w,2,1,'#e6e4d4');
 c.fillStyle='#8f9a93';for(let r=0;r<3;r++)for(let i=0;i<8;i++)c.fillRect(cx-w/2+3+i*(w-6)/8,y+3+r*(w*.075),(w-6)/8-1.5,w*.05);
 c.fillRect(cx-w*.2,y+3+3*(w*.075),w*.4,w*.05);
}
function mouse(c,x,y,cable=0){ellipse(c,x,y,3.6,5,'#d8d7c6');ellipse(c,x,y,3.6,5,'#d8d7c6');c.fillStyle='#9aa49c';c.fillRect(x-.6,y-4,1.2,3);
 if(cable)line(c,[[x,y-5],[x-cable*.4,y-9],[x-cable,y-11]],'#5e6f6b66',1)}
function mug(c,x,y,color='#e8dcc0'){round(c,x-4,y-6,8,8,2,color);c.strokeStyle=shade(color,-40);c.lineWidth=1.2;c.beginPath();c.arc(x+5,y-2.5,2.6,-1.2,1.2);c.stroke();ellipse(c,x,y-6,4,1.6,shade(color,-25));
 c.globalAlpha=.3+Math.sin(now()*1.5+x)*.15;line(c,[[x,y-9],[x-2,y-13],[x+1,y-17]],'#ffffff',1.4);c.globalAlpha=1}
function papers(c,x,y,w=15){round(c,x,y,w,w*.72,1,'#cfcab0');round(c,x-1.5,y-2,w,w*.72,1,'#efeada');
 c.fillStyle='#a9b2ab';for(let i=0;i<3;i++)c.fillRect(x+.5,y+1+i*3,w-5,1)}
function officeChair(c,cx,cy,back='#2b3742',seat='#3c4c58'){
 // Cadeira de rodízios vista de cima: base de cinco raios, assento e encosto.
 c.strokeStyle='#1d2932';c.lineWidth=2.4;c.beginPath();
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.6;c.moveTo(cx,cy+12);c.lineTo(cx+Math.cos(a)*13,cy+12+Math.sin(a)*5)}c.stroke();
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.6;ellipse(c,cx+Math.cos(a)*13,cy+12+Math.sin(a)*5,2.2,1.6,'#161f27')}
 round(c,cx-2,cy+3,4,10,2,'#1d2932');
 round(c,cx-15,cy-13,30,24,7,back);round(c,cx-12,cy-11,24,18,5,seat);
 round(c,cx-16,cy-4,4,11,2,shade(back,-10));round(c,cx+12,cy-4,4,11,2,shade(back,-10));
 c.globalAlpha=.25;c.fillStyle='#0c151b';c.fillRect(cx-9,cy-9,18,1.5);c.fillRect(cx-9,cy-5,18,1.5);c.globalAlpha=1;
}
function chairSeats(o){
 // Lugares à volta de uma mesinha de café: é aqui que os colegas se sentam a conversar.
 const cx=o.x+o.w/2,cy=o.y+o.h/2,r=o.w*.55;
 return [{x:cx-r,y:cy+3},{x:cx+r,y:cy+3},{x:cx,y:cy-r*.72}];
}
// Tons por tipo de posto: madeira do corpo e do tampo.
const DESK_TONES={desk:['#b48a5f','#ddbd8c'],executive:['#8a6748','#c39a6c'],console:['#54707c','#8fb0b8']};
function deskUnit(c,o){
 const{x,y,w,h,type}=o,[wood,top]=DESK_TONES[type]||DESK_TONES.desk;
 round(c,x+6,y+10,w,h-6,8,'#1c2e3020');
 slab(c,x,y,w,h,top,wood);legs(c,x,y,w,h,shade(wood,-26));
 // Gaveteiro encostado a um dos lados, para a secretária ter volume e não ser uma tábua solta.
 round(c,x+w-26,y+h-30,22,26,3,shade(wood,-8));for(let i=0;i<2;i++){round(c,x+w-23,y+h-27+i*12,16,9,2,shade(top,-6));round(c,x+w-18,y+h-23+i*12,6,1.6,1,shade(wood,-30))}
 const cx=x+w*.42;
 monitor(c,cx,y+h*.52,Math.min(38,w*.42),type==='console'?'#16303a':'#1b2c3a');
 keyboard(c,cx,y+h*.56,Math.min(34,w*.38));
 mouse(c,cx+Math.min(26,w*.3),y+h*.62,10);
 papers(c,x+6,y+9,Math.min(16,w*.18));
 mug(c,x+w-16,y+h*.44,['#e8dcc0','#cf9f87','#9fbfc4'][Math.abs(Math.round(x))%3]);
 if(type==='executive'){round(c,x+10,y+h*.28,18,14,2,'#5d7a74');round(c,x+12,y+h*.28+2,14,7,1,'#d8e4d4');}
 if(w>110){round(c,x+w-52,y+8,14,18,3,'#9a674f');ellipse(c,x+w-45,y+11,7,3,'#4f6d58');ellipse(c,x+w-49,y+6,4,7,'#6b9878');ellipse(c,x+w-41,y+4,4,8,'#85b07f')}
}
function receptionDesk(c,o){
 const{x,y,w,h}=o,front=y+h-26;
 round(c,x+6,y+12,w,h,10,'#1c2e3020');
 // Corpo do balcão (fachada virada a quem chega) + tampo de trabalho mais baixo, do lado de dentro.
 round(c,x,y,w,h-24,7,'#b48a5f');round(c,x+3,y+2,w-6,h-30,5,'#ddbd8c');round(c,x+3,y+2,w-6,3,2,'#eed7ad');
 round(c,x,front,w,26,7,'#5a7f77');round(c,x+4,front+3,w-8,7,3,'#7fa199');
 c.globalAlpha=.25;c.fillStyle='#22383f';for(let i=1;i<5;i++)c.fillRect(x+i*w/5,front+4,1.5,18);c.globalAlpha=1;
 round(c,x+14,front+10,w-28,13,3,'#20333f');text(c,'NIMBUS · RECEPÇÃO',x+w/2,front+20,11,'#f2e3bb');
 // Posto de trabalho da recepcionista, do lado de dentro do balcão.
 monitor(c,x+40,y+30,34);keyboard(c,x+40,y+33,30);mouse(c,x+62,y+37,8);
 papers(c,x+84,y+8,15);mug(c,x+112,y+26,'#cf9f87');
 // Placa de visitantes, sineta de atendimento e terminal de crachás sobre o tampo.
 round(c,x+w-96,y+6,30,17,3,'#3a4a58');round(c,x+w-93,y+8,24,11,2,'#53636e');text(c,'VISITAS',x+w-81,y+17,7,'#e3dcc4');
 ellipse(c,x+w-52,front-6,9,7,'#c9c2ab');ellipse(c,x+w-52,front-11,7,6,'#dcd6c0');
 ellipse(c,x+w-54-Math.sin(now())*1.5,front-13,1.6,1.4,'#fff8e2');round(c,x+w-55,front-1,6,2,1,'#8f8a76');
 round(c,x+w-26,y+8,15,20,3,'#33424e');round(c,x+w-23,y+11,9,9,1,'#6f8d96');ellipse(c,x+w-18,y+24,1.4,1.4,Math.sin(now()*2)>0?'#8fd3b0':'#43575c');
}
function cafeTable(c,o){
 const{x,y,w,h}=o,cx=x+w/2,cy=y+h/2;
 for(const s of chairSeats(o))cafeChair(c,s.x,s.y,s.x-cx,s.y-cy);
 ellipse(c,cx+3,cy+10,w*.46,h*.32,'#1c2e3022');
 round(c,cx-4,cy+2,8,17,3,'#6e6555');ellipse(c,cx,cy+19,14,6,'#5d5547');
 ellipse(c,cx,cy+4,w*.47,h*.35,'#7d6a4e');ellipse(c,cx,cy,w*.47,h*.35,'#b79a70');ellipse(c,cx,cy-1.5,w*.4,h*.28,'#d3bc93');
 c.globalAlpha=.25;c.strokeStyle='#7d6a4e';c.lineWidth=1;c.beginPath();c.ellipse(cx,cy-1,w*.3,h*.2,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;
 // Em cima: duas canecas, um prato, um vaso pequeno e um guardanapo — sinais de que alguém esteve aqui.
 ellipse(c,cx+2,cy-7,7,4.5,'#efe9d7');ellipse(c,cx+2,cy-7,4.6,2.8,'#d9a86d');
 round(c,cx-24,cy-2,11,8,1,'#eee8d4');round(c,cx-23,cy-1,9,1.2,1,'#c7d0c2');
 round(c,cx+16,cy-12,5,9,2,'#7f9fa6');ellipse(c,cx+18.5,cy-14,3,3.4,'#cf8f93');ellipse(c,cx+15,cy-16,2.4,3,'#6f9673');
 mug(c,cx-11,cy+3,'#e8dcc0');mug(c,cx+10,cy+6,'#cf9f87');
}
function upholstery(c,x,y,w,h,arm,pillows){
 // Estofo em três peças legíveis: encosto, braços e assento. Antes era um retângulo verde só.
 round(c,x+4,y+9,w,h,10,'#1c2e3022');
 round(c,x,y,w,h,10,'#4e7068');round(c,x+2,y+2,w-4,15,7,'#688c82');round(c,x+2,y+3,w-4,4,3,'#7ea79a');
 round(c,x-2,y+9,arm,h-11,6,'#5b8177');round(c,x,y+11,arm-4,h-17,4,'#6f978b');
 round(c,x+w-arm+2,y+9,arm,h-11,6,'#5b8177');round(c,x+w-arm+4,y+11,arm-4,h-17,4,'#6f978b');
 const inner=x+arm+1,span=w-arm*2-2;
 for(let i=0;i<pillows;i++){const cw=(span-3*(pillows-1))/pillows;
  round(c,inner+i*(cw+3),y+13,cw,h-20,6,'#93b198');round(c,inner+2+i*(cw+3),y+15,cw-4,h-25,4,'#a9c8ac');}
 round(c,x+5,y+h-4,6,7,2,'#3f5a53');round(c,x+w-11,y+h-4,6,7,2,'#3f5a53');
}
function loungeChair(c,o){const{x,y,w,h}=o;upholstery(c,x,y,w,h,12,1);
 round(c,x+16,y+18,w-32,11,4,'#c6d8c2')}
function lowTable(c,o){
 const{x,y,w,h}=o;round(c,x+4,y+8,w,h,6,'#1c2e3022');
 round(c,x,y,w,h,6,'#7d6148');round(c,x+3,y+2,w-6,h-9,4,'#bd9d76');round(c,x+3,y+2,w-6,3,2,'#d7bd95');
 round(c,x+5,y+h-5,6,7,2,'#634d3a');round(c,x+w-11,y+h-5,6,7,2,'#634d3a');
 // Revistas empilhadas, um descanso de copo e uma taça — o sinal de que alguém espera aqui.
 round(c,x+8,y+12,30,19,2,'#d8d0b6');round(c,x+11,y+9,30,19,2,'#e9c48a');
 round(c,x+15,y+13,19,2.5,1,'#ac7a49');round(c,x+15,y+18,13,2,1,'#c49a6a');round(c,x+15,y+22,16,2,1,'#c49a6a');
 ellipse(c,x+52,y+21,6,4,'#9fb3ad');ellipse(c,x+52,y+20,4.4,2.8,'#c3d3ce');
 ellipse(c,x+w-20,y+20,10,6.5,'#7d9a86');ellipse(c,x+w-20,y+17,8,4.6,'#a2c0a2');
 for(let i=0;i<4;i++)ellipse(c,x+w-27+i*4.5,y+12-(i%2)*3,3.2,4,['#c98f7a','#e0b878','#8fb694','#c2879b'][i]);
}
function partition(c,o){
 // Divisória de escritório: montantes metálicos e painéis de vidro fosco. Fecha a espera sem ser uma parede cega.
 const{x,y,w,h}=o,vertical=h>w,glass='#c3d9d6',frame='#6e8079';
 if(vertical){round(c,x+4,y,w,h,3,'#1c2e3022');
  round(c,x,y,w,h,2,frame);
  for(let i=0;i*34<h-8;i++){const py=y+6+i*34,ph=Math.min(26,y+h-8-py);if(ph<8)break;
   c.globalAlpha=.7;round(c,x+1,py,w-2,ph,2,glass);c.globalAlpha=.35;round(c,x+1,py,w-2,ph*.4,1,'#ffffff');c.globalAlpha=1;}
  round(c,x-1,y-3,w+2,5,2,'#8c9e97');round(c,x-1,y+h-4,w+2,6,2,'#4f635d');}
 else{const top=y-16,hh=h+16;round(c,x,y+4,w,h,3,'#1c2e3022');
  round(c,x,top,w,hh,2,frame);
  for(let i=0;i*38<w-10;i++){const px=x+6+i*38,pw=Math.min(30,x+w-6-px);if(pw<10)break;
   c.globalAlpha=.7;round(c,px,top+4,pw,hh-12,2,glass);c.globalAlpha=.35;round(c,px,top+4,pw*.35,hh-12,1,'#ffffff');c.globalAlpha=1;}
  round(c,x-2,top-3,w+4,5,2,'#8c9e97');round(c,x,y+h-3,w,4,2,'#4f635d');
  for(let i=0;i*38<w+10;i++)round(c,x+i*38,top,4,hh,1,'#5d6f69');}
}
function counterUnit(c,o){
 // Copa: bancada com armários, lava-loiça e prateleira — dá contexto à zona de café.
 const{x,y,w,h}=o;
 round(c,x,y,w,h+18,4,'#9c7d5c');round(c,x,y,w,h,3,'#d9c29c');round(c,x,y,w,4,2,'#eddcb9');
 c.globalAlpha=.3;c.fillStyle='#7c6144';for(let i=1;i*54<w;i++)c.fillRect(x+i*54,y+h,1.6,18);c.globalAlpha=1;
 for(let i=0;i*54<w-20;i++)round(c,x+i*54+16,y+h+7,18,2,1,'#7a6448');
 round(c,x+18,y+7,30,18,3,'#9fb3b6');round(c,x+21,y+9,24,13,2,'#c3d3d2');
 line(c,[[x+33,y+7],[x+33,y+2],[x+41,y+2]],'#8a9aa0',2.5);
 for(let i=0;i<3;i++){round(c,x+w-70+i*17,y+11,11,13,2,['#e8dcc0','#cf9f87','#9fbfc4'][i]);ellipse(c,x+w-64.5+i*17,y+11,5.5,2,'#cfc6ac')}
 round(c,x+w-116,y+8,34,20,3,'#4a5a63');round(c,x+w-112,y+11,20,14,2,'#7d949a');ellipse(c,x+w-86,y+18,2,2,'#f0c979');
}
function cabinetUnit(c,o){
 const{x,y,w,h}=o;round(c,x+5,y+9,w,h,4,'#1c2e3020');
 round(c,x,y,w,h,4,'#71818a');round(c,x+2,y+2,w-4,4,2,'#8ea0a8');
 for(let i=0;i<4;i++){round(c,x+4,y+10+i*((h-14)/4),w-8,(h-14)/4-4,2,'#8b9ca3');round(c,x+w/2-7,y+10+i*((h-14)/4)+((h-14)/4-4)/2-1.5,14,3,1.5,'#4e5d65')}
 round(c,x+6,y-14,16,14,2,'#c9b48f');round(c,x+8,y-12,12,3,1,'#a08a66');round(c,x+8,y-7,12,3,1,'#b59b74');
 plant(c,x+w-14,y-4);
}
function printerUnit(c,o){
 const{x,y,w,h}=o;round(c,x+5,y+9,w,h,4,'#1c2e3020');
 round(c,x,y+10,w,h-10,4,'#606f78');round(c,x,y,w,16,4,'#7b8a92');round(c,x+3,y+2,w-6,9,2,'#4c5a63');
 round(c,x+4,y+16,w-8,9,2,'#e9e4d2');round(c,x+6,y+14,w-14,8,1,'#f6f2e3');
 round(c,x+5,y+h-16,w-10,12,2,'#4f5d66');round(c,x+8,y+h-13,w-16,6,1,'#8a99a1');
 ellipse(c,x+w-9,y+30,2.2,2.2,Math.sin(now()*1.7)>0?'#8fd3b0':'#3e5350');
 round(c,x+7,y+29,16,3,1.5,'#93a2a9');
}
// Zonas do piso 1: tapete da espera, passadeira da entrada e área da copa em tom próprio.
// Sem isto, o chão é um xadrez uniforme e cada móvel parece largado no meio do nada.
function receptionZones(c,l){const warm=shade(l.theme,-9),edge=shade(l.theme,-26);
 // Copa/café: piso mais quente, delimitado, a dizer "aqui pára-se para conversar".
 round(c,612,110,324,268,10,warm);round(c,612,110,324,268,10,'#00000000');
 c.strokeStyle=edge;c.lineWidth=2;c.beginPath();c.roundRect(613,111,322,266,10);c.stroke();
 c.globalAlpha=.5;c.fillStyle=edge;for(let x=612;x<936;x+=36)c.fillRect(x,110,1,268);for(let y=110;y<378;y+=36)c.fillRect(612,y,324,1);c.globalAlpha=1;
 // Passadeira da entrada: liga o elevador ao balcão, como num átrio a sério.
 round(c,418,110,126,150,4,shade(l.theme,-16));round(c,424,116,114,138,3,shade(l.theme,-4));
 c.globalAlpha=.45;c.fillStyle=edge;for(let y=122;y<252;y+=13)c.fillRect(426,y,110,1);c.globalAlpha=1;
 // Tapete da sala de espera: dá contorno ao recanto em vez de um quadrado solto.
 round(c,56,392,262,152,16,'#1c2e3018');round(c,52,388,262,152,16,'#9aa98f');
 round(c,60,396,246,136,12,'#b6c2a4');round(c,70,406,226,116,9,'#a7b597');
 c.strokeStyle='#8d9c83';c.lineWidth=1.5;c.beginPath();c.roundRect(76,412,214,104,7);c.stroke();
 // Carpete da zona de trabalho, por baixo das duas escrivaninhas.
 round(c,420,380,516,166,10,shade(l.theme,-13));
 c.globalAlpha=.4;c.fillStyle=edge;for(let x=420;x<936;x+=43)c.fillRect(x,380,1,166);c.globalAlpha=1;
}
// Cadeira de café vista de cima: assento, encosto virado para fora da mesa e quatro pés.
function cafeChair(c,cx,cy,ax,ay,color='#8a6f52'){
 const a=Math.atan2(ay,ax);c.save();c.translate(cx,cy);c.rotate(a);
 ellipse(c,1,4,11,9,'#1c2e3022');
 for(const[dx,dy]of[[-7,-7],[-7,7],[5,-7],[5,7]])round(c,dx-1.4,dy-1.4,2.8,3.4,1,'#4a3b2c');
 round(c,5,-10,8,20,3,shade(color,-30));round(c,6.5,-7.5,4.5,15,2,shade(color,10));
 round(c,-10,-9,17,18,4,shade(color,-20));round(c,-8.5,-7.5,14,15,3,color);round(c,-7.5,-6.5,12,6,2,shade(color,18));
 c.restore();
}
// Peças de mobília por tipo. Cada entrada desenha só a peça: a sombra, a cadeira e a
// legenda são responsabilidade de furniture(), para não se repetirem em cada ramo.
const SOFA=(c,o)=>upholstery(c,o.x,o.y,o.w,o.h,14,Math.max(2,Math.round(o.w/95)));
function coffeeMachine(c,o){const{x,y,w,h}=o;
 round(c,x,y,w,h,5,'#bd9b6a');round(c,x+10,y+5,38,h-10,4,'#3a5061');round(c,x+16,y+10,25,12,2,'#90b4b7');
 round(c,x+22,y+h-21,12,10,3,'#f5e3bb');for(let i=0;i<3;i++)ellipse(c,x+65+i*15,y+24,5,6,'#f3dec1');
}
function rackUnit(c,o){const{x,y,w,h}=o;
 round(c,x,y,w,h,5,'#344957');
 for(let i=0;i<4;i++){
  round(c,x+5,y+8+i*25,w-10,20,3,'#57717c');
  // Luzes de status com fase própria, para não piscarem todas juntas.
  const on=Math.sin(now()*2.4+i*1.9+x*.02)>0;
  ellipse(c,x+w-14,y+17+i*25,2,2,on?'#a8dfbc':'#3c5049');
  line(c,[[x+12,y+14+i*25],[x+30,y+14+i*25]],'#2e4857',2);
 }
}
function boardUnit(c,o){const{x,y,w,h}=o,notas=['#efc277','#9dbfbd','#c4a6a4','#a3b990'];
 round(c,x,y,w,h,4,'#91a7a1');round(c,x+4,y+4,w-8,h-8,2,'#e7e9ce');
 for(let i=0;i<4;i++)round(c,x+12+i*(w-25)/4,y+9,Math.max(12,w/6),h-17,2,notas[i]);
}
function gardenUnit(c,o){const{x,y,w,h}=o;
 round(c,x,y,w,h,10,'#779276');for(let j=0;j<4;j++)plant(c,x+w/2,y+40+j*48);
}
function roundTable(c,o){const{x,y,w,h,type}=o,conselho=type==='boardtable';
 ellipse(c,x+w/2,y+h/2,w/2,h/2,conselho?'#936f54':'#92a7a3');
 ellipse(c,x+w/2,y+h/2,w/2-5,h/2-5,conselho?'#c3a075':'#b8c4b0');
 for(let i=1;i<=3;i++){round(c,x+w*i/4-12,y+12,24,15,3,'#eae5ca');round(c,x+w*i/4-12,y+h-27,24,15,3,'#4d7080')}
}
const PIECES={desk:deskUnit,executive:deskUnit,console:deskUnit,reception:receptionDesk,
 cafetable:cafeTable,armchair:loungeChair,lowtable:lowTable,partition,counter:counterUnit,
 cabinet:cabinetUnit,printer:printerUnit,plant:(c,o)=>plant(c,o.x+o.w/2,o.y+o.h-4),
 sofa:SOFA,coffee:coffeeMachine,rack:rackUnit,board:boardUnit,garden:gardenUnit};
// Tipos com cadeira no lugar dado por chairSpot(), e tipos que levam sombra projetada.
const COM_CADEIRA=new Set(['desk','executive','console','reception']);
const COM_SOMBRA=new Set(['sofa','coffee','rack','board','garden','meeting','boardtable']);
// Balcão e mesinhas dizem o que são pelo próprio desenho; o resto do cenário não se anuncia.
const SEM_LEGENDA=new Set([...QUIET,'reception','cafetable','armchair']);
function pieceLabel(c,o,f){
 if(SEM_LEGENDA.has(o.type))return;
 const cx=o.x+o.w/2;
 // Nas secretárias a legenda desce para baixo da cadeira; se cair noutro móvel, sobe.
 let ly=o.y+o.h+(['desk','executive','console'].includes(o.type)?52:17);
 if(layout(f).objects.some(q=>q!==o&&cx>q.x-30&&cx<q.x+q.w+30&&ly>q.y-6&&ly<q.y+q.h+6))ly=o.y-8;
 c.font='600 11px system-ui';
 const tw=c.measureText?.(o.label)?.width||o.label.length*6;
 c.globalAlpha=.55;round(c,cx-tw/2-6,ly-11,tw+12,15,7,'#f4efdd');c.globalAlpha=1;
 text(c,o.label,cx,ly,11,'#2f4a4d');
}
function furniture(c,o,f){const{x,y,w,h,type}=o;
 // Plantas continuam a vir de office-props.png quando a imagem já carregou; café e mural já têm
 // desenho procedural próprio (coffeeMachine/boardUnit, mesma família visual da mesa/executivo).
 if(['plant'].includes(type)&&root.OFFICE_ART?.draw(c,type,x,y,w,h)){pieceLabel(c,o,f);return}
 if(COM_SOMBRA.has(type))round(c,x+5,y+9,w,h,8,'#223c3d20');
 (PIECES[type]||roundTable)(c,o);
 if(COM_CADEIRA.has(type)){const cs=chairSpot(o);officeChair(c,cs.x,cs.y)}
 if(type==='reception')plant(c,x+w+16,y+h-8);
 pieceLabel(c,o,f);
}
function background(c,f,time){setFloor(f);const l=layout(f);c.imageSmoothingEnabled=true;round(c,0,0,960,108,0,'#375c65');floor(c,l);c.fillStyle=shade(l.theme,-40);c.fillRect(0,100,960,10);c.fillStyle=shade(l.theme,-6);c.fillRect(0,108,960,2);
// Janela com caixilho, peitoril e vista (céu, silhueta de cidade, reflexo) em vez de um retângulo chapado.
for(let x of [45,190,650,795]){const night=time<480||time>=1080;round(c,x-4,16,120,72,6,'#2c4b55');round(c,x,20,112,62,5,'#cfcca9');round(c,x+5,25,102,51,2,night?'#2d4a60':'#9fd0d6');round(c,x+5,25,102,night?26:22,2,night?'#25405a':'#bfe2e4');c.save();c.beginPath();c.roundRect(x+5,25,102,51,2);c.clip();c.fillStyle=night?'#1d3448':'#7aa4ae';for(let i=0;i<6;i++){const bw=12+((i*37)%11),bh=10+((i*53)%20);c.fillRect(x+7+i*17,76-bh,bw,bh);}if(night){c.fillStyle='#f1d08e';for(let i=0;i<14;i++)c.fillRect(x+10+((i*29)%94),62+((i*17)%12),2,2)}else{ellipse(c,x+78,38,9,9,'#f3e6bd');c.globalAlpha=.5;ellipse(c,x+30,36,14,5,'#e9f2ee');ellipse(c,x+44,33,10,4,'#e9f2ee');c.globalAlpha=1}c.restore();c.globalAlpha=.25;c.fillStyle='#ffffff';c.beginPath();c.moveTo(x+12,76);c.lineTo(x+40,25);c.lineTo(x+56,25);c.lineTo(x+28,76);c.fill();c.globalAlpha=1;line(c,[[x+56,25],[x+56,76]],'#e6e0be',3);line(c,[[x+6,50],[x+106,50]],'#e6e0be',2.5);round(c,x-6,82,124,7,3,'#b8b591');round(c,x-6,82,124,3,2,'#d8d4b0');}round(c,412,14,136,94,6,'#223f4c');round(c,425,33,110,72,2,'#9eb4b4');line(c,[[480,34],[480,105]],'#4f6e7c',3);round(c,461,17,38,13,2,'#17333e');text(c,'0'+f,480,28,11,'#f3d490');
// Relógio de parede com hora do jogo a sério (não decorativo) — mesmo elemento em todos os andares.
ellipse(c,357,52,17,17,'#e7e2cf');ellipse(c,357,52,15,15,'#2a4550');
{const hr=(time%1440)/60,hAngle=(hr%12)/12*Math.PI*2-Math.PI/2,mAngle=(hr%1)*Math.PI*2-Math.PI/2;
line(c,[[357,52],[357+Math.cos(hAngle)*8,52+Math.sin(hAngle)*8]],'#f3d490',2.2);
line(c,[[357,52],[357+Math.cos(mAngle)*12,52+Math.sin(mAngle)*12]],'#f3d490',1.3);
ellipse(c,357,52,1.4,1.4,'#f3d490');}

// Piso 1: parede de marca por trás do balcão e dois quadros do lado da copa.
if(f===1){round(c,554,20,92,64,6,'#2a4a54');round(c,558,24,84,56,4,'#35606a');text(c,'NIMBUS',600,50,16,'#f3d490');text(c,'TECHNOLOGIES',600,66,8,'#9fc3c0');round(c,914,28,42,46,4,'#c2b391');round(c,917,31,36,40,2,'#d9cdb0');for(let i=0;i<3;i++)round(c,921+i*12,37+(i%2)*8,8,26-(i%2)*8,1,['#cf8f7a','#7f9fa6','#9db88f'][i]);receptionZones(c,l);}
if(f===2){
// Divisórias baixas separam desenvolvimento, RH, marketing e pessoal em repartições visíveis, sem bloquear a passagem.
for(let x of [312,517,722]){round(c,x,220,7,270,3,'#22384420');round(c,x,220,6,266,2,'#7c8f88');round(c,x,220,2,266,1,'#a4b3ad');}
}
for(let o of l.objects)furniture(c,o,f);plant(c,48,130);plant(c,916,535);
// Só o andar 1 tem porta de saída de verdade — os outros ganham o espaço de volta (o dia ainda pode ser encerrado pela pausa, Esc).
if(f===1){round(c,365,558,230,42,5,'#547c78');text(c,'SAÍDA DO ESCRITÓRIO',480,585,13,'#fff0c4');}
if(time<480||time>=1080){c.fillStyle='#23365418';c.fillRect(0,0,960,600)}}
// Pose sentada: pernas curtas escondidas atrás de um encosto de cadeira, em vez de alguém de pé encostado à secretária.
// Só o corpo: a cadeira é sempre desenhada pela mobília (imagem ou procedural), nunca aqui,
// para não duplicar nem desalinhar com a cadeira que já existe na secretária.
function spriteSeated(c,x,y,a,dir='up',selected=false,resting=false){const side=dir==='left'||dir==='right',vertical=dir==='up'||dir==='down';
// Cada pessoa tem fase própria (semente pela posição), para não respirarem nem digitarem todas ao mesmo tempo.
const seed=(x*7+y*3)%10,t=now()*3+seed,bob=Math.sin(t*(resting?.26:.4))*(resting?.9:.6);
const armL=resting?Math.sin(t*.3)*.5:Math.sin(t)*1.4,armR=resting?Math.sin(t*.27+1)*.5:Math.sin(t+Math.PI*.8)*1.4;
const sleeve=shade(a.shirt,-18),collar=shade(a.shirt,26);
c.save();c.translate(x,y+bob);ellipse(c,0,10,12,3.5,'#20363d30');
if(selected){c.strokeStyle='#f7d687';c.lineWidth=1.5;c.beginPath();c.ellipse(0,10,15,5,0,0,Math.PI*2);c.stroke()}
// Pernas curtas: o resto do corpo fica escondido pela cadeira/mesa, como se estivesse mesmo sentado.
round(c,-7,1,6,8,2,'#39495a');round(c,1,1,6,8,2,'#39495a');round(c,-8,7,8,4,2,'#233341');round(c,0,7,8,4,2,'#233341');
const [bw,bx]=side?[14,-7]:vertical?[16,-8]:[20,-10];
round(c,bx,-15,bw,16,5,a.shirt);round(c,bx+1,-15,bw-2,4,2,collar);
if(!side&&dir!=='up'){line(c,[[-3,-15],[0,-11],[3,-15]],shade(a.shirt,-30),1.4);round(c,3.5,-9,3.5,4.5,1,'#e9e2c6');ellipse(c,5.2,-7,.8,.8,'#7f8f93')}
round(c,side?-3:-13,-9+armL,5,10,3,sleeve);ellipse(c,side?0:-10.5,-1+armL,2.6,3,a.skin);
if(!side){round(c,8,-9+armR,5,10,3,sleeve);ellipse(c,10.5,-1+armR,2.6,3,a.skin)}
if(resting&&!side){c.save();c.translate(10.5,-1+armR);round(c,-2.6,-4.5,5.2,5,1.5,'#e8dcc0');c.strokeStyle='#bfb49a';c.lineWidth=1;c.beginPath();c.arc(3,-2,1.7,-1.2,1.2);c.stroke();c.restore()}
face(c,a,dir);c.restore()}
const api={furniture,QUIET,chairSeats,gridPoint,coffeePoint,destination,setFloor,layout,desks:[],blocked,safe,facing,move,path,home,World,chairSpot,sprite:(c,x,y,a,dir,stride,moving,selected,seated)=>{if(seated){spriteSeated(c,x,y,a,dir,selected,seated==='rest');return;}if(!root.WALK_SHEET?.draw(c,x,y,a,dir,stride,moving,selected))spriteNatural(c,x,y,a,dir,stride,moving,selected)},portrait,background,round,ellipse,text};root.SCENE=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
