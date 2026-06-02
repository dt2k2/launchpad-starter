import {
  STAGES,
  TECH_TREE,
  PERSPECTIVES,
  type Decision,
  type DecisionOption,
  type MetricKey,
  type PerspectiveId,
} from "../src/data/historicalSim";
import { TIERS } from "../src/data/contradiction/thresholds";
import { CONTRADICTION_EVENTS } from "../src/data/contradiction/events";
import { COMPANION_LINES } from "../src/data/companion/lines";
import { INTERLUDES } from "../src/data/interludes";
import { ENDING_TEMPLATES } from "../src/data/endings/templates";
import {
  OPTION_COPY_OVERRIDES,
  resolveOptions,
  resolveVoice,
} from "../src/data/perspective/perspectiveConfig";
import type { EraId } from "../src/data/eras";
import type { PathOutcome } from "../src/data/transition/outcomes";

const failures: string[] = [];
const roles = PERSPECTIVES.map((p) => p.id) as PerspectiveId[];
const eraIds = new Set<EraId>(STAGES.map((stage) => stage.id));
const techIds = new Set(TECH_TREE.map((tech) => tech.id));
const tierIds = new Set(TIERS.map((tier) => tier.id));
const validMetrics: MetricKey[] = [
  "production",
  "stability",
  "contradiction",
  "revolution",
  "tech",
];
const disruptiveOutcomes: PathOutcome[] = ["collapse", "freeze", "suppress", "failed_uprising"];

function fail(message: string) {
  failures.push(message);
}

function requireUnique(scope: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(`${scope}: duplicate id "${id}"`);
    seen.add(id);
  }
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasMetricEffect(option: DecisionOption): boolean {
  return validMetrics.some((metric) => (option.effect[metric] ?? 0) !== 0);
}

function checkOption(scope: string, option: DecisionOption, insightIds: Set<string>) {
  if (!hasText(option.label)) fail(`${scope}: missing label`);
  if (!hasText(option.flavor)) fail(`${scope}: missing flavor`);
  if (!option.tag) fail(`${scope}: missing option tag`);
  if (!hasMetricEffect(option)) fail(`${scope}: missing metric effect`);
  if (option.causeChain.length < 2) fail(`${scope}: cause chain should have at least 2 beats`);

  for (const metric of Object.keys(option.effect)) {
    if (!validMetrics.includes(metric as MetricKey)) fail(`${scope}: unknown metric "${metric}"`);
  }

  for (const techId of option.unlocks ?? []) {
    if (!techIds.has(techId)) fail(`${scope}: unlocks missing tech "${techId}"`);
  }

  if (option.insight && !insightIds.has(option.insight)) {
    fail(`${scope}: references missing stage insight "${option.insight}"`);
  }
}

function checkDecision(stageId: EraId, decision: Decision, insightIds: Set<string>) {
  if (!hasText(decision.title)) fail(`${stageId}/${decision.id}: missing title`);
  if (!hasText(decision.prompt)) fail(`${stageId}/${decision.id}: missing prompt`);
  requireUnique(
    `${stageId}/${decision.id}/options`,
    decision.options.map((option) => option.id),
  );

  for (const role of roles) {
    const voice = resolveVoice(role, "decisionPrompt", { decision, fallback: decision.prompt });
    if (!hasText(voice)) fail(`${stageId}/${decision.id}: missing ${role} decision voice`);

    const resolved = resolveOptions(decision, role);
    if (resolved.length < 2)
      fail(`${stageId}/${decision.id}/${role}: fewer than 2 resolved options`);
    requireUnique(
      `${stageId}/${decision.id}/${role}/resolved-options`,
      resolved.map((option) => option.id),
    );
    for (const option of resolved) {
      checkOption(`${stageId}/${decision.id}/${role}/${option.id}`, option, insightIds);
    }
  }
}

requireUnique(
  "eras",
  STAGES.map((stage) => stage.id),
);
requireUnique(
  "tech tree",
  TECH_TREE.map((tech) => tech.id),
);
requireUnique("perspectives", roles);

for (const stage of STAGES) {
  if (stage.order < 1 || stage.order > STAGES.length)
    fail(`${stage.id}: invalid order ${stage.order}`);
  if (stage.productionForces.length < 2)
    fail(`${stage.id}: production forces should have at least 2 items`);
  if (stage.relationsOfProduction.length < 2)
    fail(`${stage.id}: relations should have at least 2 items`);
  if (stage.decisions.length !== 3) fail(`${stage.id}: expected exactly 3 decisions/events`);

  const insightIds = new Set(stage.insights.map((insight) => insight.id));
  requireUnique(
    `${stage.id}/decisions`,
    stage.decisions.map((decision) => decision.id),
  );
  requireUnique(
    `${stage.id}/insights`,
    stage.insights.map((insight) => insight.id),
  );

  for (const insight of stage.insights) {
    if (insight.era !== stage.id) fail(`${stage.id}/${insight.id}: insight era mismatch`);
    if (!hasText(insight.title) || !hasText(insight.body))
      fail(`${stage.id}/${insight.id}: shallow insight copy`);
  }

  for (const techId of stage.techPool) {
    const tech = TECH_TREE.find((node) => node.id === techId);
    if (!tech) fail(`${stage.id}: techPool references missing tech "${techId}"`);
    else if (tech.era !== stage.id) fail(`${stage.id}: tech "${techId}" belongs to ${tech.era}`);
  }

  for (const decision of stage.decisions) checkDecision(stage.id, decision, insightIds);
}

