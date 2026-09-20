from pathlib import Path
p=Path('outputs/proximo-andar/scene.js');s=p.read_text();a=s.index('function safe(');b=s.index('function facing(',a)
s=s[:a]+'''function gridPoint(point,f=activeFloor,occupied=[]){let best=null,score=Infinity;for(let y=120;y<=540;y+=20)for(let x=40;x<=920;x+=20){let d=(x-point.x)**2+(y-point.y)**2;if(d<score&&!blocked(x,y,f)&&occupied.every(p=>Math.hypot(p.x-x,p.y-y)>=30)){score=d;best={x,y}}}return best||{x:480,y:140}}
function safe(point,f=activeFloor){return !blocked(point.x,point.y,f)?{x:point.x,y:point.y}:gridPoint(point,f)}
''' +s[b:]
s=s.replace("to=safe(to);let grid=20,start=[Math.round(from.x/grid),Math.round(from.y/grid)],end=[Math.round(to.x/grid),Math.round(to.y/grid)]", "to=gridPoint(to);let origin=gridPoint(from);let grid=20,start=[origin.x/grid,origin.y/grid],end=[to.x/grid,to.y/grid]")
s=s.replace('let route=[],p=end;', 'let route=[],p=end;').replace('return route}\nfunction home', 'route.unshift(origin);return route}\nfunction home')
a=s.index('function destination(');b=s.index('class World',a)
s=s[:a]+'''function destination(n,time,visit){let hour=time%1440,h=home(n);if((n.id===15||n.id===31)&&activeFloor===3&&hour>=900&&hour<945)return {x:n.id===15?410:460,y:350,activity:'articulando uma candidatura',chat:n.id===15?'Nosso nome primeiro.':'E o crédito dele?'};if(visit)return {...safe({x:350+(n.id%5)*100,y:505}),activity:(D().visits[n.id]||[]).find(v=>hour>=v.from&&hour<v.to)?.reason||'encontrando outras equipes'};const next=(D().visits[n.id]||[]).find(v=>hour>=v.from-8&&hour<v.from);if(next)return {x:480,y:140,activity:'indo ao andar '+next.floor};
// Two short, staggered breaks. Most of the day belongs to the assigned workstation.
let first=570+(n.slot%7)*18,second=870+(n.slot%6)*20,isBreak=(hour>=first&&hour<first+18)||(hour>=second&&hour<second+18);if(n.id===0)isBreak=hour>=750&&hour<770;
if(!isBreak)return {...h,activity:n.id===0?'recebendo visitantes':n.floor===3?'monitorando serviços':n.floor>=4?'planejando com a equipe':'trabalhando'};
let coffee=layout().objects.find(o=>o.type==='coffee')||layout().objects.find(o=>o.type==='sofa');return {...safe(coffee?{x:coffee.x+coffee.w/2,y:coffee.y+coffee.h+28}:{x:640,y:510}),activity:'em pausa para café'};}
''' +s[b:]
s=s.replace("this.floor=saved?.floor||0}","this.floor=saved?.floor||0;for(let p of this.people.values()){p.goal='';p.route=[];p.requestKey='';}}")
old="let dest=destination(n,game.s.time,n.floor!==this.floor),goal=dest.x+','+dest.y;if(goal!==p.goal){p.goal=goal;p.route=path(p,dest)}p.activity=dest.activity;p.chat=dest.chat;"
new="let dest=destination(n,game.s.time,n.floor!==this.floor);let story=game.storyOffer?.();if(story&&story.npc===n.id&&!game.s.story?.deferred?.[story.id])dest={...safe({x:game.s.x+45,y:game.s.y}),activity:'quer falar com você'};let requestKey=Math.round(dest.x/20)+','+Math.round(dest.y/20)+':'+dest.activity;if(requestKey!==p.requestKey){let reserved=[...this.people.values()].filter(v=>v.id!==p.id&&v.destination).map(v=>v.destination);p.destination=gridPoint(dest,this.floor,reserved);p.requestKey=requestKey;p.goal=p.destination.x+','+p.destination.y;p.route=path(p,p.destination);}p.activity=dest.activity;p.chat=dest.chat;"
s=s.replace(old,new).replace("if(dist<1){p.route.shift();p.moving=false}","if(dist<1){p.route.shift();p.moving=p.route.length>0}")
s=s.replace('const api={setFloor,layout,','const api={gridPoint,destination,setFloor,layout,');p.write_text(s)
