import type { VisualTheme } from "@/schemas/game-spec";

const visualThemes = ["space", "ocean", "lava", "ice", "forest", "neon", "desert"] as const;
const palettes: Record<VisualTheme, [string, string]> = { space:["#071126","#171046"], ocean:["#063d71","#021c45"], lava:["#40110f","#13070c"], ice:["#6fc8df","#103c65"], forest:["#17462d","#071c18"], neon:["#17113c","#060716"], desert:["#d6a25c","#71452b"] };

export function normalizeVisualTheme(value: unknown): VisualTheme {
  return typeof value === "string" && (visualThemes as readonly string[]).includes(value) ? value as VisualTheme : "space";
}

export function renderVisualTheme(ctx: CanvasRenderingContext2D, visualTheme: unknown, width: number, height: number, elapsed = 0) {
  const normalizedTheme = normalizeVisualTheme(visualTheme);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palettes[normalizedTheme][0]); gradient.addColorStop(1, palettes[normalizedTheme][1]); ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
  if(normalizedTheme==="ocean"){ctx.fillStyle="#aeeeff20";for(let i=0;i<4;i+=1){ctx.beginPath();ctx.moveTo(width*(.12+i*.24),0);ctx.lineTo(width*(.28+i*.2),height*.72);ctx.lineTo(width*(.42+i*.18),0);ctx.closePath();ctx.fill()}ctx.strokeStyle="#c5f7ff88";ctx.lineWidth=1.5;for(let i=0;i<18;i+=1){const x=(i*83+elapsed*18)%width,y=height-((i*47+elapsed*28)%(height*.78));ctx.beginPath();ctx.arc(x,y,2+(i%3)*2,0,Math.PI*2);ctx.stroke()}ctx.fillStyle="#193a31";ctx.beginPath();ctx.moveTo(0,height*.88);for(let x=0;x<=width;x+=30)ctx.lineTo(x,height*.86+Math.sin(x*.04)*9);ctx.lineTo(width,height);ctx.lineTo(0,height);ctx.fill();ctx.strokeStyle="#2ea880";ctx.lineWidth=4;for(let x=25;x<width;x+=70){ctx.beginPath();ctx.moveTo(x,height*.9);ctx.quadraticCurveTo(x+12,height*.76,x+3,height*.68);ctx.stroke()}}
  else if(normalizedTheme==="space"){ctx.fillStyle="#e5f8ff";for(let i=0;i<40;i+=1){ctx.globalAlpha=.35+(i%4)*.15;ctx.fillRect((i*97)%width,(i*53)%height,1+(i%2),1+(i%2))}ctx.globalAlpha=1}
  else if(normalizedTheme==="lava"){ctx.fillStyle="#ff572244";ctx.fillRect(0,height*.75,width,height*.25);ctx.strokeStyle="#ff9d3666";ctx.lineWidth=6;for(let x=-30;x<width;x+=90){ctx.beginPath();ctx.moveTo(x,height*.83);ctx.quadraticCurveTo(x+38,height*.72,x+85,height*.9);ctx.stroke()}}
  else if(normalizedTheme==="ice"){ctx.fillStyle="#e5fbff55";for(let i=0;i<28;i+=1){const x=(i*71)%width,y=(i*43+elapsed*12)%height;ctx.fillRect(x,y,2,8)} }
  else if(normalizedTheme==="forest"){ctx.fillStyle="#06150d99";for(let x=0;x<width;x+=55){ctx.fillRect(x,height*.35,18,height*.65);ctx.beginPath();ctx.arc(x+9,height*.3,42,0,Math.PI*2);ctx.fill()}ctx.fillStyle="#c4ff8355";for(let i=0;i<18;i+=1)ctx.fillRect((i*79)%width,(i*59)%height,3,3)}
  else if(normalizedTheme==="neon"){ctx.strokeStyle="#ff4ee455";ctx.lineWidth=1;for(let x=0;x<width;x+=55){ctx.beginPath();ctx.moveTo(width/2,height*.5);ctx.lineTo(x,height);ctx.stroke()}for(let y=height*.55;y<height;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}}
  else if(normalizedTheme==="desert"){ctx.fillStyle="#f3ca7940";for(let i=0;i<3;i+=1){ctx.beginPath();ctx.arc(width*(.18+i*.38),height*1.05,width*.32,Math.PI,Math.PI*2);ctx.fill()}}
}
