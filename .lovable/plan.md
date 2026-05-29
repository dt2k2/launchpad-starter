# Historical Sim Refactor — "History Under Pressure"

## Why the game still feels linear (diagnosis)

After reviewing the current code:

1. **Stage transitions are deterministic.** `simStore.advanceStage()` runs after the last decision of a stage and unconditionally jumps to the next era (only revolution forks). There is no failure, freeze, or collapse branch — every run climbs the ladder.
2. **Contradiction is mostly cosmetic** despite the new tier/pressure system: tiers can lock options and decay metrics, but no event meaningfully *changes the path*. There's no emergency-only fork, no point-of-no-return.
3. **Perspective is a filter, not a reality.** The three perspectives mostly relabel option text and bias metrics. They all see the same decisions, the same numbers, the same outcomes.
4. **No memory.** Each era starts clean. Past repression / revolts / reforms don't echo into intro text, narrator, or later events.
5. **No human voice.** Pure macro numbers; no recurring figure makes consequences feel personal.
6. **Endings are flavor.** Only "revolution" vs "stage complete" branches exist.

## Refactor strategy (extend, don't rebuild)

Keep: `simStore`, `HistoricalSim.tsx`, cinematic system, `PerspectiveProvider`, contradiction engine, tech tree, replay timeline, ending screen.

Extend with **5 small new subsystems** that plug into existing hooks:


| Subsystem              | New files                                                                       | Hook point                              |
| ---------------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| Transition engine      | `src/data/transition/{outcomes.ts,rules.ts,resolver.ts}`                        | replaces `advanceStage()` body          |
| Historical memory      | `src/data/memory/{tags.ts,memory.ts}` + store slice                             | `applyOutcome()`, stage intro, narrator |
| Perspective visibility | extend `perspectiveConfig.ts` with `visibility` map; new `usePerspectiveLens()` | HUD + DecisionPanel + Narrator          |
| Human presence         | `src/data/companion/{lines.ts,companion.ts}` + `CompanionVoice.tsx`             | event hooks                             |
| Endings v2             | `src/data/endings/templates.ts` + `EndingScreen.tsx` refactor                   | end-of-run resolver                     |


All new files are data-driven configs + pure resolvers. No JSX rewrite.

## Architecture overview

```text
simStore (extended)
  ├─ pressures + tier   (existing)
  ├─ memory: MemoryTag[]               NEW
  ├─ stagePath: PathOutcome            NEW
  ├─ companionState                    NEW
  └─ endingType                        NEW

resolvers/
  contradiction (existing)
  transition (NEW)   → outcome ∈ {evolve, rupture, freeze, collapse, suppress, failed_uprising}
  memory (NEW)       → push/query tags, decay weights
  ending (NEW)       → picks template from {memory, path, perspective, finalPressures}

UI hooks
  PerspectiveHUD     → uses lens.visibility to mute/hide gauges
  DecisionPanel      → filters options by perspective.exclusive + visibility
  Narrator           → injects memory echoes + companion lines
  ReplayTimeline     → renders memory tags as icons
  EndingScreen       → renders template with reflective question
```

## Data schemas

```ts
// transition/outcomes.ts
export type PathOutcome =
  | "evolve"          // normal next era
  | "rupture"         // revolution branch
  | "freeze"          // stay in stage, decay
  | "collapse"        // fragment, dark age
  | "suppress"        // authoritarian lock-in
  | "failed_uprising";// revolt crushed, +repression

export interface TransitionRule {
  outcome: PathOutcome;
  weight: (s: SimState) => number; // 0 if disqualified
  requires?: { tierMin?: Tier["id"]; stage?: string };
}

// memory/tags.ts
export type MemoryTagId =
  | "mass_repression" | "failed_revolt" | "successful_reform"
  | "famine" | "elite_purge" | "underground_network"
  | "collapse_scar" | "rupture_legacy" | "stagnation_decade";

export interface MemoryTag {
  id: MemoryTagId;
  stage: string;        // era it was created in
  weight: number;       // 1 fresh, decays per stage
  perspective?: PerspectiveId; // who witnessed it
}

// perspective visibility extension
export interface PerspectiveLens {
  gauges: Record<PressureKey, "visible"|"muted"|"hidden">;
  metrics: Record<MetricKey,  "visible"|"muted"|"hidden">;
  optionTags: { exclusive?: OptionTag[]; emphasize?: OptionTag[]; hide?: OptionTag[] };
}

// companion/lines.ts
export interface CompanionLine {
  perspective: PerspectiveId;
  trigger: "stage_start"|"high_pressure"|"event:<id>"|"outcome:<id>";
  text: string;
}

// endings/templates.ts
export interface EndingTemplate {
  id: string;
  match: (s: FinalState) => boolean;   // path + memory + pressures
  perspectiveNarration: Record<PerspectiveId, string>;
  tone: "somber"|"defiant"|"frozen"|"hopeful"|"ironic";
  reflectiveQuestion: string;
}
```

