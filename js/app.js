/* Concept demo – all data synthetic, generated below with a seeded random number generator.
   Prepared by Dr Mark Aszkenasy. No real patient information is used anywhere. */
'use strict';
// ---------- utilities ----------
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=mulberry32(20261009);
const rnd=()=>R();
const randn=()=>{let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const lognorm=(med,s)=>med*Math.exp(s*randn());
const bern=p=>R()<p;
const sig=x=>1/(1+Math.exp(-x));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const pois=l=>{let L=Math.exp(-l),k=0,p=1;do{k++;p*=R()}while(p>L);return k-1};
const pickW=(items,w)=>{let s=w.reduce((a,b)=>a+b,0),r=R()*s;for(let i=0;i<items.length;i++){r-=w[i];if(r<=0)return items[i]}return items[items.length-1]};
const median=a=>{if(!a.length)return NaN;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
const quant=(a,q)=>{if(!a.length)return NaN;const s=[...a].sort((x,y)=>x-y);const i=(s.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return s[lo]+(s[hi]-s[lo])*(i-lo)};
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN;
const pct=(a,f)=>a.length?100*a.filter(f).length/a.length:NaN;
const fmt=(x,d=0)=>isNaN(x)?'–':x.toLocaleString('en-GB',{maximumFractionDigits:d,minimumFractionDigits:d});
const $=s=>document.querySelector(s);
const C={teal:'#006165',teal2:'#3F7174',teal3:'#5E9EA0',mint:'#9adbc6',coral:'#FF8684',pink:'#F0B0C8',sun:'#FFD35C',slate:'#3F4549',grey:'#b9c4c6',purple:'#8a7fd1',blue:'#5b9bd5'};
const charts={};
function mk(id,cfg){if(charts[id])charts[id].destroy();const el=document.getElementById(id);if(!el)return;charts[id]=new Chart(el,cfg);return charts[id]}
Chart.defaults.font.family='Arimo, "Segoe UI", Arial, sans-serif';Chart.defaults.font.size=13;Chart.defaults.color='#3F4549';
Chart.defaults.maintainAspectRatio=false;Chart.defaults.plugins.legend.labels.boxWidth=14;Chart.defaults.animation.duration=500;
function seg(id,cb){const el=document.getElementById(id);el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{el.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');cb(b.dataset.k)}));}
const MONTHS=[];{const nm=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];for(let i=0;i<18;i++){const mm=(3+i)%12,yy=25+Math.floor((3+i)/12);MONTHS.push(nm[mm]+' '+yy)}}

// ---------- synthetic cohort ----------
const N=9000, P=[];
const ETH=['White','Asian','Black','Mixed','Other'], ETHW=[.76,.10,.05,.06,.03];
const MEDS_A=['Lisdexamfetamine','Methylphenidate','Atomoxetine','Guanfacine'], MEDS_AW=[.5,.38,.08,.04];
const MEDS_C=['Methylphenidate','Lisdexamfetamine','Atomoxetine','Guanfacine'], MEDS_CW=[.62,.24,.08,.06];
const RESP={Methylphenidate:.68,Lisdexamfetamine:.71,Atomoxetine:.52,Guanfacine:.50};
for(let i=0;i<N;i++){
  const m=Math.min(17,Math.floor(18*Math.pow(rnd(),0.85)));
  const service=rnd()<0.6?'adult':'child';
  let age; if(service==='adult'){age=Math.round(clamp(18+Math.abs(randn())*13+rnd()*6,18,70))} else {age=7+Math.floor(rnd()*11)}
  const pathway=service==='child'&&rnd()<0.45?'nd':'adhd';
  const sex=service==='adult'?(rnd()<0.56?'Female':'Male'):(rnd()<(pathway==='nd'?0.32:0.36)?'Female':'Male');
  const imd=pickW([1,2,3,4,5],[.22,.21,.2,.19,.18]);
  const eth=pickW(ETH,ETHW);
  // diagnostic outcome
  let adhdDx,autism=false,ndOut=null;
  if(pathway==='nd'){ndOut=pickW(['ADHD + autism','ADHD only','Autism only','Neither'],[.38,.27,.17,.18]);adhdDx=ndOut.startsWith('ADHD');autism=ndOut==='ADHD + autism'||ndOut==='Autism only'}
  else adhdDx=rnd()<(service==='adult'?0.82:0.78);
  const anx=rnd()<(service==='adult'?0.36:(autism?0.42:0.24));
  const sleepProb=service==='child'?rnd()<(autism?0.71:0.42):rnd()<0.38;
  const melatonin=service==='child'&&sleepProb&&rnd()<(autism?0.62:0.40);
  // capacity improvement over time
  const f=m<7?1:Math.max(0.58,1-0.055*(m-6));
  const formsDays=lognorm(11,0.55)*(1+0.12*(3-imd))*(m>=10?0.68:1);
  const toAssess=lognorm(service==='adult'?52:(pathway==='nd'?82:64),0.42)*f;
  const refToAssess=formsDays+toAssess;
  const assessToDx=lognorm(pathway==='nd'?22:11,0.4);
  const dxToTx=lognorm(service==='adult'?96:74,0.42)*Math.max(0.62,1-0.03*Math.max(0,m-5));
  const formsReturned=rnd()<0.945-0.02*(3-imd)-(service==='adult'&&age<26?0.03:0);
  const assessed=formsReturned&&rnd()<0.965;
  const diagnosed=assessed&&adhdDx;
  const startTx=diagnosed&&rnd()<(service==='adult'?0.84:0.80);
  const med=startTx?(service==='adult'?pickW(MEDS_A,MEDS_AW):pickW(MEDS_C,MEDS_CW)):null;
  const steps=startTx?Math.min(9,1+pois(service==='adult'?1.6:(autism?2.7:1.8))):null;
  const stableDays=startTx?Math.round(steps*20+lognorm(14,0.5)):null;
  const app=rnd()<0.45, rem=rnd()<(m>=9?0.92:0.78), prevDNA=Math.min(4,pois(0.35+0.12*(3-imd)));
  const lastWait=lognorm(42,0.6);
  const ya=service==='adult'&&age<=25?1:0, child=service==='child'?1:0;
  const lp=-2.45+0.52*prevDNA+0.0075*(lastWait-45)+0.2*(3-imd)+0.028*(formsDays-12)-0.55*app+0.38*anx-0.62*rem+0.55*ya-0.7*child;
  const dna=startTx?rnd()<sig(lp):rnd()<sig(lp-0.2);
  const stable=startTx&&rnd()<(0.88-(autism?0.07:0)-(dna?0.08:0));
  const shared=stable&&rnd()<0.74;
  const sharedDays=shared?lognorm(120,0.35):null;
  const monitorOK=startTx&&rnd()<(m<9?0.74:(m<12?0.86:0.93));
  let resp=null,symChange=null,funChange=null,funcImp=null,base=null,base2=null;
  if(startTx){const p=RESP[med]-(autism?0.13:0)-(service==='child'&&!autism?0.01:0);resp=rnd()<p;
    symChange=resp?-(0.3+rnd()*0.35):-(rnd()*0.3-0.05);funChange=clamp(symChange*0.75+randn()*0.13,-0.8,0.25);funcImp=funChange<=-0.25;
    base=service==='adult'?clamp(48+randn()*7,30,70):clamp(36+randn()*6,22,54);base2=clamp(1.6+randn()*0.35,0.6,2.8)}
  const se={};const sep=service==='child'?(autism?{Appetite:.52,Sleep:.41,Irritability:.29,Anxiety:.18,Headache:.17,'Tics':.05}:{Appetite:.45,Sleep:.27,Irritability:.13,Anxiety:.10,Headache:.15,'Tics':.03}):{Appetite:.48,Sleep:.30,Irritability:.12,Anxiety:.14,Headache:.18,'Tics':.01};
  if(startTx)for(const k in sep)se[k]=rnd()<sep[k];
  const satisfied=rnd()<(0.86+(startTx&&resp?0.05:0)-(refToAssess>100?0.08:0)+(m>=10?0.03:0));
  const auStart=pathway==='nd'?lognorm(m<10?102:72,0.35):null;
  const ageBand=service==='child'?(age<=11?'7–11':'12–17'):(age<=25?'18–25':age<=40?'26–40':'41+');
  P.push({i,m,service,age,ageBand,pathway,sex,imd,eth,adhdDx,autism,ndOut,anx,sleepProb,melatonin,formsDays,refToAssess,toAssess,assessToDx,dxToTx,formsReturned,assessed,diagnosed,startTx,med,steps,stableDays,app,rem,prevDNA,lastWait,ya,child,dna,stable,shared,sharedDays,monitorOK,resp,symChange,funChange,funcImp,base,base2,se,satisfied,auStart});
}

// ---------- hero stats ----------
$('#heroStats').innerHTML=[
  [fmt(N),'synthetic referrals generated in your browser'],
  ['13','headline quality KPIs with targets'],
  ['1','explainable model trained live, with a fairness audit'],
  ['0','real patient records used']
].map(([b,s])=>`<div class="stat"><b>${b}</b><span>${s}</span></div>`).join('');

// ---------- KPI dashboard ----------
const PRODM=MONTHS.map((_,m)=>3.55+0.055*m+randn()*0.08); // synthetic assessments per WTE per week
const unit=p=>p.pathway==='nd'?2:(p.service==='child'?1.3:1);
const WTE=MONTHS.map((_,m)=>{const u=P.filter(p=>p.m===m&&p.assessed).reduce((a,p)=>a+unit(p),0);return u/(4.33*PRODM[m])});
const KPIS=[
 {k:'r2a',label:'Referral → assessment',unit:'days',sub:'median',target:56,dir:'low',fn:a=>median(a.filter(p=>p.assessed).map(p=>p.refToAssess)),extra:a=>'90th centile '+fmt(quant(a.filter(p=>p.assessed).map(p=>p.refToAssess),.9))+' d'},
 {k:'within',label:'Assessed within 13 weeks',unit:'%',target:90,dir:'high',fn:a=>pct(a.filter(p=>p.assessed),p=>p.refToAssess<=91)},
 {k:'a2d',label:'Assessment → diagnosis',unit:'days',sub:'median, report issued',target:21,dir:'low',fn:a=>median(a.filter(p=>p.assessed).map(p=>p.assessToDx))},
 {k:'d2t',label:'Diagnosis → treatment start',unit:'days',sub:'median',target:42,dir:'low',fn:a=>median(a.filter(p=>p.startTx).map(p=>p.dxToTx))},
 {k:'stab',label:'Time to stable dose',unit:'days',sub:'median from first dose',target:84,dir:'low',fn:a=>median(a.filter(p=>p.stable).map(p=>p.stableDays))},
 {k:'steps',label:'Titration steps to stability',unit:'',sub:'mean dose / drug changes',target:3.5,dir:'low',dp:1,fn:a=>mean(a.filter(p=>p.stable).map(p=>p.steps))},
 {k:'dna',label:'DNA rate',unit:'%',sub:'missed ≥1 titration appointment',target:6,dir:'low',dp:1,fn:a=>pct(a.filter(p=>p.startTx),p=>p.dna)},
 {k:'mon',label:'Monitoring complete',unit:'%',sub:'BP, HR and weight on time',target:95,dir:'high',fn:a=>pct(a.filter(p=>p.startTx),p=>p.monitorOK)},
 {k:'sym',label:'Meaningful symptom change',unit:'%',sub:'≥30% fall from baseline at 12 wks',target:65,dir:'high',fn:a=>pct(a.filter(p=>p.startTx),p=>p.resp)},
 {k:'fun',label:'Meaningful function change',unit:'%',sub:'WFIRS improvement ≥25%',target:55,dir:'high',fn:a=>pct(a.filter(p=>p.startTx),p=>p.funcImp)},
 {k:'sat',label:'Patient / parent satisfaction',unit:'%',sub:'rated good or very good',target:90,dir:'high',fn:a=>pct(a,p=>p.satisfied)},
 {k:'shared',label:'Shared-care transfer',unit:'%',sub:'of patients on a stable dose',target:70,dir:'high',fn:a=>pct(a.filter(p=>p.stable),p=>p.shared)},
 {k:'prod',label:'Clinician productivity',unit:'',sub:'assessment units per WTE per week (service-wide)',target:4.2,dir:'high',dp:1,fn:(a,ms)=>mean(ms.map(m=>PRODM[m]))}
];
const KF={service:'all',pathway:'all',age:'all',period:3};
let kpiSel='r2a';
function kfilter(p){return (KF.service==='all'||p.service===KF.service)&&(KF.pathway==='all'||p.pathway===KF.pathway)&&(KF.age==='all'||p.ageBand===KF.age)}
function rag(v,K){if(isNaN(v))return 'grey';const ok=K.dir==='low'?v<=K.target:v>=K.target;if(ok)return 'green';const near=K.dir==='low'?v<=K.target*1.12:v>=K.target*0.92;return near?'amber':'red'}
function spark(vals,K){const w=120,h=34,v=vals.filter(x=>!isNaN(x));if(!v.length)return '';const lo=Math.min(...v,K.target),hi=Math.max(...v,K.target),r=(hi-lo)||1;
  const y=x=>h-3-(x-lo)/r*(h-6);const pts=vals.map((x,i)=>isNaN(x)?null:`${(i/(vals.length-1)*w).toFixed(1)},${y(x).toFixed(1)}`).filter(Boolean).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none"><line x1="0" x2="${w}" y1="${y(K.target)}" y2="${y(K.target)}" stroke="#FF8684" stroke-dasharray="3 3" stroke-width="1"/><polyline fill="none" stroke="#006165" stroke-width="2" points="${pts}"/></svg>`}
function monthly(K,arr){return MONTHS.map((_,m)=>{const a=arr.filter(p=>p.m===m);return a.length<15?NaN:K.fn(a,[m])})}
function renderKpis(){
  const arr=P.filter(kfilter);const k=KF.period;const cur=[],prev=[];for(let m=18-k;m<18;m++)cur.push(m);for(let m=18-2*k;m<18-k;m++)prev.push(m);
  const A=arr.filter(p=>cur.includes(p.m)),B=arr.filter(p=>prev.includes(p.m));
  $('#kpiCount').textContent=arr.length?`${fmt(A.length)} synthetic referrals in the selected period`:'No synthetic patients match these filters';
  $('#kpiGrid').innerHTML=KPIS.map(K=>{const v=A.length?K.fn(A,cur):NaN,pv=B.length?K.fn(B,prev):NaN,d=v-pv;const r=rag(v,K);
    const better=K.dir==='low'?d<0:d>0;const arrow=isNaN(d)||Math.abs(d)<1e-9?'':`<span class="delta ${better?'up':'down'}">${d>0?'▲':'▼'} ${fmt(Math.abs(d),K.dp||0)}${K.unit==='%'?' pts':''}</span>`;
    return `<button class="kpitile ${K.k===kpiSel?'sel':''}" data-k="${K.k}"><span class="kl">${K.label}</span><span class="kv">${fmt(v,K.dp||0)}<small>${K.unit==='%'?'%':(K.unit?' '+K.unit:'')}</small></span>
      <span class="ks">${K.sub||''}${K.extra&&A.length?' · '+K.extra(A):''}</span>${spark(monthly(K,arr),K)}
      <span class="kfoot"><span class="pill ${r}">Target ${K.dir==='low'?'≤':'≥'} ${K.target}${K.unit==='%'?'%':(K.unit?' '+K.unit:'')}</span>${arrow}</span></button>`}).join('');
  document.querySelectorAll('.kpitile').forEach(b=>b.addEventListener('click',()=>{kpiSel=b.dataset.k;renderKpis()}));
  renderKpiTrend(arr);resetForecast(arr);
}
function renderKpiTrend(arr){const K=KPIS.find(x=>x.k===kpiSel);const vals=monthly(K,arr);
  $('#trendTitle').textContent=K.label+' – monthly trend';$('#trendSub').textContent=(K.sub?K.sub+'. ':'')+'Dashed line: illustrative target. Shaded: the selected reporting period.';
  const extraDs=[];if(K.k==='r2a')extraDs.push({label:'90th centile',data:MONTHS.map((_,m)=>{const a=arr.filter(p=>p.m===m&&p.assessed);return a.length<15?null:quant(a.map(p=>p.refToAssess),.9)}),borderColor:C.pink,backgroundColor:C.pink,borderWidth:2,pointRadius:2,tension:.3});
  mk('kpiTrend',{type:'line',data:{labels:MONTHS,datasets:[{label:K.label,data:vals.map(v=>isNaN(v)?null:v),borderColor:C.teal,backgroundColor:'rgba(0,97,101,.12)',fill:true,tension:.3,pointRadius:3,borderWidth:3},...extraDs,
    {label:'Target',data:MONTHS.map(()=>K.target),borderColor:C.coral,borderDash:[6,5],pointRadius:0,borderWidth:2,fill:false}]},
    options:{plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fmt(c.parsed.y,K.dp||1)}${K.unit==='%'?'%':''}`}}},scales:{y:{beginAtZero:K.unit!=='%',title:{display:true,text:K.unit==='%'?'%':(K.unit||'value')}}}},
    plugins:[{id:'shade',beforeDraw(ch){const x=ch.scales.x,y=ch.scales.y,ctx=ch.ctx;const x0=x.getPixelForValue(18-KF.period)-((x.getPixelForValue(1)-x.getPixelForValue(0))/2);ctx.save();ctx.fillStyle='rgba(255,211,92,.16)';ctx.fillRect(x0,y.top,x.right-x0,y.bottom-y.top);ctx.restore()}}]});
}
// forecast
const FC={};
function resetForecast(arr){const rec=arr.filter(p=>p.m>=15);if(!rec.length){$('#fcText').innerHTML='No synthetic patients match these filters.';return}
  const demand=Math.round(rec.length/13);const dnaRate=pct(rec.filter(p=>p.startTx),p=>p.dna)/100||0.1;const medW=median(rec.filter(p=>p.assessed).map(p=>p.refToAssess))/7;
  const rate=4.4;const wte=Math.max(1,Math.round(demand*0.96/(rate*(1-dnaRate*0.6))*2)/2);
  Object.assign(FC,{dem0:demand,dna:dnaRate,W0:Math.round(demand*Math.max(medW,6)*2),def:{d:demand,w:wte,r:rate,x:0}});
  setSlider('fc_d',demand,Math.round(demand*0.5),Math.round(demand*1.6),1);setSlider('fc_w',wte,Math.max(1,Math.floor(wte*0.5)),Math.ceil(wte*1.8),0.5);
  setSlider('fc_r',rate,3,6,0.1);setSlider('fc_x',0,0,60,5);runForecast()}
function setSlider(id,v,lo,hi,st){const s=document.getElementById(id);s.min=lo;s.max=hi;s.step=st;s.value=v}
function simulate(d,w,r,x){const cap=w*r*(1-FC.dna*0.6*(1-x/100));let W=FC.W0;const L=[],T=[];
  for(let t=0;t<52;t++){const season=1+0.08*Math.sin((t+3)/52*2*Math.PI*2);const D=d*season;W=Math.max(0,W+D-cap);L.push(Math.round(W));T.push(W/cap)}return{L,T,cap}}
const FCTARGET=8;
function runForecast(){if(!FC.def)return;const d=+$('#fc_d').value,w=+$('#fc_w').value,r=+$('#fc_r').value,x=+$('#fc_x').value;
  $('#v_fc_d').textContent=d+' per week';$('#v_fc_w').textContent=w+' WTE';$('#v_fc_r').textContent=r.toFixed(1);$('#v_fc_x').textContent=x+'%';
  const S=simulate(d,w,r,x),B=simulate(FC.def.d,FC.def.w,FC.def.r,FC.def.x);
  const start=new Date(2026,9,12);const lab=S.L.map((_,i)=>{const dt=new Date(start.getTime()+i*7*864e5);return dt.toLocaleDateString('en-GB',{day:'numeric',month:'short'})});
  const hit=S.T.findIndex(t=>t<=FCTARGET);const d0=S.T[0];
  let msg;if(d0<=FCTARGET)msg=`Estimated wait is already within the ${FCTARGET}-week illustrative target and stays ${S.T[51]<=FCTARGET?'there':'there until week '+(S.T.findIndex(t=>t>FCTARGET)+1)}.`;
  else if(hit>=0)msg=`<b>Waits fall below ${FCTARGET} weeks in week ${hit+1} (w/c ${lab[hit]})</b>. Effective capacity ${fmt(S.cap)} assessments a week against average demand of ${fmt(d)}.`;
  else{const need=((d+FC.W0/40)/(1+FCTARGET/40))/(r*(1-FC.dna*0.6*(1-x/100)));msg=`<b>Waits do not reach ${FCTARGET} weeks within a year.</b> Roughly ${fmt(Math.max(0,need-w),1)} more WTE (or equivalent productivity and DNA gains) would be needed.`}
  $('#fcText').innerHTML=msg+` <span class="muted">Starting list: ${fmt(FC.W0)} (synthetic). Reducing DNAs frees slots: the link to the prediction model in section 05.</span>`;
  mk('forecast',{data:{labels:lab,datasets:[
    {type:'line',label:'Estimated wait, this scenario (weeks)',data:S.T.map(v=>+v.toFixed(1)),borderColor:C.teal,borderWidth:3,pointRadius:0,yAxisID:'y1',tension:.3},
    {type:'line',label:'Current plan (weeks)',data:B.T.map(v=>+v.toFixed(1)),borderColor:C.grey,borderDash:[5,4],borderWidth:2,pointRadius:0,yAxisID:'y1',tension:.3},
    {type:'line',label:`Target (${FCTARGET} weeks)`,data:lab.map(()=>FCTARGET),borderColor:C.coral,borderDash:[6,5],borderWidth:2,pointRadius:0,yAxisID:'y1'},
    {type:'bar',label:'Waiting list (people)',data:S.L,backgroundColor:'rgba(240,176,200,.55)',yAxisID:'y',order:5}]},
    options:{interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom'}},scales:{x:{ticks:{maxTicksLimit:12}},y:{position:'right',beginAtZero:true,title:{display:true,text:'People waiting'},grid:{display:false}},y1:{position:'left',beginAtZero:true,title:{display:true,text:'Estimated wait (weeks)'}}}}});
}
['fc_d','fc_w','fc_r','fc_x'].forEach(id=>document.getElementById(id).addEventListener('input',runForecast));
['kf_service','kf_path','kf_age','kf_period'].forEach(id=>document.getElementById(id).addEventListener('change',()=>{KF.service=$('#kf_service').value;KF.pathway=$('#kf_path').value;KF.age=$('#kf_age').value;KF.period=+$('#kf_period').value;renderKpis()}));
$('#fc_reset').addEventListener('click',()=>resetForecast(P.filter(kfilter)));
renderKpis();

// ---------- 01 pathway ----------
const NODECOL={'Referred':C.teal,'Forms returned':C.teal2,'Forms not returned':C.coral,'Assessed':C.teal3,'Withdrew before assessment':C.coral,'ADHD diagnosed':C.teal,'ADHD not diagnosed':C.grey,
 'ADHD + autism':'#d6457c','ADHD only':C.teal,'Autism only':C.pink,'Neither':C.grey,'Started titration':C.blue,'Chose no medication':C.sun,'Stable dose':'#2e9e6b','Stopped titration':C.coral,'Shared care with GP':'#1d7a52','Specialist follow-up':C.mint};
function segArr(k){return k==='adult'?P.filter(p=>p.service==='adult'):k==='cyp'?P.filter(p=>p.service==='child'&&p.pathway==='adhd'):P.filter(p=>p.pathway==='nd')}
function renderPath(k){const a=segArr(k);const F=[];const add=(f,t,n)=>{if(n>0)F.push({from:f,to:t,flow:n})};const cnt=fn=>a.filter(fn).length;
  add('Referred','Forms returned',cnt(p=>p.formsReturned));add('Referred','Forms not returned',cnt(p=>!p.formsReturned));
  add('Forms returned','Assessed',cnt(p=>p.assessed));add('Forms returned','Withdrew before assessment',cnt(p=>p.formsReturned&&!p.assessed));
  if(k==='nd'){['ADHD + autism','ADHD only','Autism only','Neither'].forEach(o=>add('Assessed',o,cnt(p=>p.assessed&&p.ndOut===o)));
    ['ADHD + autism','ADHD only'].forEach(o=>{add(o,'Started titration',cnt(p=>p.ndOut===o&&p.startTx));add(o,'Chose no medication',cnt(p=>p.ndOut===o&&p.diagnosed&&!p.startTx))})}
  else{add('Assessed','ADHD diagnosed',cnt(p=>p.diagnosed));add('Assessed','ADHD not diagnosed',cnt(p=>p.assessed&&!p.adhdDx));
    add('ADHD diagnosed','Started titration',cnt(p=>p.startTx));add('ADHD diagnosed','Chose no medication',cnt(p=>p.diagnosed&&!p.startTx))}
  add('Started titration','Stable dose',cnt(p=>p.stable));add('Started titration','Stopped titration',cnt(p=>p.startTx&&!p.stable));
  add('Stable dose','Shared care with GP',cnt(p=>p.shared));add('Stable dose','Specialist follow-up',cnt(p=>p.stable&&!p.shared));
  const tot={};F.forEach(f=>{tot[f.to]=(tot[f.to]||0)+f.flow});tot['Referred']=a.length;const labels={};for(const n in tot)labels[n]=`${n} (${fmt(tot[n])})`;
  mk('sankey',{type:'sankey',data:{datasets:[{data:F,colorFrom:c=>NODECOL[c.dataset.data[c.dataIndex].from]||C.grey,colorTo:c=>NODECOL[c.dataset.data[c.dataIndex].to]||C.grey,colorMode:'gradient',labels,size:'max',nodeWidth:12,borderWidth:0,font:{size:12}}]},
    options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const d=c.dataset.data[c.dataIndex];return `${d.from} → ${d.to}: ${fmt(d.flow)}`}}}}}});
  const st=[['Referral → forms returned',a.filter(p=>p.formsReturned).map(p=>p.formsDays)],['Forms → assessment',a.filter(p=>p.assessed).map(p=>p.toAssess)],['Assessment → diagnosis',a.filter(p=>p.assessed).map(p=>p.assessToDx)],['Diagnosis → titration start',a.filter(p=>p.startTx).map(p=>p.dxToTx)],['Titration → stable dose',a.filter(p=>p.stable).map(p=>p.stableDays)]];
  if(k==='nd')st.splice(2,0,['Referral → autism assessment starts',a.filter(p=>p.assessed).map(p=>p.auStart)]);
  mk('waits',{type:'bar',data:{labels:st.map(s=>s[0]),datasets:[{label:'Median',data:st.map(s=>Math.round(median(s[1]))),backgroundColor:C.teal},{label:'90th centile',data:st.map(s=>Math.round(quant(s[1],.9))),backgroundColor:C.pink}]},
    options:{indexAxis:'y',plugins:{legend:{position:'bottom'}},scales:{x:{title:{display:true,text:'days'}}}}});
  const stages=[['forms not returned',cnt(p=>!p.formsReturned)/a.length],['withdrew before assessment',cnt(p=>p.formsReturned&&!p.assessed)/cnt(p=>p.formsReturned)],['chose no medication',cnt(p=>p.diagnosed&&!p.startTx)/cnt(p=>p.diagnosed)],['stopped during titration',cnt(p=>p.startTx&&!p.stable)/cnt(p=>p.startTx)]].sort((x,y)=>y[1]-x[1]);
  const e2e=median(a.filter(p=>p.stable).map(p=>p.refToAssess+p.assessToDx+p.dxToTx+p.stableDays));
  $('#pathKpis').innerHTML=[[fmt(a.length),'synthetic referrals'],[fmt(pct(a.filter(p=>p.assessed),p=>p.refToAssess<=91))+'%','assessed within 13 weeks'],[fmt(100*cnt(p=>p.stable)/Math.max(1,cnt(p=>p.startTx)))+'%','of those starting titration reach a stable dose'],[fmt(e2e/7)+' wks','median referral to stable dose']].map(([b,s])=>`<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  const nr=q=>pct(a.filter(p=>p.imd===q),p=>!p.formsReturned);
  $('#pathInsight').innerHTML=`<b>What the data suggests:</b> the largest proportional loss is <b>${stages[0][0]}</b> (${fmt(stages[0][1]*100,1)}%). Non-return of forms is ${fmt(nr(1),1)}% in the most deprived quintile vs ${fmt(nr(5),1)}% in the least deprived, so targeted help with forms (phone support, easy-read versions, reminders) is a fairness intervention as well as an efficiency one. ${k==='nd'?'For the combined pathway, the autism assessment step is the longest wait, which is why it has its own CG128 quality marker below.':'The longest wait is between diagnosis and starting titration, where capacity planning (see the forecast above) has most leverage.'}`;
}
seg('pathSeg',renderPath);renderPath('adult');

// ---------- 02 combined autism + ADHD ----------
(function(){
  const nd=P.filter(p=>p.pathway==='nd'&&p.assessed);const kids=P.filter(p=>p.service==='child');
  const tx=kids.filter(p=>p.startTx),txA=tx.filter(p=>p.autism),txN=tx.filter(p=>!p.autism);
  const dx=kids.filter(p=>p.diagnosed),dxA=dx.filter(p=>p.autism),dxN=dx.filter(p=>!p.autism);
  const ndAll=P.filter(p=>p.pathway==='nd');
  const w3e=pct(ndAll.filter(p=>p.m<6),p=>p.auStart<=91),w3l=pct(ndAll.filter(p=>p.m>=12),p=>p.auStart<=91);
  const sA=mean(txA.filter(p=>p.stable).map(p=>p.steps)),sN=mean(txN.filter(p=>p.stable).map(p=>p.steps));
  $('#ndKpis').innerHTML=[[fmt(pct(nd,p=>p.ndOut==='ADHD + autism'))+'%','of combined-pathway children diagnosed with both'],[fmt(w3e)+'% → '+fmt(w3l)+'%','autism assessment started within 3 months (CG128), first vs last 6 months'],[fmt(sA,1)+' vs '+fmt(sN,1),'titration steps to stability: ADHD + autism vs ADHD alone'],[fmt(pct(dxA,p=>p.sleepProb))+'% vs '+fmt(pct(dxN,p=>p.sleepProb))+'%','significant sleep problems at baseline']].map(([b,s])=>`<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  const outs=['ADHD + autism','ADHD only','Autism only','Neither'];
  mk('ndOutcome',{type:'doughnut',data:{labels:outs,datasets:[{data:outs.map(o=>nd.filter(p=>p.ndOut===o).length),backgroundColor:['#d6457c',C.teal,C.pink,C.grey],borderWidth:2}]},options:{cutout:'58%',plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>`${c.label}: ${fmt(100*c.parsed/nd.length,1)}%`}}}}});
  const bins=['1','2','3','4','5','6+'],hist=a=>{const s=a.filter(p=>p.stable);return bins.map((b,i)=>100*s.filter(p=>i===5?p.steps>=6:p.steps===i+1).length/Math.max(1,s.length))};
  mk('ndSteps',{type:'bar',data:{labels:bins,datasets:[{label:'ADHD alone',data:hist(txN),backgroundColor:C.teal},{label:'ADHD + autism',data:hist(txA),backgroundColor:'#d6457c'}]},options:{plugins:{legend:{position:'bottom'}},scales:{y:{title:{display:true,text:'% of children'}},x:{title:{display:true,text:'steps'}}}}});
  mk('ndSleep',{type:'bar',data:{labels:['Sleep problem (CSHQ)','Melatonin prescribed'],datasets:[{label:'ADHD alone',data:[pct(dxN,p=>p.sleepProb),pct(dxN,p=>p.melatonin)],backgroundColor:C.teal},{label:'ADHD + autism',data:[pct(dxA,p=>p.sleepProb),pct(dxA,p=>p.melatonin)],backgroundColor:'#d6457c'}]},options:{plugins:{legend:{position:'bottom'}},scales:{y:{max:100,title:{display:true,text:'%'}}}}});
  const SE=['Appetite','Sleep','Irritability','Anxiety','Headache','Tics'];
  mk('ndSE',{type:'bar',data:{labels:['Reduced appetite','Sleep onset delay','Irritability','Anxiety','Headache','Tics'],datasets:[{label:'ADHD alone',data:SE.map(s=>pct(txN,p=>p.se[s])),backgroundColor:C.teal},{label:'ADHD + autism',data:SE.map(s=>pct(txA,p=>p.se[s])),backgroundColor:'#d6457c'}]},options:{indexAxis:'y',plugins:{legend:{position:'bottom'}},scales:{x:{title:{display:true,text:'% of children starting medication'}}}}});
  const T=[0,1,2,3,6,9,12],traj=a=>T.map(t=>mean(a.map(p=>p.base*(1+p.symChange*(1-Math.exp(-t/1.4))))));
  mk('ndTraj',{type:'line',data:{labels:T.map(t=>t+' m'),datasets:[{label:'ADHD alone',data:traj(txN),borderColor:C.teal,backgroundColor:C.teal,tension:.35,borderWidth:3},{label:'ADHD + autism',data:traj(txA),borderColor:'#d6457c',backgroundColor:'#d6457c',tension:.35,borderWidth:3}]},options:{plugins:{legend:{position:'bottom'}},scales:{y:{title:{display:true,text:'mean symptom score (0–54)'}}}}});
  $('#ndTraj').closest('.card').querySelector('.sub').textContent='Mean ADHD symptom score (SNAP-IV style, 0–54, lower is better) for children starting medication';
  $('#ndInsight').innerHTML=`<b>Synthetic example:</b> children with ADHD and autism need more titration steps (${fmt(sA,1)} vs ${fmt(sN,1)}), report irritability about twice as often (${fmt(pct(txA,p=>p.se.Irritability))}% vs ${fmt(pct(txN,p=>p.se.Irritability))}%) and improve less on average. A pathway that starts lower, goes slower and treats sleep early could be tested and measured.`;
})();

// ---------- 03 outcomes ----------
function renderOut(k){const svc=k==='adult'?'adult':'child';const a=P.filter(p=>p.service===svc&&p.startTx);const W=[0,4,8,12,26,52];
  const val=(p,w)=>p.base*(1+p.symChange*(1-Math.exp(-w/4))*(w>12?1.03:1));const rows=W.map(w=>a.map(p=>val(p,w)));
  const scale=k==='adult'?'ASRS total (0–72)':'SNAP-IV total (0–54)';
  mk('outTraj',{type:'line',data:{labels:W.map(w=>w===0?'Baseline':w+' wks'),datasets:[{label:'75th centile',data:rows.map(r=>quant(r,.75)),borderColor:'transparent',backgroundColor:'rgba(94,158,160,.18)',fill:'+1',pointRadius:0},{label:'25th centile',data:rows.map(r=>quant(r,.25)),borderColor:'transparent',pointRadius:0,fill:false},{label:'Mean',data:rows.map(mean),borderColor:C.teal,backgroundColor:C.teal,borderWidth:3,tension:.3}]},
    options:{plugins:{legend:{display:false}},scales:{y:{title:{display:true,text:scale}}}}});
  const meds=k==='adult'?MEDS_A:MEDS_C;
  mk('outResp',{type:'bar',data:{labels:meds,datasets:[{label:'% responders',data:meds.map(m=>pct(a.filter(p=>p.med===m),p=>p.resp)),backgroundColor:[C.teal,C.teal3,C.pink,C.sun]}]},
    options:{plugins:{legend:{display:false},tooltip:{callbacks:{afterLabel:c=>'n = '+a.filter(p=>p.med===meds[c.dataIndex]).length+' (synthetic)'}}},scales:{y:{max:100,title:{display:true,text:'% responding'}}}}});
  const cols={Methylphenidate:C.teal3,Lisdexamfetamine:C.teal,Atomoxetine:C.coral,Guanfacine:C.sun};const smp=a.filter((_,i)=>i%Math.ceil(a.length/450)===0);
  mk('outScatter',{type:'scatter',data:{datasets:meds.map(m=>({label:m,data:smp.filter(p=>p.med===m).map(p=>({x:+(p.symChange*100).toFixed(1),y:+(p.funChange*100).toFixed(1)})),backgroundColor:cols[m]+'cc',pointRadius:3}))},
    options:{plugins:{legend:{position:'bottom'}},scales:{x:{title:{display:true,text:'% change in symptoms'}},y:{title:{display:true,text:'% change in function (WFIRS)'}}}}});
  const symNoFun=pct(a,p=>p.resp&&!p.funcImp);
  $('#outInsight').innerHTML=`<b>What the data suggests:</b> ${fmt(pct(a,p=>p.resp))}% of synthetic ${k==='adult'?'adults':'children'} respond on symptoms by 12 weeks. ${fmt(symNoFun)}% improve on symptoms but not yet on daily functioning: a group who might benefit from coaching, the Care ADHD app or school support alongside medication. Linking outcomes to medication, dose and co-occurring conditions makes every review a contribution to the evidence.`;
}
seg('outSeg',renderOut);renderOut('adult');

// ---------- 04 safety ----------
const LINES=[0.4,2,9,25,50,75,91,98,99.6];
const SAFE=[
 {id:'SYN-1043',age:9,med:'Methylphenidate XL 27 mg',child:1,days:[0,14,28,42],hr:[86,92,95,98],sbpC:[70,88,96,97],wC:[50,48,46,45],last:3},
 {id:'SYN-3302',age:27,med:'Methylphenidate XL 54 mg',child:0,days:[0,14,28,42,56],hr:[88,104,118,124,126],sbp:[122,124,127,129,128],dbp:[78,79,80,82,81],last:2},
 {id:'SYN-2210',age:34,med:'Lisdexamfetamine 50 mg',child:0,days:[0,14,28,42],hr:[74,80,84,86],sbp:[128,136,142,144],dbp:[82,86,91,92],last:5},
 {id:'SYN-0876',age:11,med:'Lisdexamfetamine 30 mg',child:1,days:[0,28,56,84,112],hr:[84,88,90,90,92],sbpC:[50,55,58,60,57],wC:[50,42,30,20,8],last:9},
 {id:'SYN-1960',age:13,med:'Guanfacine 3 mg',child:1,days:[0,14,28,42],hr:[82,70,58,54],sbpC:[45,30,18,12],wC:[60,61,62,63],last:4},
 {id:'SYN-3015',age:10,med:'Methylphenidate XL 18 mg',child:1,autism:1,days:[0,28,56,84],hr:[90,92,94,93],sbpC:[60,62,66,64],wC:[30,22,14,8],last:12},
 {id:'SYN-1559',age:15,med:'Atomoxetine 40 mg',child:1,days:[0,28,56],hr:[78,84,86],sbpC:[55,60,62],wC:[40,40,39],last:198},
 {id:'SYN-0412',age:8,med:'Methylphenidate IR 5 mg tds',child:1,days:[0,28,56],hr:[92,94,95],sbpC:[50,52,54],wC:[45,44,44],last:121},
 {id:'SYN-2788',age:45,med:'Lisdexamfetamine 70 mg',child:0,days:[0,28,56,84],hr:[72,76,78,77],sbp:[124,126,128,127],dbp:[80,80,81,80],last:213}
];
function crossed(arr){const hi=Math.max(...arr.slice(0,-1)),lo=arr[arr.length-1];return LINES.filter(l=>l<hi&&l>lo).length}
SAFE.forEach(s=>{const f=[];const n=s.hr.length;
  if(s.hr[n-1]>120&&s.hr[n-2]>120)f.push(['red','Resting HR >120 bpm on 2 readings','Recheck; reduce dose; seek specialist cardiovascular advice (NICE NG87)']);
  if(s.child&&s.sbpC[n-1]>95&&s.sbpC[n-2]>95)f.push(['red','Systolic BP >95th centile on 2 occasions','Repeat BP; reduce dose; refer to paediatric hypertension specialist (NICE NG87)']);
  if(!s.child&&s.sbp[n-1]>=140&&s.sbp[n-2]>=140)f.push(['amber','BP ≥140/90 on 2 readings','Repeat with home readings; review dose; liaise with GP']);
  if(s.child&&crossed(s.wC)>=2)f.push(['amber','Weight has fallen across 2 centile lines','Dietary advice, dose timing, review height; consider options']);
  if(s.med.startsWith('Guanfacine')&&s.hr[n-1]<60)f.push(['amber','Low heart rate and falling BP on guanfacine','Check for dizziness or fainting; review dose']);
  const lim=s.child?(s.age<10?90:180):180;if(s.last>lim)f.push(['overdue',`Observations ${s.last} days old (due every ${s.child&&s.age<10?3:6} months)`,'Send home observation request; book review']);
  s.flags=f;s.level=f.some(x=>x[0]==='red')?'red':f.some(x=>x[0]==='amber')?'amber':'overdue'});
let safeSel=SAFE[0].id;
function renderSafeTable(k){const rows=SAFE.filter(s=>k==='all'||s.flags.some(f=>f[0]===k));
  $('#safeTable tbody').innerHTML=rows.map(s=>{const n=s.hr.length;const obs=s.child?`HR ${s.hr[n-1]} · SBP ${s.sbpC[n-1]}th c · Wt ${s.wC[n-1]}th c`:`BP ${s.sbp[n-1]}/${s.dbp[n-1]} · HR ${s.hr[n-1]}`;
    return `<tr data-id="${s.id}" class="${s.id===safeSel?'sel':''}"><td><b>${s.id}</b></td><td>${s.age}${s.autism?' <span class="pill pink">autism</span>':''}</td><td>${s.med}</td><td class="small">${obs}<br><span class="muted">${s.last} days ago</span></td><td>${s.flags.map(f=>`<span class="pill ${f[0]==='overdue'?'grey':f[0]}">${f[0]==='red'?'Act now':f[0]==='amber'?'Review':'Overdue'}</span><div class="small">${f[1]}</div>`).join('')}</td><td class="small">${s.flags.map(f=>f[2]).join('<br>')}</td></tr>`}).join('');
  document.querySelectorAll('#safeTable tbody tr').forEach(tr=>tr.addEventListener('click',()=>{safeSel=tr.dataset.id;renderSafeTable(k);renderSafeChart()}))}
function renderSafeChart(){const s=SAFE.find(x=>x.id===safeSel);const lab=s.days.map(d=>d===0?'Baseline':'Day '+d);
  $('#safeChartTitle').textContent=`${s.id} · age ${s.age}`;$('#safeChartSub').textContent=s.med+(s.child?' · centiles for age and sex':'');
  const dash=(v,ax,c,l)=>({label:l,data:lab.map(()=>v),borderColor:c,borderDash:[5,4],borderWidth:1.5,pointRadius:0,yAxisID:ax});
  const ds=s.child?[{label:'Heart rate (bpm)',data:s.hr,borderColor:C.slate,backgroundColor:C.slate,yAxisID:'y',tension:.3},{label:'Systolic BP centile',data:s.sbpC,borderColor:C.coral,backgroundColor:C.coral,yAxisID:'y1',tension:.3,borderWidth:3},{label:'Weight centile',data:s.wC,borderColor:C.teal,backgroundColor:C.teal,yAxisID:'y1',tension:.3,borderWidth:3},dash(95,'y1','#d6457c','95th centile'),dash(120,'y','#a3221f','HR 120')]
   :[{label:'Systolic (mmHg)',data:s.sbp,borderColor:C.coral,backgroundColor:C.coral,yAxisID:'y',tension:.3,borderWidth:3},{label:'Diastolic (mmHg)',data:s.dbp,borderColor:C.pink,backgroundColor:C.pink,yAxisID:'y',tension:.3},{label:'Heart rate (bpm)',data:s.hr,borderColor:C.slate,backgroundColor:C.slate,yAxisID:'y',tension:.3},dash(140,'y','#d6457c','140 mmHg'),dash(120,'y','#a3221f','HR 120')];
  mk('safeChart',{type:'line',data:{labels:lab,datasets:ds},options:{plugins:{legend:{position:'bottom',labels:{filter:i=>!/^(95th|140|HR 120)/.test(i.text)}}},scales:{y:{title:{display:true,text:s.child?'bpm':'mmHg / bpm'},suggestedMin:40,suggestedMax:150},...(s.child?{y1:{position:'right',min:0,max:100,title:{display:true,text:'centile'},grid:{display:false}}}:{})}}})}
(function(){const rec=P.filter(p=>p.startTx&&p.m>=15);const cnt=l=>SAFE.filter(s=>s.flags.some(f=>f[0]===l)).length;
  $('#safeKpis').innerHTML=[[fmt(rec.length),'synthetic patients in titration (last 3 months)'],[cnt('red'),'act-now alerts today'],[cnt('amber'),'readings to review'],[fmt(pct(rec,p=>p.monitorOK))+'%','monitoring completed on time']].map(([b,s])=>`<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  seg('safeSeg',k=>renderSafeTable(k));renderSafeTable('all');renderSafeChart()})();

// ---------- 05 prediction ----------
const FEAT=[
 {k:'child',name:'Child (parent or carer attends)',v:['Adult, attends alone','Child, parent or carer attends'],f:p=>p.child},
 {k:'ya',name:'Young adult (18–25)',v:['Not aged 18–25','Young adult (18–25)'],f:p=>p.ya},
 {k:'wait',name:'Days waiting since last contact',f:p=>p.lastWait},
 {k:'dna',name:'Previous missed appointments',f:p=>p.prevDNA},
 {k:'dep',name:'Deprivation (IMD)',f:p=>3-p.imd},
 {k:'forms',name:'Slow return of forms',f:p=>p.formsDays},
 {k:'app',name:'Uses the Care ADHD app',v:['Not using the Care ADHD app','Uses the Care ADHD app'],f:p=>+p.app},
 {k:'anx',name:'Co-occurring anxiety',v:['No co-occurring anxiety','Co-occurring anxiety'],f:p=>+p.anx},
 {k:'rem',name:'SMS + email reminders',v:['Letter reminders only','SMS + email reminders'],f:p=>+p.rem}];
const MODEL=(function(){const X=P.map(p=>FEAT.map(F=>F.f(p))),y=P.map(p=>p.dna?1:0);const tr=P.map((p,i)=>i%10<7);
  const mu=FEAT.map((_,j)=>mean(X.filter((_,i)=>tr[i]).map(r=>r[j]))),sd=FEAT.map((_,j)=>{const m=mu[j];return Math.sqrt(mean(X.filter((_,i)=>tr[i]).map(r=>(r[j]-m)**2)))||1});
  const Z=X.map(r=>r.map((v,j)=>(v-mu[j])/sd[j]));let w=new Array(FEAT.length).fill(0),b=0;const idx=[];tr.forEach((t,i)=>{if(t)idx.push(i)});
  for(let it=0;it<350;it++){const g=new Array(FEAT.length).fill(0);let gb=0;for(const i of idx){const z=Z[i];let s=b;for(let j=0;j<z.length;j++)s+=w[j]*z[j];const e=sig(s)-y[i];gb+=e;for(let j=0;j<z.length;j++)g[j]+=e*z[j]}
    b-=0.8*gb/idx.length;for(let j=0;j<w.length;j++)w[j]-=0.8*(g[j]/idx.length+0.001*w[j])}
  const beta=w.map((v,j)=>v/sd[j]),b0=b-w.reduce((a,v,j)=>a+v*mu[j]/sd[j],0);
  const pred=x=>sig(b0+x.reduce((a,v,j)=>a+beta[j]*v,0));
  const test=P.map((p,i)=>({p,y:y[i],s:pred(X[i])})).filter((_,i)=>!tr[i]);
  const auc=(arr)=>{const pos=arr.filter(r=>r.y),neg=arr.filter(r=>!r.y);if(!pos.length||!neg.length)return NaN;const s=[...arr].sort((a,b)=>a.s-b.s);let rk=0,sum=0;s.forEach((r,i)=>{if(r.y)sum+=i+1});return (sum-pos.length*(pos.length+1)/2)/(pos.length*neg.length)};
  return {beta,b0,mu,pred,test,auc:auc(test),aucF:auc,ntr:idx.length}})();
$('#aucText').innerHTML=`Trained on ${fmt(MODEL.ntr)} synthetic records, tested on ${fmt(MODEL.test.length)} unseen ones. Discrimination (AUC): <b>${MODEL.auc.toFixed(2)}</b>. Calibration below: predicted vs observed, by tenth of risk.`;
(function(){const s=[...MODEL.test].sort((a,b)=>a.s-b.s),pts=[];for(let d=0;d<10;d++){const g=s.slice(Math.floor(d*s.length/10),Math.floor((d+1)*s.length/10));pts.push({x:+(100*mean(g.map(r=>r.s))).toFixed(1),y:+(100*mean(g.map(r=>r.y))).toFixed(1)})}
  const mx=Math.ceil(Math.max(...pts.map(p=>Math.max(p.x,p.y)))/5)*5;
  mk('calib',{type:'scatter',data:{datasets:[{label:'Tenths of predicted risk',data:pts,backgroundColor:C.teal,pointRadius:5},{type:'line',label:'Perfect calibration',data:[{x:0,y:0},{x:mx,y:mx}],borderColor:C.coral,borderDash:[5,4],pointRadius:0}]},
    options:{plugins:{legend:{display:false}},scales:{x:{min:0,max:mx,title:{display:true,text:'predicted %'}},y:{min:0,max:mx,title:{display:true,text:'observed %'}}}}})})();
function renderFair(k){const G={age:[['Child 7–17',p=>p.child],['18–25',p=>p.ya],['26–40',p=>p.service==='adult'&&p.age>25&&p.age<=40],['41+',p=>p.service==='adult'&&p.age>40]],sex:[['Female',p=>p.sex==='Female'],['Male',p=>p.sex==='Male']],
  imd:[1,2,3,4,5].map(q=>[`Q${q}${q===1?' (most deprived)':q===5?' (least)':''}`,p=>p.imd===q]),eth:ETH.map(e=>[e,p=>p.eth===e])}[k];
  const rows=G.map(([l,f])=>{const g=MODEL.test.filter(r=>f(r.p));return{l,n:g.length,pr:100*mean(g.map(r=>r.s)),ob:100*mean(g.map(r=>r.y)),auc:MODEL.aucF(g)}});
  mk('fair',{type:'bar',data:{labels:rows.map(r=>r.l),datasets:[{label:'Predicted %',data:rows.map(r=>r.pr),backgroundColor:C.teal},{label:'Observed %',data:rows.map(r=>r.ob),backgroundColor:C.pink}]},
    options:{plugins:{legend:{position:'bottom'},tooltip:{callbacks:{afterBody:it=>{const r=rows[it[0].dataIndex];return `n = ${r.n} · AUC ${isNaN(r.auc)?'–':r.auc.toFixed(2)}`}}}},scales:{y:{beginAtZero:true,title:{display:true,text:'DNA %'}}}}})}
seg('fairSeg',renderFair);renderFair('age');
const ACTIONS={dna:'a personal call to agree a time that works',wait:'a check-in message while they wait',forms:'help with forms by phone or an easy-read version',dep:'a flexible video slot, avoiding travel and time off',rem:'switching to SMS and email reminders',app:'an invitation to the Care ADHD app and its reminders',anx:'a warm introduction and clear "what to expect" information',ya:'text-first contact and evening slots'};
function whatIf(){const age=+$('#f_age').value,x={child:age<18?1:0,ya:age>=18&&age<=25?1:0,wait:+$('#f_wait').value,dna:+$('#f_dna').value,dep:3-(+$('#f_imd').value),forms:+$('#f_forms').value,app:+$('#f_app').value,anx:+$('#f_anx').value,rem:+$('#f_rem').value};
  $('#v_age').textContent=age+(age<18?' (child)':'');$('#v_wait').textContent=x.wait;$('#v_dna').textContent=x.dna;$('#v_imd').textContent=$('#f_imd').value+(+$('#f_imd').value===1?' (most deprived)':+$('#f_imd').value===5?' (least)':'');$('#v_forms').textContent=x.forms;
  const xv=FEAT.map(F=>x[F.k]);const pr=MODEL.pred(xv);$('#riskVal').textContent=(pr*100).toFixed(0)+'%';$('#riskPin').style.left=`calc(${Math.min(pr/0.5,1)*100}% - 2px)`;
  const band=pr<0.1?'Low: routine reminders':pr<0.22?'Moderate: consider a light-touch nudge':'Higher: offer proactive support';$('#riskBand').textContent='Estimated chance of missing the next appointment. '+band+'.';
  const con=FEAT.map((F,j)=>({F,nm:F.v?F.v[xv[j]]:F.name,c:MODEL.beta[j]*(xv[j]-MODEL.mu[j])})).sort((a,b)=>Math.abs(b.c)-Math.abs(a.c));const mx=Math.max(0.8,...con.map(c=>Math.abs(c.c)));
  $('#contribs').innerHTML=con.map(({F,nm,c})=>{const w=Math.abs(c)/mx*50;return `<div class="contrib"><span>${nm}</span><div class="bar"><i style="${c>=0?`left:50%;width:${w}%;background:${C.coral}`:`right:50%;width:${w}%;background:${C.teal}`}"></i><i style="left:50%;width:1px;background:#9aa"></i></div><span class="small">${c>=0?'+':''}${c.toFixed(2)}</span></div>`}).join('');
  const up=con.filter(c=>c.c>0.05).slice(0,2),down=con.filter(c=>c.c<-0.05).slice(0,1);
  const acts=up.filter(u=>!(u.F.k==='app'&&x.app)&&!(u.F.k==='rem'&&x.rem)&&u.F.k!=='child').map(u=>ACTIONS[u.F.k]).filter(Boolean);if(x.rem===0&&!acts.includes(ACTIONS.rem))acts.push(ACTIONS.rem);
  $('#explainText').innerHTML=`Compared with an average patient, ${up.length?'the estimate is pushed up mainly by <b>'+up.map(u=>u.nm.toLowerCase()).join('</b> and <b>')+'</b>':'nothing much pushes the estimate up'}${down.length?', and pulled down by <b>'+down[0].nm.toLowerCase()+'</b>':''}. ${pr>=0.1&&acts.length?'Suggested support: '+acts.slice(0,2).join('; ')+'.':'No extra action suggested.'} <span class="muted">(Units: change in log-odds. A clinician or administrator always decides.)</span>`}
['f_age','f_wait','f_dna','f_imd','f_forms','f_app','f_anx','f_rem'].forEach(id=>document.getElementById(id).addEventListener('input',whatIf));whatIf();

// ---------- 06 AI on free text (simulated, rule-based) ----------
const LETTERS=[
`Dear Dr Patel,

Re: "Sam" (synthetic example), 9-year-old boy

Thank you for referring Sam. Mum reports that he is constantly on the go at home, fidgets through meals and cannot wait his turn in games. He often interrupts conversations. His teacher describes poor concentration, losing belongings most days and not finishing written work.

Sam prefers to play alone at break time and lines up his toys in careful rows. He has an intense interest in train timetables. Changes to routine are very distressing for him, and he covers his ears in noisy places such as the school hall. Eye contact is limited and he has a very literal understanding of language.

Sleep is a major concern: he takes over an hour to fall asleep and wakes at 3am most nights. He is anxious about school. No tics have been noted.

Family history: father has dyslexia; a maternal cousin is autistic.

Weight 28 kg. BP and pulse to be recorded at baseline. No safeguarding concerns.

Plan: combined autism and ADHD assessment, school questionnaires, sleep diary and Children's Sleep Habits Questionnaire.`,
`Titration review, week 6 (synthetic example)

Alex is a 31-year-old woman reviewed by video. Currently taking lisdexamfetamine 50 mg each morning. She reports much better focus at work and is finishing tasks. ASRS score has fallen from 52 to 31.

Side effects: reduced appetite at lunchtime, weight down 2.1 kg since baseline, some insomnia in the first two weeks, now settling. BP 138/88, pulse 96. Mood stable, no suicidal thoughts. Drinks alcohol at weekends only, within guidelines.

Plan: continue lisdexamfetamine 50 mg; recheck BP with home readings in 2 weeks before any dose increase.`,
`Referral summary (synthetic example)

Jess is a 14-year-old girl, diagnosed with autism at age 11, now referred for ADHD assessment. Parents describe her as forgetful and disorganised, and she daydreams in lessons. Teachers say she is quiet and compliant; she appears to mask her difficulties at school and is exhausted after school.

She has strong sensory sensitivities to clothing labels and noise. School attendance is 62% this term because of anxiety, and there has been low mood since the spring. She disclosed self-harm (scratching) to the school nurse last month; a safeguarding referral was made and CAMHS are aware.

Sleep onset is usually after 1am despite melatonin 2 mg.

Plan: ADHD assessment with school observation; liaise with CAMHS; risk assessment at first appointment.`];
const DICT=[
 ['symptom','Hyperactivity / restlessness',/constantly on the go|fidget\w*|restless\w*/gi],
 ['symptom','Impulsivity',/cannot wait (?:his|her|their) turn|interrupt\w*|blurts? out|impulsiv\w*/gi],
 ['symptom','Inattention',/poor concentration|losing belongings|forgetful|disorganised|daydream\w*|not finishing [a-z ]+work|better focus/gi],
 ['autism','Social communication differences',/prefers to play alone|eye contact is limited|limited eye contact|literal understanding of language|quiet and compliant/gi],
 ['autism','Restricted interests / repetitive behaviour',/lines up his toys|lines up her toys|intense interest in [a-z ]+/gi],
 ['autism','Need for sameness',/changes to routine/gi],
 ['autism','Sensory differences',/covers his ears|covers her ears|sensory sensitivities[a-z ]*/gi],
 ['autism','Masking / camouflaging',/mask her difficulties|mask his difficulties|masking/gi],
 ['autism','Existing autism diagnosis',/diagnosed with autism[a-z0-9 ]*/gi],
 ['sleep','Sleep onset difficulty',/takes over an hour to fall asleep|sleep onset is usually after \d+ ?am|insomnia/gi],
 ['sleep','Night waking',/wakes at \d+ ?am[a-z ]*/gi],
 ['comorb','Anxiety',/anxious|anxiety/gi],['comorb','Low mood',/low mood/gi],['comorb','Tics',/tics/gi],['comorb','Alcohol use',/drinks alcohol[a-z ]*/gi],
 ['med','Medication',/(?:lisdexamfetamine|methylphenidate|atomoxetine|guanfacine|melatonin|dexamfetamine)(?: (?:XL|IR))?(?: \d+ ?mg)?/gi],
 ['school','School / work functioning',/school attendance is \d+%|exhausted after school|teacher[a-z]* (?:describes|say)|finishing tasks|focus at work/gi],
 ['risk','Self-harm',/self-harm[a-z ()]*/gi],['risk','Suicidal thoughts',/suicidal thoughts/gi],['risk','Safeguarding',/safeguarding (?:referral|concerns)/gi],
 ['se','Side effect',/reduced appetite[a-z ]*|weight down [0-9.]+ ?kg|weight loss/gi],
 ['comorb','Family history',/family history:[^\n]*/gi]];
const NEG=/\b(no|not|denies|without|nil)\b[^.]{0,12}$/i;
function runNLP(){const t=$('#letter').value;const hits=[];
  DICT.forEach(([cat,label,re])=>{re.lastIndex=0;let m;while((m=re.exec(t))){const pre=t.slice(Math.max(0,m.index-18),m.index);hits.push({cat,label,s:m.index,e:m.index+m[0].length,txt:m[0],neg:NEG.test(pre)})}});
  hits.sort((a,b)=>a.s-b.s||b.e-a.e);const keep=[];let end=-1;hits.forEach(h=>{if(h.s>=end){keep.push(h);end=h.e}});
  const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));let html='',pos=0;keep.forEach(h=>{html+=esc(t.slice(pos,h.s))+`<span class="hl ${h.cat}" title="${h.label}${h.neg?' (negated)':''}">${esc(h.txt)}</span>${h.neg?'<sup class="small muted"> (negated)</sup>':''}`;pos=h.e});html+=esc(t.slice(pos));
  const by=c=>[...new Set(keep.filter(h=>h.cat===c&&!h.neg).map(h=>h.cat==='med'?h.txt:h.label))];const negs=[...new Set(keep.filter(h=>h.neg).map(h=>h.label))];
  const age=(t.match(/(\d+)-year-old ?(boy|girl|woman|man)?/)||[]);const bp=t.match(/BP (\d{2,3})\/(\d{2,3})/),hr=t.match(/pulse (\d{2,3})/),asrs=t.match(/ASRS score has fallen from (\d+) to (\d+)/),plan=(t.match(/Plan:([^\n]*)/)||[])[1];
  const ad=by('symptom'),au=by('autism'),sl=by('sleep'),co=by('comorb').filter(x=>x!=='Family history'),rk=by('risk');const fam=(t.match(/family history:([^\n]*)/i)||[])[1];
  const nAd=keep.filter(h=>h.cat==='symptom'&&!h.neg).length;const codes=[];if(/titration|currently taking/i.test(t))codes.push('ADHD (on treatment)');else if(nAd>=2)codes.push('ADHD, suspected (for assessment)');if(au.includes('Existing autism diagnosis'))codes.push('Autism spectrum condition (existing diagnosis)');else if(au.length>=2)codes.push('Autism, suspected (for assessment)');if(sl.length)codes.push('Sleep difficulty');co.forEach(c=>codes.push(c));if(rk.includes('Self-harm'))codes.push('Self-harm (recent)');
  const meas=[];if(age[1]&&+age[1]<18){if(ad.length)meas.push('SNAP-IV or Conners 3 (parent and teacher)');if(au.length&&!au.includes('Existing autism diagnosis'))meas.push('SRS-2 or SCQ');if(sl.length)meas.push('Children\'s Sleep Habits Questionnaire + sleep diary');if(co.includes('Anxiety'))meas.push('Spence Children\'s Anxiety Scale');meas.push('WFIRS-P','Goal-Based Outcomes')}else{meas.push('ASRS at each review','WFIRS');if(sl.length)meas.push('Sleep diary')}
  const alerts=[];if(bp){const s=+bp[1],d=+bp[2];alerts.push(s>=140||d>=90?`<span class="pill red">BP ${s}/${d}: above threshold</span>`:s>=135||d>=85?`<span class="pill amber">BP ${s}/${d}: borderline, recheck before dose increase</span>`:`<span class="pill green">BP ${s}/${d}</span>`)}if(hr)alerts.push(+hr[1]>120?`<span class="pill red">HR ${hr[1]}</span>`:`<span class="pill green">HR ${hr[1]}</span>`);if(rk.length)alerts.push(`<span class="pill red">Risk: ${rk.join(', ')}. Clinician review today</span>`);
  const who=age[1]?`${age[1]}-year-old ${age[2]||''}`.trim():'Patient';
  const summ=`${who}${au.includes('Existing autism diagnosis')?' with an existing autism diagnosis':''}. ${ad.length?'ADHD features: '+ad.join(', ').toLowerCase()+'. ':''}${au.filter(x=>x!=='Existing autism diagnosis').length?'Autism-related features: '+au.filter(x=>x!=='Existing autism diagnosis').join(', ').toLowerCase()+'. ':''}${sl.length?'Sleep: '+sl.join(', ').toLowerCase()+'. ':''}${co.length?'Also: '+co.join(', ').toLowerCase()+'. ':''}${asrs?`ASRS improved ${asrs[1]} → ${asrs[2]} (${Math.round(100*(asrs[1]-asrs[2])/asrs[1])}% reduction, meets responder threshold). `:''}${plan?'Plan:'+plan:''}`;
  const F=(k,v)=>`<div class="field"><b>${k}</b><div>${v||'<span class="muted">none found</span>'}</div></div>`;const P_=a=>a.map(x=>`<span class="pill">${x}</span>`).join('');
  const out=`<p class="small muted" style="margin-top:0">Annotated letter</p><div style="white-space:pre-wrap;font-size:.86rem;max-height:190px;overflow:auto;border:1px dashed var(--line);border-radius:10px;padding:10px">${html}</div>
   <div class="mt">${F('Summary',summ)}${F('Suggested codes',codes.map(c=>`<span class="pill pink">${c}</span>`).join('')+'<div class="small muted">Pending clinician confirmation; SNOMED CT mapping in production</div>')}${F('ADHD features',P_(ad))}${F('Autism features',P_(au))}${F('Sleep',P_(sl))}${F('Co-occurring',P_(co))}${F('Medication',P_(by('med')))}${F('Side effects',P_([...new Set(keep.filter(h=>h.cat==='se').map(h=>h.txt))]))}${F('Family history',fam?fam.trim():'')}${F('Safety and risk',alerts.join(' '))}${F('Explicitly absent',negs.map(n=>`<span class="pill grey">${n}</span>`).join(''))}${F('Suggested measures',P_(meas))}</div>`;
  let w=0;const bar=$('#nlpProg');$('#nlpOut').innerHTML='<p class="muted">Reading letter, finding entities, checking negation, drafting summary…</p>';const tm=setInterval(()=>{w+=12;bar.style.width=Math.min(100,w)+'%';if(w>=100){clearInterval(tm);$('#nlpOut').innerHTML=out}},70)}
seg('letterSeg',k=>{$('#letter').value=LETTERS[+k];runNLP()});$('#letter').value=LETTERS[0];$('#runNlp').addEventListener('click',runNLP);

// ---------- 07 experience ----------
const THEMES=[
 ['Kind, listening clinicians',420,[.86,.10,.04],8,['"The clinician really listened and never rushed me."','"Felt understood for the first time in years."','"Lovely with my son, got down to his level."']],
 ['Communication and updates',360,[.38,.17,.45],-12,['"I didn\'t know where I was in the queue for months."','"Live chat was quick and helpful."','"Would like a text when my forms have been received."']],
 ['Waiting times',310,[.22,.18,.60],-15,['"Waiting for titration felt endless."','"Assessment came much quicker than the NHS locally."','"Clear estimate of the wait would help."']],
 ['Pre-assessment forms',180,[.30,.25,.45],5,['"The forms were long and hard to finish with ADHD!"','"A phone call to help with the forms made all the difference."','"School form got lost between us and the teacher."']],
 ['Medication supply and shared care',240,[.25,.20,.55],22,['"GP wouldn\'t take over prescribing and nobody told me why."','"Pharmacy shortages made the first month stressful."','"Smooth handover to my GP, thank you."']],
 ['Autism-aware, child-friendly approach',150,[.80,.12,.08],30,['"They let her bring her ear defenders and take breaks."','"Visual guide to the appointment helped my autistic son."','"Felt like they understood both the autism and the ADHD."']],
 ['Online appointments',200,[.72,.18,.10],4,['"Video from home was so much easier for my daughter."','"Connection dropped twice but they called back."','"No time off work needed."']],
 ['Value and affordability',170,[.84,.10,.06],2,['"Affordable compared with other providers."','"Transparent pricing, no surprises."','"Worth every penny."']],
 ['Side-effect support during titration',130,[.45,.20,.35],10,['"Quick reply when I couldn\'t sleep on the new dose."','"Not sure who to contact about appetite loss."','"Helpful advice on taking it with breakfast."']]
].map(([n,c,s,g,q])=>{const k=c*(0.9+rnd()*0.2);return{n,c:Math.round(k),pos:Math.round(k*s[0]),neu:Math.round(k*s[1]),neg:Math.round(k*s[2]),g,q}});
function showQuotes(i){const T=THEMES[i];$('#quoteTitle').textContent=T.n;$('#quoteSub').textContent=`${fmt(T.pos+T.neu+T.neg)} synthetic comments · ${Math.round(100*T.pos/(T.pos+T.neu+T.neg))}% positive · volume ${T.g>0?'up':'down'} ${Math.abs(T.g)}% last quarter`;
  $('#quotes').innerHTML=T.q.map((q,j)=>`<div class="quote">${q}<small>Synthetic comment · ${['Adult service','Under 18s: parent','Under 18s: young person'][j%3]}</small></div>`).join('')+`<div class="insight">${T.neg>T.pos?'<b>Improvement opportunity.</b> Negative sentiment outweighs positive: worth a focused improvement project.':'<b>Strength.</b> Worth celebrating and protecting as the service grows.'}</div>`}
mk('themes',{type:'bar',data:{labels:THEMES.map(t=>t.n),datasets:[{label:'Positive',data:THEMES.map(t=>t.pos),backgroundColor:'#2e9e6b'},{label:'Neutral',data:THEMES.map(t=>t.neu),backgroundColor:C.grey},{label:'Negative',data:THEMES.map(t=>t.neg),backgroundColor:C.coral}]},
  options:{indexAxis:'y',onClick:(e,els)=>{if(els.length)showQuotes(els[0].index)},plugins:{legend:{position:'bottom'}},scales:{x:{stacked:true,title:{display:true,text:'comments'}},y:{stacked:true}}}});
showQuotes(4);
mk('themeMap',{type:'bubble',data:{datasets:THEMES.map((t,i)=>({label:t.n,data:[{x:Math.round(100*(t.pos-t.neg)/(t.pos+t.neu+t.neg)),y:t.g,r:Math.sqrt(t.c)*1.1}],backgroundColor:[C.teal,C.coral,C.coral,C.sun,'#d6457c',C.pink,C.teal3,'#2e9e6b',C.purple][i]+'bb'}))},
  options:{onClick:(e,els)=>{if(els.length)showQuotes(els[0].datasetIndex)},plugins:{legend:{position:'right'},tooltip:{callbacks:{label:c=>`${c.dataset.label}: net sentiment ${c.raw.x}, volume change ${c.raw.y}%`}}},scales:{x:{min:-60,max:100,title:{display:true,text:'net sentiment (% positive − % negative)'}},y:{min:-30,max:40,title:{display:true,text:'volume change last quarter (%)'}}}}});

// ---------- 08 SPC + funnel ----------
function pchart(vals,ns,brk){const ph=[[0,brk],[brk,vals.length]];const cl=[],ucl=[],lcl=[];ph.forEach(([a,b])=>{const pbar=vals.slice(a,b).reduce((s,v,i)=>s+v*ns[a+i],0)/ns.slice(a,b).reduce((s,v)=>s+v,0);for(let i=a;i<b;i++){const se=Math.sqrt(pbar*(1-pbar)/ns[i]);cl[i]=pbar;ucl[i]=Math.min(1,pbar+3*se);lcl[i]=Math.max(0,pbar-3*se)}});return{cl,ucl,lcl}}
function ichart(vals,brk){const cl=[],ucl=[],lcl=[];[[0,brk],[brk,vals.length]].forEach(([a,b])=>{const s=vals.slice(a,b),m=mean(s),mr=mean(s.slice(1).map((v,i)=>Math.abs(v-s[i])));for(let i=a;i<b;i++){cl[i]=m;ucl[i]=m+2.66*mr;lcl[i]=Math.max(0,m-2.66*mr)}});return{cl,ucl,lcl}}
const SPCD={};
{const n=[],v=[];for(let w=0;w<52;w++){const nn=60+Math.floor(rnd()*50);const p=w<26?0.74:Math.min(0.93,0.86+0.004*(w-26));let k=0;for(let j=0;j<nn;j++)if(rnd()<p)k++;n.push(nn);v.push(k/nn)}
 SPCD.obs={labels:v.map((_,i)=>'Wk '+(i+1)),vals:v.map(x=>x*100),lim:(()=>{const L=pchart(v,n,26);return{cl:L.cl.map(x=>x*100),ucl:L.ucl.map(x=>x*100),lcl:L.lcl.map(x=>x*100)}})(),brk:26,unit:'%',title:'Titration monitoring completed on time (p-chart)',sub:'Weekly % of titration reviews with BP, HR and weight recorded. Change at week 27: home BP monitors posted out + app reminders.',
  ins:'<b>Special cause detected:</b> after the change, every point sits above the old centre line (a run of 8+ is the signal), so the improvement is real rather than chance. Limits are recalculated for the new process.'};}
{const v=[];for(let w=0;w<52;w++)v.push(w<22?14+randn()*2.2:9.5+randn()*1.6);
 SPCD.forms={labels:v.map((_,i)=>'Wk '+(i+1)),vals:v,lim:ichart(v,22),brk:22,unit:'days',title:'Median days to return pre-assessment forms (I-chart)',sub:'Weekly median. Change at week 23: SMS nudges at day 5 and 10, plus offer of phone help.',
  ins:'<b>Process shift:</b> the median fell by about 4 days after SMS nudges and phone help. Because non-return is higher in more deprived areas (section 01), this change also narrows an inequality.'};}
{const nd=P.filter(p=>p.pathway==='nd');const n=[],v=[];MONTHS.forEach((_,m)=>{const a=nd.filter(p=>p.m===m);n.push(a.length);v.push(a.filter(p=>p.auStart<=91).length/Math.max(1,a.length))});
 const L=pchart(v,n,10);SPCD.nd={labels:MONTHS,vals:v.map(x=>x*100),lim:{cl:L.cl.map(x=>x*100),ucl:L.ucl.map(x=>x*100),lcl:L.lcl.map(x=>x*100)},brk:10,unit:'%',title:'Autism assessment started within 3 months (p-chart)',sub:'Monthly %, combined pathway. Change from month 11: single combined triage and a weekly MDT clinic. CG128 quality marker.',
  ins:'<b>Step change:</b> a single combined triage and regular MDT clinic moved far more children into the CG128 3-month window. The next question for the data: which children still wait longest, and why?'};}
function renderSPC(k){const D=SPCD[k];$('#spcTitle').textContent=D.title;$('#spcSub').textContent=D.sub;$('#spcInsight').innerHTML=D.ins;
  const out=D.vals.map((v,i)=>v>D.lim.ucl[i]||v<D.lim.lcl[i]);const sh=D.vals.map((v,i)=>i>=D.brk&&(k==='forms'?v<D.lim.cl[0]:v>D.lim.cl[0]));
  const seg2=(arr)=>arr.map((v,i)=>i===D.brk?null:v);const L=x=>{const a=[...x];a.splice(D.brk,0,null);return a};const lab=[...D.labels];lab.splice(D.brk,0,'');
  const vals=[...D.vals];vals.splice(D.brk,0,null);const col=D.vals.map((v,i)=>out[i]?'#a3221f':sh[i]?C.coral:C.teal);col.splice(D.brk,0,C.teal);
  mk('spc',{type:'line',data:{labels:lab,datasets:[{label:'Measure',data:vals,borderColor:C.teal,pointBackgroundColor:col,pointBorderColor:col,pointRadius:4,borderWidth:2,spanGaps:false},
    {label:'Centre line',data:L(D.lim.cl),borderColor:C.slate,borderWidth:2,pointRadius:0,spanGaps:false},{label:'Upper control limit',data:L(D.lim.ucl),borderColor:C.pink,borderDash:[6,4],borderWidth:2,pointRadius:0,stepped:true},{label:'Lower control limit',data:L(D.lim.lcl),borderColor:C.pink,borderDash:[6,4],borderWidth:2,pointRadius:0,stepped:true}]},
    options:{plugins:{legend:{position:'bottom'}},scales:{x:{ticks:{maxTicksLimit:14}},y:{title:{display:true,text:D.unit}}}},
    plugins:[{id:'chg',afterDraw(ch){const x=ch.scales.x.getPixelForValue(D.brk),y=ch.scales.y,ctx=ch.ctx;ctx.save();ctx.strokeStyle='#d6457c';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x,y.top);ctx.lineTo(x,y.bottom);ctx.stroke();ctx.fillStyle='#d6457c';ctx.font='bold 12px Arimo, Arial';ctx.fillText('Change introduced',x+6,y.top+14);ctx.restore()}}]})}
seg('spcSeg',renderSPC);renderSPC('obs');
(function(){const teams=[];const pbar=0.11;for(let t=0;t<18;t++){const n=80+Math.floor(rnd()*820);let p=pbar*(1+randn()*0.08);if(t===5)p=0.17;if(t===10)p=0.06;let k=0;for(let j=0;j<n;j++)if(rnd()<p)k++;teams.push({x:n,y:+(100*k/n).toFixed(1),t:'Team '+String.fromCharCode(65+t)})}
  const N0=teams.reduce((a,b)=>a+b.x,0),P0=teams.reduce((a,b)=>a+b.x*b.y/100,0)/N0;const ns=[];for(let n=60;n<=920;n+=20)ns.push(n);const lim=z=>s=>ns.map(n=>({x:n,y:Math.max(0,100*(P0+s*z*Math.sqrt(P0*(1-P0)/n)))}));
  const col=teams.map(t=>{const se=Math.sqrt(P0*(1-P0)/t.x);const d=Math.abs(t.y/100-P0)/se;return d>3.09?(t.y/100>P0?'#a3221f':'#2e9e6b'):d>1.96?C.sun:C.teal});
  mk('funnel',{type:'scatter',data:{datasets:[{label:'Clinic teams (synthetic)',data:teams,backgroundColor:col,pointRadius:6},{type:'line',label:'Average',data:ns.map(n=>({x:n,y:100*P0})),borderColor:C.slate,pointRadius:0,borderWidth:2},
    {type:'line',label:'95% limits',data:lim(1.96)(1),borderColor:C.sun,pointRadius:0,borderDash:[5,4],borderWidth:2},{type:'line',label:'95% lower',data:lim(1.96)(-1),borderColor:C.sun,pointRadius:0,borderDash:[5,4],borderWidth:2},
    {type:'line',label:'99.8% limits',data:lim(3.09)(1),borderColor:C.coral,pointRadius:0,borderWidth:2},{type:'line',label:'99.8% lower',data:lim(3.09)(-1),borderColor:C.coral,pointRadius:0,borderWidth:2}]},
    options:{plugins:{legend:{position:'bottom',labels:{filter:i=>!/lower/.test(i.text)}},tooltip:{callbacks:{label:c=>c.raw.t?`${c.raw.t}: ${c.raw.y}% of ${c.raw.x} patients`:''}}},scales:{x:{type:'linear',title:{display:true,text:'patients in titration'}},y:{title:{display:true,text:'DNA rate %'}}}}})})();

// ---------- 10 clock + nav ----------
$('#clock').innerHTML=Array.from({length:24},(_,h)=>{const uk=h>=8&&h<18,ind=h>=5&&h<14;return `<div class="${uk&&ind?'both':uk?'uk':ind?'in':'off'}" title="${String(h).padStart(2,'0')}:00 UK"></div>`}).join('');
(function(){const links=[...document.querySelectorAll('#nav a')];const map={};links.forEach(a=>map[a.getAttribute('href').slice(1)]=a);
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.remove('active'));const a=map[e.target.id];if(a){a.classList.add('active');const nv=document.getElementById('nav');nv.scrollLeft=a.offsetLeft-nv.clientWidth/2+a.clientWidth/2}}})},{rootMargin:'-45% 0px -50% 0px'});
  Object.keys(map).forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el)})})();
runNLP();
