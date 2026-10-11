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

# Classes used only by chapters 4 onward. They ride in through frame()'s sky slot, so the chapter 1 to 3 files stay byte for byte the same.
EXTRA2 = ('<style>@media (prefers-reduced-motion:no-preference){\n'
 '.creep{animation:creep 9s ease-in-out infinite alternate;transform-box:view-box;transform-origin:var(--o)}@keyframes creep{0%,8%{transform:rotate(-72deg)}92%,100%{transform:rotate(0)}}\n'
 '.creep2{animation:creep2 9s ease-in-out infinite alternate;transform-box:view-box;transform-origin:var(--o)}@keyframes creep2{0%,8%{transform:rotate(-7.2deg)}92%,100%{transform:rotate(0)}}\n'
 '.scrawl{stroke-dasharray:900;animation:scrawl 8s ease-out infinite}@keyframes scrawl{0%,6%{stroke-dashoffset:900}48%,100%{stroke-dashoffset:0}}\n'
 '.haze{animation:haze 2.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}@keyframes haze{0%{transform:translateX(-14px) scaleY(.6);opacity:.25}100%{transform:translateX(14px) scaleY(1.5);opacity:.7}}\n'
 '.wob{animation:wob 1.7s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}@keyframes wob{to{transform:skewX(3deg) scaleY(1.02)}}\n'
 '.c2{animation:c2 7.5s infinite}@keyframes c2{0%,31%{opacity:1}33%,100%{opacity:0}}\n'
 '.c3{animation:c3 7.5s infinite}@keyframes c3{0%,31%{opacity:0}33%,64%{opacity:1}66%,100%{opacity:0}}\n'
 '.c4{animation:c4 7.5s infinite}@keyframes c4{0%,64%{opacity:0}66%,98%{opacity:1}100%{opacity:0}}\n'
 '.rock{animation:rock 4.6s ease-in-out infinite;transform-box:view-box;transform-origin:var(--o)}@keyframes rock{0%,100%{transform:rotate(-2deg)}50%{transform:translateY(6px) rotate(2.5deg)}}\n'
 '.climb{animation:climb 6s ease-in-out infinite alternate}@keyframes climb{to{transform:translateY(-18px)}}\n'
 '.fade{animation:fade 6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}@keyframes fade{to{transform:scaleX(.82);opacity:.45}}\n'
 '.limp{animation:limp 4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}@keyframes limp{50%{transform:rotate(-4deg)}}\n'
 '}</style>')
frame2 = lambda inner, sky: frame(inner, EXTRA2 + sky)

# Biscuit nose right: the same drawing mirrored, with the registration redrawn so it still reads forward.
def biscuit_r(door="closed", figure=False, cabin=""):
    b = biscuit(door, figure)
    i = b.index('<text x="148"'); j = b.index('</text>', i) + 7
    return (f'<g transform="translate(200 0) scale(-1 1)">{b[:i]}{b[j:]}{cabin}</g>'
            '<text x="52" y="92" text-anchor="end" font-family="Arial" font-weight="700" font-size="6.5" fill="#23395b" transform="rotate(11 52 92)">N4791E</text>')

import math

# 4 Airspace: Danny's 2018 Denver sectional, the blue 80 over Centennial circled three times in red with his 80!!! beside it, the
#   reservoir just north, and Biscuit's altimeter at 7,800 with Abby's finger resting on the glass. The red circles draw themselves
#   and the needles creep up through 7,600 to 7,800 and back down (reduced motion: they rest at 7,800).
def alt_ticks(cx, cy, r):
    t = ""
    for k in range(50):
        a = math.radians(k * 7.2); big = k % 5 == 0
        r1 = r - (22 if big else 12)
        t += f'<path d="M{cx+r1*math.sin(a):.1f} {cy-r1*math.cos(a):.1f}L{cx+r*math.sin(a):.1f} {cy-r*math.cos(a):.1f}" stroke="{CRM}" stroke-width="{5 if big else 2.5}"/>'
    for n in range(10):
        a = math.radians(n * 36); rr = r - 46
        t += f'<text x="{cx+rr*math.sin(a):.1f}" y="{cy-rr*math.cos(a)+12:.1f}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="34" fill="{CRM}">{n}</text>'
    return t
