/* Sky: night, dawn, day and dusk for the follow-the-sun scenes. No libraries.
   Concept demo by Dr Mark Aszkenasy. */
'use strict';
(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const PH=['night','dawn','day','dusk'];
/* seeded random so the stars sit in the same place every visit */
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function stars(r,n,cls){let h='';for(let i=0;i<n;i++){const x=r()*100,y=Math.pow(r(),1.6)*62,rad=(.5+r()*r()*1.4).toFixed(2),o=(.35+r()*.6).toFixed(2);
  h+=`<circle cx="${x.toFixed(2)}%" cy="${y.toFixed(2)}%" r="${rad}" opacity="${o}"/>`}return`<svg class="st ${cls}" aria-hidden="true">${h}</svg>`}

/* mount(host,{pos:{dawn:[x,y],day:[x,y],dusk:[x,y],night:[x,y]},moon:[x,y]}) -> {set, play, stop} */
function mount(host,o){o=o||{};const r=rng(o.seed||7);
  host.classList.add('sky');host.setAttribute('aria-hidden','true');
  host.innerHTML=PH.map(p=>`<div class="l ${p}"></div>`).join('')+
    `<div class="stars">${stars(r,34,'s1')}${stars(r,26,'s2')}${stars(r,18,'s3')}</div><div class="hz"></div>`+
    `<div class="moon"><b></b><i></i></div><div class="orb"><div class="halo"></div><div class="disc"></div><div class="warm"></div></div>`;
  const pos=Object.assign({night:[88,114],dawn:[88,101],day:[88,91],dusk:[88,101]},o.pos||{}),moon=o.moon||[80,16];
  host.style.setProperty('--agx',pos.dawn[0]+'%');host.style.setProperty('--dgx',pos.dusk[0]+'%');host.style.setProperty('--ygx',pos.day[0]+'%');host.style.setProperty('--ygy',pos.day[1]+'%');
  function set(p){host.dataset.phase=p;const s=pos[p];host.style.setProperty('--sx',s[0]+'%');host.style.setProperty('--sy',s[1]+'%');
    const m=p==='night'?moon:p==='dusk'?[moon[0],moon[1]+8]:[moon[0],moon[1]-30];host.style.setProperty('--mx',m[0]+'%');host.style.setProperty('--my',m[1]+'%');
    if(o.scene)o.scene.dataset.sky=p}
  set(o.start||'night');
  let seq=null,i=0,t=null,vis=false,cb=null;
  function step(){if(!seq||!vis||document.hidden)return;const s=seq[i];set(s.ph);cb&&cb(i,s);t=setTimeout(()=>{i=(i+1)%seq.length;step()},s.ms)}
  function play(sq,onStep){seq=sq;cb=onStep;i=0;clearTimeout(t);
    if(reduce){const k=sq.findIndex(s=>s.rest);i=k<0?0:k;set(sq[i].ph);cb&&cb(i,sq[i]);return}
    step()}
  function go(k){clearTimeout(t);i=k;if(!seq)return;set(seq[k].ph);cb&&cb(k,seq[k]);if(reduce||!vis)return;t=setTimeout(()=>{i=(i+1)%seq.length;step()},seq[k].ms+4000)}
  const io=new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!vis){vis=true;clearTimeout(t);if(seq&&!reduce)step()}else if(!v){vis=false;clearTimeout(t)}},{threshold:.25});
  io.observe(o.scene||host);
  document.addEventListener('visibilitychange',()=>{clearTimeout(t);if(!document.hidden&&vis&&seq&&!reduce)step()});
  const api={set,play,go,get i(){return i}};host._sky=api;return api}

