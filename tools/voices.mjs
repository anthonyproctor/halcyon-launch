// Split a story paragraph into narrator and character segments using <span class="said" data-who="X">.
// v2 props: a doc prop with kind="vlog" is read as a short header in the paragraph's voice, then the transcript in the voice of its `from`
// (Ada); kind="consolelog" is a short header, then the log in Ruth's voice. Every other prop reads exactly as before.
const MON={JAN:'January',FEB:'February',MAR:'March',APR:'April',MAY:'May',JUN:'June',JUL:'July',AUG:'August',SEP:'September',SEPT:'September',OCT:'October',NOV:'November',DEC:'December'};
const KEEP=new Set(['FD','AR','ARA','LOS','UNR','VLV','PM','PMI','PMO','ECO','EVM','CPI','SPI','TCPI','EAC','ETC','AI','CEO','ISS','NASA','SOW','WBS','RACI']); // acronyms Kokoro should spell
const tc=x=>String(x||'').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
const units=x=>String(x||'').replace(/(\d+)\s*min\b/gi,(m,n)=>n+(n==='1'?' minute':' minutes')).replace(/(\d+)\s*s\b/gi,(m,n)=>n+(n==='1'?' second':' seconds'));
// all caps shorthand: Kokoro spells unfamiliar capitalized words letter by letter, so lower everything but the acronyms, and say months in full
const NAMES=new Set(['LISE','MORI','TATE','WENDELL','GARRITY','ARNAUD','ALDERGROVE','WATKINS','PETREL','PUEBLO','RUTHIE','RUTH','OKAFOR','CALDER','HALE','MARS','CAPE']); // console log names stay names, not words (2026-10-23)
const uncaps=x=>x.replace(/\b[A-Z][A-Z']*\b/g,w=>MON[w]||(KEEP.has(w)||(w.length<2&&w!=='A')?w:NAMES.has(w.replace(/'S$/,''))?w[0]+w.slice(1).toLowerCase():w.toLowerCase()));
const NUM=['oh','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty','twenty one','twenty two','twenty three'];
const TENS={2:'twenty',3:'thirty',4:'forty',5:'fifty'};
const mm=m=>m===0?'hundred':m<10?'oh '+NUM[m]:m<20?NUM[m]:TENS[Math.floor(m/10)]+(m%10?' '+NUM[m%10]:'');
const hhmm=t=>{const h=+t.slice(0,2),m=+t.slice(2);return (h<10?'oh ':'')+NUM[h]+' '+mm(m)}; // 0600 oh six hundred, 1730 seventeen thirty
const ENT={nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",'#39':"'",mdash:'—',ndash:'–',hellip:'…',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',deg:'°'};
const unent=s=>s.replace(/&(#?\w+);/g,(m,k)=>k in ENT?ENT[k]:/^#\d+$/.test(k)?String.fromCharCode(+k.slice(1)):m); // HTML entities in cards (&nbsp; in METAR/TAF columns) are spacing, never words to send to the voice
const lines=b=>b.split(/(?:<br\s*\/?>\s*)+/).map(x=>unent(x.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()).filter(Boolean).map(x=>/[.!?:"”']$/.test(x)?x:x+'.').join(' ');
const said=(who,t)=>`<span class="said" data-who="${who}">${t}</span>`;
const qa=t=>!/(^|<br\s*\/?>\s*|>\s*)Q\. /.test(t)?t:t.replace(/(^|<br\s*\/?>\s*|>\s*)Q\. /g,'$1Question. ').replace(/(^|<br\s*\/?>\s*|>\s*)A\. (?=<span|[A-Z"“])/g,'$1Answer. ');
function propSpeech(html){return qa(html).replace(/<prop\s+([^>]*)>([\s\S]*?)<\/prop>/g,(_,attrs,body)=>{const a={};attrs.replace(/(\w+)="([^"]*)"/g,(m,k,v)=>a[k]=v);
  // say="...": what a listener hears instead of the prop's text (a nav log, METAR, code, a table); the screen still shows the prop.
  // by="Who" voices it as that speaker. Write quotes inside it as &quot; (2026-10-22)
  if(a.say!==undefined){const t=unent(a.say).trim();return a.by?said(a.by,t):t}
  if(a.type==='doc'&&a.kind==='vlog'){const tp=(a.title||'').split(/\s*·\s*/),who=a.name||(tp[0]?tc(tp[0]):a.from||'someone'),where=a.station||(tp[1]?tc(tp[1]):'');
    const head=[`A log from ${who}${where?`, ${where}`:''}.`,a.sol?`Sol ${a.sol}.`:'',a.delay?`One way, ${units(a.delay)}.`:'',a.margin?`Margin, ${a.margin}.`:''].filter(Boolean).join(' ');
    return `${head} ${said(a.from||'narrator',lines(body))}`}
  if(a.type==='doc'&&a.kind==='consolelog'){const T=a.title||'',mi=T.match(/L MINUS (\d+) DAYS/),pl=T.match(/L PLUS (\d+) DAYS/);
    // the heading says only when it is, in plain words (2026-10-22): the date and flow name were four facts in one breath
    const when=/LAUNCH DAY|L MINUS 0\b/.test(T)?'launch day':mi?`${mi[1]} days before launch`:pl?`${pl[1]} days after launch`:/PAGE 15\b/.test(T)?'the last page':null;
    const old=`Ruth's console log. ${T.split(/\s*·\s*/).map(x=>tc(x).replace(/\b[A-Z][a-z]{2,3}\b/g,w=>MON[w.toUpperCase()]||w)).join('. ')}.`.replace(/\.\.$/,'.');
    const head=!when?old:a.bare?when[0].toUpperCase()+when.slice(1)+'.':`Ruth's console log, ${when}.`;
    return `${head} ${said('Ruth',uncaps(lines(body.replace(/(^|<br\s*\/?>\s*)(\d{4})\b/g,(m,p,t)=>p+hhmm(t)+',').replace(/(?<![\d:.,$])\b(0\d[0-5]\d)\b(?![\d,])/g,(m,t)=>hhmm(t)))))}`}
  // a line that already ends in punctuation gets no extra period ("flan.. TAF" read as an odd pause, 2026-10-22; "Team,." 2026-10-23)
  const b0=body.replace(/_{3,}/g,'blank').replace(/([.!?:;,"”'])?((?:<\/[^>]+>)*)\s*<br\s*\/?>\s*/g,(m,p,t)=>p?p+t+' ':t+'. ');
  // a message signed with the sender's initial ("G.", "K.") says the sender's first name: a lone letter sounds like a word (2026-10-23)
  const nm=String(a.from||'').replace(/^(Dr|Ms|Mr|Mrs)\.?\s+/,'').split(/[\s,]+/).filter(w=>/^[A-Z][a-z]/.test(w));
  const b=nm.length&&/^(email|text|chat)$/.test(a.type)&&/(<br\s*\/?>\s*[A-Z]\.?|[.!?]\s+[A-Z]\.)\s*$/.test(body)?b0.replace(/(^|[.!?]\s+|\s)([A-Z])\.?\s*$/,(m,p,l)=>{const w=nm.find(x=>x[0]===l);return w?p+w+'.':m}):b0;
  if(a.type==='email')return `An email from ${a.from||'someone'}${a.subject?`. Subject: ${a.subject}`:''}. ${b}`;
  if(a.type==='chat')return `A message from ${a.from||'someone'}. ${b}`;
  if(a.type==='text')return `A text from ${a.from||'someone'}. ${b}`;
  if(a.type==='doc')return `${a.title?a.title+'. ':''}${b}`;
  if(a.type==='chart')return `${a.title?a.title+'. ':''}${b}`;
  return b})}
const SIGN_STOP=new Set('The Then That This There They Their She Her His Over After And But When Where What Sent Subject Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December Mrs Miss'.split(' '));
export function segments(html, base){
  html=propSpeech(html);
  // a message quoted in bold in the narration and signed with an initial ("...Let's talk Monday. G.</b>") says the name the
  // narration gave that sender just before it ("Garrett's email came in"): a lone letter sounds like a word (2026-10-25)
  html=html.replace(/([.!?]\s+)([A-Z])\.(\s*<\/b>)/g,(m,p,l,e,off)=>{const pre=html.slice(0,off),o=pre.lastIndexOf('<b>');if(o<0)return m;
    const ws=[...pre.slice(0,o).replace(/<[^>]+>/g,' ').matchAll(/\b([A-Z][a-z]{2,})(?:['’]s)?\b/g)].map(x=>x[1]).filter(w=>w[0]===l&&!SIGN_STOP.has(w));
    return ws.length?p+ws[ws.length-1]+'.'+e:m});
  // optional data-tone="Angry, clipped, controlled." on a said span: a per-line delivery cue (never spoken or shown; the engine
  // ignores the attribute). The segment carries it as `tone`; a span without one gives exactly the segment it always did.
  const out=[];const re=/<span class="said"(?: data-who="([^"]+)")?(?: data-tone="([^"]+)")?>([\s\S]*?)<\/span>/g;let last=0,m;
  const clean=s=>unent(s.replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
  while((m=re.exec(html))){const before=clean(html.slice(last,m.index));if(before)out.push({v:base,t:before});
    const q=clean(m[3]).replace(/^["“]|["”]$/g,'');if(q)out.push(m[2]?{v:m[1]||base,t:q,tone:unent(m[2]).trim()}:{v:m[1]||base,t:q});last=re.lastIndex}
  const rest=clean(html.slice(last));if(rest)out.push({v:base,t:rest});return out;
}
