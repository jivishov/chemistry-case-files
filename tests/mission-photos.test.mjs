import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import { createSceneMedia, photoScene, scenePhotoUrl } from '../shared/js/scene-media.js';
import { SCENE_PHOTOS } from '../shared/js/scene-photo-manifest.js';

// These tests exercise the real problem generators and mission renderer in Node.
// WebGL mounting is outside that scope and must never run in this suite. Replace
// only the two browser-only viewer imports; no chemistry or generator is mocked.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.includes('/units/04-bonding-geometry/js/main.js') && specifier === './vsepr.js') {
      return { url: 'data:text/javascript,export function createViewer(){throw new Error("Unexpected WebGL mount in generator test")}', shortCircuit: true };
    }
    if (context.parentURL?.includes('/units/07-gas-laws/js/main.js') && specifier === './gasbox.js') {
      return { url: 'data:text/javascript,export function createGasBox(){throw new Error("Unexpected WebGL mount in generator test")}', shortCircuit: true };
    }
    return nextResolve(specifier, context);
  }
});

const units = (await readdir(new URL('../units/', import.meta.url))).filter(x => /^\d\d-/.test(x)).sort();
const src = html => html.match(/class="scene-photo" src="([^"]+)"/)?.[1];
const regular = {
  1: [['newMeasure','measure','a'],['newSF','sigfig','b'],['newSample','density','c'],['newDataset','evaluate','d']],
  2: [['nextModels','models','a'],['nextBuild','build','b'],['nextMass','mass','d'],['nextSpectra','spectra','c'],['nextConfig','config','e'],['nextFamily','config','f']],
  3: [['newA','table','a'],['newB','families','b'],['newC','trends','c']],
  4: [['genBond','bond','a'],['genName','name','b'],['genGeometry','geometry','c'],['genForces','forces','d']],
  5: [['genConversion','molg','a','molg'],['genConversion','particles','b','particles'],['genPercent','percent','c'],['genFormula','formula','d']],
  6: [['genBalance','balance','a'],['genClassify','classify','b'],['genStoich','stoich','c'],['genLr','lr','d']],
  7: [['genKmt','kmt','a'],['genIdeal','ideal','b'],['genDalton','dalton','c']],
  8: [['genDissolve','dissolve','a'],['genTypes','types','b'],['genCurve','curve','c'],['genPrecip','precip','d'],['genMolarity','molarity','e'],['genDilute','dilute','f']],
  9: [['genNaming','naming','a'],['dfDeal','define','b'],['genStrength','strength','c'],['genNeutralize','neutralize','d'],['genMeter','meter','e']],
  10: [['genLaw','laws','a'],['genPack','pack','c'],['genWarm','warm','d'],['genCal','calorimeter','b']],
  11: [['genIdent','ident','a'],['genPower','power','b'],['genApply','apply','c'],['genDose','dose','hl']]
};
const repeated = {
  1: [['newSample','h1-sizecall'],['newDataset','h2-kitcall'],['genCapstone','cap-waterchange']],
  2: [['nextSpectra','h1-photon'],['nextConfig','h2-orbital']],
  3: [['newH2','h2-dip'],['genCapstone','cap-substitute']],
  4: [['genPercent','h1-percent-ionic'],['genPolarity','h2-polarity'],['genImf','h3-imf'],['genCapstone','cap-underthesink']],
  5: [['genHydrate','h1-desiccant'],['genCombustion','h2-arson'],['genCapstone','cap-pod']],
  6: [['genHonors1','h1-particles'],['genHonors2','h2-recovery'],['genCapstone','cap-tanker']],
  7: [['genHonors1','h1-speeds'],['genHonors2','h2-real'],['genHonors3','h3-water'],['genCapstone','cap-lastfill']],
  8: [['genKsp','h1-ksp'],['genCrys','h2-crys'],['genCapstone','cap-batch']],
  9: [['genTitration','h1-titrate'],['genWeak','h2-weak'],['genCapstone','cap-last']],
  10: [['genHess','h1-route'],['genFormation','h2-formation'],['genCapstone','cap-evac']],
  11: [['genSeries','h1-series'],['genBinding','h2-binding'],['genEffective','h3-effective'],['genCapstone','cap-lastcase']]
};
async function makeSim(unit) {
  let { createSim } = await import(`../units/${unit}/js/main.js`);
  if (unit.startsWith('11')) {
    const { applyContentRefinements, refineCreateSim } = await import(`../units/${unit}/js/refinements.js`);
    const { refineOutputCreateSim } = await import(`../units/${unit}/js/output-refinements.js`);
    applyContentRefinements();
    createSim = refineOutputCreateSim(refineCreateSim(createSim));
  }
  const sim = createSim();
  sim.$nextTick = () => {}; sim.$watch = () => {}; sim.$refs = {};
  sim.init();
  return sim;
}

