(function(root){
 const image=typeof Image==='function'?new Image():null;
 if(image)image.src=new URL('assets/office-props.png',document.currentScript.src).href;
 // Normalized crops of the four isolated assets in the generated source.
 const crops={coffee:[.04,.025,.45,.48],board:[.53,.085,.42,.39],plant:[.035,.505,.405,.445],desk:[.465,.51,.525,.47]};
 function draw(c,type,x,y,w,h){if(!image?.complete||!image.naturalWidth||!crops[type])return false;
  const b=crops[type],iw=image.naturalWidth,ih=image.naturalHeight,sw=b[2]*iw,sh=b[3]*ih;
  const scale=Math.min(w/sw,h/sh),width=sw*scale,height=sh*scale;
  c.drawImage(image,b[0]*iw,b[1]*ih,sw,sh,x+(w-width)/2,y+h-height,width,height);return true;
 }
 root.OFFICE_ART={draw};
})(typeof window!=='undefined'?window:globalThis);
