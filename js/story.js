/* Story page: eight scenes, one idea each. Every figure comes from the synthetic cohort built in app.js / audit.js.
   Concept demo by Dr Mark Aszkenasy. No real patient information. */
'use strict';
(function(){
const root=document.documentElement,SC=[...document.querySelectorAll('.scene')];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rem=()=>parseFloat(getComputedStyle(root).fontSize);
const HEAD='"Familjen Grotesk", Arial, sans-serif',BODY='Arimo, Arial, sans-serif';
const GREEN='#3DDC97',AMBER='#FFD35C',RED='#FF8684';

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
requestAnimationFrame(()=>SC.forEach(s=>io.observe(s)));

/* ---------- chart helpers ---------- */
const px=f=>Math.round(rem()*f);
const endLabels=ITEMS=>({id:'endLabels',afterDatasetsDraw(ch){if(!ch.$ready)return;const ctx=ch.ctx;ctx.save();ctx.textBaseline='middle';
  ITEMS.forEach(it=>{const pts=ch.getDatasetMeta(it.ds).data,p=pts[it.at===undefined?pts.length-1:it.at];if(!p)return;
    const lines=(typeof it.text==='function'?it.text():it.text).split('\n'),s=px(it.f||1);ctx.textAlign=it.align||'left';
    lines.forEach((l,j)=>{ctx.font=j?`400 ${Math.round(s*.78)}px ${BODY}`:`700 ${s}px ${HEAD}`;ctx.fillStyle=j?(it.c2||'#5d6b70'):it.color;ctx.fillText(l,p.x+(it.dx===undefined?12:it.dx),p.y+(it.dy||0)+j*s*1.1)})});ctx.restore()}});
function axisStyle(dark){const c=dark?'rgba(255,255,255,.65)':'#6b787c';return{ticks:{color:c,font:{size:px(.78),family:BODY}},grid:{display:false},border:{display:false}}}

/* ---------- 1 opening: number + flowing data ---------- */
const DP=P.reduce((a,p)=>a+14+30+(p.formsReturned?90:0)+(p.assessed?60:0)+(p.startTx?20+p.steps*31:0)+(p.stable?25:0),0);
INIT['s-open']=()=>{const el=$('#dp'),t0=performance.now(),D=reduce?1:2400;
  (function tick(t){const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(DP*e));if(k<1)requestAnimationFrame(tick)})(t0)};
(function flow(){const cv=$('#flow'),ctx=cv.getContext('2d');let W,H,dpr,run=true;const N=Math.round(Math.min(260,Math.max(60,innerWidth*innerHeight/8500))),ps=[];
  function size(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',size);
  const spawn=(p,first)=>{p.x=first?Math.random()*W:-20;p.y=Math.random()*H;p.v=.6+Math.random()*1.3;p.c=Math.random()<.14?'255,134,132':(Math.random()<.5?'154,219,198':'222,255,248');p.a=.25+Math.random()*.55;p.r=Math.random()<.1?2.4:1.3;return p};
  for(let i=0;i<N;i++)ps.push(spawn({},true));
  let t=0;function frame(){if(!run)return;t+=1;ctx.clearRect(0,0,W,H);
    for(const p of ps){const ang=Math.sin(p.x*.0035+t*.004+p.y*.004)*.5;const vx=p.v,vy=Math.sin(ang)*p.v*.9+(H*.58-p.y)*.0016*(p.x/W);
      p.x+=vx;p.y+=vy;if(p.x>W+20)spawn(p);
      const g=ctx.createLinearGradient(p.x-vx*14,p.y-vy*14,p.x,p.y);g.addColorStop(0,`rgba(${p.c},0)`);g.addColorStop(1,`rgba(${p.c},${p.a})`);
      ctx.strokeStyle=g;ctx.lineWidth=p.r;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x-vx*14,p.y-vy*14);ctx.lineTo(p.x,p.y);ctx.stroke()}
    requestAnimationFrame(frame)}
  if(reduce){for(let i=0;i<60;i++){t++;ps.forEach(p=>{p.x+=p.v})}run=false;return}
  new IntersectionObserver(es=>{const v=es[0].isIntersecting&&!document.hidden;if(v&&!run){run=true;requestAnimationFrame(frame)}else if(!v)run=false}).observe($('#s-open'));
  requestAnimationFrame(frame)})();

/* ---------- 2 waits: one slider ---------- */
(function(){const rec=P.filter(p=>p.m>=15),demand=Math.round(rec.length/13),dnaRate=pct(rec.filter(p=>p.startTx),p=>p.dna)/100||.1,
  medW=median(rec.filter(p=>p.assessed).map(p=>p.refToAssess))/7,rate=4.4,wte=Math.max(1,Math.round(demand*.96/(rate*(1-dnaRate*.6))*2)/2);
  Object.assign(FC,{dem0:demand,dna:dnaRate,W0:Math.round(demand*Math.max(medW,6)*2),def:{d:demand,w:wte,r:rate,x:0}});
  let tgt=wte+4;for(let w=wte;w<=wte+10;w+=.5){const h=simulate(demand,w,rate,0).T.findIndex(t=>t<=FCTARGET);if(h>=0&&h<=30){tgt=w;break}}
  const s=$('#wte');s.min=wte-2;s.max=tgt+3;s.step=.5;s.value=wte;
  const start=new Date(2026,9,12),lab=Array.from({length:52},(_,i)=>new Date(start.getTime()+i*7*864e5));
  const dshort=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  const B=simulate(demand,wte,rate,0);let S=B,hit=-1,chart;
  const better=pct(P.filter(p=>p.startTx),p=>p.resp);$('#k_better').textContent=fmt(better)+'%';
  $('#s-waits .kpi3 div:nth-child(3) span').textContent='respond to medication by 12 weeks';
  function calc(){const w=+s.value;S=simulate(demand,w,rate,0);hit=S.T.findIndex(t=>t<=FCTARGET);
    $('#wteOut').textContent=w.toFixed(1).replace('.0','')+' WTE';s.style.setProperty('--p',(100*(w-s.min)/(s.max-s.min))+'%');
    $('#k_hit').textContent=hit>=0?'w/c '+dshort(lab[hit]):'Not this year';
    $('#s-waits .kpi3 div:first-child span').textContent=hit>=0?'waits fall under 8 weeks':'waits stay above 8 weeks';
    $('#k_list').textContent=fmt(S.L[25])}
  calc();
  function draw(){const dark=false;chart=new Chart($('#c_wait'),{type:'line',
    data:{labels:lab.map(d=>d.toLocaleDateString('en-GB',{month:'short',year:'2-digit'})),datasets:[
      {data:S.T.map(v=>+v.toFixed(2)),borderColor:C.teal,borderWidth:5,pointRadius:0,tension:.35,fill:{target:{value:0}},
       backgroundColor:c=>{const a=c.chart.chartArea;if(!a)return'transparent';const g=c.chart.ctx.createLinearGradient(0,a.top,0,a.bottom);g.addColorStop(0,'rgba(0,97,101,.22)');g.addColorStop(1,'rgba(0,97,101,0)');return g}},
      {data:B.T.map(v=>+v.toFixed(2)),borderColor:'#b3c1c3',borderDash:[6,6],borderWidth:2.5,pointRadius:0,tension:.35},
      {data:lab.map(()=>FCTARGET),borderColor:C.coral,borderWidth:2.5,borderDash:[2,6],pointRadius:0}]},
    options:{animation:{duration:900},layout:{padding:{right:px(7.4),top:px(1.2)}},interaction:{intersect:false,mode:'index'},
      plugins:{legend:{display:false},tooltip:{displayColors:false,callbacks:{title:it=>'w/c '+dshort(lab[it[0].dataIndex]),label:c=>[`This plan: ${fmt(c.chart.data.datasets[0].data[c.dataIndex],1)} weeks`,`Current plan: ${fmt(c.chart.data.datasets[1].data[c.dataIndex],1)} weeks`][c.datasetIndex]||null}}},
      scales:{x:{...axisStyle(dark),ticks:{...axisStyle(dark).ticks,autoSkip:false,maxRotation:0,callback:function(v,i){const n=this.chart.width<520?26:13;return i%n===0?lab[i].toLocaleDateString('en-GB',{month:'short',year:'numeric'}):''}}},
        y:{...axisStyle(dark),min:0,suggestedMax:Math.ceil(Math.max(...B.T,...S.T)/4)*4,grid:{color:'rgba(0,60,64,.06)'},ticks:{...axisStyle(dark).ticks,maxTicksLimit:5,callback:v=>v+' wks'}}}},
    plugins:[endLabels([{ds:0,color:C.teal,text:()=>`${fmt(S.T[51],1)} wks\nthis plan`,f:1.05},{ds:1,color:'#8a9a9d',text:()=>`${fmt(B.T[51],1)} wks\ncurrent plan`,f:.9},{ds:2,color:'#e2605e',text:'8-week\ntarget',f:.9,c2:'#e2605e'}]),{id:'hit',afterDatasetsDraw(ch){if(!ch.$ready||hit<0)return;const p=ch.getDatasetMeta(0).data[hit];if(!p)return;const x=ch.ctx;x.save();
      x.fillStyle='#fff';x.strokeStyle=C.coral;x.lineWidth=4;x.beginPath();x.arc(p.x,p.y,8,0,7);x.fill();x.stroke();
      x.font=`700 ${px(.85)}px ${HEAD}`;x.fillStyle=C.teal;x.textAlign='center';x.fillText('Under target',p.x,p.y-px(1.3));x.restore()}}]});
    setTimeout(()=>{chart.$ready=true;chart.update('none')},reduce?0:950)}
  function upd(){calc();if(!chart)return;chart.data.datasets[0].data=S.T.map(v=>+v.toFixed(2));chart.update('none')}
  s.addEventListener('input',upd);
  INIT['s-waits']=()=>{draw();if(reduce)return;
    setTimeout(()=>{const t0=performance.now(),D=1800,from=wte;(function g(t){const k=Math.min(1,(t-t0)/D),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      s.value=Math.round((from+(tgt-from)*e)*2)/2;upd();if(k<1)requestAnimationFrame(g)})(t0)},1300)};
})();

/* ---------- 3 autism + ADHD journeys ---------- */
(function(){const tx=P.filter(p=>p.service==='child'&&p.startTx),dx=P.filter(p=>p.service==='child'&&p.diagnosed);
  const grp=[{n:'ADHD alone',c:C.teal,f:p=>!p.autism},{n:'ADHD + autism',c:'#e2605e',f:p=>p.autism}].map(g=>{const t=tx.filter(g.f),st=t.filter(p=>p.stable);
    return{...g,nTx:t.length,steps:mean(st.map(p=>p.steps)),weeks:median(st.map(p=>p.stableDays))/7,irr:pct(t,p=>p.se.Irritability),sleep:pct(dx.filter(g.f),p=>p.sleepProb)}});
  const AX=Math.ceil((Math.max(...grp.map(g=>g.weeks))+3)/4)*4,sp=3.4/AX;
  let h='<em class="tag">Synthetic data</em>';
  grp.forEach((g,r)=>{const w=100*g.weeks/AX,n=Math.max(1,Math.round(g.steps)),d0=r*.35,dur=g.weeks*sp;
    let dots='';for(let j=0;j<n;j++){const x=w*j/n;dots+=`<i class="dot" style="left:${x}%;border-color:${g.c};transition-delay:${(d0+dur*j/n).toFixed(2)}s"></i>`}
    h+=`<div class="jrow"><div class="jlab"><b style="color:${g.c}">${g.n}</b><span>${fmt(g.nTx)} children starting medication</span></div>
      <div class="jtrack"><span class="base"></span><span class="line" style="--w:${w}%;background:${g.c};transition-duration:${dur.toFixed(2)}s;transition-delay:${d0}s"></span>${dots}
      <span class="end" style="left:${w}%;background:${g.c};transition-delay:${(d0+dur).toFixed(2)}s">✓</span>
      <span class="flag" style="left:${w}%;transition-delay:${(d0+dur+.15).toFixed(2)}s;top:-${r?1.6:1.6}rem"><b style="color:${g.c}">Stable by week ${fmt(g.weeks)}</b><span>${fmt(g.steps,1)} dose changes on average</span></span></div></div>
      <div class="jfacts"><span>Irritability on medication <b>${fmt(g.irr)}%</b></span><span>Sleep problems at baseline <b>${fmt(g.sleep)}%</b></span></div>`});
  let ax='';for(let k=0;k<=AX;k+=4)ax+=`<i style="left:${100*k/AX}%">${k===0?'First dose':k+' weeks'}</i>`;
  h+=`<div class="jaxis"><span>Each dot is a dose change</span><div>${ax}</div></div>`;
  $('#journeys').innerHTML=h;
  $('#journeys .jaxis span').style.cssText='font-size:.78rem;color:#5d6b70';
  // make room for the flag labels above each track
  document.querySelectorAll('#journeys .jrow').forEach(r=>r.style.marginTop='2.6rem');
})();

/* ---------- 4 NICE ring ---------- */
(function(){const arr=AUD.filter(afilter),rec=arr.filter(p=>p.m>=12);
  const rows=STD.map((S,k)=>({S,k,st:stdStats(S,S.all?arr:rec)})).filter(o=>o.st.den>0);
  rows.forEach(o=>o.rag=audRag(o.st.pct,o.S.tg));
  const meet=rows.filter(o=>Math.round(o.st.pct)>=o.S.tg).length,tot=rows.reduce((a,o)=>a+o.st.den,0),num=rows.reduce((a,o)=>a+o.st.num,0);
  const COL={green:GREEN,amber:AMBER,red:RED},LBL={green:'On target',amber:'Close',red:'Below target'};
  const cx=320,cy=320,r0=196,r1=256,g=.018,G=.075,groups=[...new Set(rows.map(o=>o.S.g))];
  const segA=(2*Math.PI-rows.length*g-groups.length*G)/rows.length;
  const pt=(r,a)=>[cx+r*Math.sin(a),cy-r*Math.cos(a)];
  const arc=(a0,a1)=>{const[x0,y0]=pt(r1,a0),[x1,y1]=pt(r1,a1),[x2,y2]=pt(r0,a1),[x3,y3]=pt(r0,a0);return`M${x0.toFixed(1)} ${y0.toFixed(1)}A${r1} ${r1} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A${r0} ${r0} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z`};
  let a=G/2,svg='',lab='',last=null,gs=0;
  rows.forEach((o,i)=>{if(o.S.g!==last){if(last!==null){lab+=glab(last,gs,a-g);a+=G}last=o.S.g;gs=a}
    o.a0=a;o.a1=a+segA;svg+=`<path class="seg" tabindex="0" role="button" data-i="${i}" d="${arc(a,a+segA)}" fill="${COL[o.rag]}" style="transition-delay:${(.3+i*.06).toFixed(2)}s"><title>${o.S.g} ${o.S.r.join(', ')}: ${o.S.t} (${fmt(o.st.pct)}%, target ${o.S.tg}%)</title></path>`;a+=segA+g});
  lab+=glab(last,gs,a-g);
  function glab(n,a0,a1){const m=(a0+a1)/2,[x,y]=pt(r1+30,m),s=Math.sin(m);return`<text class="gl" x="${x.toFixed(1)}" y="${(y+5).toFixed(1)}" text-anchor="${Math.abs(s)<.25?'middle':s>0?'start':'end'}">${n}</text>`}
  const leg=[['On target',GREEN],['Close',AMBER],['Below',RED]].map(([t,c],j)=>`<circle cx="${214+j*88}" cy="626" r="6" fill="${c}"/><text x="${224+j*88}" y="631" style="font-size:14px;fill:rgba(255,255,255,.7)">${t}</text>`).join('');
  $('#ring').innerHTML=svg+lab+`<text class="c1" x="${cx}" y="${cy+12}" text-anchor="middle">${fmt(100*num/tot)}%</text><text class="c2" x="${cx}" y="${cy+50}" text-anchor="middle">of ${fmt(tot)} checks met</text><text class="c3" x="${cx}" y="${cy+80}" text-anchor="middle">${meet} of ${rows.length} standards on target</text>`+leg;
  const segs=[...document.querySelectorAll('#ring .seg')];
  function sel(i){const o=rows[i];segs.forEach((s,j)=>s.classList.toggle('sel',j===i));const st=o.st,ref=o.S.r.join(', ');
    $('#nicePanel').innerHTML=`<div class="top"><span class="rag" style="background:${COL[o.rag]}">${LBL[o.rag]}</span><a href="${NICEURL(o.S.g,o.S.r[0])}" target="_blank" rel="noopener">NICE ${o.S.g} ${ref} ↗</a></div>
      <h3>${o.S.t}</h3><div class="pc">${fmt(st.pct)}%<small>met · target ${o.S.tg}% · ${fmt(st.num)} of ${fmt(st.den)}</small></div>
      ${(()=>{const m=st.miss.slice(0,3),ws=new Set(m.map(p=>o.S.why(p)));if(!m.length)return'<ul><li><span>No missed cases.</span></li></ul>';
        if(ws.size===1)return`<ul><li><b>Reason</b><span>${[...ws][0]}</span></li><li><b>Worklist</b><span>${m.map(pid).join(' · ')}</span></li><li><b>Action</b><span>${o.S.act}</span></li></ul>`;
        return`<ul>${m.map(p=>`<li><b>${pid(p)}</b><span>${o.S.why(p)}</span></li>`).join('')}</ul>`})()}
      ${st.miss.length>3?`<div class="more2">+ ${fmt(st.miss.length-3)} more on the synthetic worklist</div>`:''}`}
  segs.forEach((s,i)=>{s.addEventListener('click',()=>sel(i));s.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sel(i)}})});
  const worst=rows.map((o,i)=>[o.st.pct-o.S.tg,i]).sort((x,y)=>x[0]-y[0])[0][1];sel(worst);
})();

