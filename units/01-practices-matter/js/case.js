// case.js — Unit 1 case file: the Mars Climate Orbiter unit error (1999).
// Carries the story AND the stage art; rendered by the shared casefile component.
// The same story units/01-practices-matter tells, carried here in full so the units_new
// tree stands on its own. The only edit is the closing call to action, which names this
// build's setMode() instead of assigning `mode` directly.

export const CASE = {
  id: 'mars-orbiter-units',
  number: '001',
  kicker: 'a true story',
  title: 'The $327 million unit mistake',
  teaser: 'The unit mistake that killed a $327M Mars mission',
  hook: 'In 1999 a NASA spacecraft flew 669 million kilometers to Mars, then vanished in under a minute. No explosion on camera, no alien mystery. The killer was a measurement habit you are building right now.',
  stats: [
    { v: '$327M', k: 'mission lost' },
    { v: '4.45x', k: 'size of the unit error' },
    { v: '57 km', k: 'arrival altitude, not 226' }
  ],
  steps: [
    {
      t: 'Two teams, one spacecraft',
      body: 'Lockheed Martin wrote the thruster software in Colorado. NASA JPL flew the spacecraft from California. For nine months of cruise, that software reported every small course-correction burn to the JPL navigators.',
      chem: 'A measurement is a number AND a unit. Drop the unit and the number means nothing. That is why every value you record in this unit carries its label.',
      cap: 'Cruise phase: Earth to Mars, 669 million km, steered by dozens of small burns.'
    },
    {
      t: 'The invisible mismatch',
      body: 'The Lockheed code output thruster impulse in pound-seconds, a US customary unit. The JPL navigation code expected newton-seconds, the SI unit. Nobody converted. Every burn was silently logged 4.45 times weaker than it really was.',
      chem: '1 pound-force = 4.45 newtons. A conversion factor is the bridge between unit systems. Skip the bridge and the data lies to you with a straight face.',
      cap: 'Same data line, two languages: lbf-s sent, N-s assumed.'
    },
    {
      t: 'Nine months of tiny drifts',
      body: 'Each individual error was small, so the trajectory looked almost right. Navigators noticed odd residuals, but the anomaly reports were never fully run down. The little biases stacked, all in the same direction.',
      chem: 'That is systematic error: precise, repeatable, and consistently wrong the same way. Repeating the measurement cannot fix it. Checking the method can.',
      cap: 'Planned path vs actual path: the gap grows with every burn.'
    },
    {
      t: 'September 23, 1999',
      body: 'The plan was a safe pass 226 km above Mars. The orbiter actually arrived at about 57 km, deep inside the atmosphere, and was torn apart or skipped away into space. Ten months of flight ended inside a minute.',
      chem: 'The accident board wrote a fix that reads like your lab checklist: label units on every value, verify every conversion, chase every anomaly. Measurement discipline is mission discipline.',
      cap: 'Loss of signal, 09:06 UTC. The orbiter was never heard from again.'
    }
  ],
  quiz: {
    q: 'A burn log read "1.0". Lockheed meant 1.0 pound-seconds; JPL read it as 1.0 newton-seconds. The real push was 4.45 N-s. What did the navigation model believe?',
    options: [
      { label: 'It recorded about 4.45 times too much push', correct: false },
      { label: 'It recorded only about 22% of the real push', correct: true },
      { label: 'Nothing changed, the numbers matched', correct: false }
    ],
    explain: '1 lbf-s equals 4.45 N-s, so reading it as 1.0 N-s undercounts the burn by a factor of 4.45. The model believed the craft had barely been pushed when it had. Burn after undercounted burn dragged the arrival point 169 km too low.'
  },
  punch: 'A $327 million spacecraft died of a skipped conversion factor. The units, sig figs, and error analysis in this unit are exactly the skills that would have caught it.',
  careers: ['Spacecraft navigator', 'Forensic analyst', 'Pharmacy tech', 'Quality engineer'],
  cta: { label: 'Train the skills that would have saved it', call: "setMode('measure')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: the Mars Climate Orbiter drifts off its planned path and is lost in the Martian atmosphere">
            <defs>
              <radialGradient id="cf1-mars" cx="35%" cy="35%" r="80%">
                <stop offset="0%" stop-color="#e08a5a"/><stop offset="60%" stop-color="#b85433"/><stop offset="100%" stop-color="#6e2f1c"/>
              </radialGradient>
              <radialGradient id="cf1-earth" cx="35%" cy="35%" r="80%">
                <stop offset="0%" stop-color="#7fb9dd"/><stop offset="70%" stop-color="#2f6b96"/><stop offset="100%" stop-color="#1c4763"/>
              </radialGradient>
            </defs>

            <!-- starfield -->
            <g fill="#cfe4ea">
              <circle class="a-twinkle" style="--dur:2.8s" cx="60" cy="50" r="1.4"/>
              <circle class="a-twinkle" style="--dur:3.6s; --delay:.4s" cx="150" cy="110" r="1.1"/>
              <circle class="a-twinkle" style="--dur:3.1s; --delay:1.1s" cx="240" cy="40" r="1.3"/>
              <circle class="a-twinkle" style="--dur:2.5s; --delay:.7s" cx="330" cy="90" r="1"/>
              <circle class="a-twinkle" style="--dur:3.9s; --delay:.2s" cx="420" cy="30" r="1.5"/>
              <circle class="a-twinkle" style="--dur:2.9s; --delay:1.5s" cx="580" cy="250" r="1.2"/>
              <circle class="a-twinkle" style="--dur:3.4s; --delay:.9s" cx="90" cy="200" r="1.1"/>
              <circle class="a-twinkle" style="--dur:2.6s; --delay:1.8s" cx="200" cy="300" r="1.3"/>
              <circle class="a-twinkle" style="--dur:3.2s; --delay:.5s" cx="360" cy="330" r="1"/>
              <circle class="a-twinkle" style="--dur:3.7s; --delay:1.3s" cx="620" cy="60" r="1.2"/>
            </g>

            <!-- Earth -->
            <g>
              <circle cx="62" cy="298" r="17" fill="url(#cf1-earth)"/>
              <text x="62" y="332" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">EARTH</text>
            </g>

            <!-- Mars + atmosphere -->
            <g>
              <circle class="a-glow" style="--dur:5s" cx="512" cy="118" r="76" fill="none" stroke="#e08a5a" stroke-opacity=".3" stroke-width="2"/>
              <circle cx="512" cy="118" r="56" fill="url(#cf1-mars)"/>
              <text x="512" y="118" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-size="11" fill="#f6dfd2" opacity=".85">MARS</text>
            </g>

            <!-- planned trajectory (dashed, safe pass) -->
            <path d="M 80,294 C 220,236 360,208 448,170" fill="none" stroke="#7fc4d0" stroke-width="1.6" stroke-dasharray="6 7" opacity=".75"/>
            <path d="M 448,170 A 92,92 0 0 1 566,204" fill="none" stroke="#7fc4d0" stroke-width="1.6" stroke-dasharray="6 7" opacity=".55"/>

            <!-- the spacecraft, cruising (steps 1-3) -->
            <g x-show="step&lt;3">
              <g class="a-flow" style="--fx:360px; --fy:-116px; --dur:7s">
                <g transform="translate(84,290) rotate(-16)">
                  <g class="a-swim" style="--dur:3.2s">
                    <!-- thruster plume, flickering off the rear nozzle -->
                    <polygon class="a-flicker" style="--dur:.45s; --org:100% 50%" points="-33,0 -20,-3 -20,3" fill="#ffd27e" opacity=".9"/>
                    <polygon class="a-flicker" style="--dur:.3s; --delay:.1s; --org:100% 50%" points="-27,0 -20,-1.6 -20,1.6" fill="#fff4dc"/>
                    <rect x="-7" y="-5" width="14" height="10" rx="2" fill="#dcebee"/>
                    <rect x="-19" y="-3" width="10" height="6" fill="#4f93a0"/>
                    <rect x="9" y="-3" width="10" height="6" fill="#4f93a0"/>
                    <circle class="a-blink" style="--dur:1.4s" cx="0" cy="-9" r="2" fill="#ffd27e"/>
                  </g>
                </g>
              </g>
            </g>

            <!-- step 2: the two unit labels that never matched -->
            <g x-show="step===1">
              <g class="a-float" style="--dur:3.5s">
                <rect x="176" y="120" width="92" height="30" rx="6" fill="#132630" stroke="#ff9a82"/>
                <text x="222" y="140" text-anchor="middle" font-family="JetBrains Mono" font-size="13" fill="#ff9a82">lbf&#183;s</text>
              </g>
              <text class="a-blink" style="--dur:1.6s" x="296" y="141" text-anchor="middle" font-family="JetBrains Mono" font-size="18" fill="#ffd27e">&#8800;</text>
              <g class="a-float" style="--dur:3.5s; --delay:.8s">
                <rect x="322" y="120" width="92" height="30" rx="6" fill="#132630" stroke="#7fc4d0"/>
                <text x="368" y="140" text-anchor="middle" font-family="JetBrains Mono" font-size="13" fill="#7fc4d0">N&#183;s</text>
              </g>
              <text x="296" y="170" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">no conversion applied</text>
            </g>

            <!-- step 3+: actual decaying trajectory -->
            <g x-show="step>=2">
              <path class="a-draw" style="--dash:520; --dur:2.6s" d="M 80,294 C 236,252 392,238 484,164" fill="none" stroke="#ff9a82" stroke-width="2.2"/>
              <text x="300" y="262" font-family="JetBrains Mono" font-size="10" fill="#ff9a82">actual path (drifting low)</text>
              <text x="236" y="204" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">planned path</text>
            </g>

            <!-- step 4: impact + loss of signal -->
            <g x-show="step===3">
              <!-- atmospheric heating streak just before breakup -->
              <line class="a-pulse" style="--dur:.7s" x1="450" y1="184" x2="481" y2="167" stroke="#ffd27e" stroke-width="3" stroke-linecap="round" opacity=".85"/>
              <g class="a-burst" style="--dur:2.2s">
                <circle cx="484" cy="164" r="13" fill="#ffd27e"/>
                <circle cx="484" cy="164" r="22" fill="none" stroke="#ff9a82" stroke-width="2"/>
              </g>
              <!-- debris glitter thrown from the breakup -->
              <g fill="#ffd27e">
                <circle class="a-spark" style="--dur:1.6s" cx="468" cy="148" r="2.4"/>
                <circle class="a-spark" style="--dur:1.9s; --delay:.5s" cx="502" cy="174" r="2"/>
                <circle class="a-spark" style="--dur:1.7s; --delay:1.1s" cx="488" cy="188" r="2.2"/>
                <circle class="a-spark" style="--dur:2.1s; --delay:.8s" cx="462" cy="176" r="1.8"/>
              </g>
              <line x1="484" y1="164" x2="592" y2="112" stroke="#8fa9b2" stroke-width="1" stroke-dasharray="3 3"/>
              <text x="596" y="104" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#ff9a82">57 km: atmosphere</text>
              <line x1="566" y1="204" x2="606" y2="244" stroke="#8fa9b2" stroke-width="1" stroke-dasharray="3 3"/>
              <text x="608" y="258" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">226 km: planned pass</text>
              <text class="a-blink" style="--dur:1.1s" x="320" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="13" fill="#ff9a82" font-weight="700">. . . LOSS OF SIGNAL . . .</text>
            </g>
          </svg>`
};
