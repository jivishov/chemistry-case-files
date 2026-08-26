const { chromium } = require('/tmp/u7-playwright/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 1536, height: 864 }, { width: 1366, height: 768 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://127.0.0.1:8000/units/07-gas-laws/', {
      waitUntil: 'domcontentloaded', timeout: 60000
    });
    await page.waitForSelector('.workbench-grid', { state: 'visible', timeout: 60000 });
    await page.waitForTimeout(1800);

    const core = await page.evaluate(() => {
      const r = s => document.querySelector(s)?.getBoundingClientRect();
      const el = s => document.querySelector(s);
      const navButtons = [...document.querySelectorAll('.station-nav .tab')]
        .filter(x => getComputedStyle(x).display !== 'none');
      const navRows = new Set(navButtons.map(x => Math.round(x.getBoundingClientRect().top))).size;
      const mission = el('.mission-screen');
      const screenCopy = el('.screen-copy');
      return {
        headerHeight: Math.round(r('.cockpit-command')?.height || 0),
        navRows,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        missionOverflow: mission ? mission.scrollHeight > mission.clientHeight + 2 : true,
        copyOverflow: screenCopy ? screenCopy.scrollHeight > screenCopy.clientHeight + 2 : true,
        missionTop: Math.round(r('.mission-screen')?.top || 0),
        rightTop: Math.round(r('.life-support-board')?.top || 0)
      };
    });

    console.log(`${viewport.width}x${viewport.height}`, core);
    if (core.navRows !== 1) throw new Error(`navigation wrapped at ${viewport.width}x${viewport.height}`);
    if (core.horizontalOverflow) throw new Error(`horizontal overflow at ${viewport.width}x${viewport.height}`);
    if (core.missionOverflow || core.copyOverflow) throw new Error(`mission panel gained scrolling at ${viewport.width}x${viewport.height}`);
    if (Math.abs(core.missionTop - core.rightTop) > 4) throw new Error(`side columns misaligned at ${viewport.width}x${viewport.height}`);

    await page.getByLabel('Reveal advanced content').check();
    await page.waitForTimeout(300);
    const honorsOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    if (honorsOverflow) throw new Error(`Honors caused horizontal overflow at ${viewport.width}x${viewport.height}`);

    await page.getByRole('tab', { name: 'Case file' }).click();
    await page.waitForSelector('.casefile', { state: 'visible' });
    const caseOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    if (caseOverflow) throw new Error(`Case File caused horizontal overflow at ${viewport.width}x${viewport.height}`);

    await page.close();
  }
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