/* ---------- 5 cliff edge ---------- */
INIT['s-transition']=()=>{const pl=TA.filter(t=>t.planned),un=TA.filter(t=>!t.planned);const K=[];for(let k=-12;k<=12;k++)K.push(k);
  const eng=g=>K.map(k=>100*g.filter(t=>t.dis>k||t.dis===99).length/g.length);const ep=eng(pl),eu=eng(un);
  const n=K.length,step=1700/n;const prevY=c=>c.index===0?c.chart.scales.y.getPixelForValue(100):c.chart.getDatasetMeta(c.datasetIndex).data[c.index-1].getProps(['y'],true).y;
  const anim=reduce?false:{x:{type:'number',easing:'linear',duration:step,from:NaN,delay(c){if(c.type!=='data'||c.xStarted)return 0;c.xStarted=true;return c.index*step}},
    y:{type:'number',easing:'linear',duration:step,from:prevY,delay(c){if(c.type!=='data'||c.yStarted)return 0;c.yStarted=true;return c.index*step}}};
  const ch=new Chart($('#c_cliff'),{type:'line',data:{labels:K,datasets:[
      {data:ep,borderColor:C.teal,borderWidth:5,pointRadius:0,tension:.3},
      {data:eu,borderColor:C.coral,borderWidth:5,pointRadius:0,tension:.3,fill:'-1',backgroundColor:'rgba(255,134,132,.13)'}]},
    options:{animations:anim,layout:{padding:{right:px(8.6),top:px(1.6)}},
      plugins:{legend:{display:false},tooltip:{displayColors:false,callbacks:{title:it=>{const k=K[it[0].dataIndex];return k===0?'18th birthday':(k>0?k+' months after 18':(-k)+' months before 18')},label:c=>`${c.datasetIndex?'Unplanned':'Planned'}: ${fmt(c.parsed.y)}% still in care`}}},
      interaction:{intersect:false,mode:'index'},
      scales:{x:{...axisStyle(false),ticks:{...axisStyle(false).ticks,autoSkip:false,maxRotation:0,callback:function(v,i){const s=this.chart.width<520;return i===0?(s?'−12 m':'12 months before'):i===12?(s?'18':'18th birthday'):i===24?(s?'+12 m':'12 months after'):''}}},
        y:{...axisStyle(false),min:40,max:100,grid:{color:'rgba(0,60,64,.06)'},ticks:{...axisStyle(false).ticks,stepSize:20,callback:v=>v+'%'}}}},
    plugins:[endLabels([{ds:0,color:C.teal,text:`${fmt(ep[n-1])}%\nplanned`,f:1.25},{ds:1,color:'#e2605e',text:`${fmt(eu[n-1])}%\nunplanned`,f:1.25}]),{id:'b18',beforeDatasetsDraw(c){const x=c.scales.x.getPixelForValue(12),y=c.scales.y,g=c.ctx;g.save();g.strokeStyle='#9fb0b2';g.setLineDash([4,5]);g.lineWidth=1.5;g.beginPath();g.moveTo(x,y.top-px(.4));g.lineTo(x,y.bottom);g.stroke();g.restore()},afterDatasetsDraw(c){if(!c.$ready)return;const i=18,a=c.getDatasetMeta(0).data[i],b=c.getDatasetMeta(1).data[i],g=c.ctx;if(!a||!b)return;g.save();g.font=`700 ${px(1)}px ${HEAD}`;g.fillStyle='#e2605e';g.textAlign='center';g.textBaseline='middle';g.fillText('The cliff edge',a.x,(a.y+b.y)/2);g.restore()}}]});
  setTimeout(()=>{ch.$ready=true;ch.update('none')},reduce?0:1900)};

