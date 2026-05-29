/**
 * Contradiction Tiers
 * Maps contradiction (0..100) → systemic-pressure tier with concrete gameplay effects.
 */

export type TierId = "calm" | "tension" | "unstable" | "emergency" | "rupture";

export type OptionTag =
  | "reform"
  | "concession"
  | "repression"
  | "uprising"
  | "reactionary"
  | "emergency"
  | "neutral";

export type NarratorTone = "neutral" | "uneasy" | "strained" | "urgent" | "fractured";

export interface Tier {
  id: TierId;
  min: number;
  label: string;
  shortLabel: string;
  narratorTone: NarratorTone;
  uiDistortion: number;      // 0..1 → StressOverlay + Narrator glitch
  stabilityDecay: number;    // applied each decision
  productionDecay: number;
  optionRiskFactor: number;  // 0..1 → reduces positive metric outcomes
  lockTags: OptionTag[];     // option tags blocked at this tier
  emergencyOnly: boolean;    // when true, only `uprising/repression/emergency` are usable
  eventChance: number;       // probability of rolling a contradiction event per decision
}

export const TIERS: Tier[] = [
  {
    id: "calm",
    min: 0,
    label: "Bình lặng",
    shortLabel: "Bình lặng",
    narratorTone: "neutral",
    uiDistortion: 0,
    stabilityDecay: 0,
    productionDecay: 0,
    optionRiskFactor: 0,
    lockTags: [],
    emergencyOnly: false,
    eventChance: 0,
  },
  {
    id: "tension",
    min: 50,
    label: "Căng thẳng âm ỉ",
    shortLabel: "Căng thẳng",
    narratorTone: "uneasy",
    uiDistortion: 0.18,
    stabilityDecay: 1,
    productionDecay: 0,
    optionRiskFactor: 0.05,
    lockTags: [],
    emergencyOnly: false,
    eventChance: 0.35,
  },
  {
    id: "unstable",
    min: 70,
    label: "Bất ổn",
    shortLabel: "Bất ổn",
    narratorTone: "strained",
    uiDistortion: 0.45,
    stabilityDecay: 3,
    productionDecay: 2,
    optionRiskFactor: 0.15,
    lockTags: ["reform"],
    emergencyOnly: false,
    eventChance: 0.6,
  },
  {
    id: "emergency",
    min: 85,
    label: "Trạng thái khẩn cấp",
    shortLabel: "Khẩn cấp",
    narratorTone: "urgent",
    uiDistortion: 0.75,
    stabilityDecay: 5,
    productionDecay: 5,
    optionRiskFactor: 0.3,
    lockTags: ["reform", "concession"],
    emergencyOnly: false,
    eventChance: 0.9,
  },
  {
    id: "rupture",
    min: 95,
    label: "Vỡ trận",
    shortLabel: "Vỡ trận",
    narratorTone: "fractured",
    uiDistortion: 1,
    stabilityDecay: 8,
    productionDecay: 8,
    optionRiskFactor: 0.5,
    lockTags: ["reform", "concession", "reactionary", "neutral"],
    emergencyOnly: true,
    eventChance: 1,
  },
];

export const TIER_ORDER: TierId[] = TIERS.map((t) => t.id);

export function resolveTier(contradiction: number): Tier {
  const c = Math.max(0, Math.min(100, contradiction));
  let active = TIERS[0];
  for (const t of TIERS) if (c >= t.min) active = t;
  return active;
}

export function tierIndex(id: TierId): number {
  return TIER_ORDER.indexOf(id);
}

export function tierLockReason(tier: Tier, tag: OptionTag | undefined): string | null {
  if (tier.emergencyOnly && tag && !["uprising", "repression", "emergency"].includes(tag)) {
    return `Vỡ trận — chỉ còn lựa chọn cực đoan`;
  }
  if (tag && tier.lockTags.includes(tag)) {
    if (tag === "reform") return "Quá muộn để cải lương — mâu thuẫn đã vượt cải cách";
    if (tag === "concession") return "Nhượng bộ không còn đủ — quần chúng đã thấy yếu thế";
    if (tag === "reactionary") return "Phản ứng cũ không kìm được sóng ngầm";
    if (tag === "neutral") return "Không thể đứng giữa khi mọi thứ đang vỡ";
  }
  return null;
}