AX, AY = 975, 244
A[4] = frame2(f'''<g transform="rotate(-2.5 400 240)">
<rect x="-40" y="-30" width="860" height="560" fill="#ece3c2"/>
<path d="M-40 330Q120 300 260 340T560 320T820 350V530H-40Z" fill="#e2d6a8"/><path d="M-40 430Q200 400 420 440T820 430V530H-40Z" fill="#d9c890"/>
<path d="M-40 -30H820V120Q640 150 520 110T260 120T-40 90Z" fill="#f2e07a" opacity=".75"/>
<g stroke="#c9bf9c" stroke-width="1.2"><path d="M-40 60H820M-40 200H820M-40 340H820M-40 480H820M120 -30V530M320 -30V530M520 -30V530M720 -30V530"/></g>
<g fill="none" stroke="#8a3a6a" stroke-width="3" opacity=".7"><path d="M90 -30Q120 200 150 530"/><path d="M-40 250Q300 230 820 270"/><path d="M600 -30L560 530"/></g>
<path d="M300 92Q350 70 398 86Q430 104 410 128Q380 150 336 140Q296 128 300 92Z" fill="#8fc0dc" stroke="#3f7fae" stroke-width="2"/>
<g fill="none" stroke="#2c5fa6"><path d="M-40 175Q380 120 820 190" stroke-width="5"/><path d="M-40 440Q400 390 820 470" stroke-width="5"/><path d="M250 -30Q200 200 230 530" stroke-width="5"/></g>
<circle cx="350" cy="292" r="72" fill="none" stroke="#2c5fa6" stroke-width="3" stroke-dasharray="12 8"/>
<g fill="#2c5fa6"><circle cx="350" cy="292" r="20"/></g><g stroke="#ece3c2" stroke-width="4"><path d="M346 276V308M356 276V308M338 296L364 284"/></g>
<g font-family="Arial" font-weight="700" fill="#2c5fa6"><text x="380" y="330" font-size="15">CENTENNIAL (APA)</text><text x="380" y="348" font-size="13">CT 118.9  5885</text>
<text x="324" y="120" font-size="12" fill="#3f7fae" font-style="italic">CHERRY CREEK RES</text>
<g text-anchor="middle"><text x="565" y="218" font-size="30">120</text><path d="M535 226H595" stroke="#2c5fa6" stroke-width="3"/><text x="565" y="256" font-size="30">80</text></g></g>
<path class="scrawl" d="M521 248a44 25 -6 1 1 88 -6a44 25 -6 1 1 -88 6l-3 -4a49 29 -3 1 1 98 -2a49 29 -3 1 1 -98 2l5 6a42 23 -10 1 1 84 -10a42 23 -10 1 1 -84 10" fill="none" stroke="#c4302b" stroke-width="3.5" stroke-linecap="round"/>
<text x="632" y="262" font-family="Arial" font-weight="900" font-size="30" fill="#4a4a4a" opacity=".85" transform="rotate(-4 632 262)">80!!!</text>
<circle cx="140" cy="404" r="40" fill="none" stroke="#9a6a3a" stroke-width="7" opacity=".35"/><circle cx="142" cy="402" r="34" fill="none" stroke="#9a6a3a" stroke-width="2" opacity=".3"/>
<text x="104" y="408" font-family="Arial" font-weight="700" font-size="12" fill="#5a5040">CASTLE ROCK</text>
<g stroke="#6a6a6a" stroke-width="1.6" opacity=".55"><path d="M350 292L-40 160M350 292L120 530M350 292L820 60"/></g>
<path d="M400 -30V530" stroke="#fff" stroke-width="6" opacity=".35"/><path d="M403 -30V530" stroke="#8a7f60" stroke-width="2" opacity=".35"/><path d="M-40 236H820" stroke="#fff" stroke-width="5" opacity=".3"/>
</g>
<path d="M792 0H1200V480H760Z" fill="{DK}"/>
<circle cx="{AX}" cy="{AY}" r="208" fill="#20262c"/><circle cx="{AX}" cy="{AY}" r="196" fill="#33393f"/><circle cx="{AX}" cy="{AY}" r="184" fill="#0d1114"/>
{alt_ticks(AX, AY, 178)}
<rect x="{AX+52}" y="{AY-14}" width="62" height="28" rx="3" fill="#20262c"/><path d="M{AX+60} {AY-6}V{AY+6}M{AX+72} {AY-4}V{AY+4}M{AX+84} {AY-8}V{AY+8}M{AX+96} {AY-4}V{AY+4}M{AX+108} {AY-6}V{AY+6}" stroke="{CRM}" stroke-width="2"/>
<g font-family="Arial" font-weight="700" fill="{CRM}" text-anchor="middle"><text x="{AX}" y="{AY-64}" font-size="15">ALT</text><text x="{AX}" y="{AY+74}" font-size="12">100 FEET</text></g>
<g transform="rotate(28.08 {AX} {AY})"><path d="M{AX} {AY-150}L{AX-4} {AY-126}L{AX+4} {AY-126}Z" fill="{CRM}"/><path d="M{AX} {AY-126}V{AY}" stroke="{CRM}" stroke-width="2"/></g>
<g class="creep2" style="--o:{AX}px {AY}px"><g transform="rotate(280.8 {AX} {AY})"><path d="M{AX} {AY+16}L{AX-11} {AY-30}L{AX} {AY-100}L{AX+11} {AY-30}Z" fill="{CRM}"/></g></g>
<g class="creep" style="--o:{AX}px {AY}px"><g transform="rotate(288 {AX} {AY})"><path d="M{AX} {AY+30}L{AX-5} {AY}L{AX-3} {AY-150}L{AX} {AY-160}L{AX+3} {AY-150}L{AX+5} {AY}Z" fill="{CRM}"/></g></g>
<circle cx="{AX}" cy="{AY}" r="12" fill="#20262c" stroke="#6b6f75" stroke-width="2"/>
<path d="M{AX-150} {AY-90}Q{AX-60} {AY-170} {AX+40} {AY-170}" stroke="#fff" stroke-width="10" fill="none" opacity=".08" stroke-linecap="round"/>
<path d="M1200 352L1090 330Q1062 324 1060 342Q1060 360 1086 366L1200 400Z" fill="#c98f6c"/><path d="M1200 336L1110 318L1088 330L1200 356Z" fill="#b97f5e"/>
<path d="M1066 334Q1061 344 1068 353L1082 355Q1078 343 1083 333Z" fill="#e8c8b4"/><path d="M1068 336L1074 340L1072 347" stroke="#c98f6c" stroke-width="2" fill="none"/>''',
 f'<rect width="{W}" height="{H}" fill="{DK}"/>')