## Transition logic (replaces auto-advance)

Transition selection must be deterministic-first, random-second.

Use rule priority to prefer historically coherent outcomes before weighted tie-breakers.

Add anti-loop protection for freeze outcomes:

- max 1 freeze repeat per stage

- further freeze attempts must convert into evolve / rupture / collapse

- repeated freeze increases rupture risk and narrator urgency

Collapse should be a modifier state, not necessarily a separate stage, unless explicitly required by the content plan.

```ts
// transition/resolver.ts (sketch)
export function resolveTransition(s: SimState): PathOutcome {
  const c = s.contradiction, st = s.metrics.stability, p = s.metrics.production;
  const org = s.pressures.organization, leg = 100 - s.pressures.legitimacyLoss;

  const candidates: { o: PathOutcome; w: number }[] = [
    { o: "rupture",         w: c>=85 && org>=60 ? c + org : 0 },
    { o: "failed_uprising", w: c>=85 && org<40  ? c + (100-org) : 0 },
    { o: "collapse",        w: st<20 && p<25 ? (40-st)+(40-p) : 0 },
    { o: "freeze",          w: c<50 && p<40 && org<30 ? 30 : 0 },
    { o: "suppress",        w: s.perspective==="ruler" && s.pressures.repression>60 ? 50 : 0 },
    { o: "evolve",          w: st>40 && c<70 ? 40 + leg/3 : 5 },
  ];
  return weightedPick(candidates) ?? "evolve";
}
```

Non-`evolve` outcomes:

- **freeze** → same stage repeats with `stagnation_decade` memory + decay
- **collapse** → jump to special `dark_age` mini-stage, then evolve with `collapse_scar`
- **suppress** → next stage forced to authoritarian variant, locks "reform" tag for the rest of run
- **failed_uprising** → stays in stage, +30 repression, `failed_revolt` memory, organization halved
- **rupture** → existing revolution cinematic
- **evolve** → existing advance

## Perspective rules

Extend `perspectiveConfig.ts` with a `lens` per perspective:

- **Ruler**: sees stability/legitimacy/production VISIBLE, organization HIDDEN, classTension MUTED. Exclusive option tag: `repression`, `decree`. Hides `sabotage`, `underground`.
- **Worker**: sees classTension/organization/productionInstability VISIBLE, legitimacyLoss MUTED, repression VISIBLE (felt). Macro `tech` HIDDEN. Exclusive: `strike`, `organize`, `sabotage`, `solidarity`. Hides `decree`.
- **Historian**: ALL visible but `delayed` (shown as past-tense), plus memory tags expanded. Exclusive: `analyze`, `document`, `compare`. Cannot pick options tagged `direct_action` (cannot intervene) — those are replaced with `record:<id>` variants that yield insight but no metric change.

`DecisionPanel` filters `decision.options` through `lens.optionTags` and re-labels via existing `perspectiveOverrides`.

Perspective visibility must use three states: visible / muted / hidden.

Historian should retain indirect agency through analysis, archive, exposure, and insight unlocks, even if direct intervention is restricted.

## Historical memory system

- `simStore.memory: MemoryTag[]` (capped 20, weight decays 0.7^stages).
- `pushMemory(tag)` called from `applyOutcome`, contradiction events, and transition resolver.
- `queryMemory(predicate)` used by:
  - stage intro composer → `"After the famine of the previous decade…"`
  - narrator → reuses memory echoes at high pressure
  - background visuals → `ReplayTimeline` adds icons per tag
  - ending resolver → templates `match` on memory presence

## Human presence (lightweight)

`CompanionVoice.tsx` is a small bottom-corner card that shows one line at a time when a `trigger` fires. Lines live in `companion/lines.ts`. Per perspective:

