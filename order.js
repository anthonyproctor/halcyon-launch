// Balanced, unpredictable answer placement. Shared by the app (browser) and the audio builder (node).
(function(G){
  function hash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h}
  function rng(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
  function shuffle(arr,r){for(let i=arr.length-1;i>0;i--){const k=Math.floor(r()*(i+1));[arr[i],arr[k]]=[arr[k],arr[i]]}return arr}
  // targets: for n items, each display slot 0..3 used n/4 times (+-1), in shuffled order
  function targets(key,n,mod){mod=mod||4;const t=[],off=hash(key+"#")%mod;for(let i=0;i<n;i++)t.push((i+off)%mod);return shuffle(t,rng(hash(key)))}
  // display order for one item: correct option lands on `target`, others shuffled around it
  function arrange(itemKey,nOpts,correct,target){const others=[...Array(nOpts).keys()].filter(i=>i!==correct);shuffle(others,rng(hash(itemKey)));const out=new Array(nOpts);out[target]=correct;let k=0;for(let p=0;p<nOpts;p++)if(p!==target)out[p]=others[k++];return out}
  const ORD={};
  // groups: [{key, items:[{id, n, correct}]}]
  function build(groups){groups.forEach(g=>{if(!g.items.length)return;const mod=Math.max(2,Math.min(4,...g.items.map(it=>it.n)));const T=targets(g.key,g.items.length,mod);g.items.forEach((it,i)=>{ORD[it.id]=arrange(it.id,it.n,it.correct,T[i]%it.n)})})}
  G.HalcyonOrder={build,get:(id,n)=>ORD[id]||[...Array(n).keys()],_ORD:ORD};
})(typeof window!=="undefined"?window:globalThis);
