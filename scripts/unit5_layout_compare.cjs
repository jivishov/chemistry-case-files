const fs = require('fs');
const { chromium } = require('playwright');

const mode = process.argv[2];
const outPath = process.argv[3];
const baselinePath = process.argv[4] || null;
if (!['baseline', 'revised'].includes(mode) || !outPath) {
  console.error('usage: node unit5_layout_compare.cjs <baseline|revised> <out.json> [baseline.json]');
  process.exit(2);
}

const sizes = [
  { width: 1536, height: 864, name: '1536x864' },
  { width: 1366, height: 768, name: '1366x768' },
];

function geometry() {
  const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const header = document.querySelector('.cockpit-command');
  const mission = document.querySelector('.mission-screen');
  const copy = document.querySelector('.screen-copy');
  const center = document.querySelector('.chem-console');
  const tabs = [...document.querySelectorAll('.station-nav .tab')].filter(visible);
  const rect = el => el ? el.getBoundingClientRect() : null;
  const copyStyle = copy ? getComputedStyle(copy) : null;
  const missionStyle = mission ? getComputedStyle(mission) : null;
  return {
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
    docWidth: document.documentElement.scrollWidth,
    docHeight: document.documentElement.scrollHeight,
    bodyWidth: document.body.scrollWidth,
    bodyHeight: document.body.scrollHeight,
    headerHeight: header ? Math.round(rect(header).height) : null,
    tabRows: [...new Set(tabs.map(el => Math.round(rect(el).top)))],
    missionHeight: mission ? Math.round(rect(mission).height) : null,
    missionClientHeight: mission ? mission.clientHeight : null,
    missionScrollHeight: mission ? mission.scrollHeight : null,
    missionOverflowY: missionStyle ? missionStyle.overflowY : null,
    copyHeight: copy ? Math.round(rect(copy).height) : null,
    copyClientHeight: copy ? copy.clientHeight : null,
    copyScrollHeight: copy ? copy.scrollHeight : null,
    copyOverflowY: copyStyle ? copyStyle.overflowY : null,
    centerTop: center ? Math.round(rect(center).top) : null,
    centerBottom: center ? Math.round(rect(center).bottom) : null,
  };
}

async function snapshotState(page, label) {
  await page.waitForTimeout(60);
  return [label, await page.evaluate(geometry)];
}

async function capture(browser, size) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  await page.goto('http://127.0.0.1:8000/units/05-the-mole/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => window.Alpine && document.querySelector('[x-data="sim()"]'), null, { timeout: 30000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Alpine && document.querySelector('[x-data="sim()"]'), null, { timeout: 30000 });
  const rows = [];
  rows.push(await snapshotState(page, 'initial'));

  const states = [
    ['molg', 'genConversion', 'molg', 3],
    ['particles', 'genConversion', 'particles', 3],
    ['percent', 'genPercent', null, 3],
    ['formula', 'genFormula', null, 3],
    ['capstone', 'genCapstone', null, 2],
  ];
  for (const [station, fn, arg, repeats] of states) {
    for (let i = 0; i < repeats; i++) {
      await page.evaluate(({ station, fn, arg }) => {
        const s = window.Alpine.$data(document.querySelector('[x-data="sim()"]'));
        if (station === 'capstone') { s.genCapstone(); s.mode = 'capstone'; }
        else { s.mode = station; if (arg === null) s[fn](); else s[fn](arg); }
      }, { station, fn, arg });
      rows.push(await snapshotState(page, `${station}-${i + 1}`));
    }
  }

  await page.evaluate(() => {
    const s = window.Alpine.$data(document.querySelector('[x-data="sim()"]'));
    s.honors = true;
    s.mode = 'formula';
    s.genFormula(); s.genHydrate(); s.genCombustion();
  });
  rows.push(await snapshotState(page, 'Honors'));

  await page.getByRole('tab', { name: 'Case file' }).click();
  await page.waitForTimeout(100);
  const caseGeom = await page.evaluate(() => {
    const cf = document.querySelector('.casefile');
    const title = document.querySelector('.cf-title');
    const r = el => el ? el.getBoundingClientRect() : null;
    return {
      visible: !!cf && cf.getClientRects().length > 0,
      right: cf ? Math.round(r(cf).right) : null,
      titleRight: title ? Math.round(r(title).right) : null,
      viewportWidth: innerWidth,
      docWidth: document.documentElement.scrollWidth,
    };
  });
  await page.close();
  return { size: size.name, states: Object.fromEntries(rows), caseFile: caseGeom };
}

