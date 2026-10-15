"""Draw illustrated SVG avatars for the CPHIMS cast ("The Cascade Chair") -> courses/cphims/cast/<id>.svg.
Builds on tools/cast_avatars_cisa.py (which builds on tools/cast_avatars.py), so every book's portraits share one style,
and adds a few hospital extras: a white coat, a legal pad, a hard case. Run from the repo root."""
import importlib.util, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location("cast_avatars_cisa", os.path.join(ROOT, "tools", "cast_avatars_cisa.py"))
CI = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(CI)  # its writer only runs under __main__
ns = CI.ns
_cisa_hair, _cisa_extras = CI.hair, CI.extras


def extras(ex, sk):
    out = [_cisa_extras(ex, sk)]; add = out.append
    if "whitecoat" in ex:  # long white coat open over the outfit
        add('<path d="M40 200c4-34 28-52 60-52s56 18 60 52h-36l-24-46-24 46z" fill="#f3f1ec"/><path d="M76 154l24 46 24-46" fill="none" stroke="#d6d3cc" stroke-width="2"/><rect x="122" y="172" width="14" height="10" rx="1" fill="none" stroke="#c9c5bc" stroke-width="1.5"/>')
    if "legalpad" in ex:  # yellow legal pad held at the chest
        add('<rect x="54" y="162" width="30" height="38" rx="2" fill="#f2df6b"/><rect x="54" y="162" width="30" height="5" fill="#a33b2f"/><path d="M58 174h22M58 180h22M58 186h18M58 192h20" stroke="#9fb4c9" stroke-width="1"/>')
    if "hardcase" in ex:  # small hard case for a write blocker and drives
        add('<rect x="122" y="168" width="34" height="26" rx="3" fill="#2b2f36"/><rect x="134" y="164" width="10" height="5" rx="2" fill="none" stroke="#2b2f36" stroke-width="2.5"/><path d="M126 180h26" stroke="#4a4f57" stroke-width="1.5"/>')
    if "mug" in ex:
        add('<rect x="122" y="170" width="18" height="22" rx="3" fill="#c0473b"/><path d="M140 175q8 6 0 12" fill="none" stroke="#c0473b" stroke-width="3"/>')
    if "keys" in ex:
        add('<path d="M90 150l10 26 10-26" fill="none" stroke="#3f6f5a" stroke-width="3"/><circle cx="100" cy="180" r="5" fill="none" stroke="#9aa4ad" stroke-width="2"/><rect x="98" y="184" width="3" height="10" fill="#c9a35a"/>')
    return "".join(out)


ns["ns"]["hair"], ns["ns"]["extras"] = _cisa_hair, extras  # the base svg() looks these up in its own namespace
svg = CI.svg

# id: skin, hair style, hair color, outfit, extras  (see `look` in courses/cphims/cast.js)
C = {
 "maria": ("tan", "bun", "dark", "#23314f", ["blazer", "lanyard", "tired"]),
 "ochoa": ("olive", "crew", "silver", "#4a4f57", ["blazer", "collar", "lines", "legalpad", "glasseshead"]),
 "lucia": ("tan", "ponytail", "dark", "#6f7f9a", ["hoodie", "phonelow"]),
 "kiran": ("brown", "neat", "black", "#7fa6d6", ["buttondown", "bluelanyard", "pen"]),
 "marcus": ("deep", "shaved", "black", "#5d4a3a", ["beard_sp", "glasseschain", "lines", "mug"]),
 "aisha": ("brown", "bun", "black", "#5a5f6a", ["whitecoat", "earrings"]),
 "joan": ("fair", "chinbob", "silver", "#3a3d44", ["cardigan", "collar", "lines"]),
 "nate": ("light", "crew", "gray", "#2c4a7a", ["buttondown", "lanyard"]),
 "walt": ("fair", "shortwhite", "white", "#5f8f8a", ["whitecoat", "lines", "glasseschain"]),
 "glenn": ("light", "neat", "gray", "#2a2f45", ["blazer", "collar", "tie", "lines"]),
 "brett": ("light", "swept", "dark", "#3f5a7a", ["collar", "smile", "phonelow"]),
 "tasha": ("deep", "natural", "black", "#6a4f7a", ["headset", "cardigan"]),
 "gail": ("fair", "crop", "gray", "#2f4a6a", ["keys", "lines", "tired"]),
 "denise": ("deep", "natural", "saltpep", "#25336a", ["glasseshead", "smile"]),
 "theo": ("light", "swept", "saltpep", "#4a6a5a", ["smile", "stubble"]),
 "irene": ("fair", "shortwhite", "white", "#7a5a6a", ["cardigan", "lines", "kindsmile"]),
 "henry": ("light", "parted", "dark", "#23314f", ["graytemple", "blazer", "looseTie", "tired", "hardcase"]),
}

if __name__ == "__main__":
    out = os.path.join(ROOT, "courses", "cphims", "cast")
    os.makedirs(out, exist_ok=True)
    for cid, (skin, style, col, outfit, ex) in C.items():
        open(os.path.join(out, f"{cid}.svg"), "w").write(svg(cid, skin, style, col, outfit, ex))
    print(len(C), "cphims avatars ->", out)
