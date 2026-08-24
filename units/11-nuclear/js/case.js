// case.js - Unit 11 case file: a body in an Alpine glacier, dated by counting how much
// carbon-14 was left in it. Carries the story AND the stage art; the shared casefile
// component renders the chrome.
//
// The units_new build. Copied whole from units/11-nuclear/js/case.js, including the
// animated stage SVG, with no changes at all: cta.call already goes through setMode(),
// which is what the cockpit's station strip needs, so this is the one case file in the
// tree that ported without an edit.
//

export const CASE = {
  id: 'otzi-the-iceman',
  number: '011',
  kicker: 'a true story from a melting glacier',
  title: 'Two hikers found a body in the ice. Carbon-14 said it had been there 5,300 years',
  teaser: 'A body in an Alpine glacier, dated by counting the carbon-14 left in it',
  hook: 'In September 1991 two German hikers came off a ridge in the Otztal Alps and found a human head and shoulders sticking out of the ice. Everyone assumed a climbing accident from the last few decades. It was not. The body had been lying in that gully since before the pyramids were built, and the only way anybody could know that was to count what was left of one radioactive isotope inside him.',
  stats: [
    { v: '1991', k: 'found at 3,210 m in the Otztal Alps' },
    { v: '53%', k: 'of his carbon-14 still undecayed' },
    { v: '5,730 y', k: 'half-life of carbon-14' },
    { v: '5,300 y', k: 'the age that fraction works out to' }
  ],
  steps: [
    {
      t: 'Everyone guessed wrong',
      body: 'Helmut and Erika Simon thought they had found a modern climbing casualty, so the recovery was rough: a jackhammer, ski poles, and a body bag. The equipment beside him looked handmade but nobody at the scene could put a number on it. Guesses ran from a few decades to a few hundred years.',
      chem: 'Nothing about a body tells you its age directly. Preservation depends on the ice, not on the calendar. The age has to come from something inside him that has been counting on its own since the day he died.',
      cap: 'September 1991. A body in a melting gully, and nobody knows what year it is from.'
    },
    {
      t: 'The clock started when he stopped eating',
      body: 'High in the atmosphere, cosmic rays knock neutrons loose, and those neutrons hit nitrogen-14 and turn it into carbon-14. It mixes into the air as carbon dioxide, plants take it up, animals eat the plants, and every living thing carries the same small, steady fraction of it. The moment an organism dies it stops taking any more in.',
      chem: 'Carbon-14 beta decays back to nitrogen-14 with a half-life of 5,730 years. While you are alive, intake replaces what decays and the fraction holds steady. Once you die, nothing is replaced, and the fraction only falls.',
      cap: 'Alive: carbon-14 in and out, fraction steady. Dead: only decay.'
    },
    {
      t: 'Fifty-three percent',
      body: 'Four separate laboratories measured samples of his bone and tissue, and they agreed. A little over half of the carbon-14 he had been carrying when he died was still there. That single fraction is the whole measurement, because decay is first order: the fraction left depends only on how many half-lives have gone by.',
      chem: 'Age equals the half-life multiplied by log base 2 of one over the fraction remaining. With 53 percent left, that is 5,730 times log2(1.887), which is 5,730 times 0.92, or about 5,300 years. The uncertainty is a couple of centuries, not a couple of millennia.',
      cap: '53 percent left is 0.92 half-lives, and 0.92 half-lives is about 5,300 years.'
    },
    {
      t: 'The number changed what he was',
      body: 'A date of roughly 3300 BC put him in the Copper Age, and suddenly everything he was carrying made sense: the axe with a nearly pure copper blade, the unfinished bow, the birch bark containers. Ten years later a radiologist spotted a flint arrowhead lodged in his left shoulder on a scan that had been sitting in a file. He had not simply frozen. He had been shot, and the case became the oldest murder investigation ever opened.',
      chem: 'This is what a radiometric date buys you. It is not a fact about the object on its own, it is the key that makes every other fact about it interpretable. The same first-order decay law dates a coffin lid, a glacier core, and the vial of technetium on a hospital bench.',
      cap: 'A copper axe, a flint arrowhead, and a date that turned a body into a murder case.'
    }
  ],
  quiz: {
    q: 'A wooden tool from another dig has 25 percent of its original carbon-14 left. Carbon-14 has a half-life of 5,730 years. How old is it?',
    options: [
      { label: 'About 11,500 years, because a quarter left means two half-lives have passed', correct: true },
      { label: 'About 1,430 years, because a quarter of 5,730 years has passed', correct: false },
      { label: 'About 22,900 years, because a quarter left means four half-lives have passed', correct: false }
    ],
    explain: 'Each half-life halves what is left, so 100 percent goes to 50 percent to 25 percent in two steps. Two half-lives at 5,730 years each is 11,460 years. Decay is not linear: you never take a fixed amount away, you always take half of whatever is still there, which is why the answer comes from counting halvings rather than dividing.'
  },
  punch: 'You now hold the same tool that dated the Iceman. Fraction remaining goes in, number of half-lives comes out, and the age falls out of that. A hospital technologist runs the identical calculation every morning on a vial of technetium, over hours instead of millennia.',
  careers: ['Archaeologist', 'Radiocarbon laboratory technician', 'Nuclear medicine technologist', 'Forensic anthropologist'],
  cta: { label: 'Run a half-life calculation yourself', call: "setMode('dose')" },

  // Stage art. Every motion here is one of the classes casefile.css already defines, so
  // the global prefers-reduced-motion kill switch freezes all of it for free.
  // Two traps this scene hit during the build, worth knowing before editing it:
  //   1. `--deg` MUST carry a unit. `--deg:3` produces rotate(3), which is invalid, so
  //      the whole transform is dropped and the element silently never moves.
  //   2. casefile.css puts `transform-box: fill-box` on every .a-* element, so a px
  //      transform-origin is measured from that element's OWN bounding box, not from the
  //      viewBox. Orbiting a distant point is therefore not expressible that way (it
  //      flings the element off the canvas). Use translate-based flows instead, or
  //      keyword origins such as `center bottom`, which fill-box resolves correctly.
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: two hikers finding a body face down in an Alpine glacier with the head, shoulders and one arm clear of the meltwater, carbon-14 forming in the atmosphere and cycling through a living tree but only leaving a dead one, the decay curve read at 53 percent remaining, and the copper axe and flint arrowhead that the date explained">
            <defs>
              <linearGradient id="cf11-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#192f3d"/><stop offset="100%" stop-color="#24414d"/>
              </linearGradient>
              <linearGradient id="cf11-ice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#dcecf1"/><stop offset="100%" stop-color="#7fa8b4"/>
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="640" height="360" rx="10" fill="url(#cf11-sky)"/>

            <!-- the ridge is always there: this is one place, four moments -->
            <path d="M 0,210 L 96,142 L 168,186 L 262,104 L 356,182 L 452,132 L 548,198 L 640,158 L 640,360 L 0,360 Z"
                  fill="#213a45" stroke="#33525f" stroke-width="1.5"/>
            <path d="M 262,104 L 292,136 L 232,136 Z" fill="#e8f2f5" opacity=".92"/>
            <path d="M 452,132 L 476,158 L 428,158 Z" fill="#dbe9ee" opacity=".8"/>

            <!-- ============ chapter 1: the gully ============ -->
            <g x-show="step===0">
              <path d="M 130,276 C 214,252 292,262 358,272 C 430,283 512,262 600,268 L 600,360 L 130,360 Z"
                    fill="url(#cf11-ice)" opacity=".95"/>
              <ellipse cx="360" cy="304" rx="100" ry="32" fill="#4a7f8d" opacity=".38"/>
              <path class="a-flow" style="--fx:16px; --fy:0px; --dur:8s"
                    d="M 150,292 q 54,-7 108,0 q 54,7 108,0 q 54,-7 108,0"
                    fill="none" stroke="#f2fafc" stroke-width="1.6" opacity=".4"/>

              <!-- THE BODY. The note that used to sit here promised "the shoulders and one arm
                   clear of the meltwater" and then drew no arm, so it described an element that
                   had been removed. It also recorded two earlier attempts at the whole prone body
                   that both read as an animal, which is worth keeping: the fix is not more of the
                   body, it is a better read of less of it.
                   The version this replaces was a head and shoulders seen from straight above,
                   and it read as a paddle, because a dome centred on a wide smooth lozenge is a
                   paddle, a light bulb or a mushroom, and no amount of shading rescues a
                   silhouette that symmetric. What rescues it is the profile. The gully slopes and
                   the head end lies further up it, so from this low angle the head sits ABOVE the
                   shoulder line and the top edge goes bump, dip, hump. That head then neck then
                   back rhythm is the one human cue that survives at this size.
                   Everything else serves it: nothing is mirrored about a vertical axis, the arm
                   breaks the outer silhouette instead of being painted on top of the body, the
                   far end is CUT by the ice rather than tapering, because a taper reads as a tail
                   and turns him into a seal, and he is about a third of his old width, because at
                   the previous size the eye expected detail, found none, and settled on "prop".
                   He was largely bald, so the crown is a tone on the skull and adds nothing to
                   the outline. The dark keyline is what holds the edge now. That matters: the old
                   figure leaned on the hair for its top edge, and the hair was the exact
                   luminance of the sky behind it.
                   One variant was built and rejected, so it does not get retried: the arm folded
                   forward across the body, closer to how he was actually found. The deltoid and
                   the folded arm fuse with the torso into one wider mass and it goes back to
                   being a blob. He is a legible diagram here, not a forensic reconstruction. -->
              <g>
                <!-- meltwater hollow, deliberately not concentric with him -->
                <ellipse cx="356" cy="312" rx="56" ry="16" fill="#3f7280" opacity=".4" transform="rotate(-4 356 312)"/>
                <!-- the back: widest at the shoulders on the left, sloping away into the glacier -->
                <path d="M 337,301 C 339,291 347,285 357,285 C 370,285 383,293 394,304
                         C 398,310 396,316 390,318 C 375,322 355,321 345,315 C 339,311 336,306 337,301 Z"
                      fill="#5f4d3a" stroke="#423526" stroke-width="1.2"/>
                <!-- spine groove and the two shoulder blades. a bare human back really does read
                     as a groove flanked by a pair of ridges, and it is the cheapest true detail
                     available at this size. -->
                <path d="M 352,296 C 364,294 376,299 387,307" fill="none" stroke="#403328" stroke-width="2.4" opacity=".6"/>
                <path d="M 350,292 C 356,288 363,289 367,293" fill="none" stroke="#443728" stroke-width="2.4" opacity=".45"/>
                <path d="M 356,304 C 362,301 369,302 373,306" fill="none" stroke="#443728" stroke-width="2.4" opacity=".4"/>
                <!-- the neck: the most human junction there is, so it gets its own dark shape
                     rather than being left as a gap between two blobs -->
                <path d="M 329,288 L 339,293 L 336,301 L 326,295 Z" fill="#433524"/>
                <ellipse cx="320" cy="284" rx="10.5" ry="8.5" transform="rotate(-18 320 284)"
                         fill="#8b7255" stroke="#423526" stroke-width="1.2"/>
                <path d="M 311,281 C 311,275 316,272 322,273 C 327,274 330,277 330,281
                         C 324,277 316,277 311,281 Z" fill="#4a3b2a" opacity=".9"/>
                <path d="M 314,290 C 319,294 325,293 329,289" fill="none" stroke="#54432f" stroke-width="1.6" opacity=".75"/>
                <!-- the arm the old note promised. two stroked segments with round caps, the same
                     construction as the hikers' limbs, so the elbow reads as a joint. it only
                     earns its place by leaving the body outline. -->
                <path d="M 345,312 L 332,319" fill="none" stroke="#5f4d3a" stroke-width="7" stroke-linecap="round"/>
                <path d="M 332,319 L 316,316" fill="none" stroke="#80684e" stroke-width="6" stroke-linecap="round"/>
                <ellipse cx="310" cy="314" rx="5.2" ry="4" transform="rotate(-16 310 314)"
                         fill="#8b7255" stroke="#423526" stroke-width="1.2"/>
                <!-- light on the near shoulder, and the ice biting into him on a ragged line, so
                     he is IN the glacier and not lying on it -->
                <path d="M 339,295 C 343,288 349,283 358,283 C 350,286 344,290 341,298 Z" fill="#e8f2f5" opacity=".4"/>
                <path d="M 382,298 L 390,303 L 384,308 L 394,311 L 389,318
                         C 400,320 411,314 412,306 C 407,296 394,293 382,298 Z" fill="#cfe4ea" opacity=".55"/>
              </g>

              <!-- The two hikers. A gentle a-float idle, never a hop: nobody bounces next
                   to a body. The POINTING one stands on the right, nearest the find, so
                   the gesture runs into open ice instead of crossing the other figure. -->
              <g class="a-float" style="--fy:-2px; --wob:.8px; --tilt:.5deg; --dur:6.2s">
                <line x1="170" y1="234" x2="176" y2="271" stroke="#9db4bd" stroke-width="2"/>
                <rect x="139" y="230" width="12" height="21" rx="5" fill="#2a5b66"/>
                <path d="M 151,248 L 149,267" stroke="#273b46" stroke-width="6" stroke-linecap="round"/>
                <path d="M 160,248 L 163,267" stroke="#273b46" stroke-width="6" stroke-linecap="round"/>
                <path d="M 145,269 h 8" stroke="#132630" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 159,269 h 8" stroke="#132630" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 146,226 q 10,-5 20,0 l 2,24 q -12,4 -24,0 Z" fill="#3f8f9e"/>
                <path d="M 166,231 C 172,238 174,246 173,254" fill="none" stroke="#3f8f9e" stroke-width="5" stroke-linecap="round"/>
                <circle cx="156" cy="217" r="7.5" fill="#c99a72"/>
                <path d="M 148.5,216 a 7.5,7.5 0 0 1 15,0 z" fill="#c9772f"/>
                <circle cx="156" cy="208" r="2.2" fill="#e0a05e"/>
              </g>
              <g class="a-float" style="--fy:-2px; --wob:1px; --tilt:.6deg; --dur:7.6s; --delay:.9s">
                <line x1="196" y1="228" x2="192" y2="263" stroke="#9db4bd" stroke-width="2"/>
                <rect x="194" y="224" width="12" height="20" rx="5" fill="#7a3c33"/>
                <path d="M 205,242 L 203,259" stroke="#273b46" stroke-width="6" stroke-linecap="round"/>
                <path d="M 214,242 L 217,259" stroke="#273b46" stroke-width="6" stroke-linecap="round"/>
                <path d="M 199,261 h 8" stroke="#132630" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 213,261 h 8" stroke="#132630" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 200,220 q 10,-5 20,0 l 2,23 q -12,4 -24,0 Z" fill="#e0524a"/>
                <path d="M 222,225 C 234,227 244,231 252,236" fill="none" stroke="#e0524a" stroke-width="5.5" stroke-linecap="round"/>
                <ellipse cx="255" cy="238" rx="5" ry="3.6" fill="#f2a196" transform="rotate(22 255 238)"/>
                <circle cx="210" cy="211" r="7.2" fill="#d8b08c"/>
                <path d="M 202.8,210 a 7.2,7.2 0 0 1 14.4,0 z" fill="#2a6f7d"/>
                <circle cx="210" cy="202.5" r="2.1" fill="#4f93a0"/>
              </g>
              <text x="184" y="192" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#cfe4ea">two hikers off the ridge</text>

              <rect x="452" y="186" width="152" height="54" rx="8" fill="#132630" opacity=".9" stroke="#3a545f"/>
              <text class="a-blink" style="--dur:1.8s" x="528" y="212" text-anchor="middle"
                    font-family="JetBrains Mono" font-size="17" font-weight="700" fill="#ffd27e">AGE: ?</text>
              <text x="528" y="230" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">19 SEPT 1991 &#183; 3,210 m</text>
              <text x="372" y="348" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#223a44">face down in the meltwater, head, shoulders and one arm clear</text>
            </g>

            <!-- ============ chapter 2: where carbon-14 comes from, and where it stops ============ -->
            <g x-show="step===1">
              <!-- the ridge stays as texture but stops competing with the diagram -->
              <rect x="0" y="0" width="640" height="360" rx="10" fill="#132630" opacity=".74"/>

              <!-- rays kept out to the sides so they never cross the caption -->
              <g stroke="#7fc4d0" stroke-width="2.5" stroke-linecap="round" opacity=".9">
                <line class="a-flow" style="--fx:22px; --fy:30px; --dur:2.2s" x1="72" y1="10" x2="86" y2="30"/>
                <line class="a-flow" style="--fx:18px; --fy:32px; --dur:2.7s; --delay:.7s" x1="140" y1="6" x2="151" y2="28"/>
                <line class="a-flow" style="--fx:-20px; --fy:30px; --dur:2.4s; --delay:1.3s" x1="562" y1="10" x2="550" y2="30"/>
                <line class="a-flow" style="--fx:-16px; --fy:32px; --dur:2.9s; --delay:1.9s" x1="498" y1="6" x2="488" y2="28"/>
              </g>
              <text x="320" y="24" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">cosmic rays, hitting the upper atmosphere</text>

              <rect x="160" y="40" width="320" height="44" rx="10" fill="#0c1c27" stroke="#4f93a0"/>
              <text x="320" y="68" text-anchor="middle" font-family="JetBrains Mono" font-size="15" fill="#cfe4ea">n + N-14 &#8594; C-14 + p</text>

              <!-- fresh carbon-14 falling out of the equation and into the living world -->
              <g fill="#8fd9ae">
                <circle class="a-fall" style="--fy:62px; --sway:7px; --dur:3.2s" cx="128" cy="90" r="4"/>
                <circle class="a-fall" style="--fy:62px; --sway:-6px; --dur:3.7s; --delay:.9s" cx="186" cy="90" r="4"/>
                <circle class="a-fall" style="--fy:62px; --sway:6px; --dur:3.4s; --delay:1.7s" cx="244" cy="90" r="4"/>
              </g>

              <!-- LEFT: alive. Carbon goes in and comes out, so the fraction holds. -->
              <rect x="44" y="146" width="262" height="196" rx="12" fill="#142c37" stroke="#2f8f5b" stroke-width="1.5"/>
              <text x="175" y="168" text-anchor="middle" font-family="JetBrains Mono" font-size="11" font-weight="700" letter-spacing="1.6" fill="#8fd9ae">ALIVE</text>
              <rect x="169" y="262" width="12" height="48" rx="3" fill="#6b5033"/>
              <g class="a-sway" style="--dur:6s; --deg:2.4deg; transform-origin: center bottom;">
                <circle cx="175" cy="234" r="32" fill="#2f8f5b"/>
                <circle cx="152" cy="250" r="19" fill="#2f8f5b" opacity=".9"/>
                <circle cx="198" cy="250" r="19" fill="#2f8f5b" opacity=".9"/>
                <circle cx="167" cy="223" r="15" fill="#3aa76c" opacity=".75"/>
              </g>
              <!-- the two directions, labelled, so the dots are a mechanism and not decoration -->
              <g fill="#8fd9ae">
                <circle class="a-fall" style="--fy:34px; --dur:2.5s" cx="106" cy="188" r="3.4"/>
                <circle class="a-fall" style="--fy:34px; --dur:2.9s; --delay:1.1s" cx="106" cy="188" r="3.4"/>
                <circle class="a-rise" style="--rise:-34px; --wob:2px; --dur:3s; --delay:.5s" cx="244" cy="222" r="3.4"/>
                <circle class="a-rise" style="--rise:-34px; --wob:-2px; --dur:3.4s; --delay:1.6s" cx="244" cy="222" r="3.4"/>
              </g>
              <g stroke="#8fd9ae" stroke-width="2" fill="none" opacity=".85">
                <path d="M 106,186 L 106,224"/><path d="M 100,218 L 106,225 L 112,218"/>
                <path d="M 244,224 L 244,186"/><path d="M 238,192 L 244,185 L 250,192"/>
              </g>
              <text x="106" y="240" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">in</text>
              <text x="244" y="240" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">out</text>
              <rect x="96" y="318" width="158" height="7" rx="3.5" fill="#163b49"/>
              <rect x="96" y="318" width="158" height="7" rx="3.5" fill="#2f8f5b"/>
              <text x="262" y="325" font-family="JetBrains Mono" font-size="9" font-weight="700" fill="#8fd9ae">100%</text>
              <text x="175" y="336" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">in and out: the fraction holds steady</text>

              <!-- RIGHT: dead. Nothing comes in, so the fraction only falls. -->
              <rect x="334" y="146" width="262" height="196" rx="12" fill="#142c37" stroke="#8a5b4e" stroke-width="1.5"/>
              <text x="465" y="168" text-anchor="middle" font-family="JetBrains Mono" font-size="11" font-weight="700" letter-spacing="1.6" fill="#ffb3a7">DEAD</text>
              <g stroke="#6b5546" stroke-linecap="round" fill="none">
                <path d="M 478,310 L 476,240" stroke-width="8"/>
                <path d="M 477,272 C 466,264 456,250 452,234" stroke-width="5"/>
                <path d="M 477,258 C 490,250 500,238 504,226" stroke-width="5"/>
                <path d="M 476,244 C 468,234 462,224 460,214" stroke-width="4"/>
                <path d="M 476,240 C 484,230 490,222 496,216" stroke-width="3.5"/>
                <path d="M 453,236 C 448,230 446,224 445,218" stroke-width="2.5"/>
                <path d="M 502,230 C 506,224 508,220 512,216" stroke-width="2.5"/>
              </g>
              <g fill="#7a6349" opacity=".7">
                <ellipse cx="452" cy="308" rx="7" ry="3" transform="rotate(-12 452 308)"/>
                <ellipse cx="500" cy="311" rx="6" ry="2.6" transform="rotate(9 500 311)"/>
                <ellipse cx="474" cy="314" rx="6.5" ry="2.8"/>
              </g>
              <!-- mirrors the ALIVE panel exactly: the "in" position on the left is struck
                   out, and only the "out" arrow on the right survives -->
              <g fill="#ffb3a7">
                <circle class="a-rise" style="--rise:-34px; --wob:2px; --dur:2.7s" cx="534" cy="222" r="3.4"/>
                <circle class="a-rise" style="--rise:-34px; --wob:-2px; --dur:3.2s; --delay:1.3s" cx="534" cy="222" r="3.4"/>
              </g>
              <g stroke="#ffb3a7" stroke-width="2" fill="none" opacity=".85">
                <path d="M 534,224 L 534,186"/><path d="M 528,192 L 534,185 L 540,192"/>
              </g>
              <text x="534" y="240" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#ffb3a7">out</text>
              <g opacity=".8">
                <path d="M 396,186 L 396,220" stroke="#8fd9ae" stroke-width="2"/>
                <path d="M 390,214 L 396,221 L 402,214" fill="none" stroke="#8fd9ae" stroke-width="2"/>
                <path d="M 384,186 L 408,220" stroke="#e0524a" stroke-width="3" stroke-linecap="round"/>
              </g>
              <text x="396" y="240" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">no way in</text>
              <rect x="386" y="318" width="158" height="7" rx="3.5" fill="#163b49"/>
              <rect x="386" y="318" width="84" height="7" rx="3.5" fill="#bf4a30"/>
              <text x="552" y="325" font-family="JetBrains Mono" font-size="9" font-weight="700" fill="#ffb3a7">53%</text>
              <text x="465" y="336" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#ffb3a7">only out: the fraction only falls</text>
            </g>

            <!-- ============ chapter 3: the decay curve, read at 53 percent ============ -->
            <g x-show="step===2">
              <rect x="0" y="0" width="640" height="360" rx="10" fill="#132630" opacity=".74"/>
              <rect x="40" y="46" width="560" height="284" rx="12" fill="#0c1c27" stroke="#33525f"/>
              <text x="320" y="72" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">FOUR LABORATORIES, ONE FRACTION</text>
              <line x1="80" y1="92" x2="80" y2="292" stroke="#6e8794" stroke-width="2"/>
              <line x1="80" y1="292" x2="580" y2="292" stroke="#6e8794" stroke-width="2"/>
              <text x="62" y="96" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">100%</text>
              <text x="62" y="191" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">50%</text>
              <g font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">
                <text x="80" y="308" text-anchor="middle">0</text>
                <text x="240" y="308" text-anchor="middle">1</text>
                <text x="400" y="308" text-anchor="middle">2</text>
                <text x="560" y="308" text-anchor="middle">3</text>
              </g>
              <text x="330" y="324" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">half-lives elapsed (one half-life = 5,730 years)</text>
              <!-- The curve is drawn twice on purpose: a faint static copy so the shape is
                   never absent (a-draw is a one-shot, and a frozen or interrupted animation
                   would otherwise leave an empty chart), plus the bright stroke that draws
                   itself in on top. The dash length is the polyline's measured length, not
                   a guess. Note: no double hyphen may appear inside an SVG comment, because
                   XML forbids it and it breaks any strict re-parse of this markup. -->
              <polygon points="80,92 160,148 240,187 320,215 400,235 480,248 560,258 560,292 80,292"
                       fill="#4f93a0" opacity=".08"/>
              <polyline points="80,92 160,148 240,187 320,215 400,235 480,248 560,258"
                        fill="none" stroke="#4f93a0" stroke-width="2" opacity=".3"/>
              <polyline class="a-draw" style="--dash:520; --dur:2.6s"
                        points="80,92 160,148 240,187 320,215 400,235 480,248 560,258"
                        fill="none" stroke="#7fc4d0" stroke-width="3.5" stroke-linecap="round"/>
              <line x1="80" y1="181" x2="228" y2="181" stroke="#ffd27e" stroke-dasharray="4 4"/>
              <line x1="228" y1="181" x2="228" y2="292" stroke="#ffd27e" stroke-dasharray="4 4"/>
              <circle class="a-pulse" style="--dur:2s" cx="228" cy="181" r="7" fill="#ffd27e"/>
              <!-- the annotation sits well clear of the curve, which passes under it -->
              <text x="330" y="112" font-family="JetBrains Mono" font-size="12" font-weight="700" fill="#ffd27e">53% left</text>
              <text x="330" y="132" font-family="JetBrains Mono" font-size="10" fill="#cfe4ea">= 0.92 half-lives</text>
              <text x="330" y="154" font-family="JetBrains Mono" font-size="14" font-weight="700" fill="#8fd9ae">= 5,300 years</text>
              <path d="M 236,176 C 268,158 300,136 322,120" fill="none" stroke="#ffd27e" stroke-width="1" opacity=".5" stroke-dasharray="3 3"/>
            </g>

            <!-- ============ chapter 4: what the date explained ============ -->
            <g x-show="step===3">
              <rect x="0" y="0" width="640" height="360" rx="10" fill="#132630" opacity=".74"/>
              <rect x="52" y="66" width="248" height="250" rx="10" fill="#0c1c27" stroke="#4f93a0"/>
              <text x="176" y="92" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">WHAT HE CARRIED</text>

              <!-- the copper axe. The real one is a yew haft cut from a branch fork, so the
                   head end is an L: a long handle, a short arm angling forward, and the cast
                   blade set into a slot in that arm and bound with leather.
                   Three things were wrong with the version this replaces, all of them visible
                   the moment you rasterise it small and look at the outline alone:
                     1. the haft was one constant width stroke with round caps, which reads as a
                        pipe or a bent straw. Real hafts taper, so this one is a filled path that
                        goes from about 9 units at the knee to 6 at the butt.
                     2. the short arm was nearly as long as the handle, so the whole thing read
                        as a hockey stick. The head is now compact: a 22 unit arm against a 115
                        unit handle, close to the real 1 to 5.
                     3. the cutting edge pointed up and away. On an axe the edge sits roughly
                        PARALLEL to the handle, and that is most of what separates an axe from a
                        flag on a pole. The blade now projects nearly sideways.
                   Keeping the old note, because it is still true: the blade is a WEDGE with a
                   narrow butt and straight diverging sides. Curve the sides and it stops being
                   an axe and becomes a paddle.
                   The lashing is drawn ON TOP of both the wood and the blade butt, which is both
                   what leather binding actually does and the thing that stops the copper and the
                   yew reading as one fused mass.
                   Centred on x 120 so it sits over its own labels. The old one was centred on
                   136 while the captions sat at 120, so it always looked shunted right. -->
              <!-- the two objects sit side by side with their labels underneath, so no
                   caption has to run across the haft -->
              <g>
                <path d="M 104.2,254.3 L 89.5,136 L 116,131 L 119,141.5 L 100.5,147 L 109.8,253.7
                         Q 107,258.5 104.2,254.3 Z" fill="#7a5c3a" stroke="#4a3826" stroke-width="1"/>
                <path d="M 105.5,250 L 91.8,141" fill="none" stroke="#96754b" stroke-width="1.8" opacity=".75"/>
                <path d="M 108.6,250 L 100.4,150" fill="none" stroke="#5f4930" stroke-width="1.6" opacity=".55"/>
                <path d="M 102,228 L 95.4,172" fill="none" stroke="#634b2f" stroke-width="1.1" opacity=".5"/>
                <ellipse cx="107" cy="254.5" rx="3" ry="1.4" fill="#5c4629"/>
                <path d="M 110.9,130.7 L 143.9,114.4 Q 151.6,127.3 151.2,142.4 L 114.5,144.3 Z"
                      fill="#c9772f" stroke="#a85f22" stroke-width="1.2"/>
                <path d="M 136.6,116.9 Q 144.3,129.2 143.9,141.8" fill="none" stroke="#e09a52" stroke-width="2" opacity=".85"/>
                <!-- the brightest thing on the card, because the edge is the whole point of it -->
                <path d="M 143.9,114.4 Q 151.6,127.3 151.2,142.4" fill="none" stroke="#f0c48a" stroke-width="3.5" stroke-linecap="round"/>
                <g stroke="#483625" stroke-width="3.4" stroke-linecap="round">
                  <path d="M 100,133.2 L 103.2,145.8"/>
                  <path d="M 105.5,132 L 108.7,144.6"/>
                  <path d="M 111,130.7 L 114.2,143.3"/>
                </g>
                <path d="M 100.5,143 L 114.5,139.5" fill="none" stroke="#6b543a" stroke-width="2" opacity=".85"/>
              </g>
              <text x="120" y="276" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#e0a05e">copper axe</text>
              <text x="120" y="289" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#8fa9b2">near-pure cast blade</text>

              <circle class="a-pulse" style="--dur:2.4s" cx="238" cy="222" r="30" fill="none" stroke="#e0524a" stroke-width="1.5"/>
              <g transform="rotate(20 238 222)">
                <!-- a leaf-shaped point with a short tang. An earlier version used a coarse
                     zigzag outline to suggest knapping and it read as a lightning bolt; the
                     flake scars belong on the FACE, not on the silhouette. -->
                <path d="M 238,198 C 241,206 244,214 246,224 C 247,230 246,236 244,240
                         L 240,240 L 240,248 L 236,248 L 236,240 L 232,240
                         C 230,236 229,230 230,224 C 232,214 235,206 238,198 Z"
                      fill="#c2d4da" stroke="#7d97a1" stroke-width="1.1"/>
                <g stroke="#93aab3" stroke-width=".8" fill="none" opacity=".8">
                  <path d="M 238,201 L 238,238"/>
                  <path d="M 238,208 L 233,220"/><path d="M 238,214 L 243,226"/>
                  <path d="M 238,222 L 232,232"/><path d="M 238,228 L 244,235"/>
                </g>
              </g>
              <text x="238" y="276" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#cfe4ea">flint arrowhead</text>
              <text x="238" y="289" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#8fa9b2">spotted on a scan, 2001</text>

              <!-- the date that makes every one of those objects legible -->
              <rect x="332" y="66" width="256" height="250" rx="10" fill="#f3f7f8" stroke="#c9d9de" stroke-width="2"/>
              <text x="460" y="100" text-anchor="middle" font-family="Bitter" font-size="15" font-weight="700" fill="#24363f">Radiocarbon report</text>
              <line x1="354" y1="112" x2="566" y2="112" stroke="#24363f" stroke-width="3"/>
              <g font-family="JetBrains Mono" font-size="10" fill="#38484f">
                <text x="354" y="140">fraction remaining</text>
                <text x="566" y="140" text-anchor="end" font-weight="700">0.53</text>
                <text x="354" y="166">half-life</text>
                <text x="566" y="166" text-anchor="end" font-weight="700">5,730 y</text>
                <text x="354" y="192">half-lives elapsed</text>
                <text x="566" y="192" text-anchor="end" font-weight="700">0.92</text>
              </g>
              <line x1="354" y1="210" x2="566" y2="210" stroke="#24363f" stroke-width="2"/>
              <text x="354" y="238" font-family="JetBrains Mono" font-size="11" fill="#24363f">age</text>
              <text x="566" y="240" text-anchor="end" font-family="JetBrains Mono" font-size="19" font-weight="700" fill="#2f8f5b">5,300 y</text>
              <!-- the conclusion gets its own stamp, so it cannot be misread as another
                   row of the table above it -->
              <g class="a-glow" style="--dur:3.2s">
                <rect x="366" y="264" width="188" height="26" rx="13" fill="#f7e3dd" stroke="#e0b8ac"/>
                <text x="460" y="281" text-anchor="middle" font-family="JetBrains Mono" font-size="11" font-weight="700" fill="#bf4a30">COPPER AGE, ABOUT 3300 BC</text>
              </g>
              <text x="460" y="306" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#687a82">the oldest murder case ever opened</text>
            </g>
          </svg>`
};
