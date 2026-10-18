/* Wizard Computer site behaviour. Pages set window.SITE = {base:'' or '../', lang:'en'|'ar', t:{...strings}} before this file. */
(function(){
  var S=window.SITE||{base:'',lang:'en',t:{}}, T=S.t||{};
  var WA='971549982888';
  document.documentElement.classList.add('js');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v){return v<0?0:v>1?1:v}
  function ramp(p,a,b){return clamp((p-a)/(b-a))}
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function wa(text){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(text)}

  /* ---------- hero: 120-frame scroll video (unchanged from the live site, captions now reach full strength sooner) ---------- */
  var SEQ={count:120,path:function(i){return S.base+(innerWidth<=900?'frames-m':'frames')+'/f_'+String(i).padStart(3,'0')+'.webp'}};
  var story=document.getElementById('story'), nav=document.getElementById('nav');
  if(story){
    var s1=document.querySelector('.s1'), s2=document.querySelector('.s2'), s3=document.querySelector('.s3');
    var c1=document.querySelector('.cap-1'), c2=document.querySelector('.cap-2'), c3=document.querySelector('.cap-3');
    var bars=document.querySelectorAll('.progress b'), hint=document.querySelector('.scroll-hint');
    var show=function(el,o){el.style.opacity=o.toFixed(3);var on=o>.5;el.setAttribute('aria-hidden',on?'false':'true');el.firstElementChild.firstElementChild.style.pointerEvents=on?'auto':'none'};
    var cv=document.getElementById('seq'), ctx=cv.getContext('2d'), imgs=[], last=-1, useSeq=SEQ.count>0;
    var draw=function(i,force){
      if(!force&&i===last)return;
      var im=imgs[i];
      if(!im||!im.complete||!im.naturalWidth){for(var j=i;j>=0;j--){if(imgs[j].complete&&imgs[j].naturalWidth){im=imgs[j];break}}if(!im||!im.naturalWidth)return}
      last=i;var W=cv.width,H=cv.height,iw=im.naturalWidth,ih=im.naturalHeight;
      var narrow=innerWidth<=640, sc=narrow?Math.max(W*1.12/iw,H/ih):Math.max(W/iw,H/ih);
      var w=iw*sc,h=ih*sc;ctx.fillStyle='#050505';ctx.fillRect(0,0,W,H);ctx.drawImage(im,(W-w)/2,(H-h)*.55,w,h);
    };
    var size=function(){var d=Math.min(devicePixelRatio||1,2);cv.width=Math.round(cv.clientWidth*d);cv.height=Math.round(cv.clientHeight*d);last=-1};
    if(useSeq){
      document.querySelector('.shots').hidden=true; cv.hidden=false;
      for(var i=1;i<=SEQ.count;i++){var im=new Image();im.decoding='async';im.src=SEQ.path(i);
        (function(k){im.onload=function(){if(k===0||last===-1)draw(Math.max(last,0),true)}})(i-1);imgs.push(im)}
      size();addEventListener('resize',function(){size();req()});
    }
    var ticking=false;
    var frame=function(){
      ticking=false;
      var r=story.getBoundingClientRect(), total=story.offsetHeight-innerHeight, p=clamp(-r.top/total);
      if(useSeq){draw(Math.min(SEQ.count-1,Math.round(ramp(p,0,.92)*(SEQ.count-1))))}
      var a=ease(ramp(p,.22,.40)), b=ease(ramp(p,.56,.72));
      s1.style.opacity=(1-a).toFixed(3); s2.style.opacity=(a*(1-b)).toFixed(3); s3.style.opacity=b.toFixed(3);
      if(!reduce){s1.style.transform='scale('+(1+p*.18)+')';s2.style.transform='scale('+(1.16+p*.12)+') translateY(-1%)';s3.style.transform='scale('+(1.02+(p-.56)*.10)+')'}
      show(c1,1-ramp(p,.12,.22));
      show(c2,ramp(p,.26,.32)*(1-ramp(p,.58,.64)));
      show(c3,ramp(p,.68,.74));
      bars[0].style.transform='scaleY('+ramp(p,0,.33)+')';bars[1].style.transform='scaleY('+ramp(p,.33,.66)+')';bars[2].style.transform='scaleY('+ramp(p,.66,1)+')';
      if(hint) hint.style.opacity=(1-ramp(p,0,.06)).toFixed(2);
      nav.classList.toggle('solid',r.bottom<innerHeight);
    };
    var req=function(){if(!ticking){ticking=true;requestAnimationFrame(frame)}};
    addEventListener('scroll',req,{passive:true});addEventListener('resize',req);frame();
  }

  /* ---------- reveal on scroll ---------- */
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){io.observe(el)});
  } else rv.forEach(function(el){el.classList.add('in')});

  /* ---------- builds rail arrows ---------- */
  var rail=document.getElementById('rail');
  document.querySelectorAll('[data-rail]').forEach(function(b){
    b.addEventListener('click',function(){
      var dir=+b.getAttribute('data-rail')*(document.documentElement.dir==='rtl'?-1:1);
      rail.scrollBy({left:dir*(rail.querySelector('.build').offsetWidth+18),behavior:reduce?'auto':'smooth'});
    });
  });

  /* ---------- PC planner ---------- */
  var pl=document.getElementById('planner');
  if(pl){
    var use='gaming', range=document.getElementById('bud'), out=document.getElementById('budOut'),
        tier=document.getElementById('tier'), exp=document.getElementById('expect'), go=document.getElementById('planGo'), notes=document.getElementById('planNotes');
    var fmt=function(n){return n.toLocaleString('en-US')};
    var pick=function(){
      var v=+range.value, list=T.tiers[use], t=list[0];
      for(var i=0;i<list.length;i++){if(v>=list[i].min)t=list[i]}
      out.textContent=fmt(v)+(v>=+range.max?'+':'');
      tier.textContent=t.name; exp.innerHTML='';
      t.get.forEach(function(x){var li=document.createElement('li');li.textContent=x;exp.appendChild(li)});
      var msg=T.planMsg.replace('{use}',T.useNames[use]).replace('{budget}',fmt(v)+(v>=+range.max?'+':''));
      if(notes.value.trim()) msg+='\n'+T.planNotes+' '+notes.value.trim();
      go.href=wa(msg);
    };
    pl.querySelectorAll('.seg button').forEach(function(b){
      b.addEventListener('click',function(){
        pl.querySelectorAll('.seg button').forEach(function(x){x.setAttribute('aria-pressed','false')});
        b.setAttribute('aria-pressed','true');use=b.getAttribute('data-use');pick();
      });
    });
    range.addEventListener('input',pick);notes.addEventListener('input',pick);pick();
  }

  /* ---------- repair status ----------
     STATUS_URL empty = send the ticket to WhatsApp (the shop's auto-reply answers ticket status).
     Later: a public read-only endpoint that takes {ticket, last4} and returns {status, label}. */
  var STATUS_URL='';
  var sf=document.getElementById('statusForm');
  if(sf){
    var msgEl=document.getElementById('statusMsg'), track=document.querySelectorAll('.track li');
    sf.addEventListener('submit',function(e){
      e.preventDefault();
      var tk=sf.ticket.value.trim().toUpperCase().replace(/\s+/g,''), l4=sf.last4.value.trim();
      if(/^\d{6,9}$/.test(tk)) tk='QT-'+tk;
      if(!/^(QT|WT)-?[A-Z0-9-]{4,}$/.test(tk)){msgEl.textContent=T.badTicket;msgEl.className='msg err';sf.ticket.focus();return}
      if(STATUS_URL&&!/^\d{4}$/.test(l4)){msgEl.textContent=T.badLast4;msgEl.className='msg err';sf.last4.focus();return}
      if(!STATUS_URL){
        msgEl.textContent=T.statusWa;msgEl.className='msg';
        window.open(wa(T.statusMsg.replace('{t}',tk)),'_blank','noopener');
        return;
      }
      msgEl.textContent=T.checking;msgEl.className='msg';
      fetch(STATUS_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticket:tk,last4:l4})})
        .then(function(r){return r.json()}).then(function(d){
          if(!d||!d.status){msgEl.textContent=T.notFound;msgEl.className='msg err';return}
          var idx=['received','diagnosing','repairing','ready'].indexOf(d.status);
          track.forEach(function(li,i){li.classList.toggle('on',i<=idx)});
          msgEl.textContent=d.label||'';msgEl.className='msg';
        }).catch(function(){msgEl.textContent=T.notFound;msgEl.className='msg err'});
    });
  }

  /* ---------- steps line fills with scroll ---------- */
  var steps=document.querySelector('.steps');
  if(steps){
    var lis=steps.querySelectorAll('li'), tick2=false;
    var upd=function(){
      tick2=false;
      var r=steps.getBoundingClientRect(), vh=innerHeight;
      var p=clamp((vh*.85-r.top)/(r.height+vh*.35));
      steps.style.setProperty('--fill',p.toFixed(3));
      lis.forEach(function(li,i){li.classList.toggle('on',p>=i/lis.length+.02||p>=.98)});
    };
    addEventListener('scroll',function(){if(!tick2){tick2=true;requestAnimationFrame(upd)}},{passive:true});upd();
  }

  /* ---------- open now (Gulf time) + year ---------- */
  try{
    var now=new Date(), h=(now.getUTCHours()+4)%24, el=document.getElementById('openNow');
    if(el){if(h>=10&&h<22){el.textContent=T.openNow;el.classList.add('yes')}else{el.textContent=T.closedNow}}
    var yr=document.getElementById('yr'); if(yr) yr.textContent=String(now.getFullYear());
  }catch(e){}
})();
