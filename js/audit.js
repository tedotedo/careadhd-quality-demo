/* NICE audit, voice of the child, transition and future directions. All data synthetic. */
'use strict';
const R2=mulberry32(4242),r2=()=>R2();
const rn2=()=>{let u=0,v=0;while(!u)u=R2();while(!v)v=R2();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const pk2=(items,w)=>{w=w||items.map(()=>1);let s=w.reduce((a,b)=>a+b,0),r=r2()*s;for(let i=0;i<items.length;i++){r-=w[i];if(r<=0)return items[i]}return items[items.length-1]};
const NICEURL=(g,r)=>`https://www.nice.org.uk/guidance/${g.toLowerCase()}/chapter/Recommendations#${g.toLowerCase()}-${r.replace(/\./g,'_')}`;
const pid=p=>(p.tid?'SYN-T':'SYN-')+String(100000+((p.i*48271)%900000));
const GOALS=['Concentration and schoolwork','Behaviour at home','Friendships','Feeling calmer, less worried','Sleep','Being listened to','Hobbies and interests'];
const GW_C=[.14,.04,.22,.2,.12,.12,.16],GW_P=[.38,.22,.08,.12,.15,.02,.03];
const EXPQ=['People listened to me','I knew what would happen','I felt safe and comfortable','It was easy to say what I think','I would tell a friend it was OK'];
const EXP_C=[.78,.58,.82,.50,.74],EXP_P=[.90,.80,.91,.78,.88];
// ---- per-patient audit, voice and future fields ----
P.forEach(p=>{const a={},late=p.m>=9;
  if(p.startTx){a.baseMiss=['height','weight','blood pressure','pulse','cardiovascular history'].filter((x,j)=>r2()<[.01,.01,.015,.015,.03][j]*(late?0.6:1.4));
    if(p.service==='child'){const f=pk2(['Methylphenidate','Lisdexamfetamine','Atomoxetine'],[.9,.06,.04]);a.firstMed=f;a.firstOK=f==='Methylphenidate'||r2()<.5}
    else{const f=pk2(['Lisdexamfetamine','Methylphenidate','Atomoxetine'],[.52,.43,.05]);a.firstMed=f;a.firstOK=f!=='Atomoxetine'||r2()<.6}
    a.growthMiss=p.service==='child'?(r2()<(late?.9:.77)?null:pk2(p.age<=10?['Weight not measured at a 3-monthly interval','Height not measured in the last 6 months','Height and weight not plotted on a growth chart']:['Weight not recorded at 3 or 6 months after starting','Height not measured in the last 6 months','Height and weight not plotted on a growth chart'])):(r2()<.9?null:'No weight recorded in the last 6 months');
    if(p.autism||p.anx)a.slow=r2()<(late?.87:.64)}
  if(p.diagnosed)a.info=r2()<.94?null:pk2(['No record of a structured post-diagnosis discussion','Sources of information and support not documented']);
  if(p.diagnosed&&p.service==='child')a.parent=r2()<(late?.91:.7);
  if(p.stable&&p.m<=6)a.annual=r2()<.87;
  if(p.service==='child'&&p.assessed){a.viewsForm=r2()<(p.m>=10?.74:.46);a.viewsLetter=!a.viewsForm&&r2()<.38;a.views=a.viewsForm||a.viewsLetter;
    a.ownGoal=r2()<(p.m>=10?.85:.64);a.cGoal=pk2(GOALS,GW_C);a.pGoal=pk2(GOALS,GW_P);a.exp=EXPQ.map((q,j)=>({c:r2()<EXP_C[j]+(p.m>=10?.05:0)-(p.autism&&j===3?.08:0),pa:r2()<EXP_P[j]}));
    if(p.autism)a.access=r2()<(p.m>=10?.84:.52)}
  if(p.service==='child'&&p.startTx){const pr=Math.round(clamp(5+(-p.symChange)*9+rn2()*1.2,0,10));a.pR=pr;a.cR=Math.round(clamp(pr+rn2()*(p.autism?2:1.4)-(p.se.Irritability?1.6:0)-(p.se.Sleep?.6:0),0,10))}
  if(p.pathway==='nd'&&p.assessed){a.coord=r2()<.93;a.mdtMiss=r2()<(late?.89:.75)?null:pk2(['No speech and language therapist input','No psychologist input','No paediatrician or child psychiatrist input']);
    a.coexMiss=r2()<(late?.9:.77)?null:pk2(['Sleep not screened','Anxiety not screened','Learning disability not assessed','Sleep and anxiety not screened']);a.reportMiss=r2()<.94?null:pk2(['Written report not sent to the family','Report not shared with the GP']);if(p.autism)a.fu6=r2()<(late?.83:.6)}
  if(p.service==='child'&&p.autism&&p.melatonin)a.sleepPlan=r2()<(late?.8:.6);
  if(p.service==='child'&&p.autism&&p.sleepProb)a.sleepAssess=r2()<(late?.9:.8);
  if(p.service==='adult'&&p.diagnosed){a.socComm=r2()<.16;if(a.socComm)a.auConsider=r2()<(late?.62:.4)}
  if(p.service==='child'&&p.age>=14)a.tPlan=r2()<(late?.8:.5);
  if(p.service==='child'&&p.age>=16)a.named=r2()<(late?.82:.58);
  a.arfid=r2()<(p.service==='adult'?.05:(p.autism?.22:.09));
  if(p.service==='child'&&p.startTx&&['Methylphenidate','Lisdexamfetamine'].includes(p.med)){a.wDelta=-(a.arfid?2.4:1.0)*(p.autism?1.15:1)+rn2()*0.9;a.lastDose=pk2(['Before 12:00','12:00–14:00','14:00–16:00','After 16:00'],[.45,.3,.17,.08])}
  p.a=a});
// ---- transition cohort (synthetic) ----
const T=[];
for(let i=0;i<560;i++){const m=Math.floor(r2()*18),upcoming=i>=520;const q=r2()<Math.min(.85,.45+.025*m);
  const planAge=q?clamp(14.3+rn2()*0.9,13,17.4):clamp(16.8+rn2()*0.7,15,17.95);const named=q?r2()<.93:r2()<.42,joint=q?r2()<.88:r2()<.28;const planned=planAge<=17.5&&named&&joint;
  const imd=pk2([1,2,3,4,5]),autism=r2()<.3;const t={tid:true,i,m,upcoming,service:'transition',ageBand:'18–25',pathway:autism?'nd':'adhd',autism,imd,eth:pk2(ETH,ETHW),sex:r2()<.4?'Female':'Male',
    planAge,named,joint,planned,same2:r2()<(planned?.9:.52),reassess:r2()<(planned?.95:.62),readiness:Math.round(clamp((planned?72:52)+rn2()*11,10,100)),medGap:r2()<(planned?.05:.27),
    sat:r2()<(planned?.88:.56),prevDNA:Math.min(4,Math.floor(-Math.log(r2())*(planned?.4:.8))),app:r2()<.5,anx:r2()<.35,rem:r2()<.85,forms:lognorm(12,.5),lastWait:planned?lognorm(30,.4):lognorm(75,.4),turns:1+Math.floor(r2()*6)};
  const dis=r2()<(planned?.07:.31);t.dis=r2()<.03?-(1+Math.floor(r2()*10)):dis?(planned?1+Math.floor(r2()*9):Math.min(10,Math.floor(-Math.log(r2())*1.6))):99;t.dis6=t.dis>=0&&t.dis<=6;
  T.push(t)}
const TA=T.filter(t=>!t.upcoming);
// ---- audit standards ----
const nt=p=>!p.tid;
const STD=[
 {g:'NG87',r:['1.7.4'],t:'Baseline assessment before medication: height, weight, pulse, BP and cardiovascular history',pop:p=>nt(p)&&p.startTx,met:p=>!p.a.baseMiss.length,why:p=>'Missing at baseline: '+p.a.baseMiss.join(', '),act:'Complete baseline checks before the next dose increase',ev:'Observations, pre-treatment checklist, letters (AI)',tg:95},
 {g:'NG87',r:['1.8.9'],t:'Heart rate and blood pressure before and after each dose change',pop:p=>nt(p)&&p.startTx,met:p=>p.monitorOK,why:p=>`BP/HR not recorded around dose change ${1+(p.i%Math.max(1,p.steps||1))}`,act:'Request home BP/HR readings or book clinic observations',ev:'Observations, home BP app, letters (AI)',tg:95},
 {g:'NG87',r:['1.8.5'],t:'Growth monitoring: height and weight measured and plotted (children); weight 6-monthly (adults)',pop:p=>nt(p)&&p.startTx,met:p=>!p.a.growthMiss,why:p=>p.a.growthMiss,act:'Book measurements; plot on growth chart for review',ev:'Observations, growth chart record',tg:90},
 {g:'NG87',r:['1.7.7','1.7.11'],t:'First-line medicine: methylphenidate (children 5+); lisdexamfetamine or methylphenidate (adults); or reason recorded',pop:p=>nt(p)&&p.startTx,met:p=>p.a.firstOK,why:p=>`Started on ${p.a.firstMed.toLowerCase()} with no recorded reason for not using a first-line option`,act:'Prescriber to document the rationale',ev:'Prescriptions, letters (AI)',tg:95},
 {g:'NG87',r:['1.7.28'],t:'Slower titration and closer monitoring when autism or anxiety co-occurs',pop:p=>nt(p)&&p.startTx&&(p.autism||p.anx),met:p=>p.a.slow,why:p=>'Standard titration schedule despite co-occurring '+(p.autism?'autism':'anxiety'),act:'Review titration plan and monitoring frequency',ev:'Titration plan, appointment intervals',tg:85},
 {g:'NG87',r:['1.4.3','1.4.4'],t:'Structured discussion and information about support after diagnosis',pop:p=>nt(p)&&p.diagnosed,met:p=>!p.a.info,why:p=>p.a.info,act:'Send information pack; discuss at next contact',ev:'Diagnosis letter (AI), information-sent log',tg:90},
 {g:'NG87',r:['1.5.10'],t:'ADHD-focused support offered to parents and carers (children 5+)',pop:p=>nt(p)&&p.diagnosed&&p.service==='child',met:p=>p.a.parent,why:()=>'No record of ADHD-focused parent support being offered',act:'Offer group or 1–2 session parent support',ev:'Referrals, letters (AI)',tg:90},
 {g:'NG87',r:['1.10.1'],t:'Medication reviewed at least once a year',all:true,pop:p=>nt(p)&&p.stable&&p.m<=6,met:p=>p.a.annual,why:()=>'No documented annual review in the last 12 months',act:'Book annual review',ev:'Appointments, review template',tg:95},
 {g:'NG87',r:['1.3.6','1.5.4'],t:"Child's own views recorded",pop:p=>nt(p)&&p.service==='child'&&p.assessed,met:p=>p.a.views,why:()=>"Child's own account not found in child questionnaire or letters",act:"Use child-rated measure; record the child's views at next contact",ev:'Child questionnaire, letters (AI)',tg:90},
 {g:'NG87',r:['1.1.4'],t:"Reassessed for continuing treatment before leaving children's services",pop:p=>p.tid,met:p=>p.reassess,why:()=>'No documented reassessment of ongoing treatment need before transfer',act:'Reassess at next review',ev:'Transition template, letters (AI)',tg:95},
 {g:'CG128',r:['1.5.1'],t:'Autism diagnostic assessment started within 3 months of referral',pop:p=>nt(p)&&p.pathway==='nd'&&p.assessed,met:p=>p.auStart<=91,why:p=>`Assessment started after ${Math.round(p.auStart)} days`,act:'Offer the next MDT slot; tell the family the expected date',ev:'Referral and appointment dates',tg:90},
 {g:'CG128',r:['1.5.2'],t:'Case coordinator identified for every child',pop:p=>nt(p)&&p.pathway==='nd'&&p.assessed,met:p=>p.a.coord,why:()=>'No case coordinator recorded',act:'Allocate case coordinator',ev:'Case record',tg:90},
 {g:'CG128',r:['1.1.3'],t:'Core autism team involved: paediatrician or psychiatrist, speech and language therapist, psychologist',pop:p=>nt(p)&&p.pathway==='nd'&&p.assessed,met:p=>!p.a.mdtMiss,why:p=>p.a.mdtMiss,act:'Arrange missing discipline input before formulation',ev:'MDT attendance, assessment reports',tg:90},
 {g:'CG128',r:['1.5.5','1.5.15'],t:'Systematic check for coexisting conditions (e.g. sleep, anxiety, learning disability)',pop:p=>nt(p)&&p.pathway==='nd'&&p.assessed,met:p=>!p.a.coexMiss,why:p=>p.a.coexMiss,act:'Add screening (e.g. CSHQ, SCAS) at next contact',ev:'Questionnaires, letters (AI)',tg:90},
 {g:'CG128',r:['1.8.4','1.8.5'],t:'Written report given to the family and shared with the GP',pop:p=>nt(p)&&p.pathway==='nd'&&p.assessed,met:p=>!p.a.reportMiss,why:p=>p.a.reportMiss,act:'Send report',ev:'Correspondence log',tg:95},
 {g:'CG128',r:['1.8.8'],t:'Follow-up offered within 6 weeks of an autism diagnosis',pop:p=>nt(p)&&p.pathway==='nd'&&p.autism&&p.assessed,met:p=>p.a.fu6,why:()=>'No follow-up offered within 6 weeks',act:'Offer follow-up appointment',ev:'Appointments',tg:85},
 {g:'CG170',r:['1.7.4'],t:'Sleep assessment offered when an autistic child has a sleep problem',pop:p=>nt(p)&&p.service==='child'&&p.autism&&p.sleepProb,met:p=>p.a.sleepAssess,why:()=>'Sleep problem reported but no sleep assessment recorded',act:'Send CSHQ and sleep diary',ev:'Questionnaires, letters (AI)',tg:90},
 {g:'CG170',r:['1.7.6','1.7.7'],t:'Sleep plan in place before melatonin is started',pop:p=>nt(p)&&p.service==='child'&&p.autism&&p.melatonin,met:p=>p.a.sleepPlan,why:()=>'Melatonin started without a documented sleep plan',act:'Agree a sleep plan with the family; review melatonin',ev:'Sleep plan record, letters (AI)',tg:90},
 {g:'CG142',r:['1.2.2','1.2.3'],t:'Adults with ADHD and persistent social-communication difficulties: autism assessment considered (e.g. AQ-10)',pop:p=>nt(p)&&p.service==='adult'&&p.diagnosed&&p.a.socComm,met:p=>p.a.auConsider,why:()=>'Social-communication difficulties noted; autism assessment not considered',act:'Offer AQ-10 and discuss autism assessment',ev:'Assessment notes (AI)',tg:80},
 {g:'NG43',r:['1.2.1'],t:'Transition plan in place for young people aged 14 and over',pop:p=>nt(p)&&p.service==='child'&&p.age>=14,met:p=>p.a.tPlan,why:()=>'No transition plan recorded',act:'Start transition planning at next review',ev:'Transition template',tg:90},
 {g:'NG43',r:['1.2.5'],t:'Named worker identified (age 16 and over)',pop:p=>nt(p)&&p.service==='child'&&p.age>=16,met:p=>p.a.named,why:()=>'No named worker recorded',act:'Agree a named worker with the young person',ev:'Case record',tg:90},
 {g:'NG43',r:['1.2.9'],t:'Named worker support from at least 6 months before transfer',pop:p=>p.tid,met:p=>p.named&&p.planAge<=17.5,why:p=>p.named?'Named worker allocated less than 6 months before transfer':'No named worker before transfer',act:'Review transition process',ev:'Case record',tg:85},
 {g:'NG43',r:['1.3.1'],t:'Adult clinician met the young person before transfer',pop:p=>p.tid,met:p=>p.joint,why:()=>'No joint appointment or meeting with adult clinician before transfer',act:'Book joint appointment',ev:'Appointments',tg:85},
 {g:'NG43',r:['1.4.4'],t:'Same adult practitioner for the first 2 appointments after transfer',pop:p=>p.tid,met:p=>p.same2,why:()=>'Different practitioners at first 2 adult appointments',act:'Fix clinician allocation for new transfers',ev:'Appointments',tg:90}
];
const AUD=P.concat(TA);
function afilter(p){const s=KF.service,okS=s==='all'||(p.tid?true:p.service===s);const okP=KF.pathway==='all'||p.pathway===KF.pathway;
  const okA=KF.age==='all'||(p.tid?['12–17','18–25'].includes(KF.age):p.ageBand===KF.age);return okS&&okP&&okA}
let audSel=null;const audRag=(v,tg)=>isNaN(v)?'grey':(v=Math.round(v),v>=tg)?'green':v>=tg-8?'amber':'red';
function stdStats(S,arr){const d=arr.filter(S.pop);const miss=d.filter(p=>!S.met(p));return{den:d.length,num:d.length-miss.length,pct:d.length?100*(d.length-miss.length)/d.length:NaN,miss}}
function renderAudit(){const g=$('#af_g').value;const arr=AUD.filter(afilter),rec=arr.filter(p=>p.m>=12);
  const rows=STD.map((S,k)=>({S,k,st:stdStats(S,S.all?arr:rec),tr:MONTHS.map((_,m)=>{const st=stdStats(S,arr.filter(p=>p.m===m));return st.den<8?NaN:st.pct})})).filter(o=>g==='all'||o.S.g===g);
  const valid=rows.filter(o=>o.st.den>0);const meet=valid.filter(o=>Math.round(o.st.pct)>=o.S.tg).length;const tot=valid.reduce((a,o)=>a+o.st.den,0),num=valid.reduce((a,o)=>a+o.st.num,0);
  const flagged=new Set();valid.forEach(o=>o.st.miss.forEach(p=>flagged.add(pid(p))));const letterEv=rec.filter(p=>p.a&&p.a.viewsLetter).length;
  $('#auditKpis').innerHTML=[[`${meet} of ${valid.length}`,'standards meeting their target'],[fmt(100*num/Math.max(1,tot))+'%','overall compliance (all checks)'],[fmt(flagged.size),'synthetic patients with at least one open flag'],[fmt(letterEv),"times the child's views were found only in letters, by AI"]].map(([b,s])=>`<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  let html='',last='';const GN={NG87:'NG87 · ADHD: diagnosis and management',CG128:'CG128 · Autism in under 19s: recognition, referral and diagnosis',CG170:'CG170 · Autism in under 19s: support and management',CG142:'CG142 · Autism in adults',NG43:"NG43 · Transition from children's to adults' services"};
  rows.forEach(o=>{if(o.S.g!==last){html+=`<tr class="grp"><td colspan="6">${GN[o.S.g]}</td></tr>`;last=o.S.g}
    const st=o.st,rg=audRag(st.pct,o.S.tg),col={green:'#2e9e6b',amber:'#E0A400',red:'#d9534f',grey:'#b9c4c6'}[rg];
    html+=`<tr data-k="${o.k}" class="${audSel===o.k?'sel':''}"><td>${o.S.t}</td><td class="nice-link">${o.S.r.map(r=>`<a href="${NICEURL(o.S.g,r)}" target="_blank" rel="noopener">${o.S.g} ${r}</a>`).join('<br>')}</td>
     <td>${st.den?fmt(st.num)+' / '+fmt(st.den):'<span class="muted">not applicable</span>'}</td><td class="barcell">${st.den?`<b>${fmt(st.pct)}%</b> <span class="pill ${rg}">${rg==='green'?'Met':rg==='amber'?'Close':'Below'}</span><div class="mbar"><i style="width:${st.pct}%;background:${col}"></i><b style="left:${o.S.tg}%"></b></div>`:'–'}</td><td>≥ ${o.S.tg}%</td><td style="width:130px">${st.den?spark(o.tr,{target:o.S.tg}):''}</td></tr>`});
  $('#auditTable tbody').innerHTML=html;
  document.querySelectorAll('#auditTable tbody tr[data-k]').forEach(tr=>tr.addEventListener('click',()=>{audSel=+tr.dataset.k;renderAudit();document.getElementById('drill').scrollIntoView({behavior:'smooth',block:'nearest'})}));
  if(audSel===null||!rows.some(o=>o.k===audSel&&o.st.den)){const w=valid.slice().sort((a,b)=>(a.st.pct-a.S.tg)-(b.st.pct-b.S.tg))[0];audSel=w?w.k:null;if(audSel!==null){document.querySelectorAll('#auditTable tbody tr').forEach(tr=>tr.classList.toggle('sel',+tr.dataset.k===audSel))}}
  renderDrill(rec)}
let drillRows=[];
function renderDrill(rec){if(audSel===null){$('#drillTable tbody').innerHTML='';return}const S=STD[audSel],st=stdStats(S,S.all?AUD.filter(afilter):rec);drillRows=st.miss;
  $('#drillTitle').textContent='Worklist: '+S.t;$('#drillSub').innerHTML=`${fmt(st.miss.length)} synthetic patients did not meet this standard${S.all?' (patients on a stable dose for over 12 months)':' in the last 6 months'} · source: <a href="${NICEURL(S.g,S.r[0])}" target="_blank" rel="noopener">NICE ${S.g} ${S.r.join(', ')}</a>`;
  $('#drillTable tbody').innerHTML=st.miss.slice(0,12).map(p=>`<tr><td><b>${pid(p)}</b></td><td>${p.tid?'18 (transferred)':p.age}</td><td>${p.tid?'Transition':p.pathway==='nd'?'Autism + ADHD':(p.service==='adult'?'Adult ADHD':'Under 18s ADHD')}</td><td class="small">${S.why(p)}</td><td class="small muted">${S.ev}</td><td class="small">${S.act}</td></tr>`).join('')||'<tr><td colspan="6" class="muted">No missed cases. Nothing to action.</td></tr>';
  $('#drillMore').textContent=st.miss.length>12?`Showing 12 of ${fmt(st.miss.length)}. The CSV contains all of them.`:''}
if($('#drillCsv'))$('#drillCsv').addEventListener('click',()=>{const S=STD[audSel];const lines=[['pseudonymised_id','age','pathway','standard','nice_source','reason','suggested_action','note']].concat(drillRows.map(p=>[pid(p),p.tid?'18':p.age,p.tid?'transition':p.pathway,S.t,S.g+' '+S.r.join('/'),S.why(p),S.act,'SYNTHETIC DATA - NOT A REAL PATIENT']));
  const csv=lines.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='synthetic-worklist-'+S.g+'-'+S.r[0]+'.csv';a.click()});
// shared filters
if($('#auditTable')){const KFK={kf_service:'service',kf_path:'pathway',kf_age:'age'};
  document.querySelectorAll('select[data-kf]').forEach(sel=>sel.addEventListener('change',()=>{KF[KFK[sel.dataset.kf]]=sel.value;renderAudit()}));
  $('#af_g').addEventListener('change',renderAudit);renderAudit();}

// ---- 04a voice of the child ----
(function(){if(!$('#voiceKpis'))return;const kids=P.filter(p=>p.service==='child'&&p.assessed),rec=kids.filter(p=>p.m>=12);const rated=P.filter(p=>p.a.pR!==undefined);
  const div=pct(rated,p=>Math.abs(p.a.cR-p.a.pR)>=3),divA=pct(rated.filter(p=>p.autism),p=>Math.abs(p.a.cR-p.a.pR)>=3),divN=pct(rated.filter(p=>!p.autism),p=>Math.abs(p.a.cR-p.a.pR)>=3);
  const au=rec.filter(p=>p.autism);
  $('#voiceKpis').innerHTML=[[fmt(pct(rec,p=>p.a.views))+'%',"child's views recorded (last 6 months)"],[fmt(pct(rec,p=>p.a.ownGoal))+'%','children who set at least one goal of their own'],[fmt(div)+'%','child and parent differ by 3+ points on improvement'],[fmt(pct(au,p=>p.a.access))+'%','autistic children offered visual or easy-read formats']].map(([b,s])=>`<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  const smp=rated.filter((_,i)=>i%Math.ceil(rated.length/320)===0);const jit=()=>(r2()-.5)*.5;
  mk('diverge',{type:'scatter',data:{datasets:[{label:'ADHD alone',data:smp.filter(p=>!p.autism).map(p=>({x:p.a.pR+jit(),y:p.a.cR+jit()})),backgroundColor:C.teal+'aa',pointRadius:4},{label:'ADHD + autism',data:smp.filter(p=>p.autism).map(p=>({x:p.a.pR+jit(),y:p.a.cR+jit()})),backgroundColor:'#d6457caa',pointRadius:4},
    {type:'line',label:'Agree',data:[{x:0,y:0},{x:10,y:10}],borderColor:C.slate,borderWidth:1.5,pointRadius:0},{type:'line',label:'±3 points',data:[{x:0,y:3},{x:7,y:10}],borderColor:C.coral,borderDash:[5,4],pointRadius:0,borderWidth:1.5},{type:'line',label:'−3',data:[{x:3,y:0},{x:10,y:7}],borderColor:C.coral,borderDash:[5,4],pointRadius:0,borderWidth:1.5}]},
    options:{plugins:{legend:{position:'bottom',labels:{filter:i=>i.text!=='−3'}}},scales:{x:{min:-0.5,max:10.5,title:{display:true,text:'parent rating (0–10)'}},y:{min:-0.5,max:10.5,title:{display:true,text:'child rating (0–10)'}}}}});
  mk('goals',{type:'bar',data:{labels:GOALS,datasets:[{label:"Child's own goals",data:GOALS.map(gl=>pct(kids,p=>p.a.cGoal===gl)),backgroundColor:C.sun},{label:"Parent's goals",data:GOALS.map(gl=>pct(kids,p=>p.a.pGoal===gl)),backgroundColor:C.teal3}]},options:{indexAxis:'y',plugins:{legend:{position:'bottom'}},scales:{x:{title:{display:true,text:'% of goals'}}}}});
  mk('childExp',{type:'bar',data:{labels:EXPQ,datasets:[{label:'Child',data:EXPQ.map((_,j)=>pct(rec,p=>p.a.exp[j].c)),backgroundColor:C.sun},{label:'Parent',data:EXPQ.map((_,j)=>pct(rec,p=>p.a.exp[j].pa)),backgroundColor:C.teal3}]},options:{indexAxis:'y',plugins:{legend:{position:'bottom'}},scales:{x:{max:100,title:{display:true,text:'% positive'}}}}});
  mk('voiceTrend',{type:'line',data:{labels:MONTHS,datasets:[{label:"Child's views documented",data:MONTHS.map((_,m)=>pct(kids.filter(p=>p.m===m),p=>p.a.views)),borderColor:C.teal,backgroundColor:C.teal,tension:.3,borderWidth:3},{label:'Accessible formats offered (autistic children)',data:MONTHS.map((_,m)=>{const a=kids.filter(p=>p.m===m&&p.autism);return a.length<8?null:pct(a,p=>p.a.access)}),borderColor:'#d6457c',backgroundColor:'#d6457c',tension:.3,borderWidth:3},{label:'Target 90%',data:MONTHS.map(()=>90),borderColor:C.coral,borderDash:[6,5],pointRadius:0,borderWidth:2}]},
    options:{plugins:{legend:{position:'bottom'}},scales:{y:{min:0,max:100,title:{display:true,text:'%'}}}},plugins:[{id:'chg2',afterDraw(ch){const x=ch.scales.x.getPixelForValue(10),y=ch.scales.y,ctx=ch.ctx;ctx.save();ctx.strokeStyle='#d6457c';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x,y.top);ctx.lineTo(x,y.bottom);ctx.stroke();ctx.fillStyle='#d6457c';ctx.font='bold 12px Arimo, Arial';ctx.fillText('Child-voice prompt added to letters',x+6,y.top+14);ctx.restore()}}]});
  $('#voiceInsight').innerHTML=`<b>What the data suggests:</b> children and parents disagree by 3 or more points in ${fmt(div)}% of cases, more often when autism is present (${fmt(divA)}% vs ${fmt(divN)}%). Where children rate things worse than parents, irritability or poor sleep on medication is common: a reason to ask the child directly at every review. Children's goals are about friendships and feeling calmer; parents' are about schoolwork and behaviour. Both matter.`})();

