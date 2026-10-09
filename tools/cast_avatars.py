"""Draw simple illustrated SVG avatars for the cast (stand-ins until painted portraits exist)."""
import os
SK = {"deep":"#5b3a29","brown":"#8a5a3c","tan":"#c08a5f","olive":"#d0a27a","light":"#efc9a6","fair":"#f3d3bb"}
HC = {"black":"#1e1a18","dark":"#3a2a22","blond":"#c9a35a","silver":"#c9ccd1","white":"#eceae6","gray":"#9a9da3","red":"#b4532a","saltpep":"#7d7a76"}
C = { # id: skin, hair style, hair color, outfit, extras
 "sam":("deep","crop","black","#23395b",["graytemple"]),
 "dana":("brown","curlyback","dark","#a65a3a",["glasseshead","pen"]),
 "ray":("tan","crew","gray","#4b5320",["cap","lines"]),
 "ruth":("fair","shortwhite","white","#2d6b7a",["glasses_round"]),
 "elena":("olive","bob","dark","#2a2a33",["blazer"]),
 "grant":("light","swept","silver","#dfe6ee",["smile","collar"]),
 "lena":("light","shoulder","black","#8a8f96",["glasses_round"]),
 "theo":("fair","messy","blond","#5a6470",["stubble","headphones","tired"]),
 "priya":("tan","ponytail","black","#3f7d5a",["earrings"]),
 "tomasz":("fair","short","saltpep","#1c1c1c",["beard_sp","glasses_rect"]),
 "devin":("olive","fade","black","#6b6f75",["stubble","flannel","smirk"]),
 "ochoa":("tan","short","gray","#f2f2f2",["mustache","glasses_wire","tie"]),
 "maria":("olive","shortpractical","dark","#7a6a8a",["lanyard"]),
 "denise":("deep","natural","gray","#3d7f86",["glasseschain"]),
 "hal":("light","short","gray","#2f5d8a",["goatee","ruddy","lanyard"]),
 "joan":("fair","bob","silver","#8a5a6a",["glasses_cat"]),
 "douglas":("tan","full","white","#22252b",["glasses_half"]),
 "marcus":("deep","shaved","black","#2f4f6f",["headset","smile"]),
 "ken":("light","neat","black","#2a2f38",["glasses_rimless"]),
 "victor":("deep","crop","saltpep","#3a3d44",["blazer"]),
 "keisha":("deep","braids","black","#2a3f6a",["blazer","smile"]),
 "rob":("tan","short","gray","#6a5a48",["mustache"]),
 "nora":("light","bun","black","#23262e",["blazer"]),
 "helen":("light","chinbob","saltpep","#1f2f55",["earrings"]),
 "alyssa":("fair","ponytail","red","#3f6a8a",["freckles"]),
}
def hair(style,col,sk):
    h=HC[col]
    return {
     "crop":f'<path d="M66 78c0-26 20-40 34-40s34 14 34 40c-6-12-18-18-34-18s-28 6-34 18z" fill="{h}"/>',
     "curlyback":f'<g fill="{h}"><circle cx="72" cy="66" r="14"/><circle cx="90" cy="54" r="15"/><circle cx="110" cy="54" r="15"/><circle cx="128" cy="66" r="14"/><circle cx="134" cy="84" r="10"/><circle cx="66" cy="84" r="10"/></g>',
     "crew":f'<path d="M68 74c2-20 16-32 32-32s30 12 32 32c-8-8-20-12-32-12s-24 4-32 12z" fill="{h}"/>',
     "shortwhite":f'<path d="M64 88c-4-30 14-48 36-48s40 18 36 48c-2-10-6-20-10-24-8 6-22 8-36 6-10-2-18 4-22 18z" fill="{h}"/>',
     "bob":f'<path d="M62 112c-6-46 8-72 38-72s44 26 38 72c-6 2-10 0-12-4V78c-10 2-30-2-44-14-6 6-8 16-8 26v18c-2 4-6 6-12 4z" fill="{h}"/>',
     "swept":f'<path d="M66 80c0-28 16-42 36-42 16 0 32 10 32 32-14-10-36-14-50-6-8 4-14 10-18 16z" fill="{h}"/>',
     "shoulder":f'<path d="M60 128c-6-56 10-88 40-88s46 32 40 88h-12c2-24 0-40-6-50-12 4-30 2-44-8-4 10-6 30-6 58z" fill="{h}"/>',
     "messy":f'<path d="M64 82c-4-30 12-44 30-46l6-6 8 6c18 0 32 14 28 46-4-10-8-16-14-20l-4 8-6-10-8 8-6-10-8 8-6-8c-6 4-14 12-20 24z" fill="{h}"/>',
     "ponytail":f'<g fill="{h}"><path d="M64 84c-2-30 14-46 36-46s38 16 36 46c-8-14-20-22-36-22s-30 8-36 22z"/><path d="M128 60c18 6 22 30 14 52-4-14-8-24-16-30z"/></g>',
     "short":f'<path d="M66 80c0-26 16-40 34-40s34 14 34 40c-6-10-18-16-34-16s-28 6-34 16z" fill="{h}"/>',
     "fade":f'<path d="M68 74c4-22 18-32 32-32s28 10 32 32c-8-6-20-10-32-10s-24 4-32 10z" fill="{h}"/>',
     "shortpractical":f'<path d="M62 96c-4-36 12-56 38-56s42 20 38 56c-4-14-8-24-12-28-12 4-34 4-50-4-6 6-10 18-14 32z" fill="{h}"/>',
     "natural":f'<g fill="{h}"><circle cx="76" cy="62" r="13"/><circle cx="92" cy="52" r="13"/><circle cx="108" cy="52" r="13"/><circle cx="124" cy="62" r="13"/><circle cx="70" cy="78" r="9"/><circle cx="130" cy="78" r="9"/></g>',
     "full":f'<path d="M62 86c-4-32 14-50 38-50s42 18 38 50c-4-12-12-20-20-24-10 2-26 2-38-2-8 6-14 14-18 26z" fill="{h}"/>',
     "shaved":f'<path d="M70 70c6-16 18-24 30-24s24 8 30 24c-10-6-20-8-30-8s-20 2-30 8z" fill="{h}" opacity=".35"/>',
     "neat":f'<path d="M66 78c0-24 16-38 34-38s34 14 34 38c-4-6-10-10-16-12-14 2-30 2-44-2-4 4-6 8-8 14z" fill="{h}"/>',
     "braids":f'<g fill="{h}"><path d="M64 86c-4-30 14-48 36-48s40 18 36 48c-8-14-22-22-36-22s-28 8-36 22z"/><path d="M130 66c14 8 16 40 8 64h-8c4-20 4-40 0-54zM70 66c-14 8-16 40-8 64h8c-4-20-4-40 0-54z"/></g>',
     "bun":f'<g fill="{h}"><circle cx="100" cy="36" r="12"/><path d="M64 84c-2-30 14-46 36-46s38 16 36 46c-8-14-20-22-36-22s-30 8-36 22z"/></g>',
     "chinbob":f'<path d="M62 116c-6-48 8-76 38-76s44 28 38 76h-12V80c-12 2-30-2-44-12-4 8-6 18-6 30v18z" fill="{h}"/>',
    }[style]
