"""Draw illustrated SVG portraits for The Halcyon Launch v2 cast (the PMP book) -> cast/v2/<id>.svg.
Reuses the drawing helpers from tools/cast_avatars_cisa.py (which layers on the pilot and base PMP helpers), loaded
without running any of their file writers, and adds the hair, clothes, and props this cast needs. Every id in
full/v2/cast.js gets one portrait, drawn from its `look` (Ada in her station coverall, before any injury). Same
200 px frame, blink and breathe as the other books, inside the prefers-reduced-motion guard. Run from the repo root:
python3 tools/cast_avatars_v2.py"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_cisa = os.path.join(ROOT, "tools", "cast_avatars_cisa.py")
ns = {"os": os, "__file__": _cisa}
exec(open(_cisa).read().split('if __name__ == "__main__":')[0], ns)  # hair, extras, svg; the CISA writer is not run
SK, HC = ns["SK"], ns["HC"]
SK.update({"tanned": "#d9a27a", "sunburn": "#e8b49a", "warmbrown": "#a8714a"})
HC.update({"grayblond": "#c8b896", "sandy": "#cfa968", "midbrown": "#6a4a32", "redbeard": "#a8532a", "darkgray": "#4a4542"})

_cisa_hair, _cisa_extras, _cisa_svg = ns["hair"], ns["extras"], ns["svg"]
BODY = "M40 200c4-34 28-52 60-52s56 18 60 52z"
BG = '<circle cx="100" cy="100" r="96" fill="#1d4052"/>'


def hair(style, col, sk):
    h = HC.get(col, col)
    extra = {
        # short twists all over (Ada); the headband is an extra
        "twists": f'<g fill="{h}"><path d="M66 84c-2-28 14-46 34-46s36 18 34 46c-6-12-18-20-34-20s-28 8-34 20z"/>'
                  + "".join(f'<ellipse cx="{x}" cy="{y}" rx="5" ry="7"/>' for x, y in ((72, 62), (82, 50), (94, 44), (106, 44), (118, 50), (128, 62), (68, 76), (132, 76), (88, 56), (112, 56), (100, 50)))
                  + '</g>',
        # straight hair parted and taken back to a low knot (Quinn, Paloma)
        "lowknot": f'<path d="M65 92c-4-34 12-52 35-52s39 18 35 52c-2-12-6-20-12-24-10-2-20-6-24-12-6 8-18 14-28 16-4 6-6 14-6 20z" fill="{h}"/><path d="M98 42q-4 10-2 22" stroke="#000" stroke-opacity=".15" stroke-width="2" fill="none"/>',
        # sandy hair going thin on top (Garrett)
        "thinning": f'<g fill="{h}"><path d="M66 90c-2-16 2-28 10-34l6 4c-6 8-8 18-8 30zM134 90c2-16-2-28-10-34l-6 4c6 8 8 18 8 30z"/><path d="M80 54q20-14 40 0q-20-6-40 0z" opacity=".75"/></g><path d="M84 56q16-6 32 0" stroke="{h}" stroke-width="2" fill="none" opacity=".7"/>',
        # pulled back tight, a center part (Yusra, Nell, Anjali)
        "pulledback": f'<path d="M66 86c-2-30 14-46 34-46s36 16 34 46c-4-14-10-22-16-26-6-2-12-4-18-10-6 6-12 8-18 10-6 4-12 12-16 26z" fill="{h}"/><path d="M100 42v12" stroke="#000" stroke-opacity=".2" stroke-width="2"/>',
        # short gray locs (Thandi)
        "locs": f'<g fill="{h}"><path d="M66 86c-2-30 14-46 34-46s36 16 34 46c-6-12-18-20-34-20s-28 8-34 20z"/></g><g stroke="{h}" stroke-width="7" stroke-linecap="round" fill="none"><path d="M68 70q-6 20-4 44M74 58q-12 16-12 34M132 70q6 20 4 44M126 58q12 16 12 34M84 48q-8 10-10 20M116 48q8 10 10 20M100 44v14"/></g>',
        # hair back in a short braid over one shoulder (Ilse)
        "braid1": f'<path d="M66 86c-2-30 14-46 34-46s36 16 34 46c-6-12-18-20-34-20s-28 8-34 20z" fill="{h}"/><g fill="{h}"><circle cx="134" cy="112" r="7"/><circle cx="136" cy="125" r="7"/><circle cx="137" cy="138" r="6.5"/><circle cx="137" cy="150" r="6"/></g><path d="M131 156h12" stroke="#2b2b2b" stroke-width="3"/>',
    }
    return extra.get(style) or _cisa_hair(style, col, sk)


def extras(ex, sk):
    out = [_cisa_extras(ex, sk)]; add = out.append
    clip = f'<clipPath id="cl2"><path d="{BODY}"/></clipPath>'
    if "headband" in ex:
        add('<path d="M66 70q34-16 68 0v8q-34-14-68 0z" fill="#2d6b7a"/>')
    if "coverall" in ex:  # station coverall: collar points, a zip, a chest pocket
        add('<path d="M84 148l-8 12 16 4zM116 148l8 12-16 4z" fill="#000" opacity=".18"/><path d="M100 160v40" stroke="#000" stroke-opacity=".25" stroke-width="2.5"/><rect x="110" y="172" width="18" height="14" rx="2" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/>')
    if "watch" in ex:  # a forearm up across the body, a steel watch a little big for the wrist
        add(f'<path d="M150 204l-22-40" stroke="{sk}" stroke-width="15" stroke-linecap="round"/><path d="M164 204l-12-20" stroke="#c9773a" stroke-width="22"/>'
            '<rect x="129" y="170" width="18" height="11" rx="3" fill="#c9ccd1" transform="rotate(-60 138 175)"/><circle cx="138" cy="175" r="4" fill="#e8ecef" stroke="#8a9098" stroke-width="1"/>')
    if "fleece" in ex:  # zip fleece with a small grass logo, over a work shirt collar
        add('<path d="M100 150v50" stroke="#c9ccd1" stroke-width="2.5"/><path d="M86 150l14 10 14-10" fill="#8a9098"/><path d="M120 172q2-8 4-10M124 172q1-9 5-12M128 172q2-6 6-8" stroke="#e0b25c" stroke-width="2" fill="none"/>')
    if "flagpin" in ex:
        add('<rect x="118" y="168" width="10" height="7" fill="#c0473b"/><rect x="118" y="168" width="5" height="4" fill="#23395b"/>')
    if "highcollar" in ex:
        add('<path d="M88 146q12 6 24 0v10q-12 6-24 0z" fill="#e8e6e0"/>')
    if "quarterzip" in ex:  # open collar quarter zip with the Tallgrass logo
        add('<path d="M86 148l14 18 14-18" fill="#f3f1ec" opacity=".85"/><path d="M100 166v12" stroke="#c9ccd1" stroke-width="2.5"/><path d="M120 176q2-8 4-10M124 176q1-9 5-12M128 176q2-6 6-8" stroke="#e0b25c" stroke-width="2" fill="none"/>')
    if "badges" in ex:  # a lanyard full of badges
        add('<path d="M88 150l12 24 12-24" fill="none" stroke="#2d6b7a" stroke-width="3"/><rect x="91" y="172" width="18" height="12" rx="2" fill="#f3f1ec"/><rect x="94" y="182" width="16" height="11" rx="2" fill="#e0b25c"/><rect x="90" y="190" width="16" height="10" rx="2" fill="#8dbcd4"/>')
    if "tabletchest" in ex:
        add(f'<rect x="56" y="160" width="40" height="40" rx="4" fill="#15181c" transform="rotate(-8 76 180)"/><rect x="60" y="164" width="32" height="32" rx="2" fill="#22405a" transform="rotate(-8 76 180)"/><ellipse cx="86" cy="188" rx="10" ry="7" fill="{sk}"/>')
    if "safetyup" in ex:  # safety glasses pushed up on the head
        add('<path d="M70 62q30-12 60 0v10q-30-10-60 0z" fill="#cfe0ea" fill-opacity=".55" stroke="#8a9098" stroke-width="1.5"/>')
    if "polo" in ex:
        add('<path d="M86 148l14 10 14-10-6 8-8 4-8-4z" fill="#000" opacity=".2"/><path d="M100 158v16" stroke="#000" stroke-opacity=".25" stroke-width="2"/><circle cx="100" cy="164" r="1.5" fill="#e8e6e0"/><circle cx="100" cy="171" r="1.5" fill="#e8e6e0"/>')
    if "beard_dark" in ex:
        add('<path d="M70 100q0 36 30 38t30-38q-6 14-14 16h-32q-8-2-14-16z" fill="#2a1f1a"/><path d="M88 112q12-5 24 0" stroke="#2a1f1a" stroke-width="4" fill="none"/>')
    if "beard_red" in ex:
        add('<path d="M70 100q0 38 30 40t30-40q-6 14-14 16h-32q-8-2-14-16z" fill="#a8532a"/><path d="M88 112q12-5 24 0" stroke="#a8532a" stroke-width="4" fill="none"/>')
    if "missionpatch" in ex:
        add('<circle cx="124" cy="176" r="8" fill="#23395b" stroke="#e0b25c" stroke-width="2"/><path d="M118 178q6-8 12 0" stroke="#c4532f" stroke-width="2.5" fill="none"/>')
    if "laptoparm" in ex:  # laptop open on one forearm
        add(f'<path d="M50 204l28-20" stroke="#111" stroke-width="16" stroke-linecap="round"/><path d="M60 170l40 -6 4 22-40 6z" fill="#9aa4ad"/><path d="M58 192l46-6 2 6-46 6z" fill="#6b6f75"/><ellipse cx="62" cy="194" rx="8" ry="6" fill="{sk}"/>')
    if "earmuffs" in ex:  # hearing protection around the neck
        add('<path d="M74 146q26 18 52 0" fill="none" stroke="#c0473b" stroke-width="5"/><rect x="66" y="138" width="16" height="20" rx="6" fill="#c0473b"/><rect x="118" y="138" width="16" height="20" rx="6" fill="#c0473b"/>')
    if "canvas" in ex:  # canvas work jacket, pocket corners worn through
        add('<path d="M64 200l14-44M136 200l-14-44" stroke="#000" stroke-opacity=".15" stroke-width="3"/><rect x="62" y="176" width="22" height="18" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/><rect x="116" y="176" width="22" height="18" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/><path d="M62 194l4-3M138 194l-4-3M116 176l3 3" stroke="#e8dcc0" stroke-width="2.5"/>')
    if "whitestubble" in ex:
        add('<path d="M76 104q4 26 24 28t24-28" fill="none" stroke="#eceae6" stroke-opacity=".55" stroke-width="9" stroke-linecap="round" stroke-dasharray="1.5 2.5"/>')
    if "fadedcap" in ex:  # faded Air Force ball cap
        add('<path d="M64 72c4-22 18-32 36-32s32 10 36 32z" fill="#5f6f8a"/><path d="M58 72h86c-2 4-8 7-14 7H66c-4 0-8-3-8-7z" fill="#4f5e78"/><text x="100" y="64" font-size="10" text-anchor="middle" fill="#d9dde6" fill-opacity=".8" font-family="Arial" font-weight="700">USAF</text>')
    if "dirtab" in ex:  # director's collar tab on the coverall
        add('<rect x="112" y="152" width="12" height="8" rx="1" fill="#e0b25c"/><rect x="76" y="152" width="12" height="8" rx="1" fill="#e0b25c"/>')
    if "officialsmile" in ex:
        add('<path d="M90 119q10 4 20 0" stroke="#5a2e2e" stroke-width="3" fill="none" stroke-linecap="round"/>')
    if "photoframe" in ex:  # a framed photograph held against the chest, a teenage boy in it, kept simple
        add(f'<rect x="70" y="160" width="60" height="44" rx="2" fill="#6b4a2a"/><rect x="76" y="166" width="48" height="38" fill="#8dbcd4"/><circle cx="100" cy="180" r="7" fill="#5b3a29"/><path d="M88 204q0-14 12-14t12 14z" fill="#2d6b7a"/>'
            f'<ellipse cx="70" cy="184" rx="9" ry="7" fill="{sk}"/><ellipse cx="130" cy="184" rx="9" ry="7" fill="{sk}"/>')
    if "tweed" in ex:  # rumpled tweed over a black T shirt
        add(clip + '<g clip-path="url(#cl2)" stroke="#3a2a1a" stroke-opacity=".25" stroke-width="1">' + "".join(f'<path d="M{x} 146l6 56"/>' for x in range(40, 164, 6)) + '</g>'
            '<path d="M84 150l16 32 16-32z" fill="#151515"/><path d="M80 152l12 30M120 152l-12 30" stroke="#000" stroke-opacity=".3" stroke-width="2"/>')
    if "drone" in ex:  # a folded camera drone
        add('<rect x="118" y="182" width="40" height="16" rx="4" fill="#2b2f36"/><path d="M118 186h-8M158 186h8M118 194h-8M158 194h8" stroke="#2b2f36" stroke-width="3"/><circle cx="138" cy="190" r="4" fill="#5aa0d8"/>')
    if "flightsuit" in ex:  # navy flight suit: zip, name tape, the Halcyon patch
        add('<path d="M100 152v48" stroke="#c9ccd1" stroke-width="2"/><path d="M84 150l16 6 16-6-4 8-12 4-12-4z" fill="#000" opacity=".2"/><rect x="66" y="170" width="24" height="7" rx="1" fill="#d9dde3" opacity=".85"/>'
            '<circle cx="124" cy="176" r="9" fill="#f3f1ec"/><circle cx="124" cy="176" r="7" fill="#1f3a5f"/><path d="M118 179q6-9 12 0" stroke="#e0b25c" stroke-width="2" fill="none"/><circle cx="127" cy="172" r="1.6" fill="#c4532f"/>')
    if "medpatch" in ex:
        add('<rect x="117" y="188" width="14" height="10" rx="1" fill="#f3f1ec"/><path d="M124 189v8M120 193h8" stroke="#c0473b" stroke-width="2.5"/>')
    if "rolled" in ex:  # sleeves rolled to the elbow, the cuff at each shoulder edge
        add('<path d="M44 190q6-6 14-4M156 190q-6-6-14-4" stroke="#000" stroke-opacity=".25" stroke-width="4" fill="none"/>')
    if "vest" in ex:  # fleece vest over a shirt: the vest panels, shirt showing at the shoulders
        add(clip + '<g clip-path="url(#cl2)"><path d="M62 150q-12 20-14 52h38l12-48zM138 150q12 20 14 52h-38l-12-48z" fill="#3a4a3a"/></g><path d="M100 160v40" stroke="#c9ccd1" stroke-width="2"/>')
    if "quilted" in ex:  # quilted vest over a collared shirt
        add(clip + '<g clip-path="url(#cl2)"><path d="M60 150q-12 20-14 52h40l12-48zM140 150q12 20 14 52h-40l-12-48z" fill="#3a4658"/>'
            + "".join(f'<path d="M44 {y}h112" stroke="#000" stroke-opacity=".2" stroke-width="1.5"/>' for y in range(160, 200, 8)) + '</g><path d="M86 148l14 12 14-12" fill="#f3f1ec" opacity=".85"/>')
    if "steelbadge" in ex:  # an old steel company badge on a frayed lanyard
        add('<path d="M86 150l12 22M114 150l-12 22" stroke="#7a6a55" stroke-width="2.5" stroke-dasharray="5 1.5"/><rect x="92" y="170" width="18" height="22" rx="3" fill="#a9b0b8" stroke="#6b6f75" stroke-width="1.5"/><path d="M96 177h10M96 182h8" stroke="#4a4e54" stroke-width="1.5"/>')
    if "earflap" in ex:  # knit cap with ear flaps
        add('<path d="M64 80c0-28 16-42 36-42s36 14 36 42z" fill="#2d6b7a"/><path d="M64 78h72v8H64z" fill="#24596a"/><path d="M60 82h14v26q-7 6-14 0zM126 82h14v26q-7 6-14 0z" fill="#2d6b7a"/>'
            '<path d="M67 108v18M133 108v18" stroke="#e8e6e0" stroke-width="2"/>' + "".join(f'<path d="M{x} 48v28" stroke="#24596a" stroke-width="2"/>' for x in range(74, 130, 8)))
    if "reflect" in ex:  # insulated coveralls with reflective tape, gloves in the chest pocket
        add('<path d="M48 178h104M44 190h112" stroke="#d9e04a" stroke-width="5" opacity=".85"/><path d="M48 178h104M44 190h112" stroke="#f3f1ec" stroke-width="1.5" opacity=".7"/>'
            '<path d="M84 150l-6 10 22 2 22-2-6-10" fill="#000" opacity=".18"/><path d="M110 160l4-12 6 0 2 12zM118 160l5-10 5 2 0 8z" fill="#a8743a"/>')
    if "pens" in ex:  # a pen in every pocket
        add('<rect x="112" y="166" width="20" height="14" rx="1" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/><rect x="68" y="166" width="20" height="14" rx="1" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/>'
            + "".join(f'<rect x="{x}" y="158" width="3" height="12" rx="1" fill="{c}"/>' for x, c in ((114, "#c0473b"), (119, "#23395b"), (124, "#2f7a4a"), (72, "#e0b25c"), (78, "#23395b"))))
    if "laptopunder" in ex:
        add('<rect x="132" y="168" width="34" height="8" rx="2" fill="#9aa4ad" transform="rotate(-10 150 172)"/>')
    if "bowtie" in ex:
        add('<path d="M86 148l14 10 14-10" fill="#f3f1ec" opacity=".85"/><path d="M90 156l10 5 10-5v10l-10-5-10 5z" fill="#7a2e3a"/><circle cx="100" cy="161" r="2.5" fill="#5a1e2a"/><path d="M92 158l2 2M106 158l2 2" stroke="#e0b25c" stroke-width="1.5"/>')
    if "halfup" in ex:  # half glasses pushed up on the forehead
        add('<g fill="none" stroke="#333" stroke-width="2.5"><path d="M80 66h17q-2 7-8 7t-9-7zM103 66h17q-2 7-8 7t-9-7zM97 67h6"/></g>')
    if "binders" in ex:
        add('<rect x="132" y="166" width="12" height="36" rx="1" fill="#2a3f6a"/><rect x="144" y="164" width="12" height="38" rx="1" fill="#7a2e3a"/><rect x="128" y="172" width="4" height="6" fill="#e0b25c"/><rect x="140" y="182" width="4" height="6" fill="#4f9a5a"/>')
    if "greasepencil" in ex:
        add('<rect x="128" y="64" width="5" height="26" rx="2" fill="#c0473b" transform="rotate(22 130 77)"/><rect x="128" y="64" width="5" height="6" rx="1" fill="#e8e2d0" transform="rotate(22 130 77)"/>')
    if "tabbook" in ex:  # a thick paper notebook with colored tabs
        add(f'<rect x="58" y="166" width="38" height="34" rx="2" fill="#3a2f2a"/><rect x="96" y="170" width="5" height="6" fill="#e0b25c"/><rect x="96" y="178" width="5" height="6" fill="#4f9a5a"/><rect x="96" y="186" width="5" height="6" fill="#c0473b"/><ellipse cx="62" cy="190" rx="8" ry="6" fill="{sk}"/>')
    if "shortsleeve" in ex:  # short sleeved shirt with a steel company badge clipped to the pocket
        add('<path d="M86 148l14 12 14-12" fill="#f3f1ec" opacity=".85"/><rect x="110" y="168" width="20" height="16" rx="1" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/><rect x="113" y="162" width="14" height="18" rx="2" fill="#a9b0b8" stroke="#6b6f75" stroke-width="1.2"/>')
    if "cord" in ex:  # a plain cord for the glasses
        add('<path d="M77 99q-6 30 10 46M123 99q6 30-10 46" fill="none" stroke="#3a3d44" stroke-width="1.5"/>')
    if "cranepatches" in ex:  # high bay jacket with crane certification patches, a legal pad under one arm
        add('<rect x="114" y="166" width="14" height="10" rx="2" fill="#e0b25c"/><rect x="114" y="180" width="14" height="10" rx="2" fill="#4f9a5a"/><rect x="130" y="172" width="10" height="10" rx="5" fill="#c0473b"/><path d="M100 152v48" stroke="#c9ccd1" stroke-width="2"/>'
            '<rect x="50" y="164" width="30" height="40" rx="1" fill="#f2d65a" transform="rotate(-10 65 184)"/><path d="M54 172h20M54 178h20M54 184h16" stroke="#9a8a3a" stroke-width="1" transform="rotate(-10 65 184)"/>')
    if "icedcoffee" in ex:
        add(f'<path d="M134 158h22l-3 40h-16z" fill="#e8eef3" fill-opacity=".75"/><path d="M136 172h18l-2 26h-14z" fill="#8a6a47"/><path d="M146 148v14" stroke="#2d6b7a" stroke-width="3"/><circle cx="140" cy="168" r="1.2" fill="#fff"/><circle cx="150" cy="180" r="1.2" fill="#fff"/><ellipse cx="144" cy="190" rx="10" ry="7" fill="{sk}"/>')
    if "smalllogo" in ex:  # a small agency logo on a fleece
        add('<path d="M100 150v50" stroke="#c9ccd1" stroke-width="2.5"/><circle cx="124" cy="170" r="5" fill="none" stroke="#e0b25c" stroke-width="2"/><path d="M86 150l14 10 14-10" fill="#f3f1ec" opacity=".85"/>')
    if "graystreak" in ex:  # a gray streak back from the part
        add('<path d="M104 42q14 4 22 18q4 6 6 14" stroke="#c9ccd1" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>')
    if "doccap" in ex:  # squadron cap with a black doctor's bag patch and the word DOC
        add('<path d="M64 72c4-22 18-32 36-32s32 10 36 32z" fill="#3a4a3a"/><path d="M58 72h86c-2 4-8 7-14 7H66c-4 0-8-3-8-7z" fill="#2e3c2e"/><path d="M86 50h12v9H86z" fill="#151515"/><path d="M89 50q3-4 6 0" stroke="#151515" stroke-width="1.5" fill="none"/><text x="112" y="59" font-size="9" text-anchor="middle" fill="#e8e6e0" font-family="Arial" font-weight="700">DOC</text>')
    if "rangepin" in ex:  # a small range safety pin on the lapel
        add('<circle cx="122" cy="168" r="3.5" fill="#e0b25c"/><path d="M122 164.5v7M118.5 168h7" stroke="#7a2e2a" stroke-width="1.2"/>')
    if "steady" in ex:  # level brows, steady and unimpressed
        add('<path d="M79 84h14M107 84h14" stroke="#9a9da3" stroke-width="2.5" stroke-linecap="round"/>')
    return "".join(out)


ns["ns"]["ns"]["hair"], ns["ns"]["ns"]["extras"] = hair, extras  # the base svg() (two namespaces down: CISA -> pilot -> base) looks these up

# backdrops drawn behind the figure, right after the backdrop circle
SCREENDOOR = ('<rect x="24" y="20" width="152" height="180" fill="#5a4a3a"/><rect x="34" y="30" width="132" height="170" fill="#3a3530"/>'
              + "".join(f'<path d="M34 {y}h132" stroke="#6b6f75" stroke-opacity=".35" stroke-width="1"/>' for y in range(32, 200, 4))
              + "".join(f'<path d="M{x} 30v170" stroke="#6b6f75" stroke-opacity=".35" stroke-width="1"/>' for x in range(36, 166, 4))
              + '<path d="M34 104h132" stroke="#5a4a3a" stroke-width="6"/>')
PHOTO = '<rect x="0" y="0" width="200" height="200" fill="#6b5a44"/><circle cx="100" cy="100" r="96" fill="#9a8466"/>'


def svg(cid, skin, style, col, outfit, ex):
    s = _cisa_svg(cid, skin, style, col, outfit, ex)
    if "screendoor" in ex:
        s = s.replace(BG, BG + SCREENDOOR, 1)
    if "photo" in ex:  # a company photograph from the 2030s: warm, faded backdrop
        s = s.replace('<rect width="200" height="200" fill="#16303f"/>' + BG, PHOTO, 1)
    flat = '<path d="M92 120h16" stroke="#5a2e2e" stroke-width="3" stroke-linecap="round"/>'
    if "officialsmile" in ex:
        s = s.replace(flat, "", 1)
    return s


def load_cast():
    """Ids and looks from full/v2/cast.js, read with node so the list can't drift."""
    import json, subprocess
    js = "global.window={};require(process.argv[1]);console.log(JSON.stringify(window.HALCYON_CAST.map(c=>[c.id,c.look])))"
    return json.loads(subprocess.check_output(["node", "-e", js, os.path.join(ROOT, "full", "v2", "cast.js")]))