function overflowAmount(g) {
  return Math.max(0, (g.copyScrollHeight || 0) - (g.copyClientHeight || 0));
}
function missionOverflowAmount(g) {
  return Math.max(0, (g.missionScrollHeight || 0) - (g.missionClientHeight || 0));
}

function compare(base, revised) {
  const failures = [];
  const baseBySize = Object.fromEntries(base.map(x => [x.size, x]));
  for (const r of revised) {
    const b = baseBySize[r.size];
    if (!b) { failures.push(`${r.size}: missing baseline`); continue; }
    for (const [label, rg] of Object.entries(r.states)) {
      const bg = b.states[label];
      if (!bg) { failures.push(`${r.size} ${label}: missing baseline state`); continue; }
      if (rg.docWidth > rg.viewportWidth + 1 || rg.bodyWidth > rg.viewportWidth + 1) failures.push(`${r.size} ${label}: horizontal overflow`);
      if (rg.tabRows.length !== 1) failures.push(`${r.size} ${label}: navigation wrapped to ${rg.tabRows.length} rows`);
      if (rg.headerHeight > bg.headerHeight + 1) failures.push(`${r.size} ${label}: header grew ${bg.headerHeight}px -> ${rg.headerHeight}px`);
      if (overflowAmount(rg) > overflowAmount(bg) + 2) failures.push(`${r.size} ${label}: mission copy overflow increased ${overflowAmount(bg)}px -> ${overflowAmount(rg)}px`);
      if (missionOverflowAmount(rg) > missionOverflowAmount(bg) + 2) failures.push(`${r.size} ${label}: mission panel overflow increased ${missionOverflowAmount(bg)}px -> ${missionOverflowAmount(rg)}px`);
      if (rg.copyOverflowY === 'auto' && bg.copyOverflowY !== 'auto') failures.push(`${r.size} ${label}: new copy scrollbar behavior introduced`);
      if (rg.missionOverflowY === 'auto' && bg.missionOverflowY !== 'auto') failures.push(`${r.size} ${label}: new mission scrollbar behavior introduced`);
    }
    if (!r.caseFile.visible) failures.push(`${r.size}: Case File did not open`);
    if (r.caseFile.docWidth > r.caseFile.viewportWidth + 1 || r.caseFile.right > r.caseFile.viewportWidth + 1 || r.caseFile.titleRight > r.caseFile.viewportWidth + 1) failures.push(`${r.size}: Case File horizontal clipping/overflow`);
  }
  return failures;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let data;
  try {
    data = [];
    for (const size of sizes) data.push(await capture(browser, size));
  } finally {
    await browser.close();
  }
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  for (const s of data) {
    const i = s.states.initial;
    console.log(`${mode} ${s.size}: header=${i.headerHeight}px navRows=${i.tabRows.length} missionOverflow=${missionOverflowAmount(i)}px copyOverflow=${overflowAmount(i)}px docWidth=${i.docWidth}/${i.viewportWidth}`);
  }
  if (mode === 'revised') {
    if (!baselinePath) throw new Error('revised mode requires baseline.json');
    const base = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const failures = compare(base, data);
    if (failures.length) throw new Error(`Layout fidelity failures:\n- ${failures.join('\n- ')}`);
    console.log('Revised Unit 5 matches or improves baseline laptop geometry at both required viewports, including rotating scenarios, Honors, and Case File.');
  }
})().catch(err => { console.error(err); process.exit(1); });
