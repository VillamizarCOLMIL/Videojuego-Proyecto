(function(){

  const state = { score:0, lives:3, level:1 };
  const $ = (s, ctx=document)=>ctx.querySelector(s);
  const $$ = (s, ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const setHUD = ()=>{
    $('#score').textContent = state.score;
    $('#lives').textContent = state.lives;
    $('#level').textContent = state.level;
  };
  function show(id){
    ['menu','quiz','memory','hangman','fillin'].forEach(x => $('#'+x).classList.add('hidden'));
    $('#'+id).classList.remove('hidden');
  }
  function back(){ show('menu'); }


  $$('[data-start]').forEach(b => b.addEventListener('click', ()=>{
    const name = b.getAttribute('data-start');
    show(name);
    if(name==='quiz') quiz.start();
    if(name==='memory') memory.start();
    if(name==='hangman') hangman.start();
    if(name==='fillin') fillin.start();
  }));
  $$('[data-back]').forEach(b => b.addEventListener('click', back));
  $('#resetAll').addEventListener('click', ()=>{ state.score=0; state.lives=3; state.level=1; setHUD(); back(); });


  const quiz = (function(){
    const data = [
      { q:'apple', a:['manzana','pera','uva'], c:0 },
      { q:'dog', a:['gato','perro','pájaro'], c:1 },
      { q:'book', a:['libro','pluma','papel'], c:0 }
    ];
    let i=0; 
    const box = $('#quizBox');
    const nextBtn = $('#quizNext');
    function render(){
      const item = data[i];
      if(!item){ state.score+=5; state.level++; setHUD(); back(); return; }
      box.innerHTML = '';
      const q = document.createElement('div');
      q.className='q';
      q.innerHTML = '<strong>Traduce:</strong> '+ item.q;
      const opts = document.createElement('div');
      item.a.forEach((t, idx)=>{
        const btn=document.createElement('button');
        btn.className='opt';
        btn.textContent=t;
        btn.addEventListener('click', ()=>choose(idx, item.c, btn));
        opts.appendChild(btn);
      });
      box.appendChild(q);
      box.appendChild(opts);
      nextBtn.disabled=true;
    }
    function choose(idx, correct, btn){
      $$('.opt', $('#quiz')).forEach(b=>b.disabled=true);
      if(idx===correct){ btn.classList.add('correct'); state.score+=2; }
      else { btn.classList.add('wrong'); state.lives-=1; if(state.lives<=0) return gameOver(); }
      setHUD();
      nextBtn.disabled=false;
    }
    nextBtn.addEventListener('click', ()=>{ i++; render(); });
    function start(){ i=0; render(); }
    return { start };
  })();


  const memory = (function(){
    const board = $('#memoryBoard');
    const basePairs=[ ['apple','🍎'], ['dog','🐶'], ['book','📘'] ];
    let deck=[], picked=[], matched=0;
    function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
    function build(){
      deck = [];
      basePairs.forEach((p,idx)=>{
        deck.push({id:'w'+idx, t:p[0], pair:idx, type:'w', matched:false});
        deck.push({id:'e'+idx, t:p[1], pair:idx, type:'e', matched:false});
      });
      shuffle(deck);
    }
    function render(){
      board.innerHTML='';
      deck.forEach(card=>{
        const d=document.createElement('div');
        d.className='tile';
        d.textContent='?';
        d.addEventListener('click', ()=>flip(card,d));
        board.appendChild(d);
      });
    }
    let lock=false;
    function flip(card, el){
      if(lock || card.matched) return;
      if(picked.find(p=>p.card.id===card.id)) return;
      el.classList.add('revealed'); el.textContent=card.t;
      picked.push({card, el});
      if(picked.length===2){
        lock=true;
        const [a,b]=picked;
        const ok = a.card.pair===b.card.pair && a.card.type!==b.card.type;
        setTimeout(()=>{
          if(ok){
            a.el.classList.add('matched'); b.el.classList.add('matched');
            a.card.matched=b.card.matched=true; matched++;
            state.score+=1;
            if(matched===basePairs.length){ state.score+=4; state.level++; setHUD(); back(); }
          }else{
            a.el.classList.remove('revealed'); a.el.textContent='?';
            b.el.classList.remove('revealed'); b.el.textContent='?';
            state.lives-=1; if(state.lives<=0){ setHUD(); return gameOver(); }
          }
          picked=[]; lock=false; setHUD();
        }, 600);
      }
    }
    function start(){ matched=0; picked=[]; build(); render(); }
    $('#memoryRestart').addEventListener('click', start);
    return { start };
  })();

  const hangman = (function(){
    const words = ['apple','orange','teacher','window'];
    let secret='', shown=[], tries=6;
    const wordEl=$('#hangmanWord'), triesEl=$('#tries');
    function draw(){
      wordEl.textContent = shown.join(' ');
      triesEl.textContent = String(tries);
    }
    function start(){
      const i=Math.floor(Math.random()*words.length);
      secret=words[i];
      shown=secret.split('').map(()=> '_');
      tries=6; draw();
    }
    function guess(){
      const inp = $('#guessInput');
      const c = (inp.value || '').toLowerCase();
      inp.value='';
      if(!c || c.length!==1) return;
      let ok=false;
      secret.split('').forEach((ch, i)=>{ if(ch===c){ shown[i]=c; ok=true; } });
      if(!ok){ tries--; if(tries<=0){ state.lives-=1; if(state.lives<=0){ setHUD(); return gameOver(); } start(); } }
      else {
        if(shown.join('')===secret){ state.score+=5; state.level++; back(); }
      }
      setHUD(); draw();
    }
    $('#guessBtn').addEventListener('click', guess);
    $('#guessInput').addEventListener('keyup', (e)=>{ if(e.key==='Enter') guess(); });
    $('#hangmanRestart').addEventListener('click', start);
    return { start };
  })();


  const fillin = (function(){
    const rounds = [
      { sentence: "I ____ soccer every weekend.", answer:"play", options:["play","plays","played"] },
      { sentence: "She ____ to school by bus.", answer:"goes", options:["go","goes","going"] }
    ];
    const box = $('#fillinBox');
    let idx=0;
    function render(){
      const r = rounds[idx];
      box.innerHTML='';
      const s = document.createElement('div');
      s.className='sentence';

      s.innerHTML = r.sentence.replace('____','<span class="blank">____</span>');
      box.appendChild(s);
      const sel = document.createElement('select');
      sel.className='select';
      r.options.forEach(op=>{
        const o=document.createElement('option');
        o.value=op; o.textContent=op; sel.appendChild(o);
      });
      box.appendChild(sel);
      $('#fillinNext').disabled=true;
    }
    function check(){
      const r = rounds[idx];
      const sel = $('.select', box);
      if(sel.value === r.answer){ state.score+=3; $('#fillinNext').disabled=false; }
      else { state.lives-=1; if(state.lives<=0) return gameOver(); }
      setHUD();
    }
    function next(){
      idx++;
      if(idx>=rounds.length){ state.level++; state.score+=2; setHUD(); back(); }
      else { render(); }
    }
    $('#fillinCheck').addEventListener('click', check);
    $('#fillinNext').addEventListener('click', next);
    function start(){ idx=0; render(); }
    return { start };
  })();

  function gameOver(){
    alert('Game Over');
    state.score = 0; state.lives = 3; state.level = 1;
    setHUD(); back();
  }


  setHUD();
})();
