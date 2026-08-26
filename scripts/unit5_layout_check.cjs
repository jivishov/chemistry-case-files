const { chromium } = require('playwright');

const sizes = [
  { width: 1536, height: 864, name: '1536x864' },
  { width: 1366, height: 768, name: '1366x768' },
];

function geometry() {
  const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const header = document.querySelector('.cockpit-command');
  const mission = document.querySelector('.mission-screen');
  const copy = document.querySelector('.screen-copy');
  const tabs = [...document.querySelectorAll('.station-nav .tab')].filter(visible);
  return {
    width: innerWidth,
    docWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
    tabRows: [...new Set(tabs.map(el => Math.round(el.getBoundingClientRect().top)))],
    missionClientHeight: mission ? mission.clientHeight : null,
    missionScrollHeight: mission ? mission.scrollHeight : null,
    copyClientHeight: copy ? copy.clientHeight : null,
    copyScrollHeight: copy ? copy.scrollHeight : null,
  };
}

function inspect(g, label, failures) {
  if (g.docWidth > g.width + 1 || g.bodyWidth > g.width + 1) failures.push(`${label}: horizontal overflow`);
  if (g.tabRows.length !== 1) failures.push(`${label}: navigation wrapped to ${g.tabRows.length} rows`);
  if (g.copyScrollHeight > g.copyClientHeight + 2) failures.push(`${label}: mission copy clipped (${g.copyScrollHeight}>${g.copyClientHeight})`);
  if (g.headerHeight > 92) failures.push(`${label}: header too tall (${g.headerHeight}px)`);
}

async function runSize(browser, size) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  const failures = [];
  await page.goto('http://127.0.0.1:8000/units/05-the-mole/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => window.Alpine && document.querySelector('[x-data="sim()"]'), null, { timeout: 30000 });
  await page.waitForTimeout(300);
  inspect(await page.evaluate(geometry), 'initial', failures);

  const states = [
    ['molg', 'genConversion', 'molg', 3],
    ['particles', 'genConversion', 'particles', 3],
    ['percent', 'genPercent', null, 3],
    ['formula', 'genFormula', null, 3],
    ['capstone', 'genCapstone', null, 2],
  ];
  for (const [mode, fn, arg, repeats] of states) {
    for (let i = 0; i < repeats; i++) {
      await page.evaluate(({ mode, fn, arg }) => {
        const s = window.Alpine.$data(document.querySelector('[x-data="sim()"]'));
        if (mode === 'capstone') { s.genCapstone(); s.mode = 'capstone'; }
        else { s.mode = mode; if (arg === null) s[fn](); else s[fn](arg); }
      }, { mode, fn, arg });
      await page.waitForTimeout(50);
      inspect(await page.evaluate(geometry), `${mode}-${i + 1}`, failures);
    }
  }

  await page.evaluate(() => {
    const s = window.Alpine.$data(document.querySelector('[x-data="sim()"]'));
    s.honors = true;
    s.mode = 'formula';
    s.genFormula();
    s.genHydrate();
    s.genCombustion();
  });
  await page.waitForTimeout(60);
  inspect(await page.evaluate(geometry), 'Honors', failures);

  await page.getByRole('tab', { name: 'Case file' }).click();
  await page.waitForTimeout(100);
  const cg = await page.evaluate(() => {
    const cf = document.querySelector('.casefile');
    const title = document.querySelector('.cf-title');
    return {
      visible: !!cf && cf.getClientRects().length > 0,
      right: cf ? cf.getBoundingClientRect().right : 0,
      titleRight: title ? title.getBoundingClientRect().right : 0,
      width: innerWidth,
    };
  });
  if (!cg.visible) failures.push('Case File did not open');
  if (cg.right > cg.width + 1 || cg.titleRight > cg.width + 1) failures.push('Case File horizontal clipping');

  console.log(size.name, JSON.stringify(await page.evaluate(geometry)));
  await page.close();
  if (failures.length) throw new Error(`${size.name}:\n- ${failures.join('\n- ')}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const size of sizes) await runSize(browser, size);
  } finally {
    await browser.close();
  }
  console.log('Unit 5 layout checks passed at 1536x864 and 1366x768, including Honors and Case File.');
})().catch(err => { console.error(err); process.exit(1); });
