const {test}=require('node:test'),assert=require('node:assert/strict'),D=require('../data.js');
test('mesmas dimensões físicas para cada objeto comum em todos os andares',()=>{
 for(const type of ['desk','board','coffee','plant']){
  const props=D.layouts.flatMap(l=>l.objects).filter(o=>o.type===type);
  assert.equal(new Set(props.map(o=>`${o.w}x${o.h}`)).size,1,type);
  assert(props.every(o=>o.w<=100&&o.h<=90));
 }
});
