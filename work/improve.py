from pathlib import Path
p=Path('outputs/proximo-andar/engine.js')
s=p.read_text().replace("this.log('Bem-vindo à Nimbus. Converse com Lia, faça entregas e construa apoios.');","if(!saved)this.log('Bem-vindo à Nimbus. Converse com Lia, faça entregas e construa apoios.');")
s=s.replace("this.s.time+=m; if(before", "this.s.time+=m; if(this.s.reopen&&this.day>=this.s.reopen){this.s.reopen=0;this.s.vacancyUntil=this.day+3;this.log('Nova rodada de seleção aberta por 3 dias.');} if(before")
s=s.replace("this.relation(id,delta*this.cfg.relation);", "if(delta>0&&n.personality==='hostil'&&action!=='share'&&action!=='defend'){delta=Math.max(1,delta-2);this.log(n.name+' exige mais evidências: ganho de confiança reduzido em 2.');}if(delta>0&&n.personality==='oportunista'&&action==='share')delta+=2;this.relation(id,delta*this.cfg.relation);")
s=s.replace("this.s.prestige+=3;delta=3;", "this.s.prestige+=3;delta=3;")
p.write_text(s)
p=Path('outputs/proximo-andar/data.js');s=p.read_text();s=s.replace("events:['Ainda não sei se posso confiar em você. Comece ouvindo.','Você voltou e cumpriu o combinado. Posso ajudar com uma apresentação.','Seu histórico fala por você. Conte comigo na avaliação.']", "events:i<2?[c[4]+' Antes de pedir espaço, me conte como você trabalha.', 'Lembro da nossa conversa sobre '+c[3]+'. Você está construindo confiança; posso orientar sua próxima entrega.', 'Você trouxe resultados e voltou para reconhecer as pessoas. Como '+c[1].toLowerCase()+', posso apoiar sua candidatura.']:[]")
p.write_text(s)
