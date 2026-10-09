/* First 90 days: plan story. Navigation and presenter mode match the concept demo. Dr Mark Aszkenasy. */
'use strict';
(function(){
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const root=document.documentElement,SC=$$('.scene');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- navigation: progress, dots, header tone, presenter keys ---------- */
const dots=$('#dots');
dots.innerHTML=SC.map(s=>`<a href="#${s.id}" aria-label="${s.dataset.name}"><span>${s.dataset.name}</span></a>`).join('');
const dotA=[...dots.children];
dotA.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();go(i)}));
let cur=0,jumping=false,jt;
const idxAt=y=>{let k=0;SC.forEach((s,i)=>{if(s.offsetTop<=y)k=i});return k};
function onScroll(){const h=root.scrollHeight-innerHeight;$('#prog').style.width=(100*scrollY/Math.max(1,h))+'%';
  $('#hdr').classList.toggle('scrolled',scrollY>20);
  const k=idxAt(scrollY+innerHeight*.45);if(!jumping)cur=k;dotA.forEach((a,i)=>a.classList.toggle('on',i===k));
  document.body.classList.toggle('on-dark',SC[idxAt(scrollY+30)].classList.contains('dark'))}
function go(i){cur=Math.max(0,Math.min(SC.length-1,i));jumping=true;clearTimeout(jt);jt=setTimeout(()=>{jumping=false},1000);
  scrollTo({top:SC[cur].offsetTop,behavior:reduce?'auto':'smooth'})}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();
addEventListener('keydown',e=>{const t=e.target,k=e.key;
  if(t.closest&&t.closest('input,textarea,select'))return;if(e.metaKey||e.ctrlKey||e.altKey)return;
  if((k===' '||k==='Enter')&&t.closest&&t.closest('button,a,[role=button]'))return;
  if(['ArrowDown','ArrowRight','PageDown'].includes(k)||(k===' '&&!e.shiftKey)){e.preventDefault();go(cur+1)}
  else if(['ArrowUp','ArrowLeft','PageUp'].includes(k)||(k===' '&&e.shiftKey)){e.preventDefault();go(cur-1)}
  else if(k==='Home'){e.preventDefault();go(0)}else if(k==='End'){e.preventDefault();go(SC.length-1)}
  else if(k==='f'||k==='F')toggleFS()});
function toggleFS(){if(!document.fullscreenElement){const p=root.requestFullscreen&&root.requestFullscreen();if(p&&p.catch)p.catch(()=>{})}else document.exitFullscreen()}
document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('presenting',!!document.fullscreenElement);setTimeout(()=>go(cur),200)});
$('#presentBtn').addEventListener('click',e=>{e.currentTarget.blur();toggleFS()});

/* ---------- scene activation ---------- */
const INIT={},done={};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const s=e.target;s.classList.add('in');
  if(INIT[s.id]&&!done[s.id]){done[s.id]=1;INIT[s.id]()}}),{threshold:.18});

const PH=[
 {w:'Weeks 0–2',n:'Set up and baseline',c:'#9adbc6',f:3.3,from:0,to:2,p:'Name owners. Fix scope and measures. Map data sources. Start the DPIA. Hazard identification workshop. MHRA classification note. Measure the baseline, including the outcome measure.',d:['Signed one-page value case','DPIA draft','Hazard log v0.1','Baseline figures']},
 {w:'Weeks 3–6',n:'Build and validate',c:'#FF8684',f:4,from:3,to:6,p:'Encode the titration monitoring rules, each signed off clinically. Run in shadow mode on historical data, with no flags shown. Compare against a manual audit sample. Specify and build the stable-dose rules. Design the worklist with champions.',d:['Validated titration rules','Accuracy vs manual audit','Clinical safety case','DPIA approved','Go-live decision']},
 {w:'Weeks 7–10',n:'Live with champions',c:'#FFD35C',f:4,from:7,to:10,p:'Titration rules live. Stable-dose rules through shadow mode, then live once validated. Champions sign off every flag. Weekly review of flags, false positives, time taken and hazards.',d:['Weekly metrics',"First 'ready to transfer' list",'Updated hazard log','Training material']},
 {w:'Weeks 11–13',n:'Evaluate and decide',c:'#ffffff',f:3.3,from:11,to:13,p:'Compare against baseline. Clinician and GP feedback. Running cost. Safety review.',d:['Evaluation and assurance report for the board and commissioners','Recommendation for day 90']}];