def extras(ex,sk):
    out=[];add=out.append
    if "cap" in ex: add('<path d="M64 70c4-22 18-32 36-32s32 10 36 32z" fill="#1f2a44"/><path d="M60 70h84c-2 4-8 6-14 6H66c-4 0-6-2-6-6z" fill="#16203a"/><text x="100" y="62" font-size="10" text-anchor="middle" fill="#cfd6e4" font-family="Arial" font-weight="700">USAF</text>')
    gl={"glasses_round":'<g fill="none" stroke="#2b2b2b" stroke-width="3"><circle cx="86" cy="94" r="9"/><circle cx="114" cy="94" r="9"/><path d="M95 94h10"/></g>',
        "glasses_rect":'<g fill="none" stroke="#1a1a1a" stroke-width="4"><rect x="75" y="86" width="20" height="15" rx="3"/><rect x="105" y="86" width="20" height="15" rx="3"/><path d="M95 93h10"/></g>',
        "glasses_wire":'<g fill="none" stroke="#9a8a60" stroke-width="2"><rect x="76" y="87" width="19" height="13" rx="5"/><rect x="105" y="87" width="19" height="13" rx="5"/><path d="M95 93h10"/></g>',
        "glasses_cat":'<g fill="none" stroke="#5a2a3a" stroke-width="3"><path d="M74 88q12-6 22 2-2 12-12 12t-10-14zM126 88q-12-6-22 2 2 12 12 12t10-14z"/><path d="M96 92h8"/></g>',
        "glasses_half":'<g fill="none" stroke="#333" stroke-width="2.5"><path d="M76 97h19q-2 8-9 8t-10-8zM105 97h19q-2 8-9 8t-10-8zM95 98h10"/></g>',
        "glasses_rimless":'<g fill="none" stroke="#8a9098" stroke-width="1.5"><rect x="76" y="87" width="19" height="13" rx="4"/><rect x="105" y="87" width="19" height="13" rx="4"/><path d="M95 93h10"/></g>'}
    for k,v in gl.items():
        if k in ex: add(v)
    if "glasseshead" in ex: add('<g fill="none" stroke="#2b2b2b" stroke-width="3"><circle cx="88" cy="58" r="7"/><circle cx="112" cy="58" r="7"/><path d="M95 58h10"/></g>')
    if "glasseschain" in ex: add('<g fill="none" stroke="#2b2b2b" stroke-width="2.5"><circle cx="86" cy="94" r="8"/><circle cx="114" cy="94" r="8"/><path d="M94 94h12"/></g><path d="M78 96q-8 30 10 46M122 96q8 30-10 46" fill="none" stroke="#c9a35a" stroke-width="1.5" stroke-dasharray="2 2"/>')
    if "mustache" in ex: add('<path d="M88 112q12-6 24 0q-4 5-12 3q-8 2-12-3z" fill="#9a9da3"/>')
    if "beard_sp" in ex: add('<path d="M74 100q2 34 26 36t26-36q-4 12-10 14h-32q-6-2-10-14z" fill="#7d7a76"/>')
    if "goatee" in ex: add('<path d="M90 116q10 4 20 0v12q-10 6-20 0z" fill="#9a9da3"/><path d="M88 112q12-5 24 0" stroke="#9a9da3" stroke-width="3" fill="none"/>')
    if "stubble" in ex: add('<path d="M76 104q4 26 24 28t24-28" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="10" stroke-linecap="round"/>')
    if "headphones" in ex: add('<path d="M70 140q30 18 60 0" fill="none" stroke="#2b2b2b" stroke-width="6"/><rect x="62" y="132" width="14" height="16" rx="4" fill="#2b2b2b"/><rect x="124" y="132" width="14" height="16" rx="4" fill="#2b2b2b"/>')
    if "headset" in ex: add('<path d="M68 142q32 16 64 0" fill="none" stroke="#2b2b2b" stroke-width="5"/><circle cx="70" cy="142" r="6" fill="#2b2b2b"/>')
    if "earrings" in ex: add('<circle cx="70" cy="106" r="3" fill="#d9dde3"/><circle cx="130" cy="106" r="3" fill="#d9dde3"/>')
    if "lanyard" in ex: add('<path d="M88 150l12 26 12-26" fill="none" stroke="#c0392b" stroke-width="3"/><rect x="93" y="174" width="14" height="10" rx="2" fill="#f3f1ec"/>')
    if "tie" in ex: add('<path d="M96 150h8l3 8-7 26-7-26z" fill="#1f2f55"/>')
    if "pen" in ex: add('<rect x="128" y="70" width="4" height="22" rx="2" fill="#c0392b" transform="rotate(20 130 81)"/>')
    if "freckles" in ex: add('<g fill="#b4532a" opacity=".5"><circle cx="84" cy="104" r="1.3"/><circle cx="89" cy="107" r="1.3"/><circle cx="111" cy="107" r="1.3"/><circle cx="116" cy="104" r="1.3"/></g>')
    if "graytemple" in ex: add('<path d="M68 82q2-6 6-8M132 82q-2-6-6-8" stroke="#9a9da3" stroke-width="4" fill="none"/>')
    if "lines" in ex: add('<path d="M74 92l-6-2M74 96l-6 1M126 92l6-2M126 96l6 1" stroke="#000" stroke-opacity=".3" stroke-width="1.5"/>')
    if "tired" in ex: add('<path d="M80 100q6 3 12 0M108 100q6 3 12 0" stroke="#5a4a6a" stroke-opacity=".5" stroke-width="2" fill="none"/>')
    if "ruddy" in ex: add('<circle cx="80" cy="106" r="7" fill="#d9534f" opacity=".2"/><circle cx="120" cy="106" r="7" fill="#d9534f" opacity=".2"/>')
    return "".join(out)
