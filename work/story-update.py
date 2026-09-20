from pathlib import Path
p=Path('outputs/proximo-andar')
f=p/'engine.js';s=f.read_text();s=s.replace("this.s.facing=this.s.facing||'down';","this.s.story=this.s.story||{events:{},presented:{},deferred:{}};this.s.facing=this.s.facing||'down';")
pos=s.index('get cfg()')
s=s[:pos]+'''storyOffer(npc){return Game.episodes.find(e=>(npc===undefined||e.npc===npc)&&this.location(D.npcs[e.npc])===this.s.floor&&e.ready(this)&&!['closed','declined'].includes(this.s.story.events[e.id])&&(this.s.story.deferred[e.id]||0)<=this.day)}
storyChoose(id,choice){let e=this.storyOffer();if(!e||e.id!==id)return false;let state=this.s.story.events[id];if(choice==='later'){this.s.story.deferred[id]=this.day+1;this.log(D.npcs[e.npc].name+': conversa adiada para amanhã.');return true}if(state==='done'&&choice==='accept'){this.s.story.events[id]='closed';this.relation(e.npc,4);this.log(e.title+': resolvido. '+D.npcs[e.npc].name+' lembra da sua ajuda.');return true}if(state)return false;if(choice==='accept'){this.s.story.events[id]='accepted';this.log(e.title+': '+e.goal);return true}if(choice==='decline'){this.s.story.events[id]='declined';this.log(e.title+': você preferiu não assumir.');return true}return false}
storyText(id){let e=Game.episodes.find(e=>e.npc===id&&this.s.story.events[e.id]);if(!e)return '';let state=this.s.story.events[e.id];return state==='closed'?e.after:state==='declined'?e.refused:state==='accepted'?(this.s.lastTaskOutcome?.won===false?'Vi que a tentativa não deu certo. Respira. Podemos tentar de novo. ': '')+e.wait:e.end}
''' +s[pos:]
s=s.replace("this.s.lastTaskOutcome={won,name:a.name", "if(won&&!a.practice)for(const e of Game.episodes){if(this.s.story.events[e.id]==='accepted'&&e.task===a.id){this.s.story.events[e.id]='done';this.log(e.title+': entrega pronta. Procure '+D.npcs[e.npc].name+'.');}}this.s.lastTaskOutcome={won,id:a.id,name:a.name")
pos=s.index('root.Game=')
s=s[:pos]+'''Game.episodes=[
{id:'reception',npc:0,title:'A fila não anda',task:'bug',ready:g=>g.hour>=485,
intro:'Ei, tem um minuto? O cadastro de visitantes travou de novo. Estão reclamando comigo como se eu tivesse quebrado aquilo… Você consegue investigar?',goal:'Concluir um diagnóstico e voltar à Lia.',wait:'Ainda estou anotando os visitantes no papel. Quando terminar o diagnóstico, me avisa?',end:'Funcionou! A fila finalmente andou. Desculpa o jeito de antes… eu estava me sentindo sozinha aqui.',after:'Guardei aquela folha de visitantes. Lembra da confusão? Agora sei a quem pedir ajuda.',refused:'Consegui contornar com papel por enquanto. Sei que você também tem suas prioridades.'},
{id:'review',npc:14,title:'Antes de apertar publicar',task:'review',ready:g=>g.s.deliveries>0,
intro:'Preciso de outro par de olhos. Encontrei uma falha, mas o Caio quer publicar assim mesmo. Não quero transformar isso numa briga. Você revisa comigo?',goal:'Concluir uma revisão e voltar à Helena.',wait:'Separei os pontos duvidosos. Quero discutir fatos, sem expor ninguém na reunião.',end:'Você também encontrou. Obrigada. Agora consigo pedir a correção com um registro, sem virar uma disputa pessoal.',after:'A revisão que fizemos mudou o clima da reunião. O Caio não gostou da espera, mas o problema ficou registrado.',refused:'Vou fazer a revisão sozinha. Prefiro atrasar um pouco a deixar isso chegar ao cliente.'},
{id:'credit',npc:15,title:'De quem é a entrega?',task:'feature',ready:g=>g.s.story.events.review==='closed',
intro:'A Helena disse que vocês seguraram a publicação. Eu estava pressionado pelo prazo… Vamos fechar a implementação juntos? Desta vez eu coloco os nomes de todo mundo.',goal:'Concluir uma implementação e voltar ao Caio.',wait:'Estou esperando a implementação. Deixei a autoria compartilhada no relatório; pode conferir.',end:'Entregamos. E sim, seu nome está lá. Não sou bom em admitir isso, mas a revisão evitou um problema maior.',after:'Ainda discordo de você sobre prazos. Mas naquela entrega você fez sua parte — não vou apagar isso.',refused:'Entendi. Depois daquela reunião, eu também teria um pé atrás. Vou fechar minha parte.'}
];
''' +s[pos:];f.write_text(s)
f=p/'scene.js';s=f.read_text().replace("for(let p of this.people.values()){p.goal='';p.route=[];p.requestKey='';}","if(saved?.navigation!==2)for(let p of this.people.values()){p.goal='';p.route=[];p.requestKey='';}") .replace('return {floor:this.floor,people:','return {navigation:2,floor:this.floor,people:').replace("!game.s.story?.deferred?.[story.id]","!game.s.story?.events?.[story.id]||story&&story.npc===n.id&&game.s.story?.events?.[story.id]==='done'")
# Keep the compound condition explicit.
s=s.replace("if(story&&story.npc===n.id&&", "if(story&&story.npc===n.id&&")
f.write_text(s)
f=p/'app.js';s=f.read_text();s=s.replace("function talk(id){let n=", "function talk(id){let episode=game.storyOffer(id);if(episode&&!game.s.story.events[episode.id]||episode&&game.s.story.events[episode.id]==='done'){storyConversation(episode);return}let n=")
s=s.replace("conversation(n,text,[{label:'Como anda", "text=game.storyText(id)||text;conversation(n,text,[{label:'Como anda")
s=s.replace("if(!p.player&&!p.moving&&p.chat)","if(!p.player&&p.chat&&!active)")
s=s.replace("else if(!p.player&&!p.moving&&!active){SCENE.text(ctx,p.id===0?'☎':p.activity?.includes('café')?'☕':p.activity?.includes('trabalh')?'⌨':'♧',p.x,p.y-42,12);}","else if(!p.player&&game.storyOffer(p.id)&&!['accepted'].includes(game.s.story.events[game.storyOffer(p.id).id])){SCENE.round(ctx,p.x-9,p.y-42,18,20,7,'#ffe1a0');SCENE.text(ctx,'!',p.x,p.y-27,15);}")
s=s.replace("world.update(game,dt);saveTimer", "world.update(game,dt);storyTick();saveTimer")
s += '''
function storyConversation(e){let done=game.s.story.events[e.id]==='done';game.s.story.presented[e.id+':'+(done?'done':'offer')]=true;conversation(D.npcs[e.npc],done?e.end:e.intro,done?[{label:'Fico feliz que tenha dado certo.',action:"storyDecision('"+e.id+"','accept')"}]:[{label:'Pode contar comigo.',action:"storyDecision('"+e.id+"','accept')"},{label:'Hoje não consigo. Falamos amanhã?',action:"storyDecision('"+e.id+"','later')"},{label:'Prefiro não assumir isso.',action:"storyDecision('"+e.id+"','decline')"}],e.title+(done?' · Alívio':' · Preocupação'));save()}
function storyDecision(id,choice){game.storyChoose(id,choice);dismissModal()}
function storyTick(){if(modal.open)return;let e=game.storyOffer();if(!e)return;let state=game.s.story.events[e.id];if(state==='accepted')return;let key=e.id+':'+(state==='done'?'done':'offer');let p=world.people.get(e.npc);if(p&&!game.s.story.presented[key]&&Math.hypot(p.x-game.s.x,p.y-game.s.y)<65)storyConversation(e)}
''';f.write_text(s)
f=p/'tests/movement-rest.cjs';s=f.read_text().replace('g.advance(60);w.update','g.advance(90);w.update');f.write_text(s)
