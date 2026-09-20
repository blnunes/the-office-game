from pathlib import Path
base=Path('outputs/proximo-andar')
p=base/'data.js';s=p.read_text();s=s.replace('const tasks=[', '''// Identidades estáveis: nunca renumerar os IDs usados pelos saves.
npcs[29].name='Beatriz Falcão';
const skins=['#f1c9a5','#b97850','#815034','#d89d75','#593b30','#edb995'];
const hairs=['#302c36','#713e2b','#d8a34f','#54382f','#b9b4b0','#202a32','#ad5e36'];
const clothes=['#477f88','#9b5c74','#6e77a5','#53836c','#c0814b','#705987','#47719a'];
const feminine=new Set(['Lia','Helena','Iara','Nina','Clara','Eva','Sofia','Ana','Beatriz','Marta','Joana','Laura','Alice','Cecília','Inês']);
npcs.forEach(n=>{n.appearance={skin:skins[n.id%skins.length],hair:hairs[(n.id*3)%hairs.length],shirt:clothes[(n.id*2)%clothes.length],style:n.id%5,glasses:n.id%4===0,gender:feminine.has(n.name.split(' ')[0])?'feminino':'masculino',accessory:n.id%3};});
const taskScenes={
 bug:{intro:'O acesso falha para uma parte dos clientes. A equipe espera sua decisão.',choices:['Investigar a causa antes de corrigir','Chamar um colega para reproduzir o erro','Aplicar um remendo e monitorar'],reply:'Os testes de acesso terminaram. A equipe acompanha o resultado com você.'},
 review:{intro:'Uma colega pediu revisão antes de publicar. O prazo está apertado.',choices:['Conferir sozinho cada alteração','Revisar junto e explicar os riscos','Aprovar apenas o caminho principal'],reply:'A revisão voltou para a colega, com suas observações e o crédito compartilhado.'},
 feature:{intro:'Produto quer liberar um novo fluxo hoje. Ainda há dúvidas sobre os casos extremos.',choices:['Entregar um escopo menor, bem testado','Alinhar o fluxo com produto e design','Liberar tudo e corrigir depois'],reply:'O fluxo chegou à equipe. Sua escolha definiu o equilíbrio entre prazo e qualidade.'},
 incident:{intro:'Os alertas dispararam. Há clientes esperando e muita gente falando ao mesmo tempo.',choices:['Estabilizar o serviço e investigar','Organizar uma sala de resposta','Reiniciar sem investigar a causa'],reply:'O serviço respondeu. Agora a equipe registra o que aprendeu com o incidente.'},
 mentor:{intro:'Um colega travou no mesmo problema pela terceira vez. Ele pede ajuda, constrangido.',choices:['Preparar um guia para ele seguir','Resolver junto, deixando ele conduzir','Resolver por ele para ganhar tempo'],reply:'A conversa terminou. A autonomia que você ajudou a construir fica com o colega.'},
 strategy:{intro:'O conselho quer crescer sem aumentar o desgaste da equipe nem o consumo de infraestrutura.',choices:['Consolidar números antes da proposta','Construir um plano com equipes e conselho','Prometer expansão antes da análise'],reply:'A proposta circulou com responsáveis, custos e compromissos. O conselho leu sua decisão.'}
};
const tasks=[''');s=s.replace('const config={balance,roles,','const config={taskScenes,balance,roles,');p.write_text(s)
p=base/'engine.js';s=p.read_text();s=s.replace("if(!saved)this.log", "for(const rival of this.s.rivals){const npc=D.npcs.find(n=>n.name===rival.name);if(npc)rival.id=npc.id;}this.s.facing=this.s.facing||'down';if(!saved)this.log")
s=s.replace('work(id,approach){let t=', "workReason(id){const t=D.tasks.find(t=>t.id===id);if(!t)return 'Demanda não encontrada.';if(this.hour<480||this.hour>=1200)return 'Escritório fechado para entregas. Retorne às 8h.';if(this.s.rank<t.min)return 'Disponível a partir de '+D.roles[t.min]+'.';if(this.s.energy<t.cost)return 'Energia insuficiente. Faça uma pausa ou encerre o dia.';if((this.s.memory[this.day+':task:'+id]||0)>=2)return 'As demandas deste tipo já terminaram hoje. Escolha outra ou encerre o dia.';return ''; }\nwork(id,approach){let reason=this.workReason(id);if(reason){this.log(reason);return false;}let t=")
# preserve rest as low-level sleep; endDay owns office-return schedule, sleep credits distinct from waiting.
s=s.replace('nextMorning(){', "endDay(hours=8){hours=clamp(Number(hours)||8,2,10);this.rest(hours);let before=this.s.time;if(this.hour<480)this.advance(480-this.hour);else if(this.hour>=1080)this.advance(1440-this.hour+480);if(this.s.time>before)this.log('Tempo pessoal até a abertura. Retorno às 08h; recuperação corresponde apenas às '+hours+'h de sono.');this.s.floor=1;this.s.x=480;this.s.y=490;return true;}\nnextMorning(){")
p.write_text(s)
