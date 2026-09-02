from pathlib import Path

css_path = Path('units/02-atomic-structure/css/style.css')
css = css_path.read_text(encoding='utf-8')
marker = '/* Unit 2 Build: 15-inch laptop fit */'
if marker in css:
    raise SystemExit('Laptop-fit block already exists')

css += r'''

/* Unit 2 Build: 15-inch laptop fit */
@media (min-width: 1180px) and (max-width: 1600px) and (max-height: 900px) {
  .chem-console > .panel[x-show="mode==='build'"] {
    display: grid !important;
    grid-template-columns: minmax(220px, .82fr) minmax(0, 1.45fr);
    grid-template-areas:
      "intro intro"
      "order order"
      "atom controls"
      "atom gauges"
      "reveal reveal"
      "history history";
    grid-template-rows: auto auto auto auto auto auto;
    align-content: start;
    column-gap: 12px;
    row-gap: 7px;
    overflow-y: auto;
  }

  .chem-console > .panel[x-show="mode==='build'"] > p:first-child {
    grid-area: intro;
    margin: 0 !important;
    font-size: var(--fs-sm);
    line-height: 1.28;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .work-order {
    grid-area: order;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto auto;
    gap: 2px 12px;
    align-items: center;
    margin: 0 !important;
    padding: 7px 10px;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .work-order > .command-kicker,
  .chem-console > .panel[x-show="mode==='build'"] > .work-order > p {
    grid-column: 1;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .work-order > p {
    margin: 0 !important;
    line-height: 1.26;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .work-order > p + p {
    margin-top: 2px !important;
    font-size: var(--fs-xs) !important;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .work-order > .call-row {
    grid-column: 2;
    grid-row: 1 / -1;
    align-self: center;
    flex-wrap: nowrap;
    margin: 0;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .work-order > .call-row .btn {
    min-width: 118px;
    min-height: 36px;
    padding-block: 6px;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .a-row {
    display: contents;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .a-row > :first-child {
    grid-area: atom;
    align-self: start;
    min-width: 0;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .a-row > .a-side {
    grid-area: controls;
    align-self: start;
  }

  .chem-console > .panel[x-show="mode==='build'"] .bohr {
    width: clamp(205px, 18vw, 245px);
  }

  .chem-console > .panel[x-show="mode==='build'"] .iso-symbol {
    min-height: 24px;
    margin-top: 2px;
  }

  .chem-console > .panel[x-show="mode==='build'"] .a-side > .ref-title {
    margin: 0 0 4px;
  }

  .chem-console > .panel[x-show="mode==='build'"] .stepper-grid {
    gap: 6px;
  }

  .chem-console > .panel[x-show="mode==='build'"] .stepper {
    display: grid;
    grid-template-columns: 82px auto minmax(0, 1fr);
    align-items: center;
    gap: 6px;
    min-height: 0;
    padding: 5px 8px;
    text-align: left;
  }

  .chem-console > .panel[x-show="mode==='build'"] .stp-label { margin: 0; }

  .chem-console > .panel[x-show="mode==='build'"] .stp-ctl {
    margin: 0;
    gap: 4px;
  }

  .chem-console > .panel[x-show="mode==='build'"] .stp-ctl .btn {
    min-height: 32px;
    padding: 0 8px;
    line-height: 1.3;
  }

  .chem-console > .panel[x-show="mode==='build'"] .stp-val { font-size: var(--fs-lg); }
  .chem-console > .panel[x-show="mode==='build'"] .stp-sub { line-height: 1.18; }

  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials {
    grid-area: gauges;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    align-self: start;
    margin: 0 !important;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials > .stat {
    min-width: 0;
    padding: 6px 7px;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials .stat .k {
    font-size: var(--fs-xs) !important;
    line-height: 1.1;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials .stat .v {
    margin-top: 1px;
    font-size: var(--fs-lg);
    line-height: 1.05;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials .dial { margin-top: 2px; }
  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials .dial-face { max-width: 94px; }

  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials .dial-foot {
    margin-top: 0;
    gap: 2px;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials .dial-read,
  .chem-console > .panel[x-show="mode==='build'"] > .stat-row.has-dials .dial-trend {
    font-size: var(--fs-xs) !important;
    line-height: 1.12;
  }

  .chem-console > .panel[x-show="mode==='build'"] > .note {
    grid-area: reveal;
    margin-top: 0 !important;
    padding: 6px 9px;
    font-size: var(--fs-sm);
    line-height: 1.25;
  }

  .chem-console > .panel[x-show="mode==='build'"] > details.lesson-reference {
    grid-area: history;
    margin-top: 0 !important;
  }
}
'''

css_path.write_text(css, encoding='utf-8')

required = [
    'Unit 2 Build: 15-inch laptop fit',
    '"atom controls"',
    '"atom gauges"',
    'grid-template-columns: repeat(3, minmax(0, 1fr));',
    'grid-template-columns: 82px auto minmax(0, 1fr);',
    'max-width: 94px;'
]
missing = [item for item in required if item not in css]
if missing:
    raise SystemExit(f'Missing laptop-fit markers: {missing}')
print('Unit 2 Build laptop-fit patch generated successfully.')
