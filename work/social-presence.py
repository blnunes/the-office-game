from pathlib import Path
p=Path('outputs/proximo-andar');f=p/'scene.js';s=f.read_text();idx=s.index('function destination(');s=s[:idx]+"function coffeePoint(f=activeFloor){let o=layout(f).objects.find(o=>o.type==='coffee');return o?gridPoint({x:o.x+o.w/2,y:o.y+o.h+28},f):null}\n"+s[idx:]
s=s.replace("if(visit)return", "if(visit&&n.floor>=6&&hour>=720&&hour<810)return {...coffeePoint(),activity:'em pausa para café',coffee:true};if(visit)return")
s=s.replace("activity:'em pausa para café'};}","activity:'em pausa para café',coffee:true};}")
s=s.replace("let story=game.storyOffer?.();", "let appointment=game.s.appointments.find(a=>a.id===n.id&&!a.done&&game.s.time>=a.at-10&&game.s.time<=a.at+45);if(appointment)dest={...coffeePoint(),coffee:true,activity:'esperando você para o café'};let story=game.storyOffer?.();")
s=s.replace("if(story&&story.npc===n.id&&", "if(!appointment&&story&&story.npc===n.id&&")
s=s.replace("p.activity=dest.activity;p.chat=dest.chat;", "p.plannedActivity=dest.activity;p.coffee=!!dest.coffee;p.plannedChat=dest.chat;p.chat=null;")
s=s.replace("else if(dt>0)p.moving=false}}", """else if(dt>0)p.moving=false}
// Activities describe arrival, never just intent. Dialogue requires a nearby partner.
for(let p of this.people.values()){let arrived=p.destination&&Math.hypot(p.x-p.destination.x,p.y-p.destination.y)<3;p.arrived=!!arrived;p.activity=arrived?p.plannedActivity:p.coffee?'indo à máquina de café':'a caminho';p.chat=null;p.partner=null;}
let available=[...this.people.values()].filter(p=>p.arrived&&p.id!==pausedId);
for(let p of available){if(p.partner!==null)continue;let other=available.find(q=>q.id!==p.id&&q.partner===null&&Math.hypot(q.x-p.x,q.y-p.y)<85&&((p.coffee&&q.coffee)||(p.plannedChat&&q.plannedChat)));if(!other)continue;p.partner=other.id;other.partner=p.id;p.facing=facing(other.x-p.x,other.y-p.y);other.facing=facing(p.x-other.x,p.y-other.y);p.activity='conversando com '+D().npcs[other.id].name;other.activity='conversando com '+D().npcs[p.id].name;let turn=Math.floor(game.s.time/5)%2;let speaker=turn?p:other;speaker.chat=speaker.plannedChat||['Como foi a manhã?','Precisava desta pausa.','Depois te mostro a ideia.'][Math.floor(game.s.time/10)%3];}
} """)
s=s.replace('gridPoint,destination','gridPoint,coffeePoint,destination');f.write_text(s)
f=p/'engine.js';s=f.read_text().replace("{id,at:this.s.time+60,done:false}","{id,at:this.s.time+60,done:false,floor:this.s.floor}")
s=s.replace("location(n){if(this.hour", "location(n){let coffee=this.s.appointments.find(a=>a.id===n.id&&!a.done&&this.s.time>=a.at-10&&this.s.time<=a.at+45);if(coffee)return coffee.floor||n.floor;if(this.hour")
f.write_text(s)
f=p/'app.js';s=f.read_text().replace("function attend(i){act(()=>game.attend(i));panel('agenda')}","function attend(i){let a=game.s.appointments[i],p=a&&world.people.get(a.id);if(!p||!p.arrived||!p.coffee||Math.hypot(p.x-game.s.x,p.y-game.s.y)>70){show(head('Encontre seu colega')+'<p>Vá até a máquina de café do andar '+(a?.floor||D.npcs[a.id].floor)+' e aproxime-se de '+D.npcs[a.id].name+'. O encontro acontece lá.</p>'+button('Voltar ao escritório','dismissModal()'));return}act(()=>game.attend(i));panel('agenda')}")
s=s.replace("'E · '+n.name}","'E · '+n.name+' · '+(p.activity||'no escritório')}")
f.write_text(s)
