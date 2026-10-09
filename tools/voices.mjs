// Split a story paragraph into narrator and character segments using <span class="said" data-who="X">.
export function segments(html, base){
  const out=[];const re=/<span class="said"(?: data-who="([^"]+)")?>([\s\S]*?)<\/span>/g;let last=0,m;
  const clean=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  while((m=re.exec(html))){const before=clean(html.slice(last,m.index));if(before)out.push({v:base,t:before});
    const q=clean(m[2]).replace(/^["“]|["”]$/g,'');if(q)out.push({v:m[1]||base,t:q});last=re.lastIndex}
  const rest=clean(html.slice(last));if(rest)out.push({v:base,t:rest});return out;
}
