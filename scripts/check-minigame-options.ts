import { STAGES, type DecisionOption, type PerspectiveId } from "../src/data/historicalSim";
import { resolveTier, tierLockReason } from "../src/data/contradiction/thresholds";
import { INTERLUDES } from "../src/data/interludes";
import { OPTION_COPY_OVERRIDES, resolveOptions } from "../src/data/perspective/perspectiveConfig";

const ROLES: PerspectiveId[] = ["ruler", "worker", "historian"];
const RUPTURE_TIER = resolveTier(95);
const REQUIRED_COPY_OVERRIDES: Array<{ decisionId: string; role: PerspectiveId; optionId: string }> = [
  { decisionId: "s-d1", role: "worker", optionId: "war" },
  { decisionId: "s-d1", role: "worker", optionId: "reform" },
  { decisionId: "f-d2", role: "worker", optionId: "fund" },
  { decisionId: "f-d2", role: "worker", optionId: "refuse" },
  { decisionId: "c-d3", role: "worker", optionId: "techno-fix" },
  { decisionId: "c-d3", role: "worker", optionId: "social-plan" },
  { decisionId: "x-d2", role: "worker", optionId: "data-private" },
  { decisionId: "x-d3", role: "ruler", optionId: "topdown" },
];

function hasRoleRuptureOption(options: DecisionOption[], role: PerspectiveId): boolean {
  if (role === "ruler") {
    return options.some((option) => option.tag === "repression" || option.tag === "emergency");
  }
  if (role === "worker") return options.some((option) => option.tag === "uprising");
  return options.some((option) => option.tag === "document");
}

const failures: string[] = [];

for (const required of REQUIRED_COPY_OVERRIDES) {
  const override = OPTION_COPY_OVERRIDES[required.decisionId]?.[required.role]?.[required.optionId];
  if (!override?.label || !override.flavor) {
    failures.push(
      `${required.decisionId}/${required.role}/${required.optionId}: missing role-specific option copy`,
    );
  }
}

for (const stage of STAGES) {
  for (const decision of stage.decisions) {
    for (const role of ROLES) {
      const normalOptions = resolveOptions(decision, role);
      if (normalOptions.length < 2) {
        failures.push(
          `${stage.id}/${decision.id}/${role}: expected at least 2 normal options, got ${normalOptions.length}`,
        );
      }

      const ruptureOptions = resolveOptions(decision, role, RUPTURE_TIER.id).filter(
        (option) => !tierLockReason(RUPTURE_TIER, option.tag),
      );
      if (!hasRoleRuptureOption(ruptureOptions, role)) {
        const tags = ruptureOptions.map((option) => `${option.id}:${option.tag ?? "none"}`).join(", ");
        failures.push(`${stage.id}/${decision.id}/${role}: missing rupture-compatible role option. Got [${tags}]`);
      }
    }
  }
}

for (const interlude of Object.values(INTERLUDES)) {
  for (const role of ROLES) {
    const options = interlude.options[role];
    if (options.length < 2) {
      failures.push(`${interlude.id}/${role}: expected at least 2 interlude options, got ${options.length}`);
    }
    for (const option of options) {
      const hasEffect = Object.values(option.effect).some((v) => (v ?? 0) !== 0);
      if (!hasEffect) failures.push(`${interlude.id}/${role}/${option.id}: missing metric effect`);
      if (option.causeChain.length < 2) {
        failures.push(`${interlude.id}/${role}/${option.id}: cause chain is too shallow`);
      }
      if (!option.tag) failures.push(`${interlude.id}/${role}/${option.id}: missing option tag`);
    }
  }
}

if (failures.length > 0) {
  console.error("Minigame option check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Minigame option check passed: ${STAGES.length} eras, ${
    STAGES.flatMap((stage) => stage.decisions).length
  } decisions, ${Object.keys(INTERLUDES).length} interludes, ${ROLES.length} roles.`,
);