def svg(cid,skin,style,col,outfit,ex):
    s=SK[skin];mouth='<path d="M90 118q10 8 20 0" stroke="#5a2e2e" stroke-width="3" fill="none" stroke-linecap="round"/>' if ("smile" in ex) else ('<path d="M90 120q10 3 20-2" stroke="#5a2e2e" stroke-width="3" fill="none" stroke-linecap="round"/>' if "smirk" in ex else '<path d="M92 120h16" stroke="#5a2e2e" stroke-width="3" stroke-linecap="round"/>')
    blazer='<path d="M60 200l18-52 22 30 22-30 18 52z" fill="#000" opacity=".22"/>' if ("blazer" in ex or "flannel" in ex) else ""
    collar='<path d="M86 148l14 14 14-14" fill="#fff" opacity=".7"/>' if "collar" in ex else ""
    back = hair(style,col,s) if style in ("bob","shoulder","braids","chinbob","ponytail") else ""
    front = "" if back else hair(style,col,s)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#16303f"/><circle cx="100" cy="100" r="96" fill="#1d4052"/>
{back}<path d="M40 200c4-34 28-52 60-52s56 18 60 52z" fill="{outfit}"/>{blazer}{collar}<rect x="88" y="126" width="24" height="26" rx="8" fill="{s}"/>
<ellipse cx="66" cy="98" rx="6" ry="9" fill="{s}"/><ellipse cx="134" cy="98" rx="6" ry="9" fill="{s}"/><ellipse cx="100" cy="94" rx="34" ry="42" fill="{s}"/>
<circle cx="86" cy="94" r="3.4" fill="#1e1a18"/><circle cx="114" cy="94" r="3.4" fill="#1e1a18"/><path d="M79 85q7-4 14 0M107 85q7-4 14 0" stroke="#1e1a18" stroke-opacity=".7" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M100 98v10q-3 2-6 0" stroke="#000" stroke-opacity=".25" stroke-width="2" fill="none"/>{mouth}{front}{extras(ex,s)}</svg>'''
os.makedirs("cast",exist_ok=True)
for cid,(skin,style,col,outfit,ex) in C.items():
    open(f"cast/{cid}.svg","w").write(svg(cid,skin,style,col,outfit,ex))
print(len(C),"avatars")
