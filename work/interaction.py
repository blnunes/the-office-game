from pathlib import Path
p=Path('outputs/proximo-andar/scene.js');s=p.read_text().replace("{x:880,y:140+(n.slot%3)*20,activity:'buscando café'}", "{x:866+(n.slot%2)*40,y:240+Math.floor(n.slot/2)*36,activity:'buscando café'}").replace("{x:80+(n.slot%5)*30,y:500,activity:'fazendo uma pausa'}", "{x:380+(n.slot%4)*140,y:470+Math.floor(n.slot/4)*28,activity:'fazendo uma pausa'}")
# Up to sixteen staff: reserve fourteen side-corridor seats plus two lower positions.
s=s.replace('Math.floor(n.slot/2)*36','Math.floor(n.slot/2)*36')
p.write_text(s)
p=Path('outputs/proximo-andar/app.js');s=p.read_text().replace('transitionUntil=0;', 'transitionUntil=0,walkPath=[];')
s=s.replace('function show(html,kind=\'\'){keys={};', "function show(html,kind=''){keys={};walkPath=[];")
s=s.replace("if(hudTimer>.25){refresh();hudTimer=0}","if(hudTimer>.25){refresh();hudTimer=0}if(game.hour<480||game.hour>=1200)closedOffice();")
s=s.replace("SCENE.move(game.s,dx,dy,dt,D.balance.moveSpeed);", "if(dx||dy)walkPath=[];if(!dx&&!dy&&walkPath.length){let p=walkPath[0],dist=Math.hypot(p.x-game.s.x,p.y-game.s.y);if(dist<3)walkPath.shift();else{dx=p.x-game.s.x;dy=p.y-game.s.y;dt=Math.min(dt,dist/D.balance.moveSpeed)}}SCENE.move(game.s,dx,dy,dt,D.balance.moveSpeed);")
s=s.replace("function sleepMorning(){sleepChosen()}", "function sleepMorning(){sleepChosen()}\nfunction closedOffice(){show(head('O expediente terminou')+'<p>As equipes voltam às 8h. Você pode dormir para recuperar energia ou apenas avançar até a abertura, sem recuperação adicional.</p><div class=\"actions\">'+button('Encerrar o dia e descansar','restMenu()',false,true)+button('Aguardar a abertura','waitOpening()')+'</div>')}\nfunction waitOpening(){act(()=>{game.advance(game.hour<480?480-game.hour:1440-game.hour+480);game.log('As portas abriram. Esperar não recuperou sono nem energia.');});world=new SCENE.World();dismissModal()}")
s=s.replace("startScreen();requestAnimationFrame(frame);", "canvas.addEventListener('click',e=>{if(!game||modal.open)return;const bounds=canvas.getBoundingClientRect();let target={x:(e.clientX-bounds.left)*960/bounds.width,y:(e.clientY-bounds.top)*600/bounds.height};if(!blocked(target.x,target.y))walkPath=SCENE.path(game.s,target);});startScreen();requestAnimationFrame(frame);")
p.write_text(s)