# 5 Performance: a 34 degree August afternoon on the Centennial ramp. Ellie in cleats and Danny's Hangar Six cap on Marisol's scale,
#   Biscuit tied down behind her, the runway melting in heat shimmer, and the POH open to the takeoff table with Danny's pencil
#   box around the 8,000 foot row: THIS IS AUGUST. The shimmer ripples, the sun pulses, the scale readout settles.
rows = ("S.L.", "1000", "2000", "3000", "4000", "5000", "6000", "7000", "8000")
tbl = "".join(f'<text x="246" y="{313+i*15}" font-size="11">{r}</text>' + "".join(f'<path d="M{298+c*28} {309+i*15}h18" stroke="#9aa4ad" stroke-width="3"/>' for c in range(4)) for i, r in enumerate(rows))
A[5] = frame2(f'''<circle class="glow" cx="1040" cy="70" r="84" fill="#fff6cf" opacity=".35"/><circle cx="1040" cy="70" r="44" fill="#fffbe6"/>
<path d="M0 252L80 234L150 244L240 222L330 240L420 226L520 244L600 230L700 246L800 232L900 248L1000 236L1100 248L1200 240V270H0Z" fill="#b9b7c4" opacity=".7"/>
<rect x="0" y="266" width="{W}" height="214" fill="#cfc6b0"/>
<rect x="0" y="266" width="{W}" height="22" fill="#9d9a92"/><path d="M0 277H1200" stroke="#eeeae0" stroke-width="2" stroke-dasharray="40 30" opacity=".7"/>
<g fill="#f6efd8"><ellipse class="haze" cx="200" cy="270" rx="200" ry="5"/><ellipse class="haze" style="animation-delay:-.7s" cx="620" cy="266" rx="240" ry="6"/><ellipse class="haze" style="animation-delay:-1.4s" cx="1010" cy="271" rx="210" ry="5"/>
<ellipse class="haze" style="animation-delay:-1.1s" cx="420" cy="282" rx="170" ry="3.5"/><ellipse class="haze" style="animation-delay:-.3s" cx="860" cy="284" rx="190" ry="3.5"/></g>
<g stroke="#e0b25c" stroke-width="4" opacity=".6"><path d="M0 330H1200"/></g>
<path d="M700 420L1180 404L1190 414L716 432Z" fill="#000" opacity=".14"/>
<g class="wob"><g transform="translate(660 40) scale(2.6)">{biscuit()}</g></g>
<path d="M780 398L792 440M1000 396L1010 440" stroke="#d9d2bf" stroke-width="2"/>
<g transform="translate(560 0)"><rect x="-70" y="408" width="170" height="20" rx="3" fill="#5a5f66"/><rect x="-70" y="404" width="170" height="8" rx="2" fill="#7a8088"/>
<g stroke="#6b7078" stroke-width="2">{"".join(f'<path d="M{-62+k*14} 406l6 4"/>' for k in range(12))}</g>
<circle cx="-56" cy="434" r="7" fill="#1e1a18"/><circle cx="86" cy="434" r="7" fill="#1e1a18"/>
<rect x="104" y="300" width="8" height="128" fill="#7a8088"/><rect x="88" y="270" width="64" height="40" rx="4" fill="#3a3d44"/><rect x="94" y="276" width="52" height="28" rx="2" fill="#1c2a22"/>
<text class="flick" x="120" y="298" text-anchor="middle" font-family="Courier New, monospace" font-weight="700" font-size="22" fill="#7fe0a0">76</text>
<g><path d="M-6 300h32l4 58h-40z" fill="#5fa37a"/><path d="M-4 356h14l2 46h-14zM12 356h14l-2 46h-14z" fill="#d9a888"/><path d="M-8 356h40l2 14h-44z" fill="#2d4f7a"/>
<path d="M-12 398h24v8h-26zM10 398h24l4 8h-28z" fill="#1e1a18"/><path d="M-10 402h18M14 402h18" stroke="{CRM}" stroke-width="1.5"/>
<path d="M-6 306L-30 330L-26 336L-2 318M26 306L50 326L46 332L22 318" fill="#d9a888"/>
<circle cx="10" cy="284" r="17" fill="#d9a888"/><path d="M-10 280Q-8 260 10 260Q28 260 30 280Z" fill="#23395b"/><path d="M-12 280h46l-4 6h-38z" fill="#1a2c48"/>
<text x="10" y="276" text-anchor="middle" font-family="Arial" font-weight="900" font-size="9" fill="{AMB}">6</text>
<path d="M-6 268Q-12 290 -2 300" stroke="#6b4a2a" stroke-width="5" fill="none"/></g></g>
<g transform="rotate(-4 200 380)">
<path d="M10 300L200 290L200 470L14 480Z" fill="#f4eedb"/><path d="M200 290L420 300L416 480L200 470Z" fill="#faf5e4"/><path d="M200 290V470" stroke="#c9bf9c" stroke-width="3"/>
<g stroke="#b9b09a" stroke-width="3" stroke-linecap="round">{"".join(f'<path d="M34 {320+i*16}h{140 - (i*23)%50}"/>' for i in range(9))}</g>
<g font-family="Arial" font-weight="700" fill="#2b2b2b"><text x="214" y="300" font-size="10">TAKEOFF DISTANCE  2300 LB</text>{tbl}</g>
<rect x="238" y="419" width="168" height="20" fill="none" stroke="#5a5a5a" stroke-width="2.2" opacity=".85" transform="rotate(-1 322 429)"/>
<text x="244" y="460" font-family="Arial" font-weight="700" font-size="13" fill="#4a4a4a" opacity=".9" transform="rotate(-2 244 460)">THIS IS AUGUST.</text>
</g>''',
 f'<defs><linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb0d0"/><stop offset=".6" stop-color="#d9e4e4"/><stop offset="1" stop-color="#f6eed2"/></linearGradient></defs>'
 f'<rect width="{W}" height="{H}" fill="url(#sky5)"/>')

