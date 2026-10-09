"""Draw flat SVG banner illustrations for each Full Course chapter (stand-ins until painted art)."""
BG="#16303f";DK="#0f2430";MID="#1d4052";TEAL="#2d6b7a";LT="#8dbcd4";AMB="#e0b25c";CRM="#f3f1ec";RED="#c0473b";GRN="#5fa37a"
W,H=1200,480
def frame(inner,sky=None):
    sky=sky or f'<rect width="{W}" height="{H}" fill="{BG}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'+STYLE+f'{sky}{inner}</svg>'
STYLE='<style>@media (prefers-reduced-motion:no-preference){\n.steam{animation:steam 3s ease-in-out infinite}@keyframes steam{0%{opacity:0;transform:translateY(8px)}50%{opacity:.8}100%{opacity:0;transform:translateY(-14px)}}\n.glow{animation:glow 2.4s ease-in-out infinite}@keyframes glow{50%{opacity:.6}}\n.blink{animation:blink 1.6s steps(2) infinite}@keyframes blink{50%{opacity:.2}}\n.pulse{animation:pulse 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes pulse{50%{transform:scale(1.12)}}\n.grow{animation:grow 3.5s ease-out infinite;transform-box:fill-box;transform-origin:left}@keyframes grow{0%{transform:scaleX(0)}40%,100%{transform:scaleX(1)}}\n.draw{stroke-dasharray:1400;animation:draw 5s ease-out infinite}@keyframes draw{0%{stroke-dashoffset:1400}60%,100%{stroke-dashoffset:0}}\n.flash{animation:flash 3s infinite}@keyframes flash{0%,8%,16%,100%{opacity:1}4%,12%{opacity:.1}60%{opacity:.9}}\n.tick{animation:tick 8s steps(8) infinite;transform-box:view-box;transform-origin:var(--o)}@keyframes tick{to{transform:rotate(360deg)}}\n.tilt{animation:tilt 4s ease-in-out infinite;transform-box:view-box;transform-origin:880px 100px}@keyframes tilt{50%{transform:rotate(-4deg)}}\n.flick{animation:flick 4s infinite}@keyframes flick{0%,30%{opacity:.25}35%,100%{opacity:1}}\n.twinkle{animation:twinkle 2.5s ease-in-out infinite}@keyframes twinkle{50%{opacity:.2}}\n.check{animation:check 6s infinite;opacity:0}@keyframes check{0%{opacity:0}15%,90%{opacity:1}100%{opacity:0}}\n.sway{animation:sway 5s ease-in-out infinite;transform-box:view-box;transform-origin:600px 40px}@keyframes sway{50%{transform:rotate(2deg)}}\n.lift{animation:lift 6s ease-in infinite}@keyframes lift{0%,30%{transform:translateY(0)}100%{transform:translateY(-320px)}}\n.flame{animation:flame .3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:top}@keyframes flame{to{transform:scaleY(1.3)}}\n.move1{animation:m 4s linear infinite}@keyframes m{0%{opacity:0}20%,80%{opacity:1}100%{opacity:0}}\n}</style>'
def grad(id,a,b): return f'<defs><linearGradient id="{id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs>'
A={}
# 1 The Promotion: kitchen at dawn, phone glowing 6:12
A[1]=frame(f'''<rect x="120" y="60" width="300" height="220" rx="8" fill="{MID}"/><rect x="132" y="72" width="276" height="196" fill="url(#dawn)"/><circle cx="270" cy="250" r="60" fill="{AMB}" opacity=".85"/>
<path d="M270 72v196M132 170h276" stroke="{MID}" stroke-width="8"/>
<rect x="0" y="330" width="{W}" height="150" fill="{DK}"/><rect x="0" y="318" width="{W}" height="16" fill="{TEAL}"/>
<rect x="640" y="210" width="96" height="170" rx="16" fill="#111" transform="rotate(-8 688 295)"/><rect class="glow" x="650" y="226" width="76" height="132" rx="6" fill="{LT}" transform="rotate(-8 688 295)"/>
<text x="664" y="300" font-family="Arial" font-weight="700" font-size="30" fill="{DK}" transform="rotate(-8 688 295)">6:12</text>
<path d="M880 270h70v60q0 22-22 22h-26q-22 0-22-22z" fill="{CRM}"/><path d="M950 285q26 0 26 20t-26 18" fill="none" stroke="{CRM}" stroke-width="8"/><path class="steam" d="M898 250q8-14 0-26M922 250q8-14 0-26" stroke="{LT}" stroke-width="4" fill="none" opacity=".6"/>''',grad("dawn","#f0c27a","#2d6b7a")+f'<rect width="{W}" height="{H}" fill="{BG}"/>')
# 2 The Plan: whiteboard WBS + gantt
A[2]=frame(f'''<rect x="140" y="50" width="920" height="330" rx="10" fill="{CRM}"/><rect x="140" y="380" width="920" height="16" fill="#9aa"/>
<g fill="none" stroke="{TEAL}" stroke-width="4"><rect x="520" y="80" width="160" height="50" rx="6"/><path d="M600 130v30M300 160h600M300 160v24M500 160v24M700 160v24M900 160v24"/>
<rect x="240" y="184" width="120" height="40" rx="6"/><rect x="440" y="184" width="120" height="40" rx="6"/><rect x="640" y="184" width="120" height="40" rx="6"/><rect x="840" y="184" width="120" height="40" rx="6"/></g>
<g class="grow"><rect x="240" y="260" width="200" height="18" rx="9" fill="{AMB}"/><rect x="400" y="292" width="260" height="18" rx="9" fill="{TEAL}"/><rect x="620" y="324" width="180" height="18" rx="9" fill="{RED}"/><rect x="760" y="292" width="200" height="18" rx="9" fill="{LT}"/></g>
<path d="M240 256v100M960 256v100" stroke="#bbb" stroke-dasharray="4 6"/>''')
# 3 The Team: video call grid, two clocks
tiles="".join(f'<rect x="{150+i%3*210}" y="{70+i//3*150}" width="190" height="130" rx="10" fill="{MID}"/><circle cx="{245+i%3*210}" cy="{125+i//3*150}" r="26" fill="{c}"/><path d="M{205+i%3*210} {190+i//3*150}q40-36 80 0" fill="{c}"/>' for i,c in enumerate(["#8a5a3c","#efc9a6","#c08a5f","#f3d3bb","#5b3a29","#d0a27a"]))
clock=lambda x,lab,h:f'<circle cx="{x}" cy="200" r="70" fill="{CRM}"/><path d="M{x} 200l{h}" stroke="{DK}" stroke-width="7" stroke-linecap="round"/><path class="tick" style="--o:{x}px 200px" d="M{x} 200l0-48" stroke="{DK}" stroke-width="5" stroke-linecap="round"/><text x="{x}" y="310" text-anchor="middle" font-family="Arial" font-weight="700" font-size="24" fill="{LT}">{lab}</text>'
A[3]=frame(tiles+clock(880,"DENVER","30 10")+clock(1060,"KRAKÓW","-36 -14"))
# 4 Burn-In: racks with red lights
racks="".join(f'<rect x="{130+i*190}" y="70" width="150" height="340" rx="6" fill="{DK}"/>'+"".join(f'<rect x="{142+i*190}" y="{86+j*40}" width="126" height="30" rx="3" fill="{MID}"/><circle cx="{252+i*190}" cy="{101+j*40}" r="5" fill="{RED if (i*3+j)%2==0 else GRN}" class="{["","blink"][(i*3+j)%2==0]}" style="animation-delay:{(i*7+j)%5*0.3}s"/>' for j in range(8)) for i in range(5))
A[4]=frame(racks+f'<path class="pulse" d="M1080 140l36 64h-72z" fill="{AMB}"/><text x="1080" y="196" text-anchor="middle" font-family="Arial" font-weight="900" font-size="34" fill="{DK}">!</text>')
# 5 The Numbers: EV chart
A[5]=frame(f'''<rect x="150" y="50" width="900" height="360" rx="10" fill="{CRM}"/><path d="M220 360h780M220 360V90" stroke="#888" stroke-width="3"/>
<path class="draw" d="M220 350C400 320 600 220 980 110" fill="none" stroke="{TEAL}" stroke-width="7"/><path class="draw" d="M220 352C400 330 560 270 760 210" fill="none" stroke="{AMB}" stroke-width="7"/><path d="M220 352C400 320 560 240 760 170" fill="none" stroke="{RED}" stroke-width="7" stroke-dasharray="14 10"/>
<g font-family="Arial" font-weight="700" font-size="22"><text x="990" y="105" fill="{TEAL}">PV</text><text x="770" y="215" fill="{AMB}">EV</text><text x="770" y="160" fill="{RED}">AC</text></g><path d="M760 100v270" stroke="#aaa" stroke-dasharray="6 8"/>''')
# 6 Storming: storm cloud over two speech bubbles
A[6]=frame(f'''<g fill="{MID}"><circle cx="520" cy="130" r="70"/><circle cx="610" cy="100" r="85"/><circle cx="710" cy="135" r="65"/><rect x="460" y="130" width="300" height="70" rx="35"/></g>
<path class="flash" d="M600 200l-30 70h40l-30 80" fill="none" stroke="{AMB}" stroke-width="10" stroke-linejoin="round"/>
<path d="M200 260h300q24 0 24 24v80q0 24-24 24H300l-50 40v-40h-50q-24 0-24-24v-80q0-24 24-24z" fill="{TEAL}"/><path d="M700 260h300q24 0 24 24v80q0 24-24 24H950l50 40v-40h-300q-24 0-24-24v-80q0-24 24-24z" fill="{RED}" opacity=".85"/>
<g stroke="{CRM}" stroke-width="10" stroke-linecap="round"><path d="M240 310h200M240 340h150M740 310h220M740 340h160"/></g>''')
# 7 The Demo: laptop with a red-flagged line
A[7]=frame(f'''<rect x="330" y="60" width="540" height="330" rx="14" fill="{DK}"/><rect x="350" y="80" width="500" height="290" fill="{CRM}"/><path d="M280 390h640l-40 40H320z" fill="#55606a"/>
<g stroke="#9aa4ad" stroke-width="10" stroke-linecap="round"><path d="M380 120h300M380 160h400M380 200h360M380 290h330M380 330h250"/></g>
<rect x="370" y="230" width="460" height="34" rx="6" fill="{RED}" opacity=".18"/><path d="M380 247h340" stroke="{RED}" stroke-width="10" stroke-linecap="round"/><circle class="pulse" cx="800" cy="247" r="16" fill="{RED}"/><text x="800" y="256" text-anchor="middle" font-family="Arial" font-weight="900" font-size="22" fill="{CRM}">!</text>''')
# 8 The Contract: document, pen, scales
A[8]=frame(f'''<rect x="250" y="50" width="380" height="370" rx="8" fill="{CRM}" transform="rotate(-4 440 235)"/><g stroke="#9aa4ad" stroke-width="9" stroke-linecap="round" transform="rotate(-4 440 235)"><path d="M300 110h260M300 150h280M300 190h220M300 230h260M300 270h200"/><path d="M300 360q40-30 80 0t80 0" stroke="{TEAL}" stroke-width="5" fill="none"/></g>
<rect x="520" y="300" width="230" height="16" rx="8" fill="{AMB}" transform="rotate(-30 635 308)"/>
<g stroke="{LT}" stroke-width="7" fill="none"><path d="M880 100v270M800 370h160"/><g class="tilt"><path d="M770 160h220"/><path d="M770 160l-40 90h80zM990 160l-40 90h80z"/></g></g>''')
# 9 Go-Live: hospital at night, lit windows
win="".join(f'<rect x="{430+i%6*60}" y="{150+i//6*55}" width="34" height="30" fill="{AMB if (i*7)%3 else MID}" class="{["","flick"][bool((i*7)%3)]}" style="animation-delay:{i%7*0.5}s"/>' for i in range(24))
A[9]=frame(f'''<circle cx="1020" cy="90" r="40" fill="{CRM}"/><g class="twinkle" fill="{CRM}" opacity=".7"><circle cx="160" cy="80" r="2"/><circle cx="260" cy="130" r="2"/><circle cx="820" cy="60" r="2"/><circle cx="900" cy="140" r="2"/></g>
<rect x="400" y="120" width="400" height="300" fill="{MID}"/>{win}<rect x="560" y="80" width="80" height="40" fill="{MID}"/><path d="M600 86v28M586 100h28" stroke="{RED}" stroke-width="8"/>
<rect x="0" y="420" width="{W}" height="60" fill="{DK}"/><rect x="565" y="360" width="70" height="60" fill="{AMB}"/>''',grad("night","#0b1a24","#16303f")+f'<rect width="{W}" height="{H}" fill="url(#night)"/>')
# 10 Closeout: checklist all checked
items="".join(f'<rect x="420" y="{100+i*60}" width="34" height="34" rx="6" fill="{GRN}"/><path class="check" style="animation-delay:{i*0.6}s" d="M428 {117+i*60}l8 9 14-17" stroke="{CRM}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M480 {117+i*60}h{260-i*20}" stroke="#9aa4ad" stroke-width="10" stroke-linecap="round"/>' for i in range(5))
A[10]=frame(f'<rect x="380" y="50" width="440" height="380" rx="10" fill="{CRM}"/><rect x="540" y="36" width="120" height="30" rx="8" fill="{TEAL}"/>'+items+f'<path d="M880 330h160v90H880z" fill="{AMB}"/><path d="M870 330h180l-20-40H890z" fill="#c9952f"/>')
# 11 The Offer: office door with nameplate, org chart
A[11]=frame(f'''<rect x="300" y="40" width="300" height="400" rx="6" fill="{MID}"/><rect x="320" y="60" width="260" height="380" fill="{TEAL}"/><circle cx="550" cy="260" r="12" fill="{AMB}"/>
<rect x="360" y="110" width="180" height="46" rx="4" fill="{CRM}"/><path d="M380 126h140M380 142h100" stroke="{DK}" stroke-width="6"/>
<g fill="none" stroke="{LT}" stroke-width="5"><rect x="790" y="90" width="120" height="50" rx="6"/><path d="M850 140v40M730 180h240M730 180v30M850 180v30M970 180v30"/><rect x="680" y="210" width="100" height="44" rx="6"/><rect x="800" y="210" width="100" height="44" rx="6"/><rect x="920" y="210" width="100" height="44" rx="6"/></g>''')
# 12 The Shock: chart crashing, lightning
A[12]=frame(f'''<path d="M150 380h900" stroke="#888" stroke-width="3"/><path class="draw" d="M160 300L300 240L420 260L540 170L640 200L700 130L760 360L860 330L1040 400" fill="none" stroke="{RED}" stroke-width="9" stroke-linejoin="round"/>
<path d="M700 130l-30 0" stroke="none"/><path class="flash" d="M780 40l-50 120h44l-40 110" fill="none" stroke="{AMB}" stroke-width="10" stroke-linejoin="round"/>''')
# 13 Two Projects: diverging tracks
A[13]=frame(f'''<path d="M600 470L600 300C600 200 380 160 240 60" fill="none" stroke="{TEAL}" stroke-width="40"/><path d="M600 300C600 200 820 160 960 60" fill="none" stroke="{AMB}" stroke-width="40"/>
<g fill="{CRM}"><circle class="move1" style="animation-delay:1.5s" cx="330" cy="130" r="14"/><circle class="move1" style="animation-delay:1s" cx="420" cy="175" r="14"/><circle class="move1" style="animation-delay:1.5s" cx="870" cy="130" r="14"/><circle class="move1" style="animation-delay:1s" cx="780" cy="175" r="14"/><circle class="move1" cx="600" cy="360" r="16"/></g>
<text x="230" y="40" font-family="Arial" font-weight="700" font-size="24" fill="{LT}">CASCADE</text><text x="880" y="40" font-family="Arial" font-weight="700" font-size="24" fill="{AMB}">NORTHGATE</text>''')
# 14 The Hard Conversation: two chairs, one lamp
A[14]=frame(f'''<g class="sway"><path d="M600 40v90" stroke="#555" stroke-width="4"/><path d="M540 130h120l-30 50h-60z" fill="{AMB}"/><path d="M420 470L560 180h80L780 470z" fill="{AMB}" opacity=".12"/></g>
<rect x="430" y="300" width="340" height="20" rx="6" fill="{MID}"/><path d="M460 320v120M740 320v120" stroke="{MID}" stroke-width="12"/>
<g fill="{TEAL}"><rect x="260" y="250" width="120" height="20" rx="6"/><rect x="260" y="160" width="20" height="110" rx="6"/><path d="M270 270v150M370 270v150" stroke="{TEAL}" stroke-width="10"/></g>
<g fill="{TEAL}"><rect x="820" y="250" width="120" height="20" rx="6"/><rect x="920" y="160" width="20" height="110" rx="6"/><path d="M830 270v150M930 270v150" stroke="{TEAL}" stroke-width="10"/></g>''',grad("dim","#0b1a24","#122630")+f'<rect width="{W}" height="{H}" fill="url(#dim)"/>')
# 15 Liftoff: sunrise launch
A[15]=frame(f'''<circle cx="600" cy="430" r="190" fill="{AMB}" opacity=".9"/><rect x="0" y="420" width="{W}" height="60" fill="{DK}"/>
<g class="lift"><path d="M600 120q30 40 30 120v80h-60v-80q0-80 30-120z" fill="{CRM}"/><path d="M570 280l-30 50h30zM630 280l30 50h-30z" fill="{RED}"/><circle cx="600" cy="200" r="12" fill="{TEAL}"/>
<path class="flame" d="M580 330q20 70 40 0" fill="{AMB}"/></g><path d="M560 340q-40 60-90 80M640 340q40 60 90 80" stroke="{CRM}" stroke-width="10" fill="none" opacity=".6"/>''',grad("sun","#2d6b7a","#f0c27a")+f'<rect width="{W}" height="{H}" fill="url(#sun)"/>')
for n,svg in A.items(): open(f"art/full-ch{n:02d}.svg","w").write(svg)
print(len(A),"banners")