- Ruler: **Advisor** ("Sire, the granary lords grow restless.")
- Worker: **Comrade** ("Maria didn't come to the line today. Three days now.")
- Historian: **Archive Assistant** ("Cross-reference: this matches the 1848 pattern.")

No state machine — a queue of lines drained on triggers. Reduced-motion: fade only.

Companion lines must be context-aware and deduplicated.

Each line can be gated by stage, pressure thresholds, or memory tags.

The companion system should never spam repeated lines in consecutive decisions.

## Ending system v2

`endings/templates.ts` defines ~10 templates matched in order. Each carries:

- per-perspective narration paragraph
- `tone` → drives bg color via design tokens
- `reflectiveQuestion` shown after replay

Examples:

- `ruler_authoritarian_continuity`, `worker_revolution_won`, `worker_failed_uprising_legacy`, `historian_collapse_documented`, `shared_stagnation`, `shared_rupture_unfinished`.

## Sample stage walkthrough — "Late Feudalism → Industrial"

1. Stage start. Worker perspective. `memory: ["famine"]` from prior stage. Companion line: *"My brother still won't eat bread."*
2. Decision: "The lord raises the corvée".
  - Worker sees options: `Strike` (exclusive), `Organize` (exclusive), `Petition` (shared, muted as ineffective), `Submit`. `Decree leniency` is HIDDEN.
  - Picks **Strike**. Pressures: classTension +20, organization +15, production −15, repression +10.
3. Contradiction climbs to 88 → tier RUPTURE. Event `military_unrest` fires; companion: *"The garrison hasn't been paid."*
4. Stage end → `resolveTransition`:
  - rupture weight: 88 + org(70) = 158
  - failed_uprising weight: 0 (org high)
  - evolve: 5
  - → **rupture**. Cinematic plays. `pushMemory("rupture_legacy")`.
5. Next stage starts with `rupture_legacy` echo in intro; Ruler-locked options re-enabled, but `suppress` path disabled for the rest of the run.

Alternative branch (org<40 when player chose Submit twice): same event fires → **failed_uprising**. Stage repeats. Repression +30. Memory `failed_revolt`. Narrator: *"They will remember this defeat for a generation."* Companion (Worker): *"Don't say her name out loud."*

## Component-level changes

- `simStore.ts`: add `memory`, `stagePath`, `endingType`, `companionQueue`. Replace `advanceStage()` body with `resolveTransition` + branch handlers. Emit memory tags from existing event/outcome paths.
- `HistoricalSim.tsx`: render `<CompanionVoice/>`, filter options through `lens`, use `endingType` to pick ending screen variant.
- `PerspectiveHUD.tsx`: read `lens.gauges` to apply `visible/muted/hidden` classes (already styled via design tokens).
- `Narrator.tsx`: accept `memoryEchoes` prop and append before main line at tier ≥ UNSTABLE.
- `ReplayTimeline.tsx`: render small icons for each memory tag.
- New `EndingScreen.tsx` (or rework existing) using template + reflective question.

## File structure updates

```text
src/data/
  transition/{outcomes.ts, rules.ts, resolver.ts}
  memory/{tags.ts, memory.ts}
  companion/{lines.ts, companion.ts}
  endings/{templates.ts, resolver.ts}
  perspective/perspectiveConfig.ts        (extended with `lens`)
src/components/minigame/sim/
  companion/CompanionVoice.tsx
  ending/EndingScreen.tsx
  simStore.ts                              (extended)
  HistoricalSim.tsx                        (hooks)
```

## Acceptance checklist

- Stage advance is no longer guaranteed; at least 4 distinct non-evolve outcomes reachable.
- Contradiction tier ≥ EMERGENCY can trigger event that mutates available options for the next decision.
- Each perspective hides at least 1 gauge and 1 option tag; emphasizes ≥1 exclusive tag.
- Historian cannot pick `direct_action` options; gets `record` variants instead.
- Memory tags persist across stages, decay over time, appear in narrator + replay + endings.
- Companion line fires on stage start, high pressure, and key outcomes (≥6 unique lines per perspective).
- ≥6 ending templates, each with per-perspective narration + reflective question.
- No option ever feels "right" — every choice tagged with at least one negative trade-off in its delta.
- Reduced-motion + design tokens preserved; build passes.