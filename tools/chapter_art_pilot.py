"""Draw animated SVG banners for the Private Pilot chapters ("Danny's Logbook") -> courses/pilot/art/full-chNN.svg.
Shares the palette, STYLE animation classes, frame() and grad() from tools/chapter_art.py (loaded without running
its PMP writer) and adds a few classes of its own inside the same prefers-reduced-motion guard. Run from the repo root."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_src = open(os.path.join(ROOT, "tools", "chapter_art.py")).read()
ns = {}
exec(_src.split("A={}")[0], ns)  # palette, W, H, STYLE, frame, grad; the PMP banners are not written
BG, DK, MID, TEAL, LT, AMB, CRM, RED, GRN = (ns[k] for k in ("BG", "DK", "MID", "TEAL", "LT", "AMB", "CRM", "RED", "GRN"))
W, H, grad = ns["W"], ns["H"], ns["grad"]
MAR = "#7a2e3a"  # Biscuit's stripe

EXTRA = ('<style>@media (prefers-reduced-motion:no-preference){\n'
 '.taxi{animation:taxi 22s linear infinite}@keyframes taxi{0%{transform:translateX(0);opacity:0}6%{opacity:1}90%{opacity:1}100%{transform:translateX(-760px);opacity:0}}\n'
 '.sock{animation:sock 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:0 50%}@keyframes sock{50%{transform:rotate(7deg) scaleX(.93)}}\n'
 '.swing{animation:swing 3.4s ease-in-out infinite;transform-box:view-box;transform-origin:var(--o)}@keyframes swing{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-6deg)}}\n'
 '.lamp{animation:lamp 6s ease-in-out infinite}@keyframes lamp{0%,100%{opacity:.75}40%{opacity:.6}44%{opacity:.82}48%{opacity:.62}}\n'
 '.drift{animation:drift 16s ease-in-out infinite alternate}@keyframes drift{to{transform:translateX(46px)}}\n'
 '.drift2{animation:drift 11s ease-in-out infinite alternate-reverse}\n'
 '.bolt{animation:bolt 5.5s infinite;opacity:0}@keyframes bolt{0%,58%,63%,67%,100%{opacity:0}59%,61%,65%{opacity:1}}\n'
 '.lit{animation:lit 5.5s infinite;opacity:0}@keyframes lit{0%,58%,63%,67%,100%{opacity:0}59%,65%{opacity:.45}}\n'
 '.shimmer{animation:shimmer 7s ease-in-out infinite}@keyframes shimmer{50%{opacity:.55}}\n'
 '}</style>')
ns["STYLE"] = ns["STYLE"] + EXTRA  # frame() reads STYLE from its own namespace
frame = ns["frame"]

# Biscuit side view, nose left, in a 200 unit box (same geometry as her cast portrait). door: "closed" or "open".
def biscuit(door="closed", figure=False):
    d = ('<path d="M80 80H105V108H82Z" fill="#1a2630"/>'
         + ('<circle cx="94" cy="89" r="5.2" fill="#2b2420"/><path d="M85 108q1-12 9-13q9 1 10 13z" fill="#2b2420"/><path d="M98 85q3 2 3 6" stroke="#f0c27a" stroke-width="1.2" fill="none" opacity=".8"/>' if figure else '')
         + '<path d="M80 80L64 84L64 108L82 108Z" fill="#e8e6e0" stroke="#c9ccd1" stroke-width=".6"/><path d="M66 86L78 83V95H66Z" fill="#2a4a5c"/><path d="M64 101L81 100.5" stroke="' + MAR + '" stroke-width="3"/>'
         if door == "open" else '<path d="M86 80H104V93H80Z" fill="#2a4a5c"/>')
    return (f'<path d="M150 87L166 50h12l-3 42z" fill="{CRM}"/><path d="M166 50h12l-1 9h-13z" fill="{MAR}"/><ellipse cx="164" cy="98" rx="16" ry="3" fill="#dcdad4"/>'
     f'<path d="M34 97L58 89L74 77H128L172 89L172 99L128 108Q110 116 92 116L46 115Q34 113 34 105Z" fill="{CRM}"/>'
     f'<path d="M38 104L128 101L171 93L171 96.5L128 105L42 108.5Z" fill="{MAR}"/>'
     '<path d="M60 89L74 78H82L74 93Z" fill="#2a4a5c"/><path d="M108 80H125L120 93H108Z" fill="#2a4a5c"/><path d="M129 81L140 84L135 91H126Z" fill="#2a4a5c"/>'
     + d +
     '<path d="M66 77Q70 68 86 67.5L130 69.5L132 77Z" fill="#e8e6e0"/><path d="M68 74H131" stroke="' + MAR + '" stroke-width="1.5"/>'
     '<path d="M112 77L92 113" stroke="#c9ccd1" stroke-width="3" stroke-linecap="round"/>'
     '<path d="M48 114L46 125M100 114L107 125" stroke="#6b6f75" stroke-width="3"/>'
     f'<circle cx="46" cy="129" r="5" fill="#1e1a18"/><path d="M38 128q8-9 16 0z" fill="{CRM}"/><circle cx="108" cy="129" r="6" fill="#1e1a18"/><path d="M98 128q10-11 20 0z" fill="{CRM}"/>'
     '<text x="148" y="92" font-family="Arial" font-weight="700" font-size="6.5" fill="#23395b" transform="rotate(-11 148 92)">N4791E</text>'
     '<ellipse cx="31" cy="102" rx="5" ry="6.5" fill="#c9ccd1"/><rect x="27.5" y="72" width="4" height="60" rx="2" fill="#3a3d44"/>')

A = {}

# 1 Discovery Flight: Biscuit tied down at Centennial in long gold evening light, the Front Range behind,
#   door open and a figure in the left seat. Windsock moves, the light shimmers, a Cirrus taxis out.
cessnas = "".join(f'<g transform="translate({x} 300) scale(.42)" opacity=".55">{biscuit()}</g>' for x in (-20, 60, 140))
A[1] = frame(f'''<circle class="glow" cx="900" cy="292" r="120" fill="#f6d48a" opacity=".35"/><circle cx="900" cy="292" r="46" fill="#f8dc98"/>
<path d="M0 250L70 214L130 236L210 190L290 228L360 200L440 176L520 214L600 186L690 222L760 196L840 240L910 228L980 196L1060 222L1130 204L1200 226V330H0Z" fill="#4a4e6e"/>
<path d="M440 176L462 190L452 188L432 182ZM210 190L228 202L214 200ZM980 196L1000 208L986 206Z" fill="#c9c3d4" opacity=".6"/>
<path d="M0 286L90 262L170 280L260 256L340 276L430 250L520 274L620 252L720 270L820 258L900 276L1000 254L1100 272L1200 258V330H0Z" fill="#363a58"/>
<rect x="0" y="326" width="{W}" height="154" fill="#4b4f52"/><rect x="0" y="326" width="{W}" height="154" fill="url(#ramp)"/>
<path d="M0 318h330v14H0z" fill="#2e3346"/><g fill="#3b4058"><rect x="10" y="296" width="96" height="30"/><rect x="112" y="300" width="96" height="26"/><rect x="214" y="296" width="110" height="30"/></g>
{cessnas}
<g class="taxi"><g transform="translate(1040 334)"><path d="M0 10L18 4H54L66 0H72L70 10L60 13H14Z" fill="#dfe3e8"/><path d="M60 0L66 -12H72L70 1Z" fill="#dfe3e8"/><path d="M20 12H58" stroke="#9aa4ad" stroke-width="3"/><path d="M22 4L30 0H40L36 5Z" fill="#2a4a5c"/><circle cx="16" cy="16" r="2.4" fill="#1e1a18"/><circle cx="40" cy="17" r="2.6" fill="#1e1a18"/><circle class="blink" cx="69" cy="-12" r="2" fill="#e04a3b"/></g></g>
<path d="M0 360H1200" stroke="#e0b25c" stroke-width="3" opacity=".5"/>
<g stroke="#e0b25c" stroke-width="5" opacity=".55"><path d="M320 450h120M380 430v40M720 448h120M780 428v40"/></g>
<path d="M360 452L150 476L120 470L330 446Z" fill="#000" opacity=".22"/>
<g transform="translate(177 18) scale(3.2)">{biscuit("open", True)}</g>
<g stroke="#d9d2bf" stroke-width="2.5"><path d="M535 263L540 446"/></g>
<rect class="shimmer" x="0" y="326" width="{W}" height="154" fill="url(#light)"/>
<path d="M1090 230V420" stroke="#9aa4ad" stroke-width="6"/><circle cx="1090" cy="228" r="5" fill="#9aa4ad"/>
<g class="sock"><path d="M1090 236L1168 246L1166 262L1090 270Z" fill="#e8743b"/><path d="M1116 239.5V267M1142 243V264" stroke="{CRM}" stroke-width="9"/></g>''',
 f'<defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22405a"/><stop offset=".55" stop-color="#c98a5a"/><stop offset=".72" stop-color="#f0c27a"/></linearGradient>'
 f'<linearGradient id="ramp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b6250"/><stop offset="1" stop-color="#2c3236"/></linearGradient>'
 f'<linearGradient id="light" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#f0c27a" stop-opacity=".45"/><stop offset=".6" stop-color="#f0c27a" stop-opacity=".08"/><stop offset="1" stop-color="#f0c27a" stop-opacity="0"/></linearGradient></defs>'
 f'<rect width="{W}" height="{H}" fill="url(#sky1)"/>')

# 2 The Machine: Hangar Six with the cowling off the O-320, Marisol's red toolbox open with Danny's taped wire
#   in the lid, the work light, the new ELT battery. The work light flickers and a loose safety wire swings.
corr = "".join(f'<path d="M{x} 0V372" stroke="#16242c" stroke-width="3"/>' for x in range(0, 1200, 24))
cyl = lambda x: (f'<g><circle cx="{x}" cy="250" r="36" fill="#6b6f75"/>' + "".join(f'<circle cx="{x}" cy="250" r="{r}" fill="none" stroke="#4a4e54" stroke-width="2.5"/>' for r in (31, 25, 19))
                 + f'<circle cx="{x}" cy="250" r="12" fill="#8a8f96"/><rect x="{x-30}" y="198" width="60" height="18" rx="5" fill="#9aa4ad"/><path d="M{x-6} 286q-4 40 22 66" stroke="#7a5a3a" stroke-width="9" fill="none"/></g>')
A[2] = frame(f'''{corr}
<rect x="330" y="40" width="210" height="160" rx="6" fill="{CRM}"/><rect x="330" y="200" width="210" height="8" fill="#9aa4ad"/>
<g font-family="Arial" font-weight="900" fill="#23395b"><text x="346" y="74" font-size="21">DUE LIST</text><g font-size="15"><text x="346" y="102">ANNUAL 8/26</text><text x="346" y="126">XPDR 10/26</text><text x="346" y="150">ELT BATT 3/26</text></g></g>
<rect x="340" y="134" width="130" height="22" fill="none" stroke="{RED}" stroke-width="3"/><path d="M480 146l8 8 16-18" stroke="{GRN}" stroke-width="4" fill="none"/>
<path d="M346 176h120M346 188h90" stroke="#9aa4ad" stroke-width="2.5" stroke-linecap="round"/>
<rect x="470" y="214" width="44" height="40" rx="4" fill="#9a8a60"/><g fill="#c9ccd1"><circle cx="482" cy="210" r="6"/><circle cx="498" cy="208" r="6"/></g><rect x="330" y="254" width="210" height="6" fill="#3a4a54"/>
<rect x="0" y="372" width="{W}" height="108" fill="#24323b"/><path d="M0 372H1200" stroke="#3a4a54" stroke-width="3"/>
<g class="lamp"><path d="M640 112L470 372H900L760 112Z" fill="url(#beam)"/></g>
<path d="M700 0V96" stroke="#1e1a18" stroke-width="3"/><path d="M672 96h56l12 22h-80z" fill="#c9a04a"/><circle class="glow" cx="700" cy="118" r="14" fill="#fff4d0"/>
<g transform="translate(0 0)">
<path d="M770 150L1200 120V350L770 330Z" fill="{CRM}"/><path d="M780 300L1200 280V296L780 314Z" fill="{MAR}"/>
<path d="M800 158L880 150L860 230L800 236Z" fill="#2a4a5c"/><path d="M900 148L1010 142L1000 232L890 236Z" fill="#2a4a5c"/>
<path d="M860 100L1200 84V112L860 124Z" fill="#e8e6e0"/><path d="M1010 120L960 330" stroke="#c9ccd1" stroke-width="10"/>
<rect x="756" y="150" width="18" height="190" fill="#8a8f96"/>
<g stroke="#5a6470" stroke-width="6" fill="none"><path d="M756 200L700 230M756 300L700 280M756 200L720 290"/></g>
<rect x="590" y="226" width="160" height="56" rx="10" fill="#8a8f96"/>
{cyl(624)}{cyl(708)}
<rect x="610" y="300" width="56" height="40" rx="6" fill="#9a8a60"/><path d="M620 340h36v12h-36z" fill="#6b6f75"/>
<rect x="730" y="290" width="26" height="40" rx="6" fill="#3f6a8a"/>
<g class="swing" style="--o:744px 330px"><path d="M744 330q-6 10 0 18t0 18q-6 10 2 22" stroke="#d9dde3" stroke-width="2.5" fill="none"/></g>
<ellipse cx="572" cy="254" rx="20" ry="26" fill="#c9ccd1"/><rect x="560" y="70" width="12" height="380" rx="6" fill="#3a3d44"/>
<path d="M640 360L630 420" stroke="#6b6f75" stroke-width="10"/><circle cx="630" cy="432" r="22" fill="#1e1a18"/><circle cx="630" cy="432" r="8" fill="#6b6f75"/>
</g>
<rect x="330" y="410" width="250" height="44" rx="6" fill="#2d4f7a"/><path d="M350 410v44M390 410v44M430 410v44M470 410v44M510 410v44M550 410v44" stroke="#24406a" stroke-width="3"/>
<path d="M350 414Q370 370 450 368Q530 370 560 414Z" fill="{CRM}"/><path d="M380 404Q450 386 530 404" stroke="#c9ccd1" stroke-width="3" fill="none"/>
<rect x="420" y="440" width="94" height="34" rx="4" fill="#e8743b"/><text x="467" y="462" text-anchor="middle" font-family="Arial" font-weight="900" font-size="15" fill="{DK}">ELT BATT</text>
<rect x="86" y="268" width="230" height="190" rx="8" fill="#b23a30"/>
<g fill="#8f2c24">{"".join(f'<rect x="98" y="{280+i*34}" width="206" height="26" rx="4"/>' for i in range(5))}</g>
<g fill="#d9dde3">{"".join(f'<rect x="176" y="{290+i*34}" width="50" height="5" rx="2"/>' for i in range(5))}</g>
<circle cx="110" cy="462" r="9" fill="#1e1a18"/><circle cx="292" cy="462" r="9" fill="#1e1a18"/>
<path d="M86 268L106 112H296L316 268Z" fill="#8f2c24"/><path d="M100 256L116 124H286L302 256Z" fill="#d2c6b4"/>
<rect x="128" y="138" width="56" height="70" fill="{CRM}"/><g stroke="#9aa4ad" stroke-width="3"><path d="M134 150h44M134 162h40M134 174h44M134 186h34M134 198h40"/></g>
<rect x="210" y="140" width="64" height="46" fill="#c8b89a"/><path d="M220 166l22-6 24 2-8 4-14 1-14 4z" fill="#d9b04a"/><path d="M228 176h34" stroke="#f3f1ec" stroke-width="2"/>
<path d="M148 222q6-8 12 0t12 0q4-10 12-2t10 2q8-8 14 0t12-2q6-6 10 2" stroke="#d9dde3" stroke-width="3.5" fill="none"/>
<rect x="130" y="232" width="146" height="18" fill="#e9dfb0" transform="rotate(-2 203 241)"/>
<text x="203" y="246" text-anchor="middle" font-family="Arial" font-weight="900" font-size="11.5" fill="#2b2b2b" transform="rotate(-2 203 241)">D. REYES 2017. DO NOT FLY.</text>''',
 f'<defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c2" stop-opacity=".55"/><stop offset="1" stop-color="#fff1c2" stop-opacity="0"/></linearGradient></defs>'
 f'<rect width="{W}" height="{H}" fill="#1d2a33"/>')

# 3 Weather School: an afternoon thunderstorm building over the Palmer Divide, seen from Claire's kitchen window,
#   a printed KAPA METAR on the counter. Lightning flickers inside the cell and the clouds drift.
A[3] = frame(f'''<rect x="230" y="34" width="740" height="306" rx="6" fill="#d8cdb8"/>
<g clip-path="url(#win)">
<rect x="246" y="50" width="708" height="274" fill="url(#sky3)"/>
<g class="drift"><path d="M462 100Q610 64 806 88Q730 108 648 104Q560 110 462 100Z" fill="#f3f5f6"/>
<path d="M496 214Q486 184 516 172Q504 136 548 124Q548 96 588 92Q598 70 640 76Q680 70 690 98Q732 100 730 134Q764 146 752 180Q776 194 766 214Z" fill="url(#cb)"/>
<g class="lit" opacity="0" fill="#fff6d8"><circle cx="630" cy="160" r="46"/><circle cx="680" cy="176" r="30"/></g>
<g stroke="#7f8f9c" stroke-width="3" opacity=".7"><path d="M540 216l-14 76M570 216l-14 76M600 216l-14 76M690 216l-14 76M720 216l-14 76"/></g>
<path class="bolt" d="M652 214l-18 36h16l-20 42" stroke="#fff6d8" stroke-width="5" fill="none" stroke-linejoin="round"/></g>
<g class="drift2" fill="#f3f1ec" opacity=".85"><circle cx="330" cy="118" r="22"/><circle cx="356" cy="108" r="26"/><circle cx="384" cy="120" r="20"/><circle cx="880" cy="96" r="18"/><circle cx="904" cy="88" r="22"/><circle cx="928" cy="98" r="16"/></g>
<path d="M246 284Q330 262 420 276T600 270T780 268T954 276V324H246Z" fill="#3e5a52"/>
<g fill="#4c5a64"><path d="M246 306h60v-16l30-14 30 14v16h80v-12l24-12 24 12v12h90v-16l28-12 28 12v16h100v-14l26-12 26 12v14h60v18H246Z"/></g>
</g>
<path d="M600 50V324M246 186H954" stroke="#d8cdb8" stroke-width="10"/>
<rect x="210" y="330" width="780" height="18" rx="3" fill="#c7b9a0"/>
<g transform="translate(886 300)"><path d="M0 30h40l-6 30H6z" fill="#b4532a"/><path d="M20 30q-14-26-4-34M20 30q2-28 18-30M20 30q-18-12-20-24" stroke="{GRN}" stroke-width="5" fill="none"/></g>
<rect x="0" y="384" width="{W}" height="96" fill="#3a2f2a"/><rect x="0" y="370" width="{W}" height="18" fill="#b9a98e"/>
<g transform="rotate(-3 560 380)"><rect x="380" y="320" width="400" height="150" fill="#f6f4ee"/><rect x="380" y="320" width="400" height="150" fill="none" stroke="#d9d4c8" stroke-width="2"/>
<g font-family="Courier New, Courier, monospace" font-weight="700" fill="#2b2b2b" font-size="15"><text x="396" y="346">METAR KAPA 142153Z 34012G24KT 10SM</text><text x="396" y="368">VCTS SCT080CB BKN140 29/08 A3010</text><text x="396" y="390">RMK AO2 LTG DSNT S TS S MOV E</text></g>
<path d="M396 412h250M396 432h200" stroke="#c9ccd1" stroke-width="6" stroke-linecap="round"/><ellipse cx="478" cy="363" rx="44" ry="13" fill="none" stroke="{RED}" stroke-width="2.5"/></g>
<path d="M880 402h70v48q0 18-18 18h-34q-18 0-18-18z" fill="{TEAL}"/><path d="M950 414q22 0 22 16t-22 14" fill="none" stroke="{TEAL}" stroke-width="7"/>
<path class="steam" d="M898 390q8-12 0-24M926 390q8-12 0-24" stroke="{CRM}" stroke-width="4" fill="none" opacity=".6"/>''',
 f'<defs><linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f86a3"/><stop offset=".7" stop-color="#a9c3cf"/><stop offset="1" stop-color="#d7dfd8"/></linearGradient>'
 f'<linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f8f9"/><stop offset=".62" stop-color="#d9e1e6"/><stop offset="1" stop-color="#5f6f7c"/></linearGradient><clipPath id="win"><rect x="246" y="50" width="708" height="274"/></clipPath></defs>'
 f'<rect width="{W}" height="{H}" fill="#2b3a44"/><g opacity=".25"><rect class="lit" width="{W}" height="{H}" fill="#fff6d8" opacity="0"/></g>')

out = os.path.join(ROOT, "courses", "pilot", "art")
os.makedirs(out, exist_ok=True)
for n, s in A.items():
    open(os.path.join(out, f"full-ch{n:02d}.svg"), "w").write(s)
print(len(A), "pilot banners ->", out)