test('rendering is stable and independent between components and mission IDs', () => {
  const a = createSceneMedia(), b = createSceneMedia();
  a.advanceScenePhoto('d-penmeter');
  const first = scenePhotoUrl(1,'d-penmeter',a.scenePhotoVariant('d-penmeter'));
  for (let i=0;i<10;i++) assert.equal(scenePhotoUrl(1,'d-penmeter',a.scenePhotoVariant('d-penmeter')),first);
  a.advanceScenePhoto('d-penmeter');
  assert.notEqual(scenePhotoUrl(1,'d-penmeter',a.scenePhotoVariant('d-penmeter')),first);
  assert.equal(a.scenePhotoVariant('d-dropkit'),0);
  assert.equal(b.scenePhotoVariant('d-penmeter'),0);
});

test('unknown scenes retain their original SVG and never get unrelated photography', () => {
  const svg='<svg><text>Unmapped task</text></svg>';
  for (const [unit,id] of [[1,'unknown'],[12,'a-dechlor'],['toString','a-dechlor'],[1,'../aquarium']]) {
    assert.equal(scenePhotoUrl(unit,id),'');
    assert.equal(photoScene(unit,id,svg),svg);
  }
});

for (const unit of units) {
  const n = Number(unit.slice(0,2));
  test(`${unit}: all scenario photos exist, are distinct, and match both authored catalogs`, async () => {
    const { SCENARIOS } = await import(`../units/${unit}/js/model.js`);
    const { SCENE_ART } = await import(`../units/${unit}/js/art.js`);
    assert.deepEqual([...SCENE_PHOTOS[n]].sort(),SCENARIOS.map(s=>s.id).sort());
    assert.deepEqual([...SCENE_PHOTOS[n]].sort(),Object.keys(SCENE_ART).sort());
    const hashes=new Set();
    for (const id of SCENE_PHOTOS[n]) for(const variant of [0,1]) {
      const url=new URL(scenePhotoUrl(n,id,variant));
      const buffer=await readFile(url),bytes=(await stat(url)).size;
      assert.equal(buffer.toString('ascii',0,4),'RIFF');
      assert.equal(buffer.toString('ascii',8,12),'WEBP');
      assert.equal(buffer.readUInt32LE(4)+8,buffer.length,'complete WebP container');
      assert.ok(bytes>1000 && bytes<65000,`${id}: classroom-size asset`);
      const hash=createHash('sha256').update(buffer).digest('hex');
      assert.ok(!hashes.has(hash),`${id}: duplicate photo`);hashes.add(hash);
    }
  });
  test(`${unit}: problem generators change the visible photo through complete scenario cycles`, async () => {
    const sim=await makeSim(unit);
    const { SCENARIOS }=await import(`../units/${unit}/js/model.js`);
    for(const [method,mode,skill,arg] of regular[n]) {
      sim.mode=mode;
      const pool=SCENARIOS.filter(s=>s.skill===skill),seen=new Map();
      let previous;
      for(let i=0;i<pool.length*2+1;i++) {
        sim[method](arg);
        const id=sim.activeArtId,photo=src(sim.scArt(id));
        assert.ok(pool.some(s=>s.id===id),`${method}: mission matches the generated problem`);
        assert.ok(photo,`${method}: photo is rendered`);
        assert.notEqual(photo,previous,`${method}: new problem changes photograph`);
        if(seen.has(id))assert.notEqual(photo,seen.get(id),`${method}: revisited scenario changes photograph`);
        assert.equal(src(sim.scArt(id)),photo,`${method}: rerender stays stable`);
        sim.mode='casefile';sim.mode=mode;
        assert.equal(src(sim.scArt(id)),photo,`${method}: tab changes stay stable`);
        previous=photo;seen.set(id,photo);
      }
      assert.equal(seen.size,pool.length);
    }
  });
  test(`${unit}: same-scenario Honors and capstone problems get alternate photos`, async () => {
    const sim=await makeSim(unit);
    for(const [method,id] of repeated[n]) {
      sim[method]();const first=src(sim.scArt(id));
      sim[method]();const second=src(sim.scArt(id));
      assert.ok(first && second,method);
      assert.notEqual(second,first,`${method}: same ID, new photograph`);
    }
  });
}

test('Unit 5 same-scenario audit replay refreshes its photo', async () => {
  const sim=await makeSim('05-the-mole');
  const id=sim.cv.sc.id,first=src(sim.scArt(id));
  sim.genConversion('molg',{scId:id,flaw:'noConvert'});
  assert.equal(sim.cv.sc.id,id);
  assert.notEqual(src(sim.scArt(id)),first);
});

test('Unit 11 output refinements preserve the reactive photo dependency', async () => {
  const sim=await makeSim('11-nuclear');let tracked=false;
  const proxy=new Proxy(sim,{get(target,key,receiver){if(key==='scenePhotoVisits')tracked=true;return Reflect.get(target,key,receiver);}});
  proxy.scArt(proxy.activeArtId);
  assert.equal(tracked,true,'photo state must be read through the Alpine receiver');
});
