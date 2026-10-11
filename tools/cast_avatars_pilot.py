"""Draw illustrated SVG avatars for the Private Pilot cast ("Danny's Logbook") -> courses/pilot/cast/<id>.svg.
Reuses the drawing helpers from tools/cast_avatars.py (loaded without running its PMP writer) and adds a few
pilot-course hair styles and extras, plus a portrait of Biscuit the airplane. Run from the repo root."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_src = open(os.path.join(ROOT, "tools", "cast_avatars.py")).read()
ns = {"os": os}
exec(_src.split("os.makedirs(")[0], ns)  # SK, HC, hair, extras, svg; the PMP file-writing loop is not run
SK, HC = ns["SK"], ns["HC"]
HC.update({"brown": "#5e4030", "sandy": "#cfa968"})

_base_hair, _base_extras = ns["hair"], ns["extras"]

def hair(style, col, sk):
    h = HC[col]
    extra = {
        # short choppy cut with a gray streak (Marisol)
        "pixie": f'<g><path d="M64 88c-4-32 14-50 36-50s40 18 36 50c-4-12-8-20-14-24-8 6-16 6-22 2-8 4-18 4-24 0-6 6-10 14-12 22z" fill="{h}"/><path d="M96 40q-12 10-14 24" stroke="#c9ccd1" stroke-width="5" fill="none" stroke-linecap="round"/></g>',
        # two braids that hang beside the face (Ellie)
        "pigtails": f'<g fill="{h}"><path d="M64 86c-2-30 14-46 36-46s38 16 36 46c-8-14-20-22-36-22s-30 8-36 22z"/><circle cx="60" cy="104" r="7"/><circle cx="58" cy="118" r="7"/><circle cx="57" cy="132" r="6"/><circle cx="140" cy="104" r="7"/><circle cx="142" cy="118" r="7"/><circle cx="143" cy="132" r="6"/></g><circle cx="57" cy="141" r="3.5" fill="#e0b25c"/><circle cx="143" cy="141" r="3.5" fill="#e0b25c"/>',
    }
    return extra.get(style) or _base_hair(style, col, sk)

def extras(ex, sk):
    out = [_base_extras(ex, sk)]; add = out.append
    if "stethoscope" in ex: add('<path d="M80 150q-4 22 8 30q12 6 20-6" fill="none" stroke="#2b2b2b" stroke-width="3.5"/><path d="M120 150q4 14-4 24" fill="none" stroke="#2b2b2b" stroke-width="3.5"/><circle cx="114" cy="176" r="6" fill="#c9ccd1" stroke="#2b2b2b" stroke-width="2"/>')
    if "patch" in ex: add('<rect x="122" y="160" width="16" height="12" rx="2" fill="#c0473b"/><path d="M130 162v8M126 166h8" stroke="#f3f1ec" stroke-width="2"/>')
    if "pencil" in ex: add('<rect x="130" y="66" width="4" height="24" rx="1.5" fill="#e0b25c" stroke="#5a3a1a" stroke-width="1" transform="rotate(24 132 78)"/>')
    if "pencils2" in ex: add('<rect x="130" y="68" width="4" height="22" rx="1.5" fill="#e0b25c" transform="rotate(24 132 79)"/><rect x="66" y="68" width="4" height="22" rx="1.5" fill="#e0b25c" transform="rotate(-24 68 79)"/>')
    if "grease" in ex: add('<path d="M114 108q6-2 10 2" stroke="#2b2b2b" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" fill="none"/>')
    if "sunglasses" in ex: add('<g fill="#1e1a18"><rect x="78" y="54" width="18" height="10" rx="5"/><rect x="104" y="54" width="18" height="10" rx="5"/></g><path d="M96 58h8" stroke="#1e1a18" stroke-width="2.5"/>')
    if "goldearrings" in ex: add('<circle cx="66" cy="110" r="3" fill="#e0b25c"/><circle cx="134" cy="110" r="3" fill="#e0b25c"/>')
    if "vneck" in ex: add('<path d="M86 148l14 18 14-18" fill="#000" opacity=".18"/>')
    if "jersey" in ex: add('<path d="M84 148l16 12 16-12" fill="none" stroke="#f3f1ec" stroke-width="5"/><text x="100" y="192" text-anchor="middle" font-family="Arial" font-weight="900" font-size="20" fill="#f3f1ec">7</text>')
    if "zip" in ex: add('<path d="M100 150v50" stroke="#c9ccd1" stroke-width="2.5"/><path d="M88 148q12 8 24 0" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="4"/>')
    if "phone" in ex: add('<rect x="134" y="166" width="14" height="24" rx="3" fill="#111" transform="rotate(-10 141 178)"/><rect x="136" y="169" width="10" height="17" rx="1" fill="#8dbcd4" transform="rotate(-10 141 178)"/>')
    if "clipboard" in ex: add('<rect x="58" y="164" width="30" height="36" rx="3" fill="#8a6f47"/><rect x="62" y="170" width="22" height="30" fill="#f3f1ec"/><rect x="68" y="161" width="10" height="6" rx="2" fill="#9aa4ad"/>')
    if "grin" in ex: add('<path d="M88 116q12 12 24 0z" fill="#fff" stroke="#5a2e2e" stroke-width="2.5" stroke-linejoin="round"/>')
    return "".join(out)

ns["hair"], ns["extras"] = hair, extras
svg = ns["svg"]

# id: skin, hair style, hair color, outfit, extras  (see `look` in courses/pilot/cast.js)
C = {
 "jordan": ("tan", "ponytail", "dark", "#23395b", ["stethoscope", "patch", "tired"]),
 "abby": ("fair", "ponytail", "sandy", "#2d6b7a", ["headset", "pencil", "collar"]),
 "walt": ("tan", "short", "gray", "#8a6f47", ["glasseschain", "lines", "blazer"]),
 "marisol": ("olive", "pixie", "saltpep", "#2c3e57", ["pencils2", "blazer"]),
 "claire": ("light", "shoulder", "brown", "#7fa6c9", ["vneck", "lanyard", "tired"]),
 "ellie": ("olive", "pigtails", "dark", "#3f9a5a", ["jersey", "freckles", "smile"]),
 "lourdes": ("tan", "chinbob", "saltpep", "#7a2e3a", ["goldearrings", "lines"]),
 "russ": ("light", "neat", "saltpep", "#2a3550", ["glasses_rect", "zip", "phone"]),
 "danny": ("tan", "messy", "dark", "#7a2e3a", ["sunglasses", "flannel", "grin"]),
 "kendra": ("deep", "natural", "gray", "#1f2f55", ["glasses_wire", "blazer", "collar", "clipboard"]),
}

def biscuit():
    """Biscuit (N4791E) as a little side view portrait, nose left, with the same breathe/blink rhythm."""
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><style>@media (prefers-reduced-motion:no-preference){.beacon{animation:bl 2.2s infinite}@keyframes bl{0%,80%,100%{opacity:.25}85%,92%{opacity:1}}.body{animation:br 4.5s ease-in-out infinite;transform-origin:100px 200px}@keyframes br{50%{transform:translateY(-2px) scale(1.006)}}.prop{animation:pr 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes pr{50%{transform:scaleY(.82)}}}</style>
<rect width="200" height="200" fill="#16303f"/><circle cx="100" cy="100" r="96" fill="#1d4052"/>
<path d="M8 128h184v8a96 96 0 0 1-184 0z" fill="#2d6b7a" opacity=".55"/>
<g class="body">
<ellipse cx="104" cy="138" rx="66" ry="5" fill="#000" opacity=".28"/>
<path d="M150 87L166 50h12l-3 42z" fill="#f3f1ec"/><path d="M166 50h12l-1 9h-13z" fill="#7a2e3a"/>
<ellipse cx="164" cy="98" rx="16" ry="3" fill="#dcdad4"/>
<path d="M34 97L58 89L74 77H128L172 89L172 99L128 108Q110 116 92 116L46 115Q34 113 34 105Z" fill="#f3f1ec"/>
<path d="M38 104L128 101L171 93L171 96.5L128 105L42 108.5Z" fill="#7a2e3a"/>
<path d="M60 89L74 78H82L74 93Z" fill="#2a4a5c"/><path d="M86 80H104V93H80Z" fill="#2a4a5c"/><path d="M108 80H125L120 93H108Z" fill="#2a4a5c"/><path d="M129 81L140 84L135 91H126Z" fill="#2a4a5c"/>
<path d="M105 80V106M86 94v12" stroke="#9aa4ad" stroke-width="1"/>
<path d="M66 77Q70 68 86 67.5L130 69.5L132 77Z" fill="#e8e6e0"/><path d="M68 74H131" stroke="#7a2e3a" stroke-width="1.5"/>
<path d="M112 77L92 113" stroke="#c9ccd1" stroke-width="3" stroke-linecap="round"/>
<path d="M48 114L46 125M100 114L107 125" stroke="#6b6f75" stroke-width="3"/>
<circle cx="46" cy="129" r="5" fill="#1e1a18"/><path d="M38 128q8-9 16 0z" fill="#f3f1ec"/>
<circle cx="108" cy="129" r="6" fill="#1e1a18"/><path d="M98 128q10-11 20 0z" fill="#f3f1ec"/>
<text x="148" y="92" font-family="Arial" font-weight="700" font-size="6.5" fill="#23395b" transform="rotate(-11 148 92)">N4791E</text>
<ellipse cx="31" cy="102" rx="5" ry="6.5" fill="#c9ccd1"/>
<rect class="prop" x="27.5" y="72" width="4" height="60" rx="2" fill="#3a3d44"/>
<circle class="beacon" cx="172" cy="49" r="3.2" fill="#e04a3b"/>
</g></svg>'''

out = os.path.join(ROOT, "courses", "pilot", "cast")
os.makedirs(out, exist_ok=True)
for cid, (skin, style, col, outfit, ex) in C.items():
    open(os.path.join(out, f"{cid}.svg"), "w").write(svg(cid, skin, style, col, outfit, ex))
open(os.path.join(out, "biscuit.svg"), "w").write(biscuit())
print(len(C) + 1, "pilot avatars ->", out)