/* ---------- 1 opening: 13-week strip ---------- */
(function(){let h='';for(let w=0;w<14;w++){const p=PH.find(p=>w>=p.from&&w<=p.to);h+=`<i style="background:${p.c};opacity:${p.c==='#ffffff'?.85:1};transition-delay:${(.9+w*.09).toFixed(2)}s"></i>`}
  PH.forEach(p=>{h+=`<span style="grid-column:${p.from+1}/span ${p.to-p.from+1}">${p.n}</span>`});$('#weeks13').innerHTML=h})();

/* flowing data in the opening, as in the demo */
(function flow(){const cv=$('#flow'),ctx=cv.getContext('2d');let W,H,dpr,run=true;const N=Math.round(Math.min(200,Math.max(50,innerWidth*innerHeight/10000))),ps=[];
  function size(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',size);
  const spawn=(p,first)=>{p.x=first?Math.random()*W:-20;p.y=Math.random()*H;p.v=.5+Math.random()*1.1;p.c=Math.random()<.14?'255,134,132':(Math.random()<.5?'154,219,198':'222,255,248');p.a=.2+Math.random()*.5;p.r=Math.random()<.1?2.4:1.3;return p};
  for(let i=0;i<N;i++)ps.push(spawn({},true));
  let t=0;function frame(){if(!run)return;t+=1;ctx.clearRect(0,0,W,H);
    for(const p of ps){const ang=Math.sin(p.x*.0035+t*.004+p.y*.004)*.5;const vx=p.v,vy=Math.sin(ang)*p.v*.9+(H*.58-p.y)*.0016*(p.x/W);
      p.x+=vx;p.y+=vy;if(p.x>W+20)spawn(p);
      const g=ctx.createLinearGradient(p.x-vx*14,p.y-vy*14,p.x,p.y);g.addColorStop(0,`rgba(${p.c},0)`);g.addColorStop(1,`rgba(${p.c},${p.a})`);
      ctx.strokeStyle=g;ctx.lineWidth=p.r;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x-vx*14,p.y-vy*14);ctx.lineTo(p.x,p.y);ctx.stroke()}
    requestAnimationFrame(frame)}
  if(reduce){run=false;return}
  new IntersectionObserver(es=>{const v=es[0].isIntersecting&&!document.hidden;if(v&&!run){run=true;requestAnimationFrame(frame)}else if(!v)run=false}).observe($('#p-open'));
  requestAnimationFrame(frame)})();

/* ---------- 3 pathway: checks light up station by station ---------- */
INIT['p-path']=()=>{$$('.stations>li').forEach((st,i)=>{[...st.querySelectorAll('ul li')].forEach((li,j)=>setTimeout(()=>li.classList.add('on'),reduce?0:(600+i*620+j*110)))})};

/* ---------- 4 tiles stagger ---------- */
$$('#tiles .tile').forEach((t,i)=>t.style.setProperty('--d',(.12+i*.08).toFixed(2)));

