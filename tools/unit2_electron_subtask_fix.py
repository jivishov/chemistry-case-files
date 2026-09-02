from pathlib import Path


def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise RuntimeError(f'{label}: expected 1 match, found {n}')
    return text.replace(old, new, 1)


main_path = Path('units/02-atomic-structure/js/main.js')
index_path = Path('units/02-atomic-structure/index.html')
main = main_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

main = replace_once(
    main,
    "    mode: 'models',\n",
    "    mode: 'models',\n    electronTask: 'config',\n",
    'electron subtask state'
)

old = """    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.capPick) this.capPick = null;
    },
"""
new = """    setMode(m) {
      this.mode = m;
      if (m === 'config') this.focusScenario('config', this.electronTask === 'family' ? this.familySc : this.configSc);
      if (m === 'capstone' && this.capUnlocked && !this.capPick) this.capPick = null;
    },
    setElectronTask(task) {
      if (task !== 'config' && task !== 'family') return;
      this.electronTask = task;
      this.focusScenario('config', task === 'family' ? this.familySc : this.configSc);
    },
"""
main = replace_once(main, old, new, 'electron subtask navigation')

main = replace_once(
    main,
    "      this.gReset(); this.modeVerdict = {}; this.activeScenario = {}; this.rack = []; this.shiftDay = 1; this.worldLog = [];\n",
    "      this.gReset(); this.modeVerdict = {}; this.activeScenario = {}; this.rack = []; this.shiftDay = 1; this.worldLog = []; this.electronTask = 'config';\n",
    'reset electron subtask'
)

index = replace_once(
    index,
    "        <button class=\"tab\" role=\"tab\" :aria-selected=\"mode==='config'\" @click=\"setMode('config')\" aria-label=\"Electron configuration\"><span class=\"tab-full\" aria-hidden=\"true\">Electron configuration</span><span class=\"tab-short\" aria-hidden=\"true\">Electrons</span></button>",
    "        <button class=\"tab\" role=\"tab\" :aria-selected=\"mode==='config'\" @click=\"setMode('config')\" aria-label=\"Electron configuration and group patterns\"><span class=\"tab-full\" aria-hidden=\"true\">Electrons &amp; groups</span><span class=\"tab-short\" aria-hidden=\"true\">Electrons</span></button>",
    'electron tab label'
)

index = replace_once(
    index,
    "              <div class=\"teks-row\" :class=\"{ active: se.mode === mode, mastered: gMastered(se.id) }\">",
    "              <div class=\"teks-row\" :class=\"{ active: se.mode === mode && (mode !== 'config' || (se.id === 'e' && electronTask === 'config') || (se.id === 'f' && electronTask === 'family')), mastered: gMastered(se.id) }\">",
    'TEKS active electron subtask'
)

old_intro = """          <p class="muted" style="margin-bottom: var(--s-4);">Electron configurations describe how electrons occupy subshells. The simple Aufbau order is a useful starting model, but some atoms have observed ground-state exceptions.</p>
          <section class="work-order" @focusin="focusScenario('config', configSc)" @click="focusScenario('config', configSc)">"""
new_intro = """          <p class="muted" style="margin-bottom: var(--s-3);">Electron arrangements connect atomic structure to ground-state configurations, valence electrons, and periodic-table group patterns.</p>
          <div class="row call-row" role="tablist" aria-label="Electron activities" style="margin-bottom: var(--s-4);">
            <button class="btn btn-sm" :class="{ 'btn-accent': electronTask==='config' }" role="tab" :aria-selected="electronTask==='config'" @click="setElectronTask('config')">Configuration · C.6(E)</button>
            <button class="btn btn-sm" :class="{ 'btn-accent': electronTask==='family' }" role="tab" :aria-selected="electronTask==='family'" @click="setElectronTask('family')">Group pattern · C.5(B)</button>
          </div>
          <div x-show="electronTask==='config'">
          <section class="work-order" @focusin="focusScenario('config', configSc)" @click="focusScenario('config', configSc)">"""
index = replace_once(index, old_intro, new_intro, 'electron subtask selector and config wrapper')

family_prefix = "          <section class=\"work-order mt-4\" @focusin=\"focusScenario('config', familySc)\" @click=\"focusScenario('config', familySc)\"><span class=\"command-kicker\">Group pattern</span>"
family_new = "          </div>\n\n          <section class=\"work-order mt-3\" x-show=\"electronTask==='family'\" @focusin=\"focusScenario('config', familySc)\" @click=\"focusScenario('config', familySc)\"><span class=\"command-kicker\">Group pattern</span>"
index = replace_once(index, family_prefix, family_new, 'close config wrapper and gate group mission')

index = replace_once(
    index,
    "  import { createSim } from './js/main.js?v=u2-mission-fix-2';",
    "  import { createSim } from './js/main.js?v=u2-mission-fix-3';",
    'cache bust second Unit 2 refinement'
)

main_path.write_text(main, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')

assert "electronTask: 'config'" in main
assert "setElectronTask(task)" in main
assert "x-show=\"electronTask==='config'\"" in index
assert "x-show=\"electronTask==='family'\"" in index
assert 'Electrons &amp; groups' in index
print('Unit 2 electron missions separated successfully.')
