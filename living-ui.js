// As quatro opções citam o assunto real de cada pessoa (n.topic, ver careers.js) em vez de um menu igual para todo mundo.
personalConversation=function(id){let n=D.npcs[id],t=n.topic||'isso';conversation(n,game.personalLine(id),[
{label:'Entendo por que '+t+' importa tanto pra você.',action:"respondPersonally("+id+",'empathize')"},
{label:'Eu vejo '+t+' de um jeito diferente do seu. Posso discordar?',action:"respondPersonally("+id+",'disagree')"},
{label:'Sério que você liga tanto assim pra '+t+'?',action:"respondPersonally("+id+",'mock')"},
{label:'Desculpa ter zoado de você por '+t+'.',action:"respondPersonally("+id+",'apologize')"}],n.background)};
function respondPersonally(id,choice){let result=game.socialChoice(id,choice);if(!result)return;save();refresh();conversation(D.npcs[id],result.text,[{label:'Vamos encerrar por agora.',action:'dismissModal()'},{label:'Quero conversar mais.',action:'personalConversation('+id+')'}],'Confiança '+(result.delta>=0?'+':'')+result.delta+' · opiniões diferentes não são o mesmo que desrespeito.')}
const originalPersonInfo=personInfo;
const beforeLivingRefresh=refresh;
refresh=function(){beforeLivingRefresh();if(!game)return;if(game.s.receptionDuty){$('#rank').textContent='Atendimento · recepção';$('#objective').textContent='Reconstruir a carreira';$('#objectiveText').textContent='Conclua uma atividade de atendimento e recupere pelo menos 6 de prestígio.';}}
personInfo=function(id){let n=D.npcs[id],p=game.society().people[id];show(head(n.name)+'<div class="person-info"><canvas id="person-info-face" width="160" height="180"></canvas><div><h3>'+n.job+'</h3><p>'+n.background+'</p><p>Lotação atual: andar '+p.floor+' · prestígio '+p.prestige+' · desempenho recente '+(p.performance>=0?'+':'')+p.performance+'</p><p>'+(game.sectionChief(p.floor)===id?'Responsável pela seção.':'Colega da seção.')+' '+(p.anger?'Está magoado com você.':'')+'</p>'+button('Localizar','locatePerson('+id+')',game.location(n)!==game.s.floor)+'</div></div>');SCENE.portrait($('#person-info-face'),n)};