// ---- 04b transition ----
(function(){if(!$('#timeline'))return;const tl=[['13–14','Start planning','Year 9 at the latest; immediately if joining close to transfer','NG43','1.2.1'],['14–17','Annual transition review','With the young person, family and GP','NG43','1.2.4'],['15–16','Named worker','One coordinating practitioner; one-page profile or communication passport','NG43','1.2.5'],['16+','Care programme approach','Can be used as an aid to transfer','NG87','1.1.5'],['17','Reassess and meet the adult team','Review need for continuing treatment; joint appointment with the adult clinician','NG87','1.1.4'],['≈18','Transfer at a stable time','Not a rigid birthday; no gap in prescriptions','NG43','1.2.3'],['18+','Continuity after transfer','Same practitioner for first 2 appointments; named worker support for 6+ months','NG43','1.4.4']];
  $('#timeline').innerHTML=tl.map(([age,h,d,g,r],i)=>`<div class="tl ${i===5?'cliff':''}"><b>${age}</b><strong>${h}</strong><div class="small muted">${d}</div><a href="${NICEURL(g,r)}" target="_blank" rel="noopener">${g} ${r}</a></div>`).join('');
  const rec=TA.filter(t=>t.m>=12),pl=TA.filter(t=>t.planned),un=TA.filter(t=>!t.planned);
  $('#transKpis').innerHTML=[[fmt(pct(rec,t=>t.named&&t.planAge<=17.5))+'%','named worker in place 6+ months before transfer'],[fmt(pct(rec,t=>t.joint))+'%','met the adult clinician before transfer'],[fmt(pct(pl,t=>t.medGap))+'% vs '+fmt(pct(un,t=>t.medGap))+'%','gap in medication supply around 18: planned vs unplanned'],[fmt(pct(pl,t=>t.sat))+'% vs '+fmt(pct(un,t=>t.sat))+'%','young people satisfied with their transition']].map(([b,s])=>`<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  const K=[];for(let k=-12;k<=12;k++)K.push(k);const eng=g=>K.map(k=>100*g.filter(t=>t.dis>k||t.dis===99).length/g.length);
  mk('cliff',{type:'line',data:{labels:K.map(k=>k===0?'18th birthday':(k>0?'+':'')+k+' m'),datasets:[{label:'Planned transition',data:eng(pl),borderColor:C.teal,backgroundColor:'rgba(0,97,101,.1)',fill:true,tension:.25,borderWidth:3,pointRadius:0},{label:'Unplanned transfer',data:eng(un),borderColor:C.coral,backgroundColor:'rgba(255,134,132,.1)',fill:true,tension:.25,borderWidth:3,pointRadius:0}]},
    options:{interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fmt(c.parsed.y)}% engaged`}}},scales:{y:{min:40,max:100,title:{display:true,text:'% still engaged with care'}},x:{ticks:{maxTicksLimit:9}}}},
    plugins:[{id:'b18',afterDraw(ch){const x=ch.scales.x.getPixelForValue(12),y=ch.scales.y,ctx=ch.ctx;ctx.save();ctx.strokeStyle=C.slate;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x,y.top);ctx.lineTo(x,y.bottom);ctx.stroke();ctx.restore()}}]});
  mk('transOut',{type:'bar',data:{labels:['Medication supply gap','Disengaged within 6 months','Same adult clinician ×2','Young person satisfied'],datasets:[{label:'Planned',data:[pct(pl,t=>t.medGap),pct(pl,t=>t.dis6),pct(pl,t=>t.same2),pct(pl,t=>t.sat)],backgroundColor:C.teal},{label:'Unplanned',data:[pct(un,t=>t.medGap),pct(un,t=>t.dis6),pct(un,t=>t.same2),pct(un,t=>t.sat)],backgroundColor:C.coral}]},options:{indexAxis:'y',plugins:{legend:{position:'bottom'}},scales:{x:{max:100,title:{display:true,text:'%'}}}}});
  const up=T.filter(t=>t.upcoming).map(t=>{const x={child:0,ya:1,wait:t.lastWait,dna:t.prevDNA,dep:3-t.imd,forms:t.forms,app:+t.app,anx:+t.anx,rem:+t.rem};return{t,r:MODEL.pred(FEAT.map(F=>x[F.k]))}}).sort((a,b)=>b.r-a.r).slice(0,8);
  const base=new Date(2026,9,1);
  $('#transTable tbody').innerHTML=up.map(({t,r})=>{const d=new Date(base.getFullYear(),base.getMonth()+t.turns,1);const act=[];if(!t.named)act.push('agree a named worker now');if(!t.joint)act.push('book a joint appointment with the adult clinician');if(t.readiness<55)act.push('readiness session (self-management, ordering prescriptions)');if(r>.2)act.push('personal call before first adult appointment');if(!act.length)act.push('continue plan');
    return `<tr><td><b>${pid(t)}</b></td><td>${d.toLocaleDateString('en-GB',{month:'short',year:'numeric'})}</td><td>${t.readiness}/100</td><td>${t.planAge<=17.5?'<span class="pill green">Yes</span>':'<span class="pill red">Late</span>'}</td><td>${t.named?'<span class="pill green">Yes</span>':'<span class="pill red">No</span>'}</td><td><b>${fmt(r*100)}%</b></td><td class="small">${act.join('; ')}</td></tr>`}).join('')})();