/* ---------- 6 governance timeline ---------- */
(function(){const N=14,pos=w=>(100*w/N).toFixed(3)+'%';
  const R=[
   {b:'DPIA',s:'Started in week 0, covering the UK to India data flow. Signed off before live use.',bar:[0,7],t:'Approved before go-live'},
   {b:'Caldicott Guardian and DPO',s:'Sign off data access. Identifiable data stays in the UK unless the DPIA approves otherwise.',ms:6.5,t:'Before go-live'},
   {b:'Safety case and hazard log',s:'DCB0129 and DCB0160 both apply, as we build and deploy the tool ourselves.',bar:[1,14],live:1,t:'Opened in week 1, kept live'},
   {b:'Clinical Safety Officer',s:'Named, ideally not the rule author, so review is independent.',ms:1.5,t:'Named at set-up'},
   {b:'MHRA classification',s:'A documented decision on whether the tool is software as a medical device. Confirmed, not assumed.',ms:1.5,t:'Classification note at set-up'}];
  let h=`<div class="gax"><span></span><div class="wk">${Array.from({length:N},(_,w)=>`<span>${w===0?'Week 0':w}</span>`).join('')}</div></div><div class="gwrap">`;
  R.forEach((r,i)=>{const d=(.3+i*.25).toFixed(2);let tr=`<div class="grid">${'<i></i>'.repeat(N)}</div>`;
    if(r.bar){tr+=`<span class="gbar${r.live?' live':''}" style="left:${pos(r.bar[0])};width:calc(${pos(r.bar[1]-r.bar[0])} - 4px);transition-delay:${d}s"></span>`;
      const inside=r.bar[1]-r.bar[0]>=6;tr+=`<span class="gtxt" style="${inside?`left:calc(${pos(r.bar[0])} + .8rem);color:#fff;top:.5rem`:`left:calc(${pos(r.bar[1])} + .5rem)`};transition-delay:${(+d+.8).toFixed(2)}s">${r.t}</span>`}
    else{tr+=`<span class="gms" style="left:${pos(r.ms)};transition-delay:${d}s"></span><span class="gtxt" style="left:calc(${pos(r.ms)} + 1.1rem);transition-delay:${(+d+.3).toFixed(2)}s">${r.t}</span>`}
    h+=`<div class="grow"><div class="lab"><b>${r.b}</b><span>${r.s}</span></div><div class="gtr">${tr}</div></div>`});
  h+=`</div>`;$('#gantt').innerHTML=h;
  // go-live marker spans all rows, aligned to the track column
  const gw=$('#gantt .gwrap'),gl=document.createElement('div');gl.className='golive';gl.innerHTML='<span>Go-live · titration rules</span>';gw.appendChild(gl);
  function place(){const tr=gw.querySelector('.gtr');if(!tr)return;const a=tr.getBoundingClientRect(),b=gw.getBoundingClientRect();if(!a.width){gl.style.display='none';return}gl.style.display='';gl.style.left=(a.left-b.left+a.width*7/N)+'px'}
  place();addEventListener('resize',place);requestAnimationFrame(place)})();

/* ---------- 7 phases ---------- */
(function(){let t=.3;$('#phases').innerHTML=PH.map((p,i)=>{const dur=.22*(p.to-p.from+1),d=t;t+=dur;
  const lis=p.d.map((x,j)=>`<li style="--c:${p.c};transition-delay:${(d+dur+.1+j*.12).toFixed(2)}s">${x}</li>`).join('');
  return`<div class="ph"><div class="hd"><i style="background:${p.c};transition-duration:${dur.toFixed(2)}s;transition-delay:${d.toFixed(2)}s"></i><b>${p.w}</b></div><h3>${p.n}</h3><p>${p.p}</p><ul><span>Deliverables</span>${lis}</ul></div>`}).join('')})();

/* ---------- 10 day-90 fork: branches drawn between the boxes ---------- */
(function(){const f=$('#fork'),sv=f.querySelector('svg'),d=f.querySelector('.day'),a=f.querySelector('.scale'),b=f.querySelector('.stop');
  function draw(){const F=f.getBoundingClientRect();if(!F.width||getComputedStyle(sv).display==='none')return;const r=e=>e.getBoundingClientRect();
    const D=r(d),x0=D.right-F.left,y0=D.top+D.height/2-F.top;
    [[a,'.b1'],[b,'.b2']].forEach(([e,c])=>{const E=r(e),x1=E.left-F.left,y1=E.top+E.height/2-F.top,m=(x0+x1)/2;
      sv.querySelector(c).setAttribute('d',`M${x0} ${y0} C${m} ${y0} ${m} ${y1} ${x1} ${y1}`)})}
  draw();addEventListener('resize',draw);document.fonts&&document.fonts.ready.then(draw)})();

requestAnimationFrame(()=>SC.forEach(s=>io.observe(s)));
})();