/* sunrise / sunset (NOAA approximation), returned as minutes after local midnight in tz */
function sunTimes(d,lat,lon,tz){const R=Math.PI/180,sin=x=>Math.sin(x*R),cos=x=>Math.cos(x*R);
  const J=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),12)/864e5+2440587.5,n=Math.round(J-2451545.0008),Js=n-lon/360;
  const M=(357.5291+.98560028*Js)%360,C=1.9148*sin(M)+.02*sin(2*M)+.0003*sin(3*M),L=(M+C+282.9372)%360;
  const Jt=2451545+Js+.0053*sin(M)-.0069*sin(2*L),dec=Math.asin(sin(L)*sin(23.44))/R;
  const w=Math.acos((sin(-.833)-sin(lat)*sin(dec))/(cos(lat)*cos(dec)))/R;
  const f=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:tz});
  const loc=j=>{const [h,m]=f.format(new Date((j-2440587.5)*864e5)).split(':').map(Number);return(h%24)*60+m};
  return{rise:loc(Jt-w/360),set:loc(Jt+w/360)}}
const LONDON=[51.507,-.128,'Europe/London'];
/* colour stops for a 24-hour sky, as [minute, colour] */
function skyStops(st,dark){const r=st.rise,s=st.set,N=dark?'#06202c':'#10283a',D=dark?'#7fb8bd':'#bfe6ea';
  return[[0,N],[r-75,N],[r-30,'#34495f'],[r,'#b8988f'],[r+35,'#d6c6a2'],[r+120,D],[s-120,D],[s-35,'#d6c6a2'],[s,'#b8988f'],[s+35,'#3f4760'],[s+85,N],[1440,N]]}
function cssGradient(st,dark){return'linear-gradient(90deg,'+skyStops(st,dark).map(([m,c])=>`${c} ${(100*Math.max(0,Math.min(1440,m))/1440).toFixed(2)}%`).join(',')+')'}
const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.round(m%60)).padStart(2,'0');
const nowMin=(tz,d)=>{const [h,m]=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:tz}).format(d||new Date()).split(':').map(Number);return(h%24)*60+m};

function upperStops(st){const r=st.rise,s=st.set,N='#0f2436',D='#a9dbe4';
  return[[0,N],[r-85,N],[r-30,'#33507e'],[r+15,'#8d9fc4'],[r+70,'#9fd0dd'],[r+120,D],[s-120,D],[s-70,'#9fcbd8'],[s-10,'#9a93b8'],[s+30,'#3d3d6c'],[s+85,N],[1440,N]]}
