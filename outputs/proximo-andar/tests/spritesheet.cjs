const {test}=require('node:test');const assert=require('node:assert/strict');const sheet=require('../spritesheet.js');
test('identidade visual estável e independente das cores',()=>{
 assert.equal(sheet.model({gender:'feminino',style:2}),'bob');
 assert.equal(sheet.model({gender:'masculino',beard:true}),'curly');
 assert.equal(sheet.model({gender:'masculino',style:0}),'short');
 assert.equal(sheet.model({gender:'masculino',style:2,skin:'#abcdef'}),'curly');
});
test('spritesheet: quatro linhas, parada neutra e ciclo completo por distância',()=>{
 for(const [row,dir] of ['down','left','right','up'].entries()){
  assert.deepEqual(sheet.frame(dir,37,false),{row,col:1});
  assert.deepEqual([0,9,18,27,36].map(d=>sheet.frame(dir,d,true).col),[0,1,2,1,0]);
 }
});
