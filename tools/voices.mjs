// Split a story paragraph into narrator and character segments using <span class="said" data-who="X">.
// v2 props: a doc prop with kind="vlog" is read as a short header in the paragraph's voice, then the transcript in the voice of its `from`
// (Ada); kind="consolelog" is a short header, then the log in Ruth's voice. Every other prop reads exactly as before.
const MON={JAN:'January',FEB:'February',MAR:'March',APR:'April',MAY:'May',JUN:'June',JUL:'July',AUG:'August',SEP:'September',SEPT:'September',OCT:'October',NOV:'November',DEC:'December'};
const KEEP=new Set(['FD','AR','ARA','LOS','UNR','VLV','PM','PMI','PMO','ECO','EVM','CPI','SPI','TCPI','EAC','ETC','AI','CEO','ISS','NASA','SOW','WBS','RACI']); // acronyms Kokoro should spell
const tc=x=>String(x||'').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
const units=x=>String(x||'').replace(/(\d+)\s*min\b/gi,'$1 minutes').replace(/(\d+)\s*s\b/gi,'$1 seconds');
// all caps shorthand: Kokoro spells unfamiliar capitalized words letter by letter, so lower everything but the acronyms, and say months in full
const uncaps=x=>x.replace(/\b[A-Z][A-Z']*\b/g,w=>MON[w]||(KEEP.has(w)||(w.length<2&&w!=='A')?w:w.toLowerCase()));
const NUM=['oh','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty','twenty one','twenty two','twenty three'];
const TENS={2:'twenty',3:'thirty',4:'forty',5:'fifty'};
const mm=m=>m===0?'hundred':m<10?'oh '+NUM[m]:m<20?NUM[m]:TENS[Math.floor(m/10)]+(m%10?' '+NUM[m%10]:'');
const hhmm=t=>{const h=+t.slice(0,2),m=+t.slice(2);return (h<10?'oh ':'')+NUM[h]+' '+mm(m)}; // 0600 oh six hundred, 1730 seventeen thirty
const ENT={nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",'#39':"'",mdash:'—',ndash:'–',hellip:'…',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',deg:'°'};
const unent=s=>s.replace(/&(#?\w+);/g,(m,k)=>k in ENT?ENT[k]:/^#\d+$/.test(k)?String.fromCharCode(+k.slice(1)):m); // HTML entities in cards (&nbsp; in METAR/TAF columns) are spacing, never words to send to the voice
const lines=b=>b.split(/(?:<br\s*\/?>\s*)+/).map(x=>unent(x.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()).filter(Boolean).map(x=>/[.!?:"”']$/.test(x)?x:x+'.').join(' ');
const said=(who,t)=>`<span class="said" data-who="${who}">${t}</span>`;
function propSpeech(html){return html.replace(/<prop\s+([^>]*)>([\s\S]*?)<\/prop>/g,(_,attrs,body)=>{const a={};attrs.replace(/(\w+)="([^"]*)"/g,(m,k,v)=>a[k]=v);
  if(a.type==='doc'&&a.kind==='vlog'){const tp=(a.title||'').split(/\s*·\s*/),who=a.name||(tp[0]?tc(tp[0]):a.from||'someone'),where=a.station||(tp[1]?tc(tp[1]):'');
    const head=[`A log from ${who}${where?`, ${where}`:''}.`,a.sol?`Sol ${a.sol}.`:'',a.delay?`One way, ${units(a.delay)}.`:'',a.margin?`Margin, ${a.margin}.`:''].filter(Boolean).join(' ');
    return `${head} ${said(a.from||'narrator',lines(body))}`}
  if(a.type==='doc'&&a.kind==='consolelog'){const head=`Ruth's console log. ${(a.title||'').split(/\s*·\s*/).map(x=>tc(x).replace(/\b[A-Z][a-z]{2,3}\b/g,w=>MON[w.toUpperCase()]||w)).join('. ')}.`.replace(/\.\.$/,'.');
    return `${head} ${said('Ruth',uncaps(lines(body.replace(/(^|<br\s*\/?>\s*)(\d{4})\b/g,(m,p,t)=>p+hhmm(t)+','))))}`}
  const b=body.replace(/<br\s*\/?>/g,'. ');
  if(a.type==='email')return `An email from ${a.from||'someone'}${a.subject?`. Subject: ${a.subject}`:''}. ${b}`;
  if(a.type==='chat')return `A message from ${a.from||'someone'}. ${b}`;
  if(a.type==='text')return `A text from ${a.from||'someone'}. ${b}`;
  if(a.type==='doc')return `${a.title?a.title+'. ':''}${b}`;
  if(a.type==='chart')return `${a.title?a.title+'. ':''}${b}`;
  return b})}
export function segments(html, base){
  html=propSpeech(html);
  const out=[];const re=/<span class="said"(?: data-who="([^"]+)")?>([\s\S]*?)<\/span>/g;let last=0,m;
  const clean=s=>unent(s.replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
  while((m=re.exec(html))){const before=clean(html.slice(last,m.index));if(before)out.push({v:base,t:before});
    const q=clean(m[2]).replace(/^["“]|["”]$/g,'');if(q)out.push({v:m[1]||base,t:q});last=re.lastIndex}
  const rest=clean(html.slice(last));if(rest)out.push({v:base,t:rest});return out;
}