# 6 Pattern Work: from behind Walt at the chain link fence, Biscuit on short final for 35R over the numbers, crabbed into a gusty
#   west wind, the windsock standing out. Walt holds up both hands to score her landing: a full five on the left, and the right counts
#   up 5, 6 and rests on 7, the score he gave her (never a 10). The windsock gusts, Biscuit rocks in the bumps, the clouds drift.
#   Reduced motion: a still 7.
def hand(n, x, y, cls, op):
    f = "".join(f'<rect x="{x-14+i*9}" y="{y-34+abs(i-1.5)*3}" width="8" height="34" rx="4"/>' for i in range(n))
    thumb = f'<path d="M{x-12+n*9} {y-2}h{34-n*9}" stroke="#b5866a" stroke-width="7" stroke-linecap="round"/>' if n < 4 else ""
    return f'<g class="{cls}"{op} fill="#c99a78">{f}<rect x="{x-16}" y="{y-6}" width="38" height="34" rx="9"/>{thumb}</g>'
mesh = "".join(f'<path d="M{x} 322L{x+160} 482M{x+160} 322L{x} 482"/>' for x in range(-160, 1200, 22))
rear = (f'<path d="M-150 -6L150 -6L146 6L-146 6Z" fill="{CRM}"/><path d="M-150 -6L-146 6" stroke="#c9ccd1" stroke-width="3"/><path d="M-60 8L-22 40M60 8L22 40" stroke="#c9ccd1" stroke-width="4"/>'
        f'<ellipse cx="0" cy="34" rx="26" ry="22" fill="#e8e6e0"/><path d="M-26 34Q0 46 26 34" stroke="{MAR}" stroke-width="5" fill="none"/>'
        f'<path d="M-62 26H62L58 33H-58Z" fill="{CRM}"/><path d="M-4 30L-2 -38H4L6 30Z" fill="{CRM}"/><path d="M-2 -38H4L4.5 -26H-2.5Z" fill="{MAR}"/>'
        f'<path d="M-18 52L-44 78M18 52L44 78" stroke="#6b6f75" stroke-width="4"/><rect x="-52" y="74" width="14" height="18" rx="5" fill="#1e1a18"/><rect x="38" y="74" width="14" height="18" rx="5" fill="#1e1a18"/><rect x="-5" y="70" width="10" height="16" rx="4" fill="#1e1a18"/>')
