// A fully vector scene. The sealed sample is a separate model, not a diver's lung.
// Radius follows the cube root of volume; the depth ruler and sample share a scale.
export const DIVING_SCENE = `
<svg class="diving-scene" viewBox="0 0 960 540" role="img" aria-label="Interactive Boyle's law: a sealed model gas sample expands from 1 liter at 30 meters to 4 liters at the surface. A scuba diver and animated exhalation bubbles provide context.">
  <defs>
    <linearGradient id="u7-water" x2=".2" y2="1"><stop stop-color="#287784"/><stop offset=".4" stop-color="#124858"/><stop offset="1" stop-color="#041e30"/></linearGradient>
    <linearGradient id="u7-sky" x2="0" y2="1"><stop stop-color="#9ac8cd"/><stop offset="1" stop-color="#dbe2ce"/></linearGradient>
    <linearGradient id="u7-ray" x2="0" y2="1"><stop stop-color="#d9f4df" stop-opacity=".28"/><stop offset="1" stop-color="#aee5df" stop-opacity="0"/></linearGradient>
    <linearGradient id="u7-steel" x2="0" y2="1"><stop stop-color="#456570"/><stop offset=".25" stop-color="#c7d9d8"/><stop offset=".43" stop-color="#eef2df"/><stop offset=".7" stop-color="#829f9f"/><stop offset="1" stop-color="#304e58"/></linearGradient>
    <linearGradient id="u7-suit" x2=".7" y2="1"><stop stop-color="#395c65"/><stop offset=".4" stop-color="#142d3c"/><stop offset="1" stop-color="#071821"/></linearGradient>
    <linearGradient id="u7-fin" x2=".2" y2="1"><stop stop-color="#84c4bc"/><stop offset=".45" stop-color="#348e92"/><stop offset="1" stop-color="#175665"/></linearGradient>
    <linearGradient id="u7-reef" x2="0" y2="1"><stop stop-color="#30636a"/><stop offset="1" stop-color="#0a2b39"/></linearGradient>
    <radialGradient id="u7-sample" cx=".3" cy=".25" r=".78"><stop stop-color="#fff1ba" stop-opacity=".93"/><stop offset=".32" stop-color="#e7c16c" stop-opacity=".64"/><stop offset=".75" stop-color="#9c782e" stop-opacity=".25"/><stop offset="1" stop-color="#ffe3a0" stop-opacity=".8"/></radialGradient>
    <radialGradient id="u7-bubble" cx=".3" cy=".2"><stop stop-color="#e6ffff" stop-opacity=".7"/><stop offset=".42" stop-color="#c6f6ee" stop-opacity=".03"/><stop offset="1" stop-color="#bfeee5" stop-opacity=".5"/></radialGradient>
    <pattern id="u7-ripples" width="150" height="80" patternUnits="userSpaceOnUse"><path d="M-20 25 Q20 3 58 20 T150 18 M30 60 Q62 45 110 58 T180 53" fill="none" stroke="#a2e3d8" stroke-opacity=".12" stroke-width="2"/></pattern>
    <clipPath id="u7-underwater"><rect y="83" width="960" height="457"/></clipPath>
  </defs>

  <!-- Surface and layered light stay secondary to the model's gold sample. -->
  <rect width="960" height="540" fill="url(#u7-water)"/>
  <path d="M0 0H960V83Q840 91 720 83T480 83T240 83T0 83Z" fill="url(#u7-sky)"/>
  <circle cx="737" cy="32" r="19" fill="#fff2c4" opacity=".85"/>
  <path d="M0 64Q100 43 190 64T410 63L410 83H0Z" fill="#527d86" opacity=".3"/>
  <g transform="translate(459 28)" fill="#24434a" stroke="#44646a" stroke-linejoin="round">
    <path d="M-66 37L58 37 43 54H-48Z"/><path d="M-25 36V14H21L38 36Z" fill="#d8dfcf"/>
    <path d="M-18 19H0V32H-18ZM6 19H17L29 32H6Z" fill="#456b74"/>
    <path d="M8 14V0M-3 1H24" fill="none" stroke-width="2"/>
  </g>
  <g clip-path="url(#u7-underwater)">
    <g class="a-pulse" style="--dur:9s" fill="url(#u7-ray)">
      <path d="M410 80L220 505H385L485 80Z"/><path d="M559 80L471 480H558L597 80Z"/><path d="M670 80L737 495H837L714 80Z"/>
    </g>
    <rect y="85" width="960" height="170" fill="url(#u7-ripples)" opacity=".65"/>
    <path d="M0 475Q150 410 300 470T600 466T960 453V540H0Z" fill="#174451" opacity=".5"/>
    <g fill="#81b3ba" opacity=".32">
      <path d="M75 220q14-12 32 0-18 12-32 0l-10 9v-18zM133 205q11-9 24 0-13 9-24 0l-8 7v-14zM102 244q10-8 22 0-12 8-22 0l-7 6v-12z"/>
      <path d="M753 321q-13-10-30 0 17 10 30 0l9 7v-14zM786 341q-11-9-25 0 14 9 25 0l8 7v-14z"/>
    </g>
    <g fill="#caeee4" opacity=".3"><circle cx="120" cy="315" r="1.6"/><circle cx="184" cy="151" r="1"/><circle cx="447" cy="243" r="1.7"/><circle cx="515" cy="467" r="1.3"/><circle cx="725" cy="240" r="1.6"/><circle cx="781" cy="407" r="1"/><circle cx="250" cy="423" r="1.3"/></g>
  </g>
  <path d="M-30 83Q30 75 90 83T210 83T330 83T450 83T570 83T690 83T810 83T990 83" stroke="#c3e7de" stroke-width="2" fill="none" opacity=".65"/>
  <path class="a-flow" style="--fx:24px;--dur:7s" d="M-30 89Q35 80 100 89T230 89T360 89T490 89T620 89T750 89T880 89T1010 89" stroke="#c3e7de" stroke-width="1" fill="none" opacity=".35"/>

  <!-- Diver: fins, articulated wetsuit, buoyancy vest, cylinder, mask and regulator. -->
  <g class="a-float" style="--fy:-5px;--tilt:1deg;--dur:6s">
    <g transform="translate(260 329) rotate(-12)">
      <path d="M-15 18L-62 6-100 35" stroke="#0b2531" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="a-sway" style="--deg:4deg;--dur:3.8s;transform-origin:100% 50%">
        <path d="M-96 26L-124 31-180 19-184 37-127 52-96 43Z" fill="url(#u7-fin)" stroke="#6cafb3" stroke-width="1.5"/>
        <path d="M-124 36L-176 26M-123 44L-177 34" fill="none" stroke="#b2d3c9" opacity=".45"/>
      </g>
      <path d="M2 18L-42 49-93 58" stroke="url(#u7-suit)" stroke-width="28" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M-6 16L-42 41-87 51" stroke="#529e9f" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g class="a-sway" style="--deg:5deg;--dur:3.8s;--delay:-1.9s;transform-origin:100% 50%">
        <path d="M-87 48L-113 52-158 77-151 92-102 70-87 66Z" fill="url(#u7-fin)" stroke="#70b8b8" stroke-width="1.5"/>
        <path d="M-111 58L-151 80M-106 64L-148 86" fill="none" stroke="#b2d3c9" opacity=".45"/>
      </g>
      <path d="M-17-10Q8-26 56-20L74 0Q54 32 1 34L-22 22Z" fill="url(#u7-suit)" stroke="#446d75" stroke-width="2"/>
      <path d="M3-14L11 28M42-18L49 20" stroke="#071b27" stroke-width="10"/>
      <path d="M-11 18Q21 29 55 11" fill="none" stroke="#63a6a6" stroke-width="3"/>
      <rect x="10" y="18" width="13" height="9" rx="2" fill="#9fb8ae" stroke="#173743" stroke-width="2"/>
      <g transform="rotate(-3)">
        <rect x="-29" y="-43" width="96" height="29" rx="14" fill="url(#u7-steel)" stroke="#95b5b6" stroke-width="1.5"/>
        <path d="M-16-37H53" stroke="#e4eee1" stroke-width="2" opacity=".8"/>
        <path d="M-5-44V-12M39-44V-12" stroke="#112d39" stroke-width="8"/>
        <path d="M67-31H77V-23H67" fill="#b4c4b9"/>
        <path d="M73-28V-38M69-38H79" stroke="#c4d8cc" stroke-width="3"/>
      </g>
      <path d="M56-3L79 28 114 20" fill="none" stroke="#0a2532" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M59-3L79 22 102 18" fill="none" stroke="#4b9399" stroke-width="4"/>
      <path d="M108 13Q121 8 131 14L134 20 119 27 110 24Z" fill="#afbaaa"/>
      <rect x="97" y="12" width="11" height="13" rx="3" fill="#233e49"/><rect x="99" y="14" width="7" height="8" rx="1" fill="#a9d4bb"/>
      <path d="M63-11L74-28 91-21 91-6 77 7Z" fill="#152f3b"/>
      <path d="M77-47Q99-52 110-35L112-14 103-3 83-4 72-18Q68-36 77-47Z" fill="url(#u7-suit)" stroke="#60939a" stroke-width="1.5"/>
      <path d="M98-39Q109-34 110-24L116-19 110-16 108-6 97-4 91-14Z" fill="#b9c3b1"/>
      <path d="M75-32L98-29" stroke="#789b9b" stroke-width="5"/>
      <path d="M94-35L112-31 114-19 98-18 92-24Z" fill="#a0d8d6" fill-opacity=".6" stroke="#162e39" stroke-width="4"/>
      <path d="M98-31L109-28" stroke="#e0eee1" stroke-width="2"/>
      <circle cx="111" cy="-7" r="8" fill="#233d48" stroke="#8caead" stroke-width="2"/>
      <path d="M114-5C145 14 140 42 109 38S60 4 75-28" fill="none" stroke="#102a35" stroke-width="7"/>
      <path d="M114-5C145 14 140 42 109 38S60 4 75-28" fill="none" stroke="#739b97" stroke-width="1.5"/>
      <path d="M2-10C-8 47 39 59 45 20" fill="none" stroke="#c7b05f" stroke-width="3"/>
    </g>
  </g>
  <g fill="url(#u7-bubble)" stroke="#b6e4dc" stroke-width=".8">
    <circle class="a-rise" style="--rise:-200px;--wob:12px;--dur:5s;--delay:-1s" cx="371" cy="300" r="6"/>
    <circle class="a-rise" style="--rise:-205px;--wob:-9px;--dur:6s;--delay:-3s" cx="382" cy="294" r="8"/>
    <circle class="a-rise" style="--rise:-200px;--wob:15px;--dur:5.5s;--delay:-4s" cx="365" cy="291" r="4"/>
    <circle class="a-rise" style="--rise:-203px;--wob:8px;--dur:4.8s;--delay:-2s" cx="380" cy="302" r="3"/>
    <circle class="a-rise" style="--rise:-200px;--wob:-14px;--dur:6.5s;--delay:-5.5s" cx="373" cy="297" r="5"/>
  </g>

  <!-- Foreground reef uses layered silhouettes, fine branches and drifting grass. -->
  <path d="M0 502L43 478 97 490 138 467 185 477 234 507 301 500 363 520 449 514 520 533 960 523V540H0Z" fill="url(#u7-reef)"/>
  <path d="M32 509L77 495 112 505M126 485L145 478 179 489M206 509L230 515 264 510" fill="none" stroke="#54827e" stroke-width="2" opacity=".6"/>
  <g fill="none" stroke-linecap="round">
    <path d="M113 509V463M113 487L96 475 89 452M97 475L80 473M113 479L129 462 130 446M127 464L144 457M113 467L107 448" stroke="#936f60" stroke-width="7"/>
    <path d="M113 508V463M97 475L89 452M129 462L130 448" stroke="#c3987c" stroke-width="2" opacity=".8"/>
    <g class="a-sway" style="--deg:3deg;--dur:6s;transform-origin:50% 100%" stroke="#518c83" stroke-width="4">
      <path d="M40 516Q15 482 34 441M49 518Q65 479 50 458M54 519Q80 497 76 470M321 532Q302 504 314 479M331 535Q345 508 337 492"/>
    </g>
  </g>

  <!-- Scientific overlay: fixed n and T, with absolute pressure and a calibrated ruler. -->
  <g font-family="Nunito Sans, sans-serif">
    <rect x="24" y="108" width="276" height="111" rx="12" fill="#071f2b" fill-opacity=".88" stroke="#67969b" stroke-opacity=".5"/>
    <text x="42" y="132" font-size="13" fill="#b8d7d6">Boyle’s law · sealed gas sample</text>
    <text class="dive-pressure" x="42" y="163" font-size="22" font-weight="650" fill="#c0ece6" x-text="'P = ' + (1 + depth/10).toFixed(1) + ' atm'"></text>
    <text class="dive-volume" x="42" y="193" font-size="22" font-weight="650" fill="#ffe0a0" x-text="'V = ' + (4/(1 + depth/10)).toFixed(2) + ' L'"></text>
    <text x="181" y="187" font-size="12" fill="#b4d2ca">PV = 4.0 L·atm</text>
    <text x="181" y="204" font-size="11" fill="#b4d2ca">Fixed n and T</text>

    <text x="596" y="34" text-anchor="middle" font-size="14" font-weight="650" fill="#24464e">Sealed model sample</text>
    <text x="596" y="54" text-anchor="middle" font-size="12" fill="#365a62">1.0 L at 30 m → 4.0 L at surface</text>
    <path d="M596 103V465" stroke="#aacbc6" stroke-opacity=".18" stroke-dasharray="3 8"/>
    <g class="dive-sample" :transform="'translate(596 ' + (140 + depth*9) + ')'">
      <path d="M54 0H222" stroke="#e6d393" stroke-opacity=".55" stroke-dasharray="4 5"/>
      <circle class="dive-sample-shell" :r="30 * Math.cbrt(4/(1 + depth/10))" fill="url(#u7-sample)" stroke="#f8d99b" stroke-width="1.8"/>
      <circle r="30" fill="none" stroke="#ffe9b7" stroke-opacity=".45" stroke-dasharray="3 4"/>
      <ellipse :cx="-10 * Math.cbrt(4/(1 + depth/10))" :cy="-16 * Math.cbrt(4/(1 + depth/10))" :rx="10 * Math.cbrt(4/(1 + depth/10))" :ry="5 * Math.cbrt(4/(1 + depth/10))" transform="rotate(-25)" fill="#fff3d2" opacity=".6"/>
      <path :d="'M-4 ' + (30 * Math.cbrt(4/(1 + depth/10))) + 'l-2 8h12l-2-8'" fill="#d5b269" stroke="#ffe0a0"/>
      <text y="5" text-anchor="middle" fill="#fff3d0" font-size="16" font-weight="750" x-text="(4/(1 + depth/10)).toFixed(2) + ' L'"></text>
    </g>
    <text x="596" y="489" text-anchor="middle" fill="#c9ded7" font-size="12">Dashed circle: original 1.0 L volume</text>
    <text x="596" y="508" text-anchor="middle" fill="#9ebebc" font-size="12">Idealized flexible container · not a lung</text>

    <rect x="810" y="108" width="126" height="354" rx="12" fill="#072331" fill-opacity=".68" stroke="#6b9c9e" stroke-opacity=".35"/>
    <text x="873" y="129" text-anchor="middle" font-size="11" fill="#a9ccca">DEPTH / PRESSURE</text>
    <path d="M832 140V410M824 140H840M828 185H836M824 230H840M828 275H836M824 320H840M828 365H836M824 410H840" fill="none" stroke="#8bb8b9" stroke-opacity=".7"/>
    <g font-size="13" fill="#d1e5df"><text x="847" y="145">0 m · 1 atm</text><text x="847" y="235">10 m · 2 atm</text><text x="847" y="325">20 m · 3 atm</text><text x="847" y="415">30 m · 4 atm</text></g>
    <path class="dive-depth-marker" :transform="'translate(818 ' + (140 + depth*9) + ')'" d="M-9-5L0 0-9 5Z" fill="#f7d99b"/>
    <text x="873" y="444" text-anchor="middle" font-size="11" fill="#98bdbd">Schematic depth scale</text>
    <g x-show="step===2"><rect x="30" y="397" width="336" height="39" rx="8" fill="#082532" fill-opacity=".92" stroke="#b2cabe" stroke-opacity=".5"/><text x="198" y="421" text-anchor="middle" font-size="15" font-weight="650" fill="#e3eee0">Keep breathing throughout an ascent</text></g>
  </g>
</svg>
`;
