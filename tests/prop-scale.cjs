const {test}=require('node:test'),assert=require('node:assert/strict'),D=require('../data.js');
// O andar 2 usa mesas/mural/café menores de propósito (propSizes2 em data.js) — tem 14 pessoas para só 10 secretárias
// reais, e a folga extra de corredor importa mais lá do que a uniformidade visual com o resto do prédio.
test('mesmas dimensões físicas para cada objeto comum em todos os andares (andar 2 à parte, de propósito)',()=>{
 for(const type of ['desk','board','coffee','plant']){
  const others=D.layouts.filter(l=>l.floor!==2).flatMap(l=>l.objects).filter(o=>o.type===type);
  assert.equal(new Set(others.map(o=>`${o.w}x${o.h}`)).size,1,type);
  const floor2=D.layouts.find(l=>l.floor===2).objects.filter(o=>o.type===type);
  if(floor2.length)assert.equal(new Set(floor2.map(o=>`${o.w}x${o.h}`)).size,1,type+' (andar 2)');
  assert([...others,...floor2].every(o=>o.w<=100&&o.h<=90));
 }
});