# id: skin, hair style, hair color, outfit, extras  (see `look` in full/v2/cast.js)
C = {
 "sam": ("deep", "crop", "black", "#3a4a5a", ["graytemple", "glasseshead", "fleece", "lines"]),
 "ada": ("brown", "twists", "black", "#c9773a", ["headband", "coverall", "watch"]),
 "ruth": ("fair", "shortwhite", "white", "#7a7d82", ["glasseschain", "cardigan", "greenpen", "lines"]),
 "imogen": ("light", "chinbob", "silver", "#22252f", ["highcollar", "blazer", "flagpin"]),
 "garrett": ("tanned", "thinning", "sandy", "#2f4a3a", ["quarterzip", "grin", "lines"]),
 "quinn": ("fair", "lowknot", "midbrown", "#8a7a6a", ["cardigan", "badges", "tabletchest"]),
 "hana": ("light", "chinbob", "black", "#6b6f75", ["safetyup", "polo", "tired"]),
 "rafa": ("tan", "short", "dark", "#1c1c1f", ["beard_dark", "hoodie", "missionpatch", "laptoparm"]),
 "wendell": ("deep", "crew", "white", "#b39a6a", ["canvas", "earmuffs", "whitestubble", "lines"]),
 "bea": ("fair", "shoulder", "grayblond", "#22324a", ["zip", "tired"]),
 "ray": ("tan", "short", "white", "#6a6f62", ["screendoor", "fadedcap", "mustache", "lines", "collar"]),
 "hollis": ("light", "shaved", "gray", "#c9773a", ["coverall", "dirtab", "officialsmile", "ruddy"]),
 "frances": ("deep", "closecrop", "black", "#9a2f2a", ["upcollar", "photoframe"]),
 "simon": ("fair", "messy", "midbrown", "#6a5a44", ["tweed", "stubble", "drone"]),
 "yusra": ("olive", "pulledback", "dark", "#1f2f4f", ["flightsuit", "rolled"]),
 "paloma": ("tan", "lowknot", "black", "#c9d6e4", ["vest", "safetyup", "pen"]),
 "nell": ("fair", "pulledback", "saltpep", "#7a6a50", ["collar", "steelbadge", "lines"]),
 "arlo": ("fair", "short", "red", "#2a3a4f", ["earflap", "beard_red", "reflect"]),
 "peg": ("light", "pixie", "saltpep", "#7a5a6a", ["glasses_cat", "cardigan", "pens", "laptopunder"]),
 "calvin": ("fair", "neat", "gray", "#4a4f5a", ["bowtie", "halfup", "binders", "blazer"]),
 "chiamaka": ("deep", "closecrop", "black", "#c9773a", ["coverall", "rolled", "greasepencil"]),
 "thandi": ("deep", "locs", "gray", "#e8e2d0", ["glasses_rect", "quilted", "tabbook"]),
 "emmett": ("light", "crew", "gray", "#dfe6ee", ["photo", "glasses_half", "cord", "shortsleeve"]),
 "corinne": ("fair", "shortpractical", "blond", "#2d4a6a", ["cranepatches"]),
 "delphine": ("sunburn", "short", "saltpep", "#2d6b7a", ["glasseshead", "polo", "icedcoffee", "lines"]),
 "ilse": ("light", "braid1", "sandy", "#1f2f4f", ["flightsuit", "lines"]),
 "mateo": ("warmbrown", "crew", "black", "#1f2f4f", ["flightsuit", "rolled", "glasseschain", "pens"]),
 "anjali": ("warmbrown", "pulledback", "dark", "#1f2f4f", ["flightsuit", "medpatch", "graystreak"]),
 "lorna": ("deep", "closecrop", "gray", "#2a3a5a", ["glasses_rimless", "smalllogo", "coffees"]),
 "esther": ("fair", "short", "darkgray", "#22252f", ["glasses_half", "cord", "blazer", "collar", "rangepin"]),
 "leo": ("olive", "short", "dark", "#4a5a3a", ["photo", "doccap", "flightsuit", "rolled", "grin"]),
}

if __name__ == "__main__":
    cast = load_cast()
    missing = [cid for cid, _ in cast if cid not in C]
    if missing:
        raise SystemExit(f"no portrait spec for: {', '.join(missing)}")
    out = os.path.join(ROOT, "cast", "v2")
    os.makedirs(out, exist_ok=True)
    for cid, _ in cast:
        skin, style, col, outfit, ex = C[cid]
        open(os.path.join(out, f"{cid}.svg"), "w").write(svg(cid, skin, style, col, outfit, ex))
    print(len(cast), "v2 portraits ->", out)