A[6] = frame2(f'''<g class="drift" fill="#f3f5f6" opacity=".9"><path d="M120 92q20-30 60-18q24-22 56 -2q34-6 40 22q-80 12-156-2z"/><path d="M760 70q22-26 58-12q30-18 54 6q30 0 32 20q-74 10-144-14z"/></g>
<path d="M0 250L60 196L120 220L200 168L270 210L330 186L400 226L470 214L560 246L600 262H0Z" fill="#5a6488"/><path d="M200 168L218 184L206 182L192 176ZM60 196L76 210L64 208Z" fill="{CRM}" opacity=".8"/>
<path d="M0 262H1200V480H0Z" fill="#9aa86a"/><path d="M0 262H1200V300Q600 290 0 300Z" fill="#a8b47a"/>
<path d="M590 262L610 262L980 480L220 480Z" fill="#4a4e52"/>
<g fill="{CRM}"><path d="M598.5 276h3l1 8h-5zM597.5 294h5l1.5 13h-8zM595.5 322h9l2 20h-13z"/>
<text x="600" y="440" text-anchor="middle" font-family="Arial" font-weight="900" font-size="96" transform="translate(0 440) scale(1 .5) translate(0 -440)" textLength="250" lengthAdjust="spacingAndGlyphs">35R</text>
{"".join(f'<path d="M{288+k*44} 462h28l-3 18h-28z"/>' for k in range(14) if k not in (6, 7))}</g>
<path d="M220 480L590 262M980 480L610 262" stroke="{CRM}" stroke-width="3" opacity=".9"/>
<g fill="#5a5f66"><rect x="1080" y="236" width="70" height="30"/><rect x="1150" y="230" width="60" height="36"/><rect x="760" y="244" width="90" height="20"/></g>
<path d="M1010 196V300" stroke="#9aa4ad" stroke-width="5"/><circle cx="1010" cy="194" r="4" fill="#9aa4ad"/>
<g class="sock"><path d="M1010 200L1072 208L1070 222L1010 228Z" fill="#e8743b"/><path d="M1031 202.5V225.5M1051 205V223.5" stroke="{CRM}" stroke-width="7"/></g>
<g class="rock" style="--o:610px 170px"><g transform="translate(610 166) rotate(-4) scale(.92)">{rear}</g></g>
<g stroke="#8a9096" stroke-width="1.6" opacity=".7" fill="none">{mesh}</g>
<path d="M0 320H1200" stroke="#8a9096" stroke-width="6"/><g fill="#7a8088">{"".join(f'<rect x="{x}" y="316" width="9" height="164"/>' for x in (40, 420, 800, 1180))}</g>
<path d="M90 480Q92 384 150 360L196 348H258L300 358Q352 382 352 480Z" fill="#a08a5a"/><path d="M178 352Q226 372 274 352L266 344H186Z" fill="#7d6b44"/>
<path d="M226 404V480" stroke="#7d6b44" stroke-width="3"/><path d="M110 430Q112 470 118 480M330 430Q330 470 326 480" stroke="#8c7850" stroke-width="3" fill="none"/>
<path d="M300 362Q330 330 340 280L364 284Q358 344 326 384Z" fill="#a08a5a"/><path d="M336 288L364 292" stroke="#7d6b44" stroke-width="4"/>
{hand(0, 352, 262, "s5", ' opacity="0"')}{hand(1, 352, 262, "s6", ' opacity="0"')}{hand(2, 352, 262, "s7", "")}
<path d="M152 362Q122 330 112 280L88 284Q94 344 126 384Z" fill="#a08a5a"/><path d="M116 288L88 292" stroke="#7d6b44" stroke-width="4"/>
{hand(4, 96, 262, "", "")}<path d="M80 268q-12-6-16-20" stroke="#c99a78" stroke-width="8" fill="none" stroke-linecap="round"/>
<rect x="210" y="330" width="34" height="24" fill="#b98a6a"/><ellipse cx="191" cy="306" rx="7" ry="11" fill="#b98a6a"/><ellipse cx="261" cy="306" rx="7" ry="11" fill="#b98a6a"/>
<ellipse cx="226" cy="302" rx="33" ry="38" fill="#bdbdbd"/><path d="M200 282Q226 262 252 282Q240 274 226 274Q212 274 200 282Z" fill="#cfcfcf"/><path d="M200 326Q226 344 252 326" stroke="#a9a9a9" stroke-width="5" fill="none"/>''',
 f'<defs><linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d82ad"/><stop offset="1" stop-color="#bcd5e2"/></linearGradient></defs>'
 f'<rect width="{W}" height="{H}" fill="url(#sky6)"/>'
 '<style>@media (prefers-reduced-motion:no-preference){\n'
 '.s5{animation:s5 9s infinite}@keyframes s5{0%,22%{opacity:1}24%,100%{opacity:0}}\n'
 '.s6{animation:s6 9s infinite}@keyframes s6{0%,22%{opacity:0}24%,46%{opacity:1}48%,100%{opacity:0}}\n'
 '.s7{animation:s7 9s infinite}@keyframes s7{0%,46%{opacity:0}48%,100%{opacity:1}}\n'
 '}</style>')