for (const tech of TECH_TREE) {
  if (!eraIds.has(tech.era)) fail(`tech/${tech.id}: unknown era "${tech.era}"`);
  if (!hasText(tech.label) || !hasText(tech.description))
    fail(`tech/${tech.id}: shallow tech copy`);
}

for (const [decisionId, byRole] of Object.entries(OPTION_COPY_OVERRIDES)) {
  const decision = STAGES.flatMap((stage) => stage.decisions).find(
    (item) => item.id === decisionId,
  );
  if (!decision) {
    fail(`option copy overrides: missing decision "${decisionId}"`);
    continue;
  }

  for (const [role, byOption] of Object.entries(byRole) as Array<
    [PerspectiveId, Record<string, unknown>]
  >) {
    if (!roles.includes(role)) fail(`option copy overrides/${decisionId}: unknown role "${role}"`);
    const optionIds = new Set(resolveOptions(decision, role).map((option) => option.id));
    for (const optionId of Object.keys(byOption)) {
      if (optionIds.has(optionId) || optionIds.has(`record:${optionId}`)) continue;
    }
  }
}

requireUnique(
  "contradiction events",
  CONTRADICTION_EVENTS.map((event) => event.id),
);
for (const event of CONTRADICTION_EVENTS) {
  if (!tierIds.has(event.minTier)) fail(`event/${event.id}: unknown minTier "${event.minTier}"`);
  if ((event.eras ?? []).some((era) => !eraIds.has(era)))
    fail(`event/${event.id}: references unknown era`);
  for (const role of roles) {
    if (!hasText(event.narrator[role])) fail(`event/${event.id}: missing narrator for ${role}`);
  }
  if (!validMetrics.some((metric) => (event.effect[metric] ?? 0) !== 0)) {
    fail(`event/${event.id}: missing metric effect`);
  }
}

for (const interlude of Object.values(INTERLUDES)) {
  for (const role of roles) {
    const options = interlude.options[role];
    if (options.length < 2) fail(`interlude/${interlude.id}/${role}: fewer than 2 options`);
    requireUnique(
      `interlude/${interlude.id}/${role}/options`,
      options.map((option) => option.id),
    );
    for (const option of options)
      checkOption(`interlude/${interlude.id}/${role}/${option.id}`, option, new Set());
  }
}

requireUnique(
  "companion lines",
  COMPANION_LINES.map((line) => line.id),
);
for (const line of COMPANION_LINES) {
  if (!roles.includes(line.perspective))
    fail(`companion/${line.id}: unknown role "${line.perspective}"`);
  if (line.eraId && !eraIds.has(line.eraId))
    fail(`companion/${line.id}: unknown era "${line.eraId}"`);
  if (!hasText(line.speaker) || !hasText(line.text))
    fail(`companion/${line.id}: shallow companion copy`);
}

for (const eraId of eraIds) {
  for (const role of roles) {
    for (const trigger of ["stage_start", "high_pressure", "rupture"] as const) {
      const hasLine = COMPANION_LINES.some(
        (line) => line.perspective === role && line.trigger === trigger && line.eraId === eraId,
      );
      if (!hasLine) fail(`companion/${eraId}/${role}: missing ${trigger} line`);
    }
  }
}

for (const role of roles) {
  for (const outcome of disruptiveOutcomes) {
    const hasLine = COMPANION_LINES.some(
      (line) =>
        line.perspective === role &&
        line.trigger === "outcome" &&
        (!line.match || line.match({ outcome })),
    );
    if (!hasLine) fail(`companion/${role}: missing generic outcome line for ${outcome}`);
  }
}

requireUnique(
  "ending templates",
  ENDING_TEMPLATES.map((template) => template.id),
);
if (ENDING_TEMPLATES[ENDING_TEMPLATES.length - 1]?.id !== "unresolved") {
  fail("ending templates: last template should be unresolved fallback");
}
for (const template of ENDING_TEMPLATES) {
  if (!hasText(template.title) || !hasText(template.reflectiveQuestion)) {
    fail(`ending/${template.id}: shallow ending copy`);
  }
  for (const role of roles) {
    const narration = template.narration[role];
    if (!narration || !hasText(narration.body) || !hasText(narration.epitaph)) {
      fail(`ending/${template.id}: missing ${role} narration`);
    }
  }
}

if (failures.length > 0) {
  console.error("Minigame consistency check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Minigame consistency check passed: ${STAGES.length} eras, ${
    STAGES.flatMap((stage) => stage.decisions).length
  } decisions, ${CONTRADICTION_EVENTS.length} events, ${COMPANION_LINES.length} companion lines, ${
    ENDING_TEMPLATES.length
  } endings.`,
);