/* ---------- 6 letter demo ---------- */
(function(){const TXT=`<div class="hd">Clinic letter · synthetic example</div>
<p>Thank you for referring Sam, aged 9. Mum says he is {adhd|Hyperactivity|constantly on the go} and {adhd|Impulsivity|cannot wait his turn}. His teacher reports {adhd|Inattention|poor concentration} in class.</p>
<p>He {autism|Social communication|prefers to play alone} at break, has an {autism|Intense interests|intense interest in train timetables} and {autism|Sensory differences|covers his ears in noisy places}.</p>
<p>He {sleep|Sleep onset over 1 hour|takes over an hour to fall asleep} and {sleep|Night waking|wakes at 3am} most nights.</p>
<p>In his own words: {voice|“My brain goes too fast and nobody lets me finish”|“my brain goes too fast and nobody lets me finish”}.</p>`;
  $('#letterText').innerHTML=TXT.replace(/\{(\w+)\|([^|]+)\|([^}]+)\}/g,(m,c,l,t)=>`<span class="h ${c}" data-c="${c}" data-l="${l}">${t}</span>`);
  const F=[['adhd','ADHD features'],['autism','Autism features'],['sleep','Sleep'],['voice',"Child's own words"],['code','Suggested codes, for clinician to confirm']];
  $('#fields').innerHTML=F.map(([k,n])=>`<div class="fld"><span>${n}</span><div class="chips" id="f_${k}"></div></div>`).join('');
  let run=0;
  function fly(h,c,label,id){const box=$('#f_'+c),ph=document.createElement('span');ph.className=`chip ${c} ph`;ph.textContent=label;box.appendChild(ph);
    if(reduce){ph.classList.remove('ph');return}
    const s=h.getBoundingClientRect(),t=ph.getBoundingClientRect(),f=ph.cloneNode(true);f.classList.remove('ph');f.classList.add('flyer');
    f.style.left=s.left+'px';f.style.top=s.top+'px';document.body.appendChild(f);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transform=`translate(${t.left-s.left}px,${t.top-s.top}px)`}));
    setTimeout(()=>{f.remove();if(id===run)ph.classList.remove('ph')},800)}
  function play(){const id=++run;document.querySelectorAll('.flyer').forEach(f=>f.remove());F.forEach(([k])=>{$('#f_'+k).innerHTML=''});
    const hs=[...document.querySelectorAll('#letterText .h')];hs.forEach(h=>h.classList.remove('on'));let i=0;
    (function step(){if(id!==run)return;if(i<hs.length){const h=hs[i++];h.classList.add('on');fly(h,h.dataset.c,h.dataset.l,id);setTimeout(step,reduce?0:620);return}
      setTimeout(()=>{if(id!==run)return;['ADHD, suspected','Autism, suspected','Sleep difficulty'].forEach((t,j)=>setTimeout(()=>{if(id!==run)return;const e=document.createElement('span');e.className='chip code';e.textContent=t;$('#f_code').appendChild(e)},j*220));
        setTimeout(()=>{if(id!==run)return;const e=document.createElement('span');e.className='chip ok';e.textContent="NICE NG87 1.3.6: child's views recorded ✓";$('#f_voice').appendChild(e)},800)},reduce?0:500)})()}
  $('#replay').addEventListener('click',play);INIT['s-letters']=()=>setTimeout(play,reduce?0:700);
})();

