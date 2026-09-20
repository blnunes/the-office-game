from pathlib import Path
p=Path('outputs/proximo-andar');f=p/'scene.js';s=f.read_text().replace('speed=150){','speed=150,people=[]){').replace('if(!blocked(x,body.y))','if(!blocked(x,body.y)&&people.every(p=>p===body||Math.hypot(x-p.x,body.y-p.y)>=24))').replace('if(!blocked(body.x,y))','if(!blocked(body.x,y)&&people.every(p=>p===body||Math.hypot(body.x-p.x,y-p.y)>=24))')
s=s.replace('function path(from,to){','function path(from,to,people=[]){').replace('!blocked(q[0]*grid,q[1]*grid)){','!blocked(q[0]*grid,q[1]*grid)&&people.every(b=>Math.hypot(q[0]*grid-b.x,q[1]*grid-b.y)>=26)){')
s=s.replace('saved?.navigation!==2','saved?.navigation!==3').replace('navigation:2','navigation:3')
old="dest={...safe({x:game.s.x+45,y:game.s.y}),activity:'quer falar com você'};"
new="""{let distance=Math.hypot(p.x-game.s.x,p.y-game.s.y);if(distance<58)p.waitingForPlayer=true;if(distance>90)p.waitingForPlayer=false;if(p.waitingForPlayer){p.route=[];p.moving=false;p.facing=facing(game.s.x-p.x,game.s.y-p.y);dest={x:p.x,y:p.y,activity:'quer falar com você'};}else{if(!p.approachAnchor||Math.hypot(p.approachAnchor.x-game.s.x,p.approachAnchor.y-game.s.y)>60){p.approachAnchor={x:game.s.x,y:game.s.y};let angle=Math.atan2(p.y-game.s.y,p.x-game.s.x);p.approachTarget=gridPoint({x:game.s.x+Math.cos(angle)*48,y:game.s.y+Math.sin(angle)*48});}dest={...p.approachTarget,activity:'quer falar com você'};}}else{p.waitingForPlayer=false;p.approachAnchor=null;}
"""
assert old in s;s=s.replace(old,new)
s=s.replace("p.route=path(p,p.destination);", "p.route=p.waitingForPlayer?[]:path(p,p.destination);")
s=s.replace("}else move(p,dx,dy,Math.min(dt,dist/speed),speed)","""}else{let people=[game.s,...this.people.values()].filter(q=>q!==p);let moved=move(p,dx,dy,Math.min(dt,dist/speed),speed,people);p.blockedFor=moved<.01?(p.blockedFor||0)+dt:0;if(p.blockedFor>.7){p.route=path(p,p.destination,people);p.blockedFor=0;}}""")
# retry routes when temporary traffic clears
s=s.replace("else if(dt>0)p.moving=false}","else if(dt>0){p.moving=false;if(!p.waitingForPlayer&&p.destination&&Math.hypot(p.x-p.destination.x,p.y-p.destination.y)>3){p.blockedFor=(p.blockedFor||0)+dt;if(p.blockedFor>.7){p.route=path(p,p.destination,[game.s,...this.people.values()].filter(q=>q!==p));p.blockedFor=0;}}}}")
f.write_text(s)
f=p/'app.js';s=f.read_text().replace('SCENE.move(game.s,dx,dy,dt,D.balance.moveSpeed);','SCENE.move(game.s,dx,dy,dt,D.balance.moveSpeed,[...world.people.values()]);');f.write_text(s)
