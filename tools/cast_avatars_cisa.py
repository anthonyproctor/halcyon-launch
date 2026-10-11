"""Draw illustrated SVG avatars for the CISA cast ("Exception Noted") -> courses/cisa/cast/<id>.svg.
Reuses the drawing helpers from tools/cast_avatars_pilot.py (which itself layers on tools/cast_avatars.py), loaded
without running either file writer, and adds the hair styles, clothes and props this cast needs. Every id in
courses/cisa/cast.js gets a portrait. Run from the repo root."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_pilot = os.path.join(ROOT, "tools", "cast_avatars_pilot.py")
ns = {"os": os, "__file__": _pilot}
exec(open(_pilot).read().split("out = os.path.join(")[0], ns)  # hair, extras, svg; the pilot writer is not run
SK, HC = ns["SK"], ns["HC"]
HC.update({"auburn": "#8a3f24", "fairgold": "#c8ae7e", "darkgray": "#4a4542", "midbrown": "#6a4a32"})

_base_hair, _base_extras = ns["hair"], ns["extras"]
BODY = "M40 200c4-34 28-52 60-52s56 18 60 52z"  # the shared shoulders path, used to clip patterns to the clothes


def hair(style, col, sk):
    h = HC[col]
    extra = {
        # short side parting, a little lift at the front (Henry)
        "parted": f'<path d="M66 82c-2-28 14-44 34-44 22 0 38 16 34 44-4-10-8-16-14-20-14 2-30 0-42-6-6 6-10 14-12 26z" fill="{h}"/><path d="M84 46q-4 8-4 16" stroke="#000" stroke-opacity=".18" stroke-width="2" fill="none"/>',
        # close cropped natural hair, a soft textured cap (Nkechi)
        "closecrop": f'<g><path d="M67 84c-2-28 12-44 33-44s35 16 33 44c-6-12-18-19-33-19s-27 7-33 19z" fill="{h}"/><g fill="#000" opacity=".22"><circle cx="82" cy="52" r="1.6"/><circle cx="94" cy="47" r="1.6"/><circle cx="106" cy="47" r="1.6"/><circle cx="118" cy="52" r="1.6"/><circle cx="76" cy="64" r="1.6"/><circle cx="124" cy="64" r="1.6"/><circle cx="100" cy="56" r="1.6"/><circle cx="88" cy="58" r="1.6"/><circle cx="112" cy="58" r="1.6"/></g></g>',
        # long curly hair pulled into a loose low ponytail, curls escaping at the sides (Maisie)
        "curlypony": f'<g fill="{h}"><path d="M62 92c-4-34 14-54 38-54s42 20 38 54c-8-16-22-26-38-26s-30 10-38 26z"/><circle cx="64" cy="96" r="8"/><circle cx="62" cy="110" r="7"/><circle cx="136" cy="96" r="8"/><circle cx="138" cy="110" r="7"/><circle cx="138" cy="126" r="9"/><circle cx="144" cy="140" r="9"/><circle cx="140" cy="154" r="8"/><circle cx="148" cy="164" r="7"/><circle cx="72" cy="56" r="9"/><circle cx="128" cy="56" r="9"/></g>',
        # thin white hair, mostly at the sides, a few strands combed over (Arthur)
        "thinwhite": f'<g fill="{h}"><path d="M66 92c-2-14 2-26 10-32l4 4c-6 8-8 18-8 30z"/><path d="M134 92c2-14-2-26-10-32l-4 4c6 8 8 18 8 30z"/></g><path d="M78 60q20-14 44-2M82 56q16-8 32-2" stroke="{h}" stroke-width="2" fill="none" opacity=".8"/>',
        # neatly wrapped head scarf with a knot at the front (Precious)
        "headwrap": f'<g><path d="M64 88c-6-34 12-56 36-56s42 22 36 56c-8-14-20-22-36-22s-28 8-36 22z" fill="{h}"/><path d="M70 66q30-16 60 0M68 78q32-16 64 0" stroke="#000" stroke-opacity=".2" stroke-width="2.5" fill="none"/><path d="M92 38q8-10 16 0q-8 8-16 0z" fill="{h}" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/></g>',
    }
    return extra.get(style) or _base_hair(style, col, sk)


def extras(ex, sk):
    out = [_base_extras(ex, sk)]; add = out.append
    clip = f'<clipPath id="cl"><path d="{BODY}"/></clipPath>'
    if "pinstripe" in ex:
        add(clip + '<g clip-path="url(#cl)" stroke="#e8e6e0" stroke-opacity=".22" stroke-width="1">' + "".join(f'<path d="M{x} 146v56"/>' for x in range(44, 160, 7)) + '</g>')
    if "cardigan" in ex:  # open front, buttons down one side
        add('<path d="M86 150l14 50 14-50" fill="#000" opacity=".16"/><g fill="#e8e2d0"><circle cx="90" cy="168" r="2"/><circle cx="93" cy="182" r="2"/><circle cx="96" cy="196" r="2"/></g>')
    if "looseTie" in ex:  # tie knot pulled down a little and off center, top button open
        add('<path d="M86 148l14 12 14-12" fill="#f3f1ec" opacity=".85"/><path d="M98 162h8l2 7-7 28-7-27z" fill="#7a2e3a" transform="rotate(4 102 170)"/><path d="M96 160l4 4 4-4" stroke="#5a1e2a" stroke-width="2" fill="none"/>')
    if "greenpen" in ex:
        add('<rect x="132" y="172" width="5" height="26" rx="2" fill="#2f7a4a" transform="rotate(-28 134 185)"/><rect x="132" y="172" width="5" height="6" rx="1" fill="#c9ccd1" transform="rotate(-28 134 185)"/>')
    if "beads" in ex:  # glasses chain as small beads instead of a dashed line
        add('<g fill="#7fa6c9">' + "".join(f'<circle cx="{x}" cy="{y}" r="1.4"/>' for x, y in ((77, 104), (76, 114), (77, 124), (80, 133), (85, 140), (123, 104), (124, 114), (123, 124), (120, 133), (115, 140))) + '</g>')
    if "upcollar" in ex:  # overcoat collar turned up around the neck
        add('<path d="M78 150l-6-22 18 14 10 20z" fill="#4a4f57"/><path d="M122 150l6-22-18 14-10 20z" fill="#4a4f57"/><path d="M60 200l18-52 22 30 22-30 18 52z" fill="#000" opacity=".18"/>')
    if "graystubble" in ex:
        add('<path d="M76 104q4 26 24 28t24-28" fill="none" stroke="#9a9da3" stroke-opacity=".28" stroke-width="9" stroke-linecap="round" stroke-dasharray="1.5 2.5"/>')
    if "mpd" in ex:  # lanyard with a typed name badge
        add('<path d="M88 150l12 24 12-24" fill="none" stroke="#2c4a7a" stroke-width="3"/><rect x="90" y="172" width="20" height="13" rx="2" fill="#f3f1ec"/><path d="M93 177h14M93 181h9" stroke="#2b2b2b" stroke-width="1.4"/>')
    if "coffees" in ex:  # a paper cup in each hand
        for x in (52, 128):
            add(f'<path d="M{x} 168h20l-3 30h-14z" fill="#e8e2d0"/><rect x="{x - 1}" y="164" width="22" height="5" rx="2" fill="#3a3d44"/><rect x="{x + 1}" y="178" width="18" height="8" fill="#8a6f47"/>')
    if "parka" in ex:  # parka shell with a hood ring and a blazer lapel inside
        add('<path d="M70 150q30 18 60 0" fill="none" stroke="#1a2638" stroke-width="7" stroke-linecap="round"/><path d="M88 156l12 20 12-20" fill="#3a3d44"/><path d="M100 176v24" stroke="#9aa4ad" stroke-width="2"/>')
    if "credential" in ex:  # credential wallet held up in the left hand
        add('<rect x="46" y="150" width="34" height="44" rx="3" fill="#2b2420"/><rect x="50" y="154" width="26" height="17" rx="1" fill="#f3f1ec"/><path d="M53 159h14M53 163h18M53 167h10" stroke="#23395b" stroke-width="1.3"/><path d="M63 176l7 4v6q-1 5-7 7q-6-2-7-7v-6z" fill="#e0b25c"/><ellipse cx="62" cy="196" rx="12" ry="6" fill="' + sk + '"/>')
    if "hoodie" in ex:  # hood bunched behind the neck and two drawstrings
        add('<path d="M72 152q28 14 56 0q-4-8-10-10q-18 8-36 0q-6 2-10 10z" fill="#000" opacity=".2"/><path d="M93 158v24M107 158v24" stroke="#f3f1ec" stroke-width="2.4" stroke-linecap="round"/><circle cx="93" cy="183" r="2" fill="#f3f1ec"/><circle cx="107" cy="183" r="2" fill="#f3f1ec"/>')
    if "phonelow" in ex:  # phone held at the chest, screen glowing
        add('<rect x="118" y="174" width="16" height="26" rx="3" fill="#111" transform="rotate(8 126 187)"/><rect x="120" y="177" width="12" height="19" rx="1" fill="#8dbcd4" transform="rotate(8 126 187)"/>')
    if "tunic" in ex:  # nurse's tunic: piped v neck, fob watch
        add('<path d="M86 148l14 18 14-18" fill="none" stroke="#e8e6e0" stroke-width="2.5"/><circle cx="124" cy="172" r="5" fill="#e8e6e0"/><circle cx="124" cy="172" r="3" fill="#f3f1ec" stroke="#9aa4ad" stroke-width=".8"/><path d="M124 166v-6" stroke="#9aa4ad" stroke-width="1.5"/>')
    if "studs" in ex:
        add('<circle cx="66" cy="108" r="2.6" fill="#e0b25c"/><circle cx="134" cy="108" r="2.6" fill="#e0b25c"/>')
    if "bluelanyard" in ex:
        add('<path d="M88 150l12 26 12-26" fill="none" stroke="#2f6fb0" stroke-width="3"/><rect x="92" y="174" width="16" height="11" rx="2" fill="#f3f1ec"/><rect x="94" y="176" width="12" height="3" fill="#2f6fb0"/>')
    if "buttondown" in ex:  # pressed shirt: placket and pocket
        add('<path d="M100 166v34" stroke="#000" stroke-opacity=".18" stroke-width="2"/><rect x="112" y="172" width="16" height="14" rx="1" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="1.5"/>')
    if "kindsmile" in ex:
        add('<path d="M91 118q9 6 18 0" stroke="#5a2e2e" stroke-width="3" fill="none" stroke-linecap="round"/>')
    return "".join(out)


ns["ns"]["hair"], ns["ns"]["extras"] = hair, extras  # the base svg() looks these up in its own namespace
_svg = ns["svg"]

# A care home wing chair behind Arthur, drawn just after the backdrop circle so it sits behind him.
CHAIR = ('<path d="M44 200V96q0-30 30-34h52q30 4 30 34v104z" fill="#7a5a6a"/>'
         '<path d="M30 200v-60q0-14 14-14t14 14v60zM142 200v-60q0-14 14-14t14 14v60z" fill="#6a4a5a"/>'
         '<path d="M58 70q42-14 84 0" stroke="#000" stroke-opacity=".15" stroke-width="3" fill="none"/>')


def svg(cid, skin, style, col, outfit, ex):
    s = _svg(cid, skin, style, col, outfit, ex)
    mouth_flat = '<path d="M92 120h16" stroke="#5a2e2e" stroke-width="3" stroke-linecap="round"/>'
    if "kindsmile" in ex:  # the extra draws its own mouth; drop the flat default
        s = s.replace(mouth_flat, "", 1)
    if "carechair" in ex:
        bg = '<circle cx="100" cy="100" r="96" fill="#1d4052"/>'
        s = s.replace(bg, bg + CHAIR, 1)
    return s


# id: skin, hair style, hair color, outfit, extras  (see `look` in courses/cisa/cast.js)
C = {
 "henry": ("light", "parted", "dark", "#23314f", ["graytemple", "blazer", "looseTie", "tired"]),
 "dot": ("fair", "shortwhite", "silver", "#4a6fa5", ["glasseschain", "beads", "cardigan", "lines", "smirk", "greenpen"]),
 "lou": ("light", "crew", "gray", "#5b6068", ["upcollar", "graystubble", "lines", "mpd", "coffees"]),
 "giles": ("light", "swept", "fairgold", "#2a2f45", ["pinstripe", "blazer", "collar", "ruddy", "smile"]),
 "nkechi": ("deep", "closecrop", "black", "#22324a", ["parka", "studs", "credential"]),
 "maisie": ("light", "curlypony", "midbrown", "#6f7f9a", ["hoodie", "phonelow", "freckles"]),
 "arthur": ("fair", "thinwhite", "white", "#7a6a55", ["carechair", "cardigan", "collar", "tie", "lines", "kindsmile"]),
 "precious": ("brown", "headwrap", "#b5643a", "#25336a", ["tunic", "studs", "smile"]),
 "leonard": ("light", "neat", "midbrown", "#7fa6d6", ["glasses_rimless", "collar", "buttondown", "bluelanyard", "grin"]),
 "laura": ("fair", "shoulder", "auburn", "#5d7a6e", ["zip", "glasseshead", "tired"]),
}
HC["#b5643a"] = "#b5643a"  # Precious's wrap colour, passed straight through as a hair "colour"

if __name__ == "__main__":
    out = os.path.join(ROOT, "courses", "cisa", "cast")
    os.makedirs(out, exist_ok=True)
    for cid, (skin, style, col, outfit, ex) in C.items():
        open(os.path.join(out, f"{cid}.svg"), "w").write(svg(cid, skin, style, col, outfit, ex))
    print(len(C), "cisa avatars ->", out)