/* ---------- 7 map + follow the sun ---------- */
(function(){const M=MAPDOTS,[lx,ly]=M.lon,[bx,by]=M.blr,mx=(lx+bx)/2,my=(ly+by)/2,dx=bx-lx,dy=by-ly,L=Math.hypot(dx,dy),cx=mx+dy/L*170,cy=my-dx/L*170;
  const path=`M${lx} ${ly}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx} ${by}`;
  $('#map').innerHTML=`<path class="land" d="${M.d}"/><path class="arc" d="${path}"/><path class="arc2" id="arcp" d="${path}"/>
   <circle r="5" fill="#fff"><animateMotion dur="3.4s" repeatCount="indefinite" path="${path}"/></circle>
   <circle r="5" fill="${C.coral}"><animateMotion dur="3.4s" begin="1.7s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" path="${path}"/></circle>
   <circle class="pulse" cx="${lx}" cy="${ly}" r="10" fill="none" stroke="#9adbc6" stroke-width="2"/><circle cx="${lx}" cy="${ly}" r="8" fill="#9adbc6"/>
   <circle class="pulse" cx="${bx}" cy="${by}" r="10" fill="none" stroke="${C.coral}" stroke-width="2" style="animation-delay:1.2s"/><circle cx="${bx}" cy="${by}" r="8" fill="${C.coral}"/>
   <text class="city" x="${lx+18}" y="${ly-22}">London</text><text class="role" x="${lx+18}" y="${ly-2}">UK clinical team</text>
   <text class="city" x="${bx}" y="${by+40}" text-anchor="middle">Bengaluru</text><text class="role" x="${bx}" y="${by+62}" text-anchor="middle">Data and engineering hub</text>`;
  const tf=z=>new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:z});
  const mins=(z,d)=>{const [h,m]=tf(z).format(d).split(':').map(Number);return(h%24)*60+m};
  function tick(){const d=new Date();$('#t_lon').textContent=tf('Europe/London').format(d);$('#t_blr').textContent=tf('Asia/Kolkata').format(d);
    const off=((mins('Asia/Kolkata',d)-mins('Europe/London',d))+1440)%1440,uk=[8*60,18*60],bl=[9*60-off,18*60-off],ov=[Math.max(uk[0],bl[0]),Math.min(uk[1],bl[1])];
    const P_=m=>(100*m/1440).toFixed(2)+'%',seg=(a,b,c)=>`<i style="left:${P_(a)};width:${P_(b-a)};background:${c}"></i>`,now=`<span class="now" style="left:${P_(mins('Europe/London',d))}"></span>`;
    const h=x=>{const v=x/60;return(v%1?Math.floor(v)+'½':v)};
    $('#sun').innerHTML=`<div class="row"><span>UK clinics</span><div class="bar">${seg(uk[0],uk[1],'#9adbc6')}${now}</div></div>
      <div class="row"><span>Bengaluru team</span><div class="bar">${seg(bl[0],bl[1],C.coral)}${now}</div></div>
      <div class="row"><span>Working together</span><div class="bar">${seg(ov[0],ov[1],'#fff')}${now}</div></div>
      <div class="ax"><span></span><div><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div></div>
      <div class="ax" style="margin-top:.5rem"><span></span><div style="justify-content:flex-start;color:rgba(255,255,255,.75)">UK time. ${h(uk[1]-bl[0])} hours of cover a day, ${h(ov[1]-ov[0])} hours of overlap.</div></div>`}
  tick();setInterval(tick,30000)})();
})();