/* 24-hour sky strip with the sun's arc, for the light explore page */
function strip(el,o){o=o||{};const st=sunTimes(new Date(),LONDON[0],LONDON[1],LONDON[2]);const q=/[?&]skynow=(\d\d):(\d\d)/.exec(location.search),fixed=q?+q[1]*60+ +q[2]:o.now;let now=fixed!=null?fixed:nowMin(LONDON[2]);
  const H=128,G=26,PAD=0;let W=0;
  function draw(t){W=el.clientWidth||900;const x=m=>PAD+(W-2*PAD)*m/1440,sky=H-G,r=st.rise,s=st.set,top=52;
    const arcY=m=>{const u=(m-r)/(s-r);return sky-(sky-top)*Math.sin(Math.PI*Math.max(0,Math.min(1,u)))};
    const stops=upperStops(st).map(([m,c])=>`<stop offset="${(Math.max(0,Math.min(1440,m))/1440).toFixed(4)}" stop-color="${c}"/>`).join('');
    const R=rng(11);let sts='';for(let i=0;i<70;i++){let m=R()*1440;if(m>r-50&&m<s+60)continue;const y=6+Math.pow(R(),1.5)*(sky-24);sts+=`<circle class="tw${i%2?' b':''}" style="animation-delay:${(R()*3).toFixed(2)}s" cx="${x(m).toFixed(1)}" cy="${y.toFixed(1)}" r="${(.6+R()*1.1).toFixed(2)}" fill="#fff" opacity="${(.4+R()*.6).toFixed(2)}"/>`}
    let arc='';for(let m=r;m<=s;m+=10)arc+=(m===r?'M':'L')+x(m).toFixed(1)+' '+arcY(m).toFixed(1);
    const day=t>=r&&t<=s,sx=x(t),sy=day?arcY(t):sky+30;
    const mt=t<r?t+1440-s:t-s,mspan=1440-(s-r),mu=Math.max(0,Math.min(1,mt/mspan)),my=sky-(sky-top-8)*Math.sin(Math.PI*mu);
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="UK sky today: sunrise ${hm(r)}, sunset ${hm(s)}, British Summer Time">
<defs><linearGradient id="sk" x1="0" x2="1">${stops}</linearGradient>
<linearGradient id="sv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#001a24" stop-opacity=".45"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="sg"><stop offset="0" stop-color="#fbf3df" stop-opacity=".6"/><stop offset=".5" stop-color="#f1dcaa" stop-opacity=".18"/><stop offset="1" stop-color="#f1dcaa" stop-opacity="0"/></radialGradient>
<radialGradient id="sd" cx=".45" cy=".42"><stop offset="0" stop-color="#fbf3df"/><stop offset=".7" stop-color="#f1dcaa"/><stop offset="1" stop-color="#e4c48f"/></radialGradient>
<radialGradient id="hzg"><stop offset="0" stop-color="#ead7b4" stop-opacity=".55"/><stop offset=".45" stop-color="#d4aea0" stop-opacity=".22"/><stop offset="1" stop-color="#c9a9b6" stop-opacity="0"/></radialGradient>
<radialGradient id="hzc"><stop offset="0" stop-color="#f3e6c8" stop-opacity=".5"/><stop offset="1" stop-color="#e0c2a8" stop-opacity="0"/></radialGradient><clipPath id="skc"><rect width="${W}" height="${sky+12}" rx="10"/></clipPath></defs>
<g clip-path="url(#skc)"><rect width="${W}" height="${sky}" fill="url(#sk)"/><rect width="${W}" height="${sky}" fill="url(#sv)"/>${sts}
${[r,s].map((m,k)=>`<ellipse cx="${x(m)}" cy="${sky}" rx="${W*.09}" ry="${sky*.6}" fill="url(#hzg)"/><ellipse cx="${x(m)}" cy="${sky}" rx="${W*.04}" ry="${sky*.3}" fill="url(#hzc)" opacity="${k?.8:.95}"/>`).join('')}
<path d="${arc}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5" stroke-dasharray="2 6" stroke-linecap="round"/>
<g opacity="${day?1:0}"><circle cx="${sx}" cy="${sy}" r="24" fill="url(#sg)"/><circle cx="${sx}" cy="${sy}" r="7.5" fill="url(#sd)"/></g>
<g opacity="${day?0:1}"><circle cx="${sx}" cy="${my}" r="16" fill="#dce8ff" opacity=".07"/><path d="M${sx+3} ${my-9}a9 9 0 1 0 6 15 7.2 7.2 0 1 1-6-15z" fill="#e9e6da" opacity=".85"/></g></g>
<rect y="${sky}" width="${W}" height="${G}" rx="10" fill="#006165"/><rect y="${sky}" width="${W}" height="${G-10}" fill="#006165"/><rect y="${sky}" width="${W}" height="1.5" fill="url(#sk)"/>
<text class="lbl" x="${x(r)}" y="${sky+17}" text-anchor="middle">Sunrise ${hm(r)}</text><text class="lbl" x="${x(s)}" y="${sky+17}" text-anchor="middle">Sunset ${hm(s)}</text>
<text class="lbl k" x="${Math.min(W-30,Math.max(30,sx))}" y="${sky+17}" text-anchor="middle" opacity="${Math.abs(sx-x(r))<70||Math.abs(sx-x(s))<70?0:1}">Now ${hm(t)}</text></svg>`}
  function run(){draw(now);const sv=el.querySelector('svg');if(reduce||o.static||q||!sv)return;sv.style.opacity=0;sv.style.transition='opacity 2.5s ease-in-out';requestAnimationFrame(()=>requestAnimationFrame(()=>{sv.style.opacity=1}))}
  draw(now);let started=false;
  new IntersectionObserver(es=>{if(es[0].isIntersecting&&!started){started=true;run()}},{threshold:.4}).observe(el);
  addEventListener("resize",()=>draw(now));
  if(fixed==null)setInterval(()=>{now=nowMin(LONDON[2]);if(started)draw(now)},60000);
  return{st,draw}}

window.Sky={mount,sunTimes,LONDON,skyStops,cssGradient,strip,hm,nowMin,reduce};
})();
