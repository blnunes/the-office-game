from pathlib import Path
p=Path('outputs/proximo-andar/app.js');s=p.read_text()
s=s.replace('function dismissModal(){modal.close();', "function dismissModal(){if(game?.s.activeTask){game.abortTask();save();refresh();miniResult();return}modal.close();")
s=s.replace("game=new Game(s.mode,s);world=new SCENE.World(game.s.npcMotion);dismissModal()", "game=new Game(s.mode,s);world=new SCENE.World(game.s.npcMotion);SCENE.setFloor(game.s.floor);if(SCENE.blocked(game.s.x,game.s.y)){game.s.x=480;game.s.y=140}modal.close();refresh();if(game.s.activeTask)showMini()")
s=s.replace("function panel(type){if(!game)return;", "function panel(type){if(!game)return;if(type==='relations'){networkPanel();return;}")
start=s.index('function doWork(');end=s.index('function apply()',start)
s=s[:start]+'''function doWork(id,a){let reason=game.workReason(id);if(reason){show(head('Agora não é possível')+'<p>'+reason+'</p>'+button('Voltar às demandas',"panel('tasks')"));return}if(game.startTask(id,a)){save();refresh();showMini()}}
''' +s[end:]
s=s.replace("'Caderno de entregas'", "'Sprint de hoje'")
s=s.replace("'<p>Escolha uma situação para examinar. Você decide a abordagem antes de gastar tempo ou energia.</p><div class=\"cards tasklist\">'", "'<div class=\"workflow-strip\">'+['⌕ Diagnosticar','▦ Revisar','◆ Implementar','◈ Estratégia'].map((v,i)=>'<span class=\"'+(game.workflow.stage>i?'done':'')+'\">'+v+'</span>').join('<b>→</b>')+'</div><div class=\"cards tasklist\">'")
s=s.replace("'<h3>'+t.name", "'<h3>'+t.name")
s=s.replace("'<div class=\"card\"><span class=\"badge\">'", "'<div class=\"card\"><span class=\"task-symbol\">'+taskIcons[t.id]+'</span><span class=\"badge\">'")
s=s.replace("'Peça orientação para se preparar.'", "'Concluir o minigame é necessário. Falhar ou sair consome o esforço, sem recompensa.'")
# Replace data-heavy HUD with compact interactive gauges.
start=s.index("$('#hud').innerHTML=");end=s.index(';let missing=',start)
s=s[:start]+'''$('#hud').innerHTML=[['ϟ','Energia',Math.round(s.energy),100],['◷','Fadiga',Math.round(s.fatigue),100],['★','Prestígio',s.prestige.toFixed(1),100],['✓','Entregas',s.deliveries.toFixed(1),100],['◎','Influência',game.influence,85]].map(([icon,label,value,max])=>'<button class="stat" '+(label==='Influência'?'onclick="networkPanel()"':'onclick="panel(\\\'log\\\')"')+' title="'+label+'"><span class="stat-icon">'+icon+'</span><span><small>'+label+'</small><strong>'+value+'</strong><progress max="'+max+'" value="'+value+'"></progress></span></button>').join('')''' +s[end:]
s=s.replace("D.floors[s.floor-1]", "D.layouts[s.floor-1].name")
start=s.index('function elevator()');end=s.index('function travel(',start)
s=s[:start]+'''function elevator(){show(head('Qual é o próximo andar?')+'<div class="elevator-grid">'+D.layouts.map((l,i)=>button('<b class="floor-number">0'+(i+1)+'</b><span>'+l.name+'<small>'+l.feature+'</small><small>'+(game.access(i+1)?'⌑ Acesso liberado':'◎ '+D.influenceAccess[i]+' influência · ou cargo/convite')+'</small></span>','travel('+(i+1)+')',!game.access(i+1))).join('')+'</div>')}
''' +s[end:]
s=s.replace('ctx.imageSmoothingEnabled=false;', 'ctx.imageSmoothingEnabled=true;')
s=s.replace("if(desks.some(d=>Math.hypot(x-(d.x+d.w/2),y-(d.y+d.h/2))<90))return {type:'desk',label:'E · Examinar entregas'};", "let object=D.layouts[game.s.floor-1].objects.find(o=>x>o.x-55&&x<o.x+o.w+55&&y>o.y-55&&y<o.y+o.h+55);if(object)return {type:object.type==='coffee'||object.type==='sofa'?'coffee':object.type==='desk'||object.type==='executive'?'desk':'room',object,label:'E · '+object.label};")
s=s.replace("if(closest)return closest;", "if(closest){if(game.s.floor===3&&game.hour>=900&&game.hour<945&&[15,31].includes(closest.id))return {type:'plot',label:'E · Ouvir conversa'};return closest;}")
s=s.replace("if(n.type==='desk')panel('tasks')", "if(n.type==='desk')panel('tasks');if(n.type==='coffee')coffeeMenu();if(n.type==='room')roomMenu(n.object);if(n.type==='plot')plotMenu()")
s=s.replace('return SCENE.blocked(x,y)', 'return SCENE.blocked(x,y,game?game.s.floor:2)')
s=s.replace("if(game){world.update(game,0,dialogNpc);", "if(game){world.update(game,0,dialogNpc);")
s=s.replace("if(p.player){ctx.fillStyle", "if(!p.player&&!p.moving&&p.chat){SCENE.round(ctx,p.x-65,p.y-66,130,20,7,'#fff5db');SCENE.text(ctx,p.chat,p.x,p.y-52,10);}else if(!p.player&&!p.moving&&!active){SCENE.text(ctx,p.activity?.includes('café')?'☕':p.activity?.includes('trabalh')?'⌨':'♧',p.x,p.y-42,12);}if(p.player){ctx.fillStyle")
s=s.replace("WASD / setas mover · aproxime-se e pressione E", "Clique ou WASD / setas · E interagir · ◎ sua rede abre portas")
p.write_text(s)
p=Path('outputs/proximo-andar/index.html');s=p.read_text().replace('<script src="engine.js">','<script src="minigames.js"></script><script src="engine.js">').replace('<script src="app.js">','<script src="gameplay-ui.js"></script><script src="app.js">');p.write_text(s)
