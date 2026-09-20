(function(root){
 'use strict';
 const rows={down:0,left:1,right:2,up:3}, sequence=[0,1,2,1];
 const sources={}, cache=new Map();
 const script=typeof document!=='undefined'?document.currentScript:null;
 if(typeof Image==='function')for(const [key,file] of Object.entries({short:'worker-walk.png',bob:'worker-bob.png',curly:'worker-curly.png'})){
  const image=new Image();image.src=new URL('assets/'+file,script?.src||location.href).href;sources[key]=image;
 }
 function model(a){return a.gender==='feminino'?'bob':a.beard||a.style===2?'curly':'short';}
 function frame(dir,stride,moving){return {row:rows[dir]??0,col:moving?sequence[Math.floor(Math.max(0,stride)/9)%4]:1};}
 function palette(a,source,variant){
  const key=[variant,a.skin,a.hair,a.shirt].join('|');if(cache.has(key))return cache.get(key);
  const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
  const c=canvas.getContext('2d');c.drawImage(source,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
  const rgb=s=>/^#[0-9a-f]{6}$/i.test(s||'')?[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)):null;
  const colors={shirt:rgb(a.shirt),skin:rgb(a.skin),hair:rgb(a.hair)};
  for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const r=d[i],g=d[i+1],b=d[i+2];let target,base;
   // Generated alternate sheets contain a neutral matte. Key it before recoloring.
   if(variant!=='short'&&Math.min(r,g,b)>150&&Math.max(r,g,b)-Math.min(r,g,b)<25){d[i+3]=0;continue;}
   if(r>150&&g>65&&g<160&&b>45&&r>g*1.35&&g<b*1.6){target=colors.shirt;base=235;}
   else if(r>160&&g>110&&b>65&&g>b*1.12&&r>g*1.12){target=colors.skin;base=241;}
   else if(r>g*1.12&&g>b*1.1&&r<150){target=colors.hair;base=90;}
   if(target)for(let j=0;j<3;j++)d[i+j]=Math.min(255,target[j]*(.8+.2*r/base));
  }
  c.putImageData(pixels,0,0);cache.set(key,canvas);return canvas;
 }
 function draw(c,x,y,a,dir,stride,moving,selected){
  const variant=model(a),source=sources[variant];
  if(!source?.complete||!source.naturalWidth)return false;
  const f=frame(dir,stride,moving),atlas=palette(a,source,variant),cx=[260,722,1186][f.col],sy=[15,282,548,805][f.row],height=[265,263,262,270][f.row];
  c.save();c.fillStyle='#20363d30';c.beginPath();c.ellipse(x,y+11,14,4,0,0,Math.PI*2);c.fill();
  if(selected){c.strokeStyle='#f7d687';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y+11,17,6,0,0,Math.PI*2);c.stroke();}
  c.imageSmoothingEnabled=true;c.drawImage(atlas,cx-90,sy,180,height,x-18,y+12-height*.2,36,height*.2);c.restore();return true;
 }
 root.WALK_SHEET={frame,draw,model};if(typeof module!=='undefined')module.exports=root.WALK_SHEET;
})(typeof window!=='undefined'?window:globalThis);
