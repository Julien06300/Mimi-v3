// Mimi Runner — fond Paris + défilement + os (images en minuscules)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  groundY = canvas.height - 96;
}
let groundY = 0;
resize(); window.addEventListener('resize', resize);

// --- IMAGES (respecter la casse EXACTE) ---
const bg    = new Image(); bg.src    = 'paris.PNG';
const mimi  = new Image(); mimi.src  = 'Mimi.PNG';
const boneI = new Image(); boneI.src = 'bone.PNG';

// --- Joueur ---
const GRAV = 0.55;
const player = { x: 140, y: 0, w: 56, h: 56, vy: 0, onGround:false, speed: 4 };
player.y = groundY - player.h;

// --- Monde ---
let camX = 0, moveL = false, moveR = false;
let score = 0;
const bones = [];
function spawnBone(){
  const gap = 220 + Math.random()*160;
  const x = camX + canvas.width + gap;
  const y = groundY - (40 + Math.floor(Math.random()*70));
  bones.push({x,y,w:28,h:22});
}
for(let i=0;i<12;i++) spawnBone();
setInterval(spawnBone, 900);

// --- Contrôles ---
document.addEventListener('keydown', e=>{
  if(e.code==='ArrowLeft')  moveL=true;
  if(e.code==='ArrowRight') moveR=true;
  if(e.code==='Space' || e.code==='ArrowUp') jump();
});
document.addEventListener('keyup', e=>{
  if(e.code==='ArrowLeft')  moveL=false;
  if(e.code==='ArrowRight') moveR=false;
});
const L=document.getElementById('left'),R=document.getElementById('right'),J=document.getElementById('jump');
['touchstart','mousedown'].forEach(ev=>{
  L.addEventListener(ev,e=>{e.preventDefault();moveL=true});
  R.addEventListener(ev,e=>{e.preventDefault();moveR=true});
  J.addEventListener(ev,e=>{e.preventDefault();jump()});
});
['touchend','touchcancel','mouseup','mouseleave'].forEach(ev=>{
  L.addEventListener(ev,()=>moveL=false);
  R.addEventListener(ev,()=>moveR=false);
});
function jump(){ if(player.onGround){ player.vy=-11.5; player.onGround=false; } }

// --- Boucle ---
function loop(){
  // Physique
  player.y += player.vy;
  if(player.y + player.h < groundY){ player.vy += GRAV; player.onGround=false; }
  else { player.vy = 0; player.y = groundY - player.h; player.onGround=true; }

  // Caméra
  if(moveR) camX += player.speed;
  if(moveL) camX = Math.max(0, camX - player.speed);

  // Fond + sol
  drawBackground();
  drawGround();

  // Mimi
  ctx.drawImage(mimi, player.x, player.y, player.w, player.h);
  ctx.font = '16px system-ui,-apple-system'; ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.fillText('Mimi', player.x+player.w/2, player.y-10);

  // Os
  for(let i=bones.length-1;i>=0;i--){
    const b = bones[i];
    b.x -= (moveR?player.speed:0);
    b.x += (moveL?player.speed:0);
    const sx = b.x - camX;
    ctx.drawImage(boneI, sx, b.y, b.w, b.h);
    if (overlap(player.x,player.y,player.w,player.h, sx,b.y,b.w,b.h)){
      bones.splice(i,1); score++; hud.textContent='Os: '+score;
    }
    if (sx < -200) bones.splice(i,1);
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function overlap(ax,ay,aw,ah,bx,by,bw,bh){
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}
function drawBackground(){
  if(!bg.complete) return;
  const w=bg.width,h=bg.height;
  const scale = Math.max(canvas.height/h, 1);
  const dw = w*scale, dh = h*scale;
  const shift = (camX*0.5) % dw;            // parallax & répétition
  for(let x=-shift; x<canvas.width; x+=dw){ ctx.drawImage(bg, x, 0, dw, dh); }
}
function drawGround(){
  ctx.fillStyle='#3b2a1d'; ctx.fillRect(0, groundY, canvas.width, canvas.height-groundY);
  const tw=48, th=20, off=-(camX*0.8)%tw;
  for(let x=off; x<canvas.width; x+=tw){
    ctx.fillStyle='#b8743b'; ctx.fillRect(x, groundY-20, tw-2, th);
    ctx.strokeStyle='#8b5a2b'; ctx.strokeRect(x+0.5, groundY-20.5, tw-3, th-1);
  }
}