// ---- 13 future directions ----
(function(){const grp=[['Adult ADHD',p=>p.service==='adult'&&p.diagnosed],['Under 18s: ADHD alone',p=>p.service==='child'&&p.diagnosed&&!p.autism],['Under 18s: ADHD + autism',p=>p.service==='child'&&p.diagnosed&&p.autism]];
  mk('futPrev',{type:'bar',data:{labels:grp.map(g=>g[0]),datasets:[{label:'Sleep problem',data:grp.map(g=>pct(P.filter(g[1]),p=>p.sleepProb)),backgroundColor:C.purple},{label:'Positive ARFID screen',data:grp.map(g=>pct(P.filter(g[1]),p=>p.a.arfid)),backgroundColor:C.sun}]},options:{plugins:{legend:{position:'bottom'}},scales:{y:{max:100,title:{display:true,text:'%'}}}}});
  const w=P.filter(p=>p.a.wDelta!==undefined);const mo=[0,3,6,9,12];const traj=g=>mo.map(m=>mean(g.map(p=>p.a.wDelta*Math.min(1,m/6)*(m>6?1.05:1))));
  mk('futWeight',{type:'line',data:{labels:mo.map(m=>m+' m'),datasets:[{label:'No ARFID features',data:traj(w.filter(p=>!p.a.arfid)),borderColor:C.teal,backgroundColor:C.teal,borderWidth:3,tension:.3},{label:'Positive ARFID screen',data:traj(w.filter(p=>p.a.arfid)),borderColor:C.coral,backgroundColor:C.coral,borderWidth:3,tension:.3},{label:'Early-warning line',data:mo.map(()=>-1.5),borderColor:'#a3221f',borderDash:[5,4],pointRadius:0,borderWidth:1.5}]},options:{plugins:{legend:{position:'bottom'}},scales:{y:{title:{display:true,text:'centile spaces'}}}}});
  const LD=['Before 12:00','12:00–14:00','14:00–16:00','After 16:00'],add=[6,14,29,47];
  mk('futSleep',{type:'bar',data:{labels:LD,datasets:[{label:'Extra minutes to fall asleep',data:LD.map((l,j)=>{const g=w.filter(p=>p.a.lastDose===l);return mean(g.map(p=>add[j]*(p.autism?1.3:1)+(p.i%13-6)))}),backgroundColor:[C.mint,C.sun,C.coral,'#d6457c']}]},options:{plugins:{legend:{display:false}},scales:{y:{title:{display:true,text:'minutes'}}}}});
})();
