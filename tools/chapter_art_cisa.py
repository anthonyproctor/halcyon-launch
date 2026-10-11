"""Draw animated SVG banners for the CISA chapters ("Exception Noted") -> courses/cisa/art/full-chNN.svg.
Shares the palette, STYLE animation classes, frame() and grad() from tools/chapter_art.py (loaded without running
its PMP writer). Classes of its own ride in through frame()'s sky slot, inside the same prefers-reduced-motion
guard, so a reader who asks for less motion gets the still frame. Run from the repo root."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_src = open(os.path.join(ROOT, "tools", "chapter_art.py")).read()
ns = {}
exec(_src.split("A={}")[0], ns)  # palette, W, H, STYLE, frame, grad; the PMP banners are not written
BG, DK, MID, TEAL, LT, AMB, CRM, RED, GRN = (ns[k] for k in ("BG", "DK", "MID", "TEAL", "LT", "AMB", "CRM", "RED", "GRN"))
W, H, frame = ns["W"], ns["H"], ns["frame"]
INK = "#2f7a4a"    # Dot's green ink
COZY = "#4f7a45"   # the green tea cozy she knitted
CHINA = "#ece7dc"

EXTRA = ('<style>@media (prefers-reduced-motion:no-preference){\n'
 # steam that isn't there: a faint wisp over a cold pot that never quite arrives
 '.ghost{animation:ghost 9s ease-in-out infinite}@keyframes ghost{0%,55%{opacity:0;transform:translateY(6px)}72%{opacity:.32}100%{opacity:0;transform:translateY(-22px)}}\n'
 '.ghost2{animation:ghost 9s ease-in-out 1.4s infinite}\n'
 # dawn light sliding slowly across the folder
 '.sweep{animation:sweep 16s ease-in-out infinite alternate}@keyframes sweep{from{transform:translateX(-150px)}to{transform:translateX(150px)}}\n'
 # the window brightening by degrees
 '.dawn{animation:dawn 20s ease-in-out infinite alternate}@keyframes dawn{from{opacity:.15}to{opacity:.6}}\n'
 # a slow clock: second hand once a minute, minute hand once an hour
 '.sec{animation:spin 60s linear infinite;transform-box:view-box;transform-origin:1068px 118px}\n'
 '.min{animation:spin 3600s linear infinite;transform-box:view-box;transform-origin:1068px 118px}@keyframes spin{to{transform:rotate(360deg)}}\n'
 # office lights coming on and dust turning in the window light
 '.on1{animation:on 14s infinite}@keyframes on{0%,40%{opacity:.15}46%,100%{opacity:.85}}\n'
 '.on2{animation:on 14s 5s infinite}\n'
 '.mote{animation:mote 12s ease-in-out infinite alternate}@keyframes mote{to{transform:translate(26px,-18px)}}\n'
 '}</style>')
frame2 = lambda inner, sky: frame(inner, EXTRA + sky)

A = {}

# 1 Exception Noted: the corner room at the Brown Palace just after six, the sky over the office towers gone to
#   dishwater gray. The armchair by the window is turned to face the door, empty, with Henry's card on the seat.
#   On the low table: the tray with the teapot under its lumpy green cozy, two cups (one with an inch of cold tea,
#   one turned over, clean), the sugar packets torn into strips, and the manila folder with a red tab under her
#   folded reading glasses and their beaded chain, a yellow sticky note in the margin. Steam that isn't there,
#   light moving across the folder, a clock on the wall going slowly.
towers_far = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{300 - y}" fill="#6f7a84"/>' for x, y, w in
                     ((84, 150, 50), (150, 118, 40), (196, 160, 36), (300, 132, 44), (360, 104, 38), (412, 150, 44)))
towers_near = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{300 - y}" fill="#47515c"/>' for x, y, w in
                      ((96, 196, 64), (230, 140, 62), (330, 182, 56), (398, 214, 58)))
lit = "".join(f'<rect class="{c}" x="{x}" y="{y}" width="6" height="5" fill="#ecd29a" opacity=".85"/>' for x, y, c in
              ((104, 206, ""), (124, 226, "on1"), (144, 206, ""), (240, 152, "on2"), (256, 172, ""), (272, 192, "on1"),
               (240, 212, ""), (340, 194, "on2"), (356, 214, ""), (408, 226, "on1"), (430, 246, ""), (272, 232, "on2")))
pattern = "".join(f'<path d="M{x} 0V330" stroke="#ffffff" stroke-opacity=".035" stroke-width="10"/>' for x in range(530, 1200, 46))
sugar = "".join(f'<path d="M{640 + i * 13} 436l7 0 5-22-7 0z" fill="{c}"/>' for i, c in
                enumerate(("#f3f1ec", "#f3f1ec", "#efc6cf", "#f3f1ec", "#efc6cf", "#f3f1ec", "#9fc0de", "#f3f1ec")))
beads = "".join(f'<circle cx="{x}" cy="{y}" r="2.1" fill="#7fa6c9"/>' for x, y in
                ((986, 412), (980, 407), (973, 406), (967, 411), (966, 418), (970, 425), (977, 428), (985, 427), (992, 431), (1000, 433), (1009, 432)))

A[1] = frame2(f'''<rect width="{W}" height="330" fill="#2c303a"/>{pattern}
<rect y="232" width="{W}" height="6" fill="#3d4250"/><rect y="238" width="{W}" height="92" fill="#262a33"/>
<rect y="326" width="{W}" height="154" fill="#3a2a2d"/><rect y="326" width="{W}" height="6" fill="#4a3638"/>
<path d="M0 360H1200M0 400H1200M0 446H1200" stroke="#000" stroke-opacity=".08" stroke-width="2"/>
<rect x="70" y="30" width="416" height="284" rx="4" fill="#cdbf9f"/>
<rect x="84" y="44" width="388" height="256" fill="url(#sky1)"/>
<rect class="dawn" x="84" y="44" width="388" height="256" fill="url(#warm1)" opacity=".4"/>
{towers_far}{towers_near}{lit}
<path d="M276 44v256M84 166h388" stroke="#cdbf9f" stroke-width="8"/>
<rect x="56" y="298" width="444" height="16" rx="2" fill="#d8cbab"/>
<path d="M40 14Q30 180 46 340H96Q78 180 104 14Z" fill="#5b3a3a"/><path d="M60 30q-6 150 6 300M80 30q-8 150 2 300" stroke="#000" stroke-opacity=".18" stroke-width="3" fill="none"/>
<path d="M516 14Q526 180 510 340H460Q478 180 452 14Z" fill="#5b3a3a"/><path d="M496 30q6 150-6 300M476 30q8 150-2 300" stroke="#000" stroke-opacity=".18" stroke-width="3" fill="none"/>
<rect x="24" y="6" width="508" height="22" rx="4" fill="#4a2e2f"/>
<path d="M100 314L476 314L820 480L-40 480Z" fill="#f3f1ec" opacity=".05"/>
<g class="mote"><circle cx="420" cy="360" r="1.6" fill="#f3f1ec" opacity=".35"/><circle cx="520" cy="392" r="1.3" fill="#f3f1ec" opacity=".3"/><circle cx="350" cy="404" r="1.2" fill="#f3f1ec" opacity=".3"/></g>
<ellipse cx="286" cy="404" rx="128" ry="10" fill="#000" opacity=".3"/>
<path d="M188 330V206q0-42 46-46h104q46 4 46 46v124z" fill="#6b3f3a"/>
<path d="M212 200q74-26 148 0" stroke="#000" stroke-opacity=".14" stroke-width="4" fill="none"/>
<path d="M188 300v-80q-22 6-26 30v52zM384 300v-80q22 6 26 30v52z" fill="#5e3632"/>
<rect x="196" y="300" width="180" height="40" rx="12" fill="#7d4a44"/>
<rect x="148" y="286" width="56" height="84" rx="18" fill="#5e3632"/><rect x="368" y="286" width="56" height="84" rx="18" fill="#5e3632"/>
<rect x="148" y="286" width="56" height="16" rx="8" fill="#734540"/><rect x="368" y="286" width="56" height="16" rx="8" fill="#734540"/>
<rect x="160" y="340" width="252" height="52" rx="6" fill="#5e3632"/><path d="M160 360h252" stroke="#000" stroke-opacity=".15" stroke-width="2"/>
<path d="M176 392v12M396 392v12" stroke="#2a1c18" stroke-width="7" stroke-linecap="round"/>
<g transform="rotate(-10 288 316)"><rect x="274" y="308" width="30" height="18" rx="1.5" fill="#f3f1ec"/><circle cx="281" cy="317" r="3.4" fill="#2c4a8a"/><path d="M288 314h11M288 319h8" stroke="#9aa4ad" stroke-width="1.4"/></g>
<rect x="584" y="56" width="140" height="104" rx="3" fill="#8a7a5a"/><rect x="594" y="66" width="120" height="84" fill="#3b4656"/>
<path d="M594 150L630 112L652 128L676 98L714 150Z" fill="#5b6878"/><path d="M670 104l6-6 6 8z" fill="#c9ccd1"/>
<circle cx="1068" cy="118" r="54" fill="#8a7a5a"/><circle cx="1068" cy="118" r="46" fill="{CRM}"/>
{"".join(f'<path d="M1068 76v8" stroke="#2c303a" stroke-width="{3 if i % 3 == 0 else 1.5}" transform="rotate({i * 30} 1068 118)"/>' for i in range(12))}
<path d="M1068 118l-1-26" stroke="#2c303a" stroke-width="4" stroke-linecap="round" transform="rotate(-173 1068 118)"/>
<g class="min"><path d="M1068 118v-36" stroke="#2c303a" stroke-width="3" stroke-linecap="round" transform="rotate(84 1068 118)"/></g>
<g class="sec"><path d="M1068 124v-40" stroke="{RED}" stroke-width="1.5" stroke-linecap="round" transform="rotate(200 1068 118)"/></g>
<circle cx="1068" cy="118" r="3.5" fill="#2c303a"/>
<ellipse cx="836" cy="474" rx="330" ry="10" fill="#000" opacity=".28"/>
<path d="M560 332L1110 332L1176 440L494 440Z" fill="#5a3a28"/><path d="M560 332L1110 332L1120 348L550 348Z" fill="#000" opacity=".12"/>
<rect x="494" y="440" width="682" height="18" fill="#432a1d"/>
<path d="M512 458v22M1158 458v22" stroke="#2f1e15" stroke-width="12"/>
<path d="M596 346L896 346L916 410L578 410Z" fill="#b9bcc2"/><path d="M596 346L896 346L900 354L593 354Z" fill="#d7dade"/>
<path d="M578 410L916 410L914 416L580 416Z" fill="#8f949b"/>
<path d="M630 372L598 344" stroke="{CHINA}" stroke-width="12" stroke-linecap="round"/><path d="M598 344l-6-6" stroke="{CHINA}" stroke-width="7" stroke-linecap="round"/>
<g fill="none" stroke="{LT}" stroke-width="3" stroke-linecap="round"><path class="ghost" opacity="0" d="M590 326q-8-12 0-24t0-24"/><path class="ghost2" opacity="0" d="M602 324q8-12 0-24t0-22"/></g>
<path d="M724 358q20 0 20 16t-20 16" fill="none" stroke="{CHINA}" stroke-width="7"/>
<path d="M626 398Q620 312 676 304Q732 312 726 398Z" fill="{COZY}"/>
<g fill="{COZY}"><circle cx="644" cy="318" r="11"/><circle cx="662" cy="307" r="11"/><circle cx="690" cy="307" r="11"/><circle cx="708" cy="318" r="11"/><circle cx="632" cy="344" r="9"/><circle cx="720" cy="344" r="9"/></g>
<g stroke="#5f8c54" stroke-width="4" stroke-linecap="round">{"".join(f'<path d="M{x} {318 if 640 < x < 712 else 336}V384"/>' for x in range(636, 722, 12))}</g>
<rect x="623" y="384" width="106" height="14" rx="3" fill="#456b3c"/><path d="{"".join(f"M{x} 386v10" for x in range(628, 728, 6))}" stroke="#5f8c54" stroke-width="2"/>
<circle cx="676" cy="296" r="11" fill="#6a9a5c"/><circle cx="676" cy="296" r="11" fill="none" stroke="#3a5c33" stroke-width="2" stroke-dasharray="3 3"/>
<path d="M756 400l-2-30q0-6 6-8h14l6-6 4 4-6 6v34z" fill="{CHINA}"/><ellipse cx="768" cy="400" rx="15" ry="3" fill="#000" opacity=".12"/>
<ellipse cx="818" cy="398" rx="28" ry="7" fill="{CHINA}"/><ellipse cx="818" cy="397" rx="19" ry="3.5" fill="#000" opacity=".06"/>
<path d="M801 366h34l-4 28q-13 6-26 0z" fill="{CHINA}"/><ellipse cx="818" cy="366" rx="17" ry="4" fill="#d4cdbf"/><ellipse cx="818" cy="368" rx="14" ry="2.6" fill="#6b4a2a"/>
<path d="M835 372q12 0 12 10t-12 10" fill="none" stroke="{CHINA}" stroke-width="5"/>
<path d="M802 374h32" stroke="{INK}" stroke-width="2" opacity=".55"/>
<ellipse cx="870" cy="374" rx="22" ry="5.5" fill="{CHINA}"/>
<path d="M856 372h28l-4-22q-10-4-20 0z" fill="{CHINA}"/><rect x="862" y="345" width="16" height="5" rx="2" fill="#d4cdbf"/>
<path d="M858 362h24" stroke="{INK}" stroke-width="2" opacity=".55"/>
{sugar}
<path d="M940 352L1112 346L1146 432L956 440Z" fill="#d9b97a"/><path d="M944 362L1114 356" stroke="#b89a5c" stroke-width="2"/>
<path d="M1036 340L1096 338L1100 350L1040 352Z" fill="{RED}"/>
<text x="1042" y="348.5" font-family="Arial" font-weight="700" font-size="7.5" fill="#f3f1ec" transform="rotate(-2 1068 346)">MC W/P 1</text>
<g clip-path="url(#fold1)"><g class="sweep"><rect x="1000" y="330" width="90" height="120" fill="url(#beam1)" transform="skewX(-18) translate(110 0)"/></g></g>
<path d="M968 372L1050 368M970 382L1064 378M972 392L1040 389" stroke="{INK}" stroke-width="2" opacity=".7"/>
<circle cx="1074" cy="378" r="7" fill="none" stroke="{INK}" stroke-width="2.2"/>
<g transform="rotate(5 1112 412)"><rect x="1094" y="394" width="36" height="34" fill="#f2d65a"/><path d="M1099 403h24M1099 410h20M1099 417h14" stroke="#5a5a3a" stroke-width="1.6" opacity=".7"/></g>
{beads}
<g transform="rotate(-4 1021 416)"><ellipse cx="1002" cy="416" rx="16" ry="9.5" fill="#cfe0ea" fill-opacity=".35" stroke="#2b2b2b" stroke-width="3"/><ellipse cx="1040" cy="416" rx="16" ry="9.5" fill="#cfe0ea" fill-opacity=".35" stroke="#2b2b2b" stroke-width="3"/>
<path d="M1018 414q3-4 6 0" stroke="#2b2b2b" stroke-width="3" fill="none"/><path d="M988 409L1054 408" stroke="#2b2b2b" stroke-width="2.5"/></g>''',
 f'<defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6470"/><stop offset=".6" stop-color="#8f979c"/><stop offset="1" stop-color="#b9b8ad"/></linearGradient>'
 f'<linearGradient id="warm1" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#e8c58e" stop-opacity="0"/><stop offset="1" stop-color="#e8c58e"/></linearGradient>'
 f'<linearGradient id="beam1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6dc" stop-opacity="0"/><stop offset=".5" stop-color="#fff6dc" stop-opacity=".45"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></linearGradient>'
 f'<clipPath id="fold1"><path d="M940 352L1112 346L1146 432L956 440Z"/></clipPath></defs>'
 f'<rect width="{W}" height="{H}" fill="{BG}"/>')

if __name__ == "__main__":
    out = os.path.join(ROOT, "courses", "cisa", "art")
    os.makedirs(out, exist_ok=True)
    for n, s in A.items():
        open(os.path.join(out, f"full-ch{n:02d}.svg"), "w").write(s)
    print(len(A), "cisa banners ->", out)
