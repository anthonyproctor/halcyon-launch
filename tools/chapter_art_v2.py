"""Draw animated SVG banners for The Halcyon Launch v2 (the PMP book, Mars relief ship) -> art/v2/full-chNN.svg.
Shares the palette, STYLE animation classes, frame() and grad() from tools/chapter_art.py (loaded without running
its v1 writer). Classes of its own ride in through frame()'s sky slot, inside the same prefers-reduced-motion guard,
so a reader who asks for less motion gets the still frame. One banner per written chapter, each the single most
specific image from that chapter (full/v2/chNN.js); chapters 13 to 15 aren't written yet, so they get nothing and
the engine drops the banner. Run from the repo root: python3 tools/chapter_art_v2.py"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_src = open(os.path.join(ROOT, "tools", "chapter_art.py")).read()
ns = {}
exec(_src.split("A={}")[0], ns)  # palette, W, H, STYLE, frame, grad; the v1 banners are not written
BG, DK, MID, TEAL, LT, AMB, CRM, RED, GRN = (ns[k] for k in ("BG", "DK", "MID", "TEAL", "LT", "AMB", "CRM", "RED", "GRN"))
W, H, frame = ns["W"], ns["H"], ns["frame"]

MARS = "#c4532f"     # Mars red
RUST = "#8a3a24"
PLAIN = "#a8915e"    # Colorado plains, dry grass
PLAIN2 = "#7d6a43"
NAVY = "#1f3a5f"     # mission control blue
SCREEN = "#5aa0d8"
INK = "#2f7a4a"      # Ruth's green ink
HAND = "font-family=\"'Bradley Hand','Segoe Print','Comic Sans MS',cursive\" font-weight=\"700\""
SANS = 'font-family="Arial,Helvetica,sans-serif" font-weight="700"'

EXTRA = ('<style>@media (prefers-reduced-motion:no-preference){\n'
 # the two note chime: rings spreading off the tablet
 '.ring{animation:ring 2.6s ease-out infinite;transform-box:fill-box;transform-origin:center;opacity:0}@keyframes ring{0%{opacity:.8;transform:scale(.6)}100%{opacity:0;transform:scale(1.6)}}\n'
 '.ring2{animation:ring 2.6s ease-out .45s infinite}\n'
 # snow driven sideways, two layers at different speeds
 '.snow{animation:snow 1.6s linear infinite}@keyframes snow{from{transform:translate(0,0)}to{transform:translate(-160px,120px)}}\n'
 '.snow2{animation:snow 2.6s linear infinite}\n'
 # slow drift for clouds and smoke
 '.drift{animation:drift 14s ease-in-out infinite alternate}@keyframes drift{to{transform:translateX(40px)}}\n'
 '.rise{animation:rise 9s ease-in-out infinite}@keyframes rise{0%{transform:translate(0,0);opacity:.0}20%{opacity:.5}100%{transform:translate(30px,-60px);opacity:0}}\n'
 # a beacon pulse travelling a path from Mars toward the Sun, fading before it gets through
 '.ping{animation:ping 5s linear infinite;opacity:0}@keyframes ping{0%{transform:translateX(0);opacity:0}10%{opacity:1}55%{opacity:.9}75%,100%{transform:translateX(-300px);opacity:0}}\n'
 '.ping2{animation:ping 5s linear 1.7s infinite}.ping3{animation:ping 5s linear 3.4s infinite}\n'
 # the heavy lifter creeping toward the hangar
 '.roll{animation:roll 24s ease-in-out infinite alternate}@keyframes roll{from{transform:translateX(0)}to{transform:translateX(-70px)}}\n'
 # palms and curtains bending in the wind
 '.bend{animation:bend 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}@keyframes bend{50%{transform:rotate(-7deg)}}\n'
 '.curtain{animation:curtain 6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}@keyframes curtain{50%{transform:skewX(-4deg)}}\n'
 # surf lines coming in, a glint off a key blank, a screen breathing
 '.surf{animation:surf 5s ease-in-out infinite}@keyframes surf{50%{transform:translateY(5px);opacity:.35}}\n'
 '.glint{animation:glint 2.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes glint{0%,60%,100%{opacity:0;transform:scale(.4)}75%{opacity:1;transform:scale(1)}}\n'
 '.breathe{animation:breathe 4s ease-in-out infinite}@keyframes breathe{50%{opacity:.78}}\n'
 '.dawn{animation:dawn 18s ease-in-out infinite alternate}@keyframes dawn{from{opacity:.25}to{opacity:.85}}\n'
 '.trace{stroke-dasharray:900;animation:trace 7s ease-out infinite}@keyframes trace{0%{stroke-dashoffset:900}55%,100%{stroke-dashoffset:0}}\n'
 '}</style>')
frame2 = lambda inner, defs="", bg=BG: frame(inner, EXTRA + defs + f'<rect width="{W}" height="{H}" fill="{bg}"/>')


def lg(id, *stops, x2=0, y2=1):
    s = "".join(f'<stop offset="{t[0]}" stop-color="{t[1]}"' + (f' stop-opacity="{t[2]}"' if len(t) > 2 else "") + '/>' for t in stops)
    return f'<linearGradient id="{id}" x1="0" y1="0" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rg(id, *stops):
    s = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<radialGradient id="{id}">{s}</radialGradient>'


A = {}

# 1 Twenty Six Months. Monday, January 10, 2061, 5:40 AM, the kitchen in Aurora. The tablet on the table makes the two
#   note chime it only makes for Mars (Ada's log, sol 3518). The coffee maker sighs on the counter. Out the back window
#   the yard is dark and the neighbor's motion light clicks on for a rabbit. On the table by the fruit bowl, the gas bill,
#   turned over, with 952 and 969 on the back in Sam's hand and the difference under the line: minus seventeen.
#   On the pantry door frame, Ada's pencil height marks.
marks = "".join(f'<path d="M1112 {y}h20" stroke="#3a3028" stroke-width="2.5"/>' for y in (318, 290, 264, 240, 218, 198, 182, 168, 156, 146, 138, 132, 128))
A[1] = frame2(f'''<rect width="{W}" height="300" fill="#22303d"/><rect y="300" width="{W}" height="180" fill="#1a242e"/>
<rect x="40" y="40" width="300" height="200" rx="4" fill="#33404c"/><rect x="54" y="54" width="272" height="172" fill="url(#yard1)"/>
<path class="flick" d="M284 70L196 226H326V82Z" fill="#f0c27a" opacity=".22"/><rect class="flick" x="276" y="62" width="16" height="10" rx="2" fill="#f6d48a"/>
<path d="M54 204q60-10 120-4t152-6V226H54Z" fill="#141c24"/><path d="M236 202q-2-10 6-12q2-8 6-2q4 2 2 10q4 2 2 6z" fill="#0c1218"/>
<path d="M190 54v172M54 140h272" stroke="#33404c" stroke-width="7"/>
<rect x="24" y="236" width="332" height="12" rx="2" fill="#3d4a56"/>
<rect x="0" y="282" width="480" height="18" fill="#5c4a3a"/><rect x="0" y="300" width="480" height="180" fill="#3e3128"/>
<path d="M20 318h200v150H20zM240 318h220v150H240z" fill="none" stroke="#2c231c" stroke-width="3"/>
<rect x="380" y="196" width="76" height="86" rx="6" fill="#2b2b30"/><rect x="388" y="204" width="60" height="26" rx="3" fill="#15181c"/>
<text x="418" y="223" text-anchor="middle" {SANS} font-size="16" fill="#7fd0a0">5:40</text>
<path d="M394 248h48v32h-48z" fill="#cfe0ea" opacity=".25"/><path d="M398 262h40v18h-40z" fill="#6b4a2a" opacity=".7"/>
<g class="steam" fill="none" stroke="{LT}" stroke-width="3" opacity=".55"><path d="M404 188q-8-12 0-24t0-22"/><path d="M426 188q8-12 0-24"/></g>
<rect x="1040" y="40" width="160" height="380" fill="#2a3642"/><rect x="1096" y="40" width="40" height="380" fill="#8a7458"/>
{marks}<rect x="1136" y="40" width="64" height="380" fill="#3a4651"/>
<path d="M760 0v54" stroke="#3a3d44" stroke-width="3"/><path d="M716 82q44-40 88 0z" fill="#c9a35a"/><ellipse cx="760" cy="82" rx="44" ry="6" fill="#f6d48a"/>
<path d="M716 84L520 360H1010L804 84Z" fill="#f6d48a" opacity=".07"/>
<ellipse cx="770" cy="468" rx="420" ry="14" fill="#000" opacity=".3"/>
<path d="M512 344H1020L1090 440H442Z" fill="#7a5638"/><rect x="442" y="440" width="648" height="16" fill="#5a3e28"/>
<path d="M464 456v24M1068 456v24" stroke="#3e2a1a" stroke-width="14"/>
<path d="M560 344V256q0-14 14-14h60q14 0 14 14v88" fill="none" stroke="#4a3626" stroke-width="12"/><path d="M574 270h60M574 296h60" stroke="#4a3626" stroke-width="7"/>
<ellipse cx="560" cy="368" rx="64" ry="13" fill="#c9ccd1"/><path d="M496 368q64 46 128 0" fill="#aab0b8"/>
<circle cx="538" cy="352" r="17" fill="#d9622e"/><circle cx="572" cy="348" r="16" fill="#e8b33a"/><circle cx="554" cy="338" r="15" fill="#9a2f3a"/><path d="M588 340q12-18 20-10q-10 4-14 14z" fill="#4f7a45"/>
<path d="M640 420h40v-34q0-6-6-6h-28q-6 0-6 6z" fill="{CRM}"/><path d="M680 392q16 0 16 12t-16 12" fill="none" stroke="{CRM}" stroke-width="6"/><ellipse cx="660" cy="384" rx="17" ry="3.5" fill="#4a3020"/>
<g transform="rotate(-5 810 300)"><rect x="704" y="214" width="214" height="140" rx="14" fill="#15181c"/><rect x="714" y="224" width="194" height="120" rx="6" fill="url(#tab1)"/>
<circle cx="811" cy="264" r="20" fill="{MARS}"/><path d="M796 260q10-6 22 2M802 272q8 4 18-2" stroke="{RUST}" stroke-width="3" fill="none"/>
<circle class="ring" cx="811" cy="264" r="30" fill="none" stroke="{CRM}" stroke-width="2.5"/><circle class="ring ring2" cx="811" cy="264" r="30" fill="none" stroke="{CRM}" stroke-width="2.5"/>
<text x="811" y="310" text-anchor="middle" {SANS} font-size="13" fill="{CRM}">ADA OKAFOR</text><text x="811" y="328" text-anchor="middle" {SANS} font-size="11" fill="{LT}">ARES STATION · SOL 3518</text></g>
<path d="M812 352l-8 14h40l-8-14z" fill="#15181c"/>
<g transform="rotate(4 960 396)"><rect x="880" y="352" width="160" height="92" rx="2" fill="#ece7dc"/><path d="M880 352h160v10H880z" fill="#d9d2c0"/>
<g {HAND} fill="#1f2a3a"><text x="930" y="386" font-size="24">952</text><text x="930" y="412" font-size="24">969</text><text x="922" y="438" font-size="22">−17</text></g>
<path d="M918 418h70" stroke="#1f2a3a" stroke-width="2.5"/></g>''',
 '<defs>' + lg("yard1", (0, "#0f1822"), (1, "#1b2834")) + lg("tab1", (0, "#22405a"), (1, "#16303f")) + '</defs>', "#22303d")

# 2 Unexplained, Not Repeatable. Friday, February 4, 2061, 5:25 AM. The blockhouse two miles past the high bay. Out the
#   window, the test stand is a tower of white lights in the middle of nothing, the departure stage in it with frost
#   blankets over its lower half. Wendell has his boots up on a cable tray and the lid of a thermos balanced on his knee,
#   watching four screens that show the stage from four sides. On the third, low on the stage, the gray keg sized
#   cylinder in its nest of lines: the main oxidizer isolation valve.
def stage_view(x, y, w, h, i, valve=False):
    cx = x + w / 2 + (-14, 10, 0, 16)[i]
    sw = (18, 14, 18, 15)[i]
    v = (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#0b141b"/>'
         + f'<path d="M{cx-sw} {y+h}V{y+22}q{sw} -16 {2*sw} 0V{y+h}z" fill="#c9ccd1"/>'
         + f'<path d="M{cx-sw-2} {y+h}V{y+h*0.6}h{2*sw+4}V{y+h}z" fill="#8a96a3"/>'
         + f'<path d="M{x+10} {y+h}V{y+12}M{x+w-10} {y+h}V{y+12}M{x+10} {y+38}h{w-20}M{x+10} {y+74}h{w-20}" stroke="#596876" stroke-width="2.5"/>')
    if valve:
        v += (f'<rect x="{cx+16}" y="{y+h-40}" width="20" height="26" rx="6" fill="#9aa4ad"/>'
              f'<path d="M{cx+16} {y+h-32}h-12M{cx+16} {y+h-20}h-12M{cx+36} {y+h-27}h{w/2-40}" stroke="#596876" stroke-width="2"/>'
              f'<rect class="pulse" x="{cx+9}" y="{y+h-47}" width="34" height="40" rx="7" fill="none" stroke="{AMB}" stroke-width="2.5"/>')
    return v + f'<rect class="breathe" x="{x}" y="{y}" width="{w}" height="{h}" fill="{SCREEN}" opacity=".08"/>'
screens = "".join(f'<rect x="{x - 7}" y="53" width="164" height="126" rx="6" fill="#2b2f36"/>' + stage_view(x, 60, 150, 112, i, i == 2) for i, x in enumerate((330, 500, 670, 840)))
stand_lights = "".join(f'<circle class="twinkle" style="animation-delay:{i * .37:.2f}s" cx="{x}" cy="{y}" r="2.4" fill="#fff6dc"/>' for i, (x, y) in
                       enumerate(((1052, 70), (1112, 70), (1052, 112), (1112, 112), (1052, 154), (1112, 154), (1052, 196), (1112, 196))))
A[2] = frame2(f'''<rect width="{W}" height="{H}" fill="#1c252d"/>
<rect x="1010" y="30" width="180" height="240" rx="4" fill="#2b333b"/><rect x="1020" y="40" width="160" height="220" fill="url(#pre2)"/>
<path d="M1020 226q50-8 90-2t70-6V260H1020Z" fill="#141c22"/>
<path d="M1052 226V60M1112 226V60M1052 100h60M1052 140h60M1052 180h60M1052 60l60 40M1112 100l-60 40" stroke="#6d7b88" stroke-width="2"/>
<path d="M1070 226V96q12-14 24 0V226z" fill="#e8e6e0"/><path d="M1066 226V172h32V226z" fill="#d6d9de"/><path d="M1066 182h32M1066 196h32M1066 210h32" stroke="#b9bec5" stroke-width="2"/>
{stand_lights}<circle class="glow" cx="1082" cy="130" r="70" fill="url(#halo2)"/>
<rect x="0" y="0" width="{W}" height="26" fill="#151b21"/>
{screens}
<rect x="300" y="200" width="{W}" height="14" fill="#3a434c"/><path d="M300 214H1200V480H300Z" fill="#2b333b"/>
<g fill="#151b21">{"".join(f'<rect x="{x}" y="228" width="60" height="18" rx="3"/>' for x in range(360, 1180, 110))}</g>
<g>{"".join(f'<circle class="{["", "blink"][i % 3 == 0]}" style="animation-delay:{i * .3:.1f}s" cx="{372 + i * 110}" cy="237" r="3.5" fill="{[GRN, AMB, GRN][i % 3]}"/>' for i in range(8))}</g>
<rect x="760" y="300" width="40" height="66" rx="10" fill="#4f6b5a"/><rect x="764" y="292" width="32" height="12" rx="4" fill="#2b2b30"/><path d="M770 312v46" stroke="#6a8a74" stroke-width="4" opacity=".6"/>
<path d="M300 366H1200V480H300Z" fill="#232a31"/><path d="M300 366H1200" stroke="#3a434c" stroke-width="6"/>
<path d="M300 340h330v14H300z" fill="#59626b"/>{"".join(f'<path d="M{x} 340v14" stroke="#454d55" stroke-width="3"/>' for x in range(316, 630, 26))}
<path d="M326 354v26M604 354v26" stroke="#454d55" stroke-width="6"/>
<path d="M60 480V340h110v140" fill="none" stroke="#3a3d44" stroke-width="10"/><rect x="50" y="326" width="140" height="18" rx="6" fill="#4a4f57"/><path d="M60 326V230q0-12 12-12h10v108z" fill="#4a4f57"/>
<path d="M150 336L236 318L336 330" fill="none" stroke="#3e4a5a" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M330 308h28q16 0 18 16l2 14h-56z" fill="#3a2a1e"/><rect x="326" y="334" width="56" height="8" rx="3" fill="#1a1612"/>
<path d="M116 334L104 238q0-24 28-26h22q24 4 22 30l-6 92z" fill="#b39a6a"/><path d="M124 300l14 0M150 300l14 0" stroke="#8a744a" stroke-width="3"/>
<path d="M150 252q26 24 44 52" fill="none" stroke="#b39a6a" stroke-width="20" stroke-linecap="round"/><circle cx="198" cy="310" r="9" fill="#6b4a32"/>
<path d="M224 306l2-18h24l2 18z" fill="#4f6b5a"/><ellipse cx="238" cy="288" rx="12" ry="3" fill="#3a2a1a"/>
<g class="steam" fill="none" stroke="{LT}" stroke-width="2.5" opacity=".5"><path d="M234 280q-6-10 0-20t0-18"/><path d="M246 280q6-10 0-20"/></g>
<rect x="128" y="200" width="18" height="16" fill="#6b4a32"/>
<circle cx="142" cy="182" r="24" fill="#6b4a32"/><path d="M164 178l8 8-7 3z" fill="#6b4a32"/><ellipse cx="136" cy="184" rx="5" ry="7" fill="#5a3e2a"/>
<path d="M118 206q24 18 50 0" fill="none" stroke="#c0473b" stroke-width="7"/><rect x="110" y="200" width="12" height="16" rx="4" fill="#c0473b"/><rect x="162" y="200" width="12" height="16" rx="4" fill="#c0473b"/>''',
 '<defs>' + lg("pre2", (0, "#0e1824"), (.75, "#1d2c3c"), (1, "#3a3f52")) + rg("halo2", (0, "#fff6dc", .22), (1, "#fff6dc", 0)) + '</defs>', "#1c252d")

# 3 The Critical Path. Monday, March 28, 2061. The big room: every table pushed together and every wall papered over.
#   On the long wall, Quinn's work package cards, four hundred and eighty of them, one each, growing colored tails from
#   three pads of sticky notes, green, yellow, and red. On the table, her sign in neat capitals.
COLS, ROWS = 22, 7
cards = []
tails = []
for r in range(ROWS):
    for c in range(COLS):
        x, y = 40 + c * 51, 24 + r * 40
        cards.append(f'<rect x="{x}" y="{y}" width="34" height="22" rx="1.5" fill="#ece7dc"/><path d="M{x+4} {y+7}h22M{x+4} {y+13}h16" stroke="#9aa4ad" stroke-width="1.6"/>')
        k = (r * 7 + c * 3) % 11
        if k < 8:
            d = f"animation-delay:{(r * COLS + c) % 13 * .45:.2f}s"
            tails.append(f'<g class="check" style="{d}"><rect x="{x+35}" y="{y+1}" width="9" height="9" fill="#7cc48a"/><rect x="{x+35}" y="{y+11}" width="9" height="9" fill="#f2d65a"/>'
                         + (f'<rect x="{x+35}" y="{y+21}" width="9" height="{9 + k * 1.5:.0f}" fill="#e06a5a"/>' if k % 2 == 0 else f'<rect x="{x+35}" y="{y+21}" width="9" height="9" fill="#e06a5a"/>') + '</g>')
pads = "".join(f'<g transform="rotate({a} {x} 420)"><rect x="{x - 26}" y="396" width="52" height="48" rx="2" fill="{c}"/><rect x="{x - 26}" y="396" width="52" height="8" fill="#000" opacity=".1"/></g>'
               for x, c, a in ((180, "#7cc48a", -6), (250, "#f2d65a", 3), (320, "#e06a5a", -2)))
A[3] = frame2(f'''<rect width="{W}" height="330" fill="#2e3a44"/>{"".join(cards)}{"".join(tails)}
<rect y="318" width="{W}" height="10" fill="#1f2830"/>
<g fill="#1a2128"><circle cx="720" cy="262" r="20"/><path d="M690 340q0-58 30-58t30 58z"/><path d="M736 290l26-46 10 6-24 44z"/>
<circle cx="910" cy="270" r="19"/><path d="M882 340q0-56 28-56t28 56z"/><circle cx="420" cy="276" r="18"/><path d="M394 340q0-52 26-52t26 52z"/></g>
<rect x="762" y="236" width="10" height="10" fill="#e06a5a"/>
<path d="M0 340H1200V480H0Z" fill="#59483a"/><path d="M0 340H1200" stroke="#6e5a48" stroke-width="6"/>
<path d="M0 398H1200" stroke="#000" stroke-opacity=".18" stroke-width="2"/>
{pads}
<g transform="rotate(-2 700 410)"><rect x="470" y="366" width="470" height="84" rx="3" fill="#f3f1ec"/>
<text x="705" y="400" text-anchor="middle" {SANS} font-size="28" fill="#23395b">THREE NUMBERS.</text><text x="705" y="436" text-anchor="middle" {SANS} font-size="28" fill="#23395b">NOBODY WRITES ONE.</text></g>
<rect x="1000" y="392" width="40" height="56" rx="3" fill="#2b2b30"/><rect x="1004" y="398" width="32" height="40" fill="#e0dccf"/>{"".join(f'<rect x="{1008 + i % 3 * 9}" y="{402 + i // 3 * 9}" width="6" height="6" fill="#9aa4ad"/>' for i in range(12))}
<path d="M1090 446h40v-30q0-5-5-5h-30q-5 0-5 5z" fill="{CRM}"/><ellipse cx="1110" cy="411" rx="15" ry="3" fill="#4a3020"/>''', "", "#2e3a44")

# 4 The Valve. Monday, April 18, 2061, 11:04 PM. Whiteout at the test stand. Wind near forty five, gusting past fifty.
#   The pad light, four hundred meters out, is gone. The stand is a gray ghost in the snow; at its foot the pad shelter,
#   a steel box, and a small figure with a headlamp knocking ice off the relief valve outlet. From inside the blockhouse,
#   the console clock reads the minute Arlo came back on the radio, beside the guarded switch.
flakes = lambda n, seed, r: "".join(f'<circle cx="{(seed * 37 + i * 97) % 1400 - 40}" cy="{(seed * 53 + i * 61) % 600 - 120}" r="{r}"/>' for i in range(n))
streaks = lambda n, seed: "".join(f'<path d="M{(seed * 37 + i * 83) % 1400 - 20} {(seed * 29 + i * 47) % 600 - 120}l-30 22"/>' for i in range(n))
A[4] = frame2(f'''<rect width="{W}" height="{H}" fill="url(#storm4)"/>
<g opacity=".38"><path d="M620 372V60M780 372V60M620 110h160M620 170h160M620 230h160M620 290h160M620 60l160 50M780 110l-160 60M620 170l160 60M780 230l-160 60" stroke="#9aa6b2" stroke-width="5"/>
<path d="M670 372V104q30-26 60 0V372z" fill="#b9c0c8"/><path d="M664 372V270h72V372z" fill="#c9d0d8"/></g>
<path d="M0 360q300-14 600-6t600-4V480H0Z" fill="#48566a"/><path d="M0 392q300-10 600-2t600-6V480H0Z" fill="#5a687a"/>
<rect x="470" y="300" width="130" height="70" fill="#3c4652"/><rect x="470" y="294" width="130" height="10" fill="#dfe6ec" opacity=".7"/><rect x="514" y="326" width="26" height="44" fill="#2a323b"/><rect x="552" y="318" width="22" height="14" fill="#f0c27a" opacity=".55"/>
<path d="M610 336h90v12h-90z" fill="#6d7b88"/><path d="M700 324v34" stroke="#6d7b88" stroke-width="12"/><path d="M690 318h22v8h-22z" fill="#eef3f7"/><path d="M693 318q8-10 16 0" fill="#eef3f7"/>
<g transform="translate(748 302) scale(1.25)"><circle cx="0" cy="0" r="9" fill="#2b2b30"/><path d="M-9 -3h18" stroke="#2b2b30" stroke-width="5"/>
<path d="M-13 50q0-42 13-42t13 42z" fill="#d06a2a"/><path d="M-12 26h24M-12 38h24" stroke="#e6e6d6" stroke-width="3"/>
<path d="M-6 16q-16 2-26 14" stroke="#d06a2a" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M-34 32l-6 -10" stroke="#2b2b30" stroke-width="4" stroke-linecap="round"/>
<path d="M-8 50v12M8 50v12" stroke="#2b2b30" stroke-width="7"/>
<path class="flick" d="M-6 -2L-80 12V40Z" fill="#fff6dc" opacity=".3"/><circle cx="-7" cy="-2" r="3" fill="#fff6dc"/></g>
<g class="snow2" fill="#fff" opacity=".45">{flakes(100, 3, 2.2)}</g>
<g class="snow" stroke="#fff" stroke-width="2.2" opacity=".55" stroke-linecap="round">{streaks(90, 5)}</g>
<g class="snow" fill="#fff" opacity=".85">{flakes(60, 7, 3.2)}</g>
<rect width="{W}" height="{H}" fill="#c9d3dc" opacity=".08"/>
<path d="M0 0H1200V480H0ZM40 24V392H1160V24Z" fill="#1a2027" fill-rule="evenodd"/>
<path d="M40 24H1160V392H40Z" fill="none" stroke="#2b333b" stroke-width="8"/>
<rect x="0" y="392" width="{W}" height="88" fill="#262d35"/><path d="M0 392H1200" stroke="#38414b" stroke-width="6"/>
<rect x="120" y="408" width="170" height="52" rx="4" fill="#0d1013"/><text x="205" y="444" text-anchor="middle" {SANS} font-size="27" fill="#e0553b">11:04 PM</text>
<rect x="440" y="412" width="120" height="44" rx="4" fill="#3a3d44"/><rect x="474" y="422" width="52" height="24" rx="3" fill="#c0473b"/><path d="M466 416h68v6h-68z" fill="#e0b25c" opacity=".8"/>
<rect x="880" y="410" width="40" height="52" rx="5" fill="#3a3d44"/><rect x="896" y="392" width="4" height="20" fill="#3a3d44"/><circle class="blink" cx="900" cy="424" r="4" fill="{GRN}"/>
<path d="M960 450h180" stroke="#4a535c" stroke-width="10" stroke-linecap="round"/>''',
 '<defs>' + lg("storm4", (0, "#121a24"), (.55, "#2a3644"), (1, "#3e4c5c")) + '</defs>', "#121a24")

# 5 The Numbers. Thursday, July 14, 2061, 11:35 AM. The Potomac Room, a hotel ballroom near Union Station:
#   chandeliers, a carpet of gold leaves, the eleven delegations at long tables in a horseshoe with their flags on little
#   stands, the chair at the top. Sam and Garrett at the witness table, backs to us. On Sam's tablet, from Quinn in the
#   big room, one word.
flags = [("#c0473b", "#f3f1ec"), ("#23395b", "#e0b25c"), ("#2f7a4a", "#f3f1ec"), ("#e0b25c", "#c0473b"), ("#f3f1ec", "#23395b"), ("#5a2e6a", "#f3f1ec"),
         ("#c0473b", "#23395b"), ("#2d6b7a", "#f3f1ec"), ("#f3f1ec", "#c0473b"), ("#23395b", "#f3f1ec"), ("#2f7a4a", "#e0b25c")]
def flag(x, y, i):
    a, b = flags[i]
    return f'<path d="M{x} {y}v-30" stroke="#c9ccd1" stroke-width="2"/><rect x="{x}" y="{y-30}" width="20" height="13" fill="{a}"/><rect x="{x}" y="{y-24}" width="20" height="4" fill="{b}"/>'
seats_l = [(150, 330), (205, 286), (262, 250), (325, 222)]
seats_r = [(1050, 330), (995, 286), (938, 250), (875, 222)]
seats_t = [(520, 206), (600, 202), (680, 206)]
tables = (f'<path d="M110 360L320 214L420 214L420 236L338 236L150 372Z" fill="#3a2a2a"/><path d="M1090 360L880 214L780 214L780 236L862 236L1050 372Z" fill="#3a2a2a"/>'
          f'<rect x="420" y="196" width="360" height="22" fill="#3a2a2a"/><path d="M120 356L330 212L420 212V196H320L104 350Z" fill="#e8e2d0" opacity=".9"/>'
          f'<path d="M1080 356L870 212L780 212V196H880L1096 350Z" fill="#e8e2d0" opacity=".9"/><rect x="420" y="190" width="360" height="8" fill="#e8e2d0"/>')
heads = "".join(f'<circle cx="{x}" cy="{y - 20}" r="9" fill="#1e1a18"/><path d="M{x-12} {y}q0-14 12-14t12 14z" fill="#2a2f3a"/>' for x, y in seats_l + seats_r + seats_t)
fl = "".join(flag(x + 6, y + 10, i) for i, (x, y) in enumerate(seats_l + seats_t + seats_r))
chand = lambda x, s: (f'<g transform="translate({x} 0) scale({s})"><path d="M0 0v34" stroke="#c9a35a" stroke-width="2"/><circle class="glow" cx="0" cy="56" r="60" fill="url(#chg5)"/>'
                      f'<path d="M-40 50q40 26 80 0" fill="none" stroke="#c9a35a" stroke-width="3"/><path d="M-26 42q26 18 52 0" fill="none" stroke="#c9a35a" stroke-width="3"/>'
                      + "".join(f'<path d="M{dx} {dy}v-9" stroke="#fff3cf" stroke-width="3"/><circle cx="{dx}" cy="{dy - 11}" r="3" fill="#ffe7a8"/>' for dx, dy in ((-40, 50), (-20, 60), (0, 63), (20, 60), (40, 50), (-26, 42), (26, 42)))
                      + f'<path d="M-6 34h12l-6 30z" fill="#e8d6a0"/></g>')
leaves = "".join(f'<path d="M{x} {y}q10-10 20 0q-10 10-20 0z" fill="#b8913c" opacity=".35" transform="rotate({(x * 7 + y) % 90 - 45} {x + 10} {y})"/>' for x in range(-20, 1220, 60) for y in range(380, 480, 34))
A[5] = frame2(f'''<rect width="{W}" height="380" fill="#4a3a3a"/>{"".join(f'<rect x="{x}" y="0" width="80" height="380" fill="#000" opacity=".06"/>' for x in range(0, 1200, 160))}
<rect y="160" width="{W}" height="6" fill="#c9a35a" opacity=".5"/>
<rect x="470" y="40" width="260" height="128" rx="3" fill="#20262e"/><rect x="480" y="50" width="240" height="108" fill="#e8ecef"/>
<path d="M500 140h200M500 140V62" stroke="#9aa4ad" stroke-width="2"/><path class="draw" d="M500 136C560 126 620 98 700 70" fill="none" stroke="{TEAL}" stroke-width="4"/><path d="M500 137C560 130 610 112 660 96" fill="none" stroke="{AMB}" stroke-width="4"/>
{chand(250, 1)}{chand(950, 1)}
<path d="M0 380H1200V480H0Z" fill="#6a2e2e"/>{leaves}
{tables}{heads}{fl}
<circle cx="600" cy="170" r="10" fill="#1e1a18"/><path d="M587 190q0-15 13-15t13 15z" fill="#2a2f3a"/>
<rect x="300" y="400" width="600" height="30" fill="#3a2a2a"/><rect x="292" y="392" width="616" height="12" fill="#e8e2d0"/><path d="M310 430v50M890 430v50" stroke="#2a1c1c" stroke-width="10"/>
<g><circle cx="500" cy="356" r="24" fill="#1a1410"/><path d="M450 410q0-34 50-34t50 34z" fill="#2a3550"/>
<circle cx="700" cy="358" r="22" fill="#a07850"/><path d="M684 346q16-12 32 0" stroke="#c9ae7e" stroke-width="8" fill="none"/><path d="M652 410q0-32 48-32t48 32z" fill="#46505c"/></g>
<rect x="430" y="360" width="10" height="34" fill="#2b2b30"/><rect x="424" y="356" width="22" height="8" rx="3" fill="#2b2b30"/>
<g transform="rotate(-8 600 402)"><rect x="556" y="380" width="96" height="62" rx="6" fill="#15181c"/><rect x="562" y="386" width="84" height="50" rx="3" fill="#22405a"/>
<rect class="breathe" x="568" y="398" width="64" height="24" rx="10" fill="{SCREEN}"/><text x="600" y="415" text-anchor="middle" {SANS} font-size="14" fill="#0f2430">Range</text></g>''', '<defs>' + rg("chg5", (0, "#ffe7a8", .4), (1, "#ffe7a8", 0)) + '</defs>', "#4a3a3a")

# 6 Twenty Two Minutes. Saturday, August 20, 2061. Kiowa Creek Hardware in Strasburg, a long low building with a feed
#   store at one end and a key machine at the counter by the register. A woman cutting a key with her back to the door:
#   straight graying blond hair, a navy fleece. It's Bea. Washers are aisle four.
hooks = "".join(f'<path d="M{x} {y}v5" stroke="#6b6f75" stroke-width="2"/><path d="M{x - 4} {y + 5}h8l-1 16h-6z" fill="{["#c9a35a", "#c9ccd1", "#b08a4a"][(x + y) % 3]}"/>'
                for x in range(300, 560, 20) for y in (74, 110, 146))
shelf = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="18" fill="{c}"/>' for x, y, w, c in
                ((626, 96, 70, "#9a3a2a"), (702, 96, 60, "#2d6b7a"), (626, 146, 110, "#6b6f75"), (740, 146, 30, "#4f7a45"), (626, 196, 50, "#2d6b7a"), (680, 196, 90, "#8a6f47"), (626, 246, 80, "#c9a35a")))
sacks = "".join(f'<path d="M{x} {y}h86q8 0 8 10v36q0 10-8 10h-86q-8 0-8-10v-36q0-10 8-10z" fill="#d8c9a0"/><text x="{x + 43}" y="{y + 34}" text-anchor="middle" {SANS} font-size="13" fill="#5a4a2a">FEED</text>'
                for x, y in ((900, 270), (1004, 270), (1108, 270), (952, 214), (1056, 214), (1004, 158)))
A[6] = frame2(f'''<rect width="{W}" height="{H}" fill="#3e3a32"/>
<rect x="0" y="0" width="{W}" height="44" fill="#2b2822"/><rect x="380" y="8" width="440" height="30" rx="3" fill="#7a2e2a"/>
<text x="600" y="30" text-anchor="middle" {SANS} font-size="18" fill="#f3f1ec">KIOWA CREEK HARDWARE</text>
<rect x="0" y="44" width="150" height="300" fill="#c9d6dc" opacity=".35"/><rect class="dawn" x="0" y="44" width="150" height="300" fill="#fff3d6" opacity=".35"/>
<path d="M0 194h150M75 44v300" stroke="#2b2822" stroke-width="6"/><path d="M150 44v300" stroke="#2b2822" stroke-width="10"/>
<path d="M150 344L0 480H0V420Z" fill="#fff3d6" opacity=".06"/>
<rect x="286" y="60" width="290" height="124" rx="4" fill="#5a4a36"/>{hooks}
<rect x="604" y="70" width="190" height="270" fill="#2e2b26"/>{shelf}{"".join(f'<rect x="604" y="{y}" width="190" height="5" fill="#1e1c18"/>' for y in (114, 164, 214, 264))}
<path d="M664 60v-10M734 60v-10" stroke="#9aa4ad" stroke-width="2"/><rect x="646" y="56" width="106" height="32" rx="3" fill="#23395b"/>
<text x="699" y="78" text-anchor="middle" {SANS} font-size="17" fill="#f3f1ec">AISLE 4</text>
<rect x="830" y="70" width="370" height="270" fill="#4e4638"/>{sacks}
<rect x="250" y="236" width="360" height="16" fill="#6a5038"/><rect x="250" y="252" width="360" height="90" fill="#4a3828"/>
<rect x="320" y="196" width="130" height="42" rx="6" fill="#5b6870"/><rect x="340" y="176" width="52" height="26" rx="5" fill="#6d7b88"/>
<circle cx="362" cy="214" r="15" fill="#9aa4ad"/><circle cx="362" cy="214" r="9" fill="#c9ccd1"/>
<path d="M378 210h40l4 4-4 4h-40z" fill="#e0b25c"/><circle class="glint" cx="388" cy="207" r="6" fill="#fff6dc"/>
<path d="M410 330q-8-92 52-104h40q60 12 52 104z" fill="#22324a"/>
<path d="M432 238q10 10 40 10t40-10" fill="none" stroke="#1a2638" stroke-width="5"/>
<path d="M424 262q-22 -10 -34 -40" fill="none" stroke="#22324a" stroke-width="20" stroke-linecap="round"/><path d="M542 262q-4 -18 -24 -30" fill="none" stroke="#22324a" stroke-width="20" stroke-linecap="round"/>
<path d="M482 128c-26 0-42 18-42 44 0 22-2 44-8 62q50 14 100 0c-6-18-8-40-8-62 0-26-16-44-42-44z" fill="#c8b48a"/>
<path d="M466 136q-8 40-4 96M482 130v104M498 136q8 40 4 96M456 150q-6 40-2 80" stroke="#e6e2d8" stroke-width="2.5" fill="none" opacity=".55"/>
<path d="M0 330H1200V480H0Z" fill="#3a2c20"/><path d="M80 330H1180V352H80Z" fill="#7a5a3a"/><path d="M100 352H1160V480H100Z" fill="#5a4230"/>
<path d="M100 400H1160" stroke="#000" stroke-opacity=".15" stroke-width="2"/>
<rect x="800" y="276" width="120" height="58" rx="6" fill="#2b2b30"/><rect x="812" y="286" width="64" height="22" rx="2" fill="#3a5a3a"/>
<rect x="884" y="290" width="24" height="36" rx="3" fill="#3a3d44"/>
<g transform="rotate(-8 610 342)"><circle cx="596" cy="342" r="7" fill="none" stroke="#9aa4ad" stroke-width="4"/></g>''', "", "#3e3a32")

# 7 The Sprint. Friday, September 30, 2061, 6:40 AM. The simulator bay with the lights down. Commander Yusra Haddad in
#   the left seat of the mockup, flying the departure burn by hand on the screen: ignition, nineteen minutes against the
#   simulated Earth, cutoff. On the inside of the door, in letters a foot high, Rafa's marker: ONCE. Under it, smaller,
#   the autonomy squad's velocity for its five sprints.
A[7] = frame2(f'''<rect width="{W}" height="{H}" fill="#0f1a24"/>
<rect x="150" y="40" width="760" height="300" rx="10" fill="#0a1117"/><rect x="160" y="50" width="740" height="280" fill="url(#space7)"/>
<path d="M160 330Q530 170 900 330Z" fill="#2c6aa0"/><path d="M160 330Q530 200 900 330" fill="none" stroke="#8dd0f0" stroke-width="5" opacity=".7"/>
<path d="M300 300Q420 230 530 222" fill="none" stroke="#8dbcd4" stroke-width="2.5" stroke-dasharray="6 7" opacity=".7"/>
<path class="trace" d="M530 222Q640 214 740 150T880 70" fill="none" stroke="{AMB}" stroke-width="5"/>
<circle cx="530" cy="222" r="7" fill="{AMB}"/><circle cx="740" cy="150" r="7" fill="{CRM}"/>
<text x="520" y="250" text-anchor="end" {SANS} font-size="15" fill="{AMB}">IGNITION</text><text x="752" y="176" {SANS} font-size="15" fill="{CRM}">CUTOFF</text>
<rect class="breathe" x="160" y="50" width="740" height="280" fill="{SCREEN}" opacity=".05"/>
<path d="M90 480L210 300H850L970 480Z" fill="#1c2833"/><path d="M210 300H850" stroke="#3a4a58" stroke-width="10"/>
<g>{"".join(f'<rect x="{x}" y="318" width="50" height="30" rx="3" fill="#0e151c"/><rect x="{x + 6}" y="324" width="38" height="18" fill="#22405a"/>' for x in (300, 370, 620, 690))}</g>
{"".join(f'<circle class="{["", "blink"][i % 2]}" style="animation-delay:{i * .4:.1f}s" cx="{460 + i * 22}" cy="334" r="4" fill="{[GRN, AMB, GRN, GRN, RED][i]}"/>' for i in range(5))}
<path d="M300 480V380q0-40 40-44h70q40 4 40 44v100z" fill="#2a3440"/>
<circle cx="376" cy="350" r="28" fill="#1a1612"/><path d="M342 342q34-34 68 0" fill="none" stroke="#2b2b30" stroke-width="7"/><rect x="338" y="342" width="12" height="22" rx="4" fill="#2b2b30"/><circle class="blink" cx="344" cy="370" r="3" fill="{GRN}"/>
<path d="M326 480q0-90 50-96t50 96z" fill="#23314f"/><path d="M420 410l90-40" stroke="#23314f" stroke-width="16" stroke-linecap="round"/><circle cx="512" cy="368" r="9" fill="#1a1612"/>
<rect x="540" y="372" width="10" height="70" rx="4" fill="#3a3d44"/><circle cx="545" cy="372" r="10" fill="#5b6068"/>
<rect x="980" y="20" width="200" height="460" fill="#2a3a46"/><rect x="990" y="30" width="180" height="450" fill="#33495a"/><circle cx="1004" cy="270" r="6" fill="#c9ccd1"/>
<text x="1080" y="140" text-anchor="middle" font-family="'Marker Felt','Chalkboard','Comic Sans MS',cursive" font-weight="700" font-size="74" fill="#0c0f12" transform="rotate(-4 1080 120)">ONCE</text>
<g font-family="'Marker Felt','Chalkboard','Comic Sans MS',cursive" font-size="22" fill="#0c0f12">{"".join(f'<text x="1060" y="{204 + i * 30}">{v}</text>' for i, v in enumerate((34, 28, 31, 37, 26)))}</g>''',
 '<defs>' + lg("space7", (0, "#05080d"), (1, "#0f2234")) + '</defs>', "#0f1a24")

# 8 The Contract. December 2061, Pueblo. The Aldergrove conference room that was Emmett Garrity's office. Nell stands at
#   the window with her arms folded, her back to the room, looking at the mill, "the only thing in Pueblo that worked harder than he did." On
#   the table, the letter with the photocopy clipped to it: rev C cold cycle data from 2034, a pencil box around the
#   third row, and beside it in blue ink, in her hand: Still asking.
stacks = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{300 - y}" fill="#3a3030"/>' for x, y, w in ((140, 70, 20), (190, 50, 22), (246, 84, 18), (700, 60, 24), (760, 90, 18)))
smoke = "".join(f'<path class="drift" style="animation-delay:{i * 2.1:.1f}s" d="M{x} {y}q{r} -{r} {r * 4} -{r // 2}q{r * 2} 0 {r * 4} {r // 3}" fill="none" stroke="#c9c3c0" stroke-width="{r}" stroke-linecap="round" opacity=".28"/>' for i, (x, y, r) in enumerate(((150, 66, 12), (201, 46, 14), (712, 56, 13), (255, 80, 9))))
rows = "".join(f'<path d="M{760} {346 + i * 11}h{170 - (i % 3) * 14}" stroke="#7d7f84" stroke-width="2.2"/>' for i in range(8))
A[8] = frame2(f'''<rect width="{W}" height="{H}" fill="#3b3a3e"/>
<rect x="60" y="30" width="840" height="290" rx="4" fill="#5a5560"/><rect x="74" y="44" width="812" height="262" fill="url(#sky8)"/>
<path d="M74 236q200-14 420-8t392-4V306H74Z" fill="#6a5a4a"/>
{stacks}<path d="M320 300V200h300v100z" fill="#4a3c38"/><path d="M320 200l60-40h180l60 40z" fill="#3a3030"/>
<rect class="glow" x="400" y="232" width="140" height="44" fill="#f0a04a" opacity=".85"/><path d="M400 232h140v44H400z" fill="none" stroke="#2a2222" stroke-width="4"/>
<circle class="glow" cx="470" cy="254" r="130" fill="url(#mill8)"/>
<path d="M74 280h812" stroke="#2a2a2a" stroke-width="4"/><g clip-path="url(#win8)">{smoke}</g>
<path d="M480 44v262M74 176h812" stroke="#5a5560" stroke-width="8"/>
<rect x="40" y="316" width="880" height="14" fill="#6a6570"/>
<path d="M544 330l-4-150q0-36 40-38h24q40 2 40 38l-4 150z" fill="#7a6440"/><path d="M548 200q-20 10-18 40l14 6zM640 200q20 10 18 40l-14 6z" fill="#6a5636"/>
<path d="M592 150v180" stroke="#5e4c30" stroke-width="2.5"/><rect x="584" y="128" width="16" height="16" fill="#c9a07a"/>
<ellipse cx="592" cy="108" rx="23" ry="27" fill="#3a302a"/><path d="M580 86q10 20 8 40M600 84q-6 20-4 42M572 100q6 14 10 26" stroke="#8a8478" stroke-width="2.5" fill="none" opacity=".8"/>
<ellipse cx="592" cy="130" rx="11" ry="8" fill="#332a24"/>
<path d="M0 340H1200V480H0Z" fill="#2c2420"/><path d="M0 340H1200" stroke="#4a3c34" stroke-width="6"/>
<g transform="rotate(-3 840 400)"><rect x="700" y="330" width="250" height="140" rx="2" fill="#f3f1ec"/><rect x="740" y="336" width="200" height="124" fill="#cfcdc6"/>{rows}
<rect x="754" y="362" width="172" height="12" fill="none" stroke="#6b6f75" stroke-width="1.6"/>
<text x="780" y="456" {HAND} font-size="24" fill="#2c4a9a">Still asking.</text>
<path d="M716 330v30h14v-30" fill="none" stroke="#9aa4ad" stroke-width="4"/></g>
<g transform="rotate(8 1080 410)"><rect x="1010" y="370" width="130" height="90" rx="3" fill="#2a3a52"/><path d="M1020 370v90" stroke="#1a2638" stroke-width="5"/></g>''',
 '<defs>' + lg("sky8", (0, "#5a6a7a"), (.7, "#a6948a"), (1, "#c8a48a")) + rg("mill8", (0, "#f08a3a", .35), (1, "#f08a3a", 0)) + '<clipPath id="win8"><rect x="74" y="44" width="812" height="262"/></clipPath></defs>', "#3b3a3e")

# 9 Conjunction. June 2062. Mars goes behind the Sun. For twenty two days nothing personal goes either way; the relay
#   network carries only the station status beacon, once a sol, repeated until it gets through. Earth on the left,
#   the Sun between, Mars on the far side inside the three degree cone. The beacon's pulses fade into the glare, and one
#   line comes through: sol 4005.
stars = "".join(f'<circle class="{["", "twinkle"][i % 4 == 0]}" style="animation-delay:{i % 7 * .4:.1f}s" cx="{(i * 137) % 1200}" cy="{(i * 71) % 480}" r="{1 + (i % 3) * .5}" fill="#f3f1ec" opacity="{.35 + (i % 5) * .1:.2f}"/>' for i in range(90))
A[9] = frame2(f'''<rect width="{W}" height="{H}" fill="url(#space9)"/>{stars}
<path d="M140 250L1180 196M140 250L1180 304" stroke="#e0b25c" stroke-width="1.5" stroke-dasharray="3 9" opacity=".45"/>
<circle cx="640" cy="250" r="190" fill="url(#corona9)"/><circle class="glow" cx="640" cy="250" r="130" fill="url(#halo9)"/>
<circle cx="640" cy="250" r="62" fill="#fff4d6"/><circle cx="640" cy="250" r="54" fill="#fffbec"/>
<circle cx="1060" cy="236" r="22" fill="{MARS}"/><path d="M1044 230q16-8 32 2M1050 246q10 4 22-2" stroke="{RUST}" stroke-width="4" fill="none"/>
<circle cx="1066" cy="230" r="22" fill="#000" opacity=".0"/>
<g fill="{CRM}"><circle class="ping" cx="1030" cy="238" r="4"/><circle class="ping ping2" cx="1030" cy="238" r="4"/><circle class="ping ping3" cx="1030" cy="238" r="4"/></g>
<path d="M1036 238H860" stroke="{CRM}" stroke-width="1.5" stroke-dasharray="2 8" opacity=".5"/>
<circle cx="150" cy="250" r="34" fill="#2c6aa0"/><path d="M128 238q14-10 30-2q6 12-6 18q-14 2-24-16zM146 268q10-6 22 0" fill="#4f9a5a"/><path d="M118 250a34 34 0 0 0 64 12" fill="#000" opacity=".25"/>
<circle cx="194" cy="226" r="6" fill="#c9ccd1"/>
<text x="150" y="312" text-anchor="middle" {SANS} font-size="14" fill="{LT}">EARTH</text><text x="1060" y="290" text-anchor="middle" {SANS} font-size="14" fill="{MARS}">MARS</text>
<text x="1176" y="186" text-anchor="end" {SANS} font-size="12" fill="#e0b25c" opacity=".8">3°</text>
<rect x="40" y="378" width="600" height="72" rx="6" fill="#0b141b" stroke="#2d6b7a" stroke-width="2"/>
<text x="60" y="404" {SANS} font-size="14" fill="{LT}">ARES STATION · STATUS BEACON · SOL 4005</text>
<text class="breathe" x="60" y="432" {SANS} font-size="15" fill="#9fe0a0">PLANT GREEN · POWER GREEN · ECLSS GREEN · MED 0</text>''',
 '<defs>' + lg("space9", (0, "#050810"), (1, "#0d1830")) + rg("corona9", (0, "#ffe9a8", .55), (.45, "#e0b25c", .18), (1, "#e0b25c", 0)) + rg("halo9", (0, "#fff0c0", .6), (1, "#fff0c0", 0)) + '</defs>', "#050810")

# 10 The Stack. Sunday night, September 3, 2062, Cape Canaveral. Hurricane Hester off the north coast of Cuba, forecast
#   to run up Florida's east coast; at 11 PM the wind probability at the Cape hits thirty eight percent, past Coquina's
#   thirty percent trigger. The heavy lifter for launch 2 rolls back from the pad to its hangar on the transporter,
#   palms bending, the storm's bands coming in off the Atlantic.
def palm(x, y, s, d):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0q6-60 -4-120" stroke="#1a2420" stroke-width="7" fill="none"/>'
            f'<g class="bend" style="animation-delay:{d}s">' + "".join(f'<path d="M-4 -120q{dx * .5} {dy - 20} {dx} {dy}q{-dx * .4} {-dy * .2 - 6} {-dx} {-dy}" fill="#1a2420"/>' for dx, dy in ((-60, 10), (-46, 34), (50, 18), (62, -6), (-30, -28), (30, -30))) + '</g></g>')
A[10] = frame2(f'''<rect width="{W}" height="{H}" fill="url(#night10)"/>
<g class="drift" fill="#3a4656" opacity=".75"><path d="M560 120q120-90 300-60t340 30V0H560z"/><path d="M700 150q160-60 300-20t200 0V60q-200-10-500 30z" opacity=".7"/></g>
<g class="drift" style="animation-duration:20s" fill="#4a5666" opacity=".55"><path d="M800 230q120-40 220-10t180-10V150q-160 20-400 80z"/></g>
<path d="M0 360H1200V480H0Z" fill="#1d2622"/><path d="M820 360q190-12 380 0V380H820Z" fill="#2a3a4a"/>
<g class="surf" stroke="#8aa4b8" stroke-width="2" opacity=".5"><path d="M840 368h80M960 372h100M1100 366h80"/></g>
<rect x="90" y="150" width="250" height="210" fill="#2e3a44"/><path d="M90 150l125-40 125 40z" fill="#26313a"/><rect x="170" y="210" width="90" height="150" fill="#ffe7a8" opacity=".85"/>
<rect x="170" y="210" width="90" height="150" fill="none" stroke="#1a2228" stroke-width="6"/>
<path d="M660 360V70M740 360V70" stroke="#4a5666" stroke-width="8"/><path d="M660 110h80M660 170h80M660 230h80M660 290h80M660 110l80 60M740 170l-80 60M660 230l80 60" stroke="#4a5666" stroke-width="4"/>
<circle class="blink" cx="700" cy="64" r="5" fill="#e04a3b"/>
<path d="M260 388H1000" stroke="#3a4a42" stroke-width="10"/><path d="M260 388H1000" stroke="#ffe7a8" stroke-width="2" stroke-dasharray="14 18" opacity=".4"/>
<g class="roll"><rect x="440" y="340" width="200" height="34" rx="4" fill="#5b6068"/>{"".join(f'<rect x="{x}" y="372" width="44" height="16" rx="6" fill="#2b2f36"/>' for x in (446, 500, 554, 590))}
<rect x="470" y="318" width="140" height="24" fill="#6d7378"/><path d="M500 318V60M580 318V60" stroke="#6d7378" stroke-width="6"/><path d="M500 120h80M500 200h80M500 270h80" stroke="#6d7378" stroke-width="4"/>
<path d="M516 318V96q0-50 24-70q24 20 24 70v222z" fill="#e8e6e0"/><path d="M516 160h48M516 250h48" stroke="#b9bcc2" stroke-width="3"/><rect x="516" y="170" width="48" height="16" fill="{NAVY}"/>
<path d="M516 318l-14 8h76l-14-8z" fill="#9aa4ad"/>
<circle class="blink" cx="452" cy="346" r="4" fill="{AMB}"/><circle class="blink" style="animation-delay:.8s" cx="628" cy="346" r="4" fill="{AMB}"/>
</g>
{palm(850, 362, 1, 0)}{palm(940, 364, .8, .5)}{palm(380, 362, .9, .3)}{palm(1110, 366, 1.1, .8)}
<g class="snow" stroke="#9fb4c8" stroke-width="1.6" opacity=".35" stroke-linecap="round">{"".join(f'<path d="M{(i * 89) % 1300 - 40} {(i * 53) % 520 - 60}l-14 30"/>' for i in range(120))}</g>
<rect x="40" y="30" width="240" height="88" rx="6" fill="#0b141b" stroke="#2d6b7a" stroke-width="2"/>
<text x="60" y="62" {SANS} font-size="18" fill="{LT}">HESTER</text>
<text x="60" y="102" {SANS} font-size="34" fill="#f0a04a">38%</text><text x="150" y="98" {SANS} font-size="12" fill="{LT}">TROPICAL STORM</text><text x="150" y="112" {SANS} font-size="12" fill="{LT}">FORCE WINDS</text>''',
 '<defs>' + lg("night10", (0, "#0a1018"), (.7, "#1c2a3a"), (1, "#2a3a48")) + '</defs>', "#0a1018")

# 11 The Feed. 11:52 PM, Cocoa Beach. The hotel desk bolted to the wall, the window cranked open so he can hear surf he
#   can't see. On his phone, the scanned copy of AR 2207: crooked, with a gray bar an inch wide down the left side where
#   the copier caught the edge. Beside it the hotel notepad, where he starts a list in block capitals.
A[11] = frame2(f'''<rect width="{W}" height="{H}" fill="#2a2f38"/>
<rect x="700" y="30" width="440" height="270" rx="4" fill="#3a404a"/><rect x="714" y="44" width="412" height="242" fill="url(#sea11)"/>
<circle cx="1050" cy="96" r="22" fill="#e8e6e0" opacity=".85"/>
<g class="surf" stroke="#e8eef3" stroke-width="2.5" opacity=".55" stroke-linecap="round"><path d="M730 218h120M880 226h140M760 244h170M960 252h150"/></g>
<path d="M714 44h206v242H714z" fill="#cfe0ea" opacity=".12"/><path d="M920 44l120 40v202l-120-0z" fill="#cfe0ea" opacity=".2"/><path d="M920 44v242" stroke="#3a404a" stroke-width="6"/>
<path class="curtain" d="M660 20h50q-10 140 6 300h-56z" fill="#6a5a7a"/><path class="curtain" style="animation-delay:1s" d="M1130 20h50v300h-56q16-160 6-300z" fill="#6a5a7a"/>
<path d="M0 306H1200V480H0Z" fill="#1f232a"/>
<path d="M30 300H1170L1200 470H0Z" fill="#7a5c48"/><path d="M0 470H1200V480H0Z" fill="#4a382c"/><path d="M30 300H1170" stroke="#8a6a54" stroke-width="4"/>
<g transform="rotate(-6 470 320)"><rect x="400" y="200" width="140" height="240" rx="16" fill="#111418"/><rect x="408" y="214" width="124" height="212" rx="4" fill="#f3f1ec"/>
<g transform="rotate(3 470 320)"><rect x="410" y="214" width="16" height="214" fill="#8a8e94"/>
<text x="434" y="234" {SANS} font-size="8.6" fill="#1f2a3a">ANOMALY REPORT</text><text x="436" y="250" {SANS} font-size="13" fill="#1f2a3a">AR 2207</text>
{"".join(f'<path d="M436 {266 + i * 12}h{86 - (i * 13) % 30}" stroke="#7d8590" stroke-width="2"/>' for i in range(11))}
<text x="436" y="412" {SANS} font-size="9" fill="#1f2a3a">DISPOSITION: UNR.</text></g>
<rect class="breathe" x="408" y="214" width="124" height="212" rx="4" fill="#fff" opacity=".08"/></g>
<g transform="rotate(4 690 330)"><rect x="620" y="250" width="150" height="190" rx="2" fill="#f6f3ea"/><rect x="620" y="250" width="150" height="20" fill="#2a4a6a"/>
{"".join(f'<path d="M636 {294 + i * 24}h{[96, 72, 108, 60, 84][i]}" stroke="#2a2f38" stroke-width="5" stroke-linecap="square" stroke-dasharray="11 4"/>' for i in range(5))}</g>
<path d="M792 412l90-60" stroke="#c9a35a" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="80" cy="330" rx="260" ry="90" fill="url(#lamp11)"/><path d="M40 300V160" stroke="#3a3d44" stroke-width="5"/><path d="M10 170l14-50h32l14 50z" fill="#d8c49c"/>
<path d="M170 330l12-50h136l12 50z" fill="#15181c"/><text x="250" y="318" text-anchor="middle" {SANS} font-size="26" fill="#e0553b">11:52</text>''',
 '<defs>' + lg("sea11", (0, "#0e1724"), (.6, "#16243a"), (1, "#0a1220")) + rg("lamp11", (0, "#f6d48a", .28), (1, "#f6d48a", 0)) + '</defs>', "#2a2f38")

# 12 Hand Off. Friday, November 10, 2062, 5:30 AM. Wendell's truck where he left it at the stand, nose to the blockhouse
#   wall, the window down an inch the way he always leaves it so the cab won't fog. On the passenger seat, the shoebox
#   with its rubber bands on, and the thermos on top of it like a paperweight. "Leave the box in it. They're mine."
#   Through the windshield, the blockhouse wall; through the passenger window, the plains going gray before the sun and
#   the stand's lights two miles out.
blocks12 = "".join(f'<path d="M0 {y}H420" stroke="#6a6a64" stroke-width="2"/>' for y in range(70, 300, 22))
A[12] = frame2(f'''<rect width="{W}" height="{H}" fill="#191715"/>
<path d="M30 40L410 64V290L0 300Z" fill="#7d7d76"/>{blocks12}
<path d="M30 40L410 64V290L0 300Z" fill="url(#head12)"/>
<path d="M0 0H440V480H0ZM30 40L410 64V290L0 300Z" fill="#191715" fill-rule="evenodd"/>
<rect x="470" y="40" width="680" height="244" rx="10" fill="#26231f"/>
<rect x="484" y="54" width="652" height="216" rx="4" fill="url(#sky12)"/>
<rect class="dawn" x="484" y="150" width="652" height="80" fill="url(#glow12)"/>
<path d="M484 214q200-8 340-4t312-4V270H484Z" fill="#5a5040"/><path d="M484 236q220-6 652 -2V270H484Z" fill="#4a4234"/>
<path d="M600 270L760 214" stroke="#7a6e58" stroke-width="5"/>
<path d="M934 214V150M962 214V150M934 166h28M934 186h28" stroke="#4a4e58" stroke-width="2.5"/>
{"".join(f'<circle class="twinkle" style="animation-delay:{i * .4:.1f}s" cx="{x}" cy="{y}" r="2" fill="#fff6dc"/>' for i, (x, y) in enumerate(((934, 152), (962, 152), (934, 176), (962, 176), (934, 200), (962, 200))))}
<rect x="484" y="54" width="652" height="18" fill="#0c0b0a" opacity=".55"/><path d="M484 72H1136" stroke="#9aa6b2" stroke-width="2" opacity=".7"/>
<path d="M484 72H1136V270H484Z" fill="#cfe0ea" opacity=".06"/>
<path d="M450 284H1170V480H450Z" fill="#2c2824"/><path d="M1060 330h70v20h-70z" fill="#4a443c"/><path d="M470 300H1150" stroke="#3a3530" stroke-width="4"/>
<path d="M0 300H440V340H0Z" fill="#2a2622"/>
<circle cx="120" cy="420" r="92" fill="none" stroke="#3a342e" stroke-width="18"/><path d="M120 330v180M30 420h180" stroke="#3a342e" stroke-width="10"/>
<path d="M260 480V380q0-30 30-34h880q30 4 30 34v100z" fill="#5a4a3a"/>{"".join(f'<path d="M{x} 352v128" stroke="#4a3c2e" stroke-width="3"/>' for x in range(300, 1180, 40))}
<ellipse cx="770" cy="414" rx="190" ry="14" fill="#000" opacity=".3"/>
<path d="M620 330H900V410H620Z" fill="#c9b48a"/><path d="M610 312H910V340H610Z" fill="#d8c49c"/><path d="M610 340H910" stroke="#a8946a" stroke-width="3"/>
<path d="M690 312V410M840 312V410" stroke="#9a5a3a" stroke-width="5"/><path d="M610 326H910" stroke="#9a5a3a" stroke-width="4" opacity=".8"/>
<rect x="660" y="272" width="210" height="44" rx="16" fill="#4f6b5a"/><rect x="852" y="268" width="34" height="52" rx="8" fill="#2b2b30"/>
<rect x="752" y="272" width="14" height="44" fill="#3e5648"/><path d="M676 284h160" stroke="#6a8a74" stroke-width="5" opacity=".6"/>''',
 '<defs>' + lg("sky12", (0, "#141c28"), (.55, "#3a4258"), (1, "#a07860")) + lg("glow12", (0, "#f0c27a", 0), (1, "#f0c27a", .6))
 + '<radialGradient id="head12" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#fff6dc" stop-opacity=".35"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></radialGradient></defs>', "#191715")

if __name__ == "__main__":
    out = os.path.join(ROOT, "art", "v2")
    os.makedirs(out, exist_ok=True)
    for n, s in A.items():
        open(os.path.join(out, f"full-ch{n:02d}.svg"), "w").write(s)
    print(len(A), "v2 banners ->", out)