# 7 First Solo: 8:04 on October 20, Biscuit lifting off 35R northbound, the Front Range behind, one person aboard. Through the near
#   (right) window the right seat is empty; beyond it, Jordan in Danny's gray headset. The beacon blinks, Biscuit climbs away from
#   her shadow, the windsock hangs in the calm.
cabin = ('<path d="M86 80H104V93H80Z" fill="#3a5a6c"/>'
         '<circle cx="90" cy="86" r="3.6" fill="#2b2420" opacity=".85"/><path d="M86.4 84.2a3.8 3.8 0 0 1 7.2 0" stroke="#8a8f96" stroke-width="1.1" fill="none"/><ellipse cx="89.8" cy="87" rx="1.5" ry="2" fill="#7a7f86"/>'
         '<path d="M84 93q0-4 6-4.5q5 .5 5.5 4.5z" fill="#2b2420" opacity=".85"/>'
         '<path d="M97 93L98.5 81.5Q100.5 80 102.5 81.5L102 93Z" fill="#9a8a72"/><path d="M98.6 83.5L102.4 83.5" stroke="#7d6f5a" stroke-width=".8"/>')
A[7] = frame2(f'''<path d="M0 286L70 236L130 256L210 206L290 246L360 222L440 190L520 230L600 204L690 240L760 214L840 252L910 236L980 206L1060 238L1130 216L1200 238V310H0Z" fill="#5f6f94"/>
<path d="M440 190L466 208L452 206L430 198ZM210 206L230 220L214 218ZM980 206L1002 220L986 218ZM600 204L620 218L606 216Z" fill="#f3f1ec" opacity=".9"/>
<path d="M0 300L100 282L190 296L290 276L380 292L480 272L580 290L700 274L800 290L900 278L1000 292L1100 280L1200 290V318H0Z" fill="#4c5a78"/>
<rect x="0" y="316" width="{W}" height="164" fill="#b49a5c"/><path d="M0 316H1200V336H0Z" fill="#a38c55"/>
<g fill="#6b6f75"><rect x="40" y="300" width="80" height="20"/><rect x="124" y="296" width="70" height="24"/><rect x="1060" y="302" width="100" height="18"/><rect x="980" y="270" width="12" height="50"/><rect x="972" y="262" width="28" height="12" fill="#2a4a5c"/></g>
<rect x="0" y="404" width="{W}" height="62" fill="#55595d"/><path d="M0 407H1200M0 463H1200" stroke="{CRM}" stroke-width="3" opacity=".85"/>
<path d="M0 435H1200" stroke="{CRM}" stroke-width="3" stroke-dasharray="60 40" opacity=".8"/>
<g class="fade"><ellipse cx="560" cy="452" rx="250" ry="9" fill="#000" opacity=".22"/></g>
<g class="climb"><g transform="translate(250 -96) rotate(-7 520 390) scale(3.4)">{biscuit_r(cabin=cabin)}
<circle class="blink" cx="28" cy="49" r="2.4" fill="#e04a3b"/></g></g>
<path d="M1110 300V456" stroke="#9aa4ad" stroke-width="5"/><circle cx="1110" cy="298" r="4" fill="#9aa4ad"/><path d="M1110 306h12" stroke="#9aa4ad" stroke-width="3"/>
<g class="limp"><path d="M1116 304Q1134 304 1132 318L1128 362Q1124 368 1118 366L1112 320Q1104 306 1116 304Z" fill="#e8743b"/><path d="M1114 322L1131 320M1118 342L1130 341" stroke="{CRM}" stroke-width="7"/></g>''',
 f'<defs><linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f78b0"/><stop offset=".7" stop-color="#a9cbe0"/><stop offset="1" stop-color="#e6ecdc"/></linearGradient></defs>'
 f'<rect width="{W}" height="{H}" fill="url(#sky7)"/>')

out = os.path.join(ROOT, "courses", "pilot", "art")
os.makedirs(out, exist_ok=True)
for n, s in A.items():
    open(os.path.join(out, f"full-ch{n:02d}.svg"), "w").write(s)
print(len(A), "pilot banners ->", out)
