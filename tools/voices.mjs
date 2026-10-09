// Split a story paragraph into narrator and character segments using <span class="said" data-who="X">.
function propSpeech(html){return html.replace(/<prop\s+([^>]*)>([\s\S]*?)<\/prop>/g,(_,attrs,body)=>{const a={};attrs.replace(/(\w+)="([^"]*)"/g,(m,k,v)=>a[k]=v);const b=body.replace(/<br\s*\/?>/g,'. ');
  if(a.type==='email')return `An email from ${a.from||'someone'}${a.subject?`. Subject: ${a.subject}`:''}. ${b}`;
  if(a.type==='chat')return `A message from ${a.from||'someone'}. ${b}`;
  if(a.type==='text')return `A text from ${a.from||'someone'}. ${b}`;
  if(a.type==='doc')return `${a.title?a.title+'. ':''}${b}`;
  if(a.type==='chart')return `${a.title?a.title+'. ':''}${b}`;
  return b})}
export function segments(html, base){
  html=propSpeech(html);
  const out=[];const re=/<span class="said"(?: data-who="([^"]+)")?>([\s\S]*?)<\/span>/g;let last=0,m;
  const clean=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  while((m=re.exec(html))){const before=clean(html.slice(last,m.index));if(before)out.push({v:base,t:before});
    const q=clean(m[2]).replace(/^["“]|["”]$/g,'');if(q)out.push({v:m[1]||base,t:q});last=re.lastIndex}
  const rest=clean(html.slice(last));if(rest)out.push({v:base,t:rest});return out;
}
