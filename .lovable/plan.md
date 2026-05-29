# Refactor: Contradiction → Real Gameplay Pressure System

Mục tiêu: contradiction không còn chỉ là "stress overlay" — nó trở thành **áp lực hệ thống** thực sự, có ngưỡng, có sự kiện, có hậu quả lên option/metric/UI/narrator. **Không** đập kiến trúc; mở rộng `simStore` + thêm 1 cụm data + vài UI hook.

---

## 1. Engine design (data-driven, 3 lớp)

```text
┌─ Pressure Layer ──────────────┐   derived mỗi tick từ metrics + log
│ classTension, repression,     │
│ legitimacyLoss, organization, │
│ productionInstability,         │
│ ruptureRisk                    │
└──────────────┬─────────────────┘
               │ feeds
┌──────────────▼─────────────────┐
│  Threshold Resolver            │   contradiction → tier
│  CALM/TENSION/UNSTABLE/        │
│  EMERGENCY/RUPTURE             │
└──────────────┬─────────────────┘
               │ drives
┌──────────────▼─────────────────┐
│  Effect Resolver               │
│   • lockedOptionIds            │
│   • metricDecayPerTick         │
│   • optionRiskFactor           │
│   • narratorTone               │
│   • uiDistortion (0..1)        │
└──────────────┬─────────────────┘
               │ may trigger
┌──────────────▼─────────────────┐
│  Event Engine                  │
│  injects ContradictionEvent    │
│  before next decision          │
└────────────────────────────────┘
```

Tất cả derived — pressures là functions of state, không thêm dữ liệu cần persist (trừ `activeEvents`, `eventCooldowns`).

---

## 2. Files

**Mới — `src/data/contradiction/`**
- `thresholds.ts` — `TIERS` config (cutoff, narratorTone, uiDistortion, decay, lockTags…)
- `pressures.ts` — `derivePressures(state)` → 6 con số 0..100
- `events.ts` — `CONTRADICTION_EVENTS` array (strike_wave, famine, treasury_collapse, elite_fracture, military_unrest, underground_org, propaganda_surge)
- `resolver.ts` — `resolveContradictionEffects(state)` → `{tier, lockedOptionIds, decay, narratorTone, distortion, eventCandidates}`
- `index.ts` — re-export

**Mới — `src/components/minigame/sim/pressure/`**
- `PressureGauges.tsx` — 6 mini bar trong HUD
- `ContradictionTierBadge.tsx` — pill hiển thị tier hiện tại

**Sửa:**
- `src/data/historicalSim.ts` — thêm optional `tag?: "reform"|"concession"|"repression"|"uprising"|"reactionary"|"neutral"` trên `DecisionOption`; thêm optional `pressureImpact?` cho event tuning
- `src/components/minigame/sim/simStore.ts` — state mới (xem §3), gọi resolver mỗi `decide`/`ackConsequence`, inject contradiction events
- `src/components/minigame/sim/HistoricalSim.tsx` — render lock state + tooltip lý do, render banner sự kiện, truyền `distortion`/`tone` cho Narrator + StressOverlay
- `src/components/minigame/sim/perspective/PerspectiveHUD.tsx` — embed `<PressureGauges>` + `<ContradictionTierBadge>`
- `src/components/minigame/sim/cinematic/StressOverlay.tsx` — `intensity` đọc từ tier thay vì raw contradiction
- `src/components/minigame/sim/cinematic/Narrator.tsx` — class `glitch` khi tier ≥ UNSTABLE

Không động: routing, perspective config, ending classifier, replay timeline, cinematic.

---

## 3. Schema mở rộng

```ts
// simStore.ts — SimState thêm:
contradictionTier: "calm"|"tension"|"unstable"|"emergency"|"rupture";
pressures: {
  classTension: number;
  repression: number;
  legitimacyLoss: number;
  organization: number;
  productionInstability: number;
  ruptureRisk: number;
};
activeEvents: ActiveEvent[];           // event đã trigger, hiển thị banner
eventCooldowns: Record<string, number>;// id → số decision còn cooldown
lockedOptionIds: string[];             // tính lại mỗi step
```

```ts
// contradiction/thresholds.ts
export type TierId = "calm"|"tension"|"unstable"|"emergency"|"rupture";
export interface Tier {
  id: TierId;
  min: number;                      // contradiction ≥
  label: string;
  narratorTone: "neutral"|"uneasy"|"strained"|"urgent"|"fractured";
  uiDistortion: number;             // 0..1 → StressOverlay + Narrator glitch
  stabilityDecay: number;           // áp dụng cuối mỗi decision
  productionDecay: number;
  optionRiskFactor: number;         // 0..1, càng cao càng dễ "fail" effect
  lockTags: OptionTag[];            // option có tag này bị khoá ở tier này
  emergencyOnly: boolean;           // chỉ option có tag "emergency" còn dùng được
}
export const TIERS: Tier[] = [
  { id:"calm",      min:0,  narratorTone:"neutral",  uiDistortion:0,    stabilityDecay:0, productionDecay:0, optionRiskFactor:0,   lockTags:[],              emergencyOnly:false, label:"Bình lặng" },
  { id:"tension",   min:50, narratorTone:"uneasy",   uiDistortion:0.15, stabilityDecay:1, productionDecay:0, optionRiskFactor:0.05,lockTags:[],              emergencyOnly:false, label:"Căng thẳng" },
  { id:"unstable",  min:70, narratorTone:"strained", uiDistortion:0.4,  stabilityDecay:3, productionDecay:2, optionRiskFactor:0.15,lockTags:["reform"],      emergencyOnly:false, label:"Bất ổn" },
  { id:"emergency", min:85, narratorTone:"urgent",   uiDistortion:0.7,  stabilityDecay:5, productionDecay:5, optionRiskFactor:0.3, lockTags:["reform","concession"], emergencyOnly:false, label:"Khẩn cấp" },
  { id:"rupture",   min:95, narratorTone:"fractured",uiDistortion:1.0,  stabilityDecay:8, productionDecay:8, optionRiskFactor:0.5, lockTags:["reform","concession","neutral"], emergencyOnly:true, label:"Vỡ trận" },
];
```

```ts
// contradiction/events.ts
export interface ContradictionEvent {
  id: string;
  title: string;
  minTier: TierId;                  // tier tối thiểu để eligible
  weight: number;                   // weighted random
  cooldown: number;                 // số decision trước khi có thể trigger lại
  condition?: (s: SimState) => boolean;
  narrator: Partial<Record<PerspectiveId, string>>;
  effect: MetricDelta;              // áp dụng ngay khi trigger
  pressureImpact?: Partial<SimState["pressures"]>; // additive
  forcedDecision?: Decision;        // nếu có → chèn vào hàng đợi
}
```

Pressure derivation (deterministic):
```ts
classTension          = clamp(contradiction*0.6 + (100-stability)*0.3 + revolution*0.1)
repression            = clamp(sum(option.tag==="repression")*15 - sum(option.tag==="concession")*10)
legitimacyLoss        = clamp(100 - stability + contradiction*0.2 - progressiveCount*4)
organization          = clamp(sum(option.tag==="uprising")*12 + revolution*0.4 + (perspective==="worker"?10:0))
productionInstability = clamp(contradiction*0.4 + (100-production)*0.3)
ruptureRisk           = clamp(contradiction*0.45 + classTension*0.25 + legitimacyLoss*0.15 + organization*0.2 - repression*0.15)
```

---

## 4. New gameplay effects (cụ thể)

| Tier | Tác động |
|---|---|
| **TENSION (50+)** | narrator chuyển `uneasy`; HUD ring đỏ pulse nhẹ; có 25% chance trigger 1 event nhẹ (strike_wave, propaganda_surge) sau decision |
| **UNSTABLE (70+)** | option tag `reform` bị khoá (tooltip: "Quá muộn để cải lương — mâu thuẫn đã vượt cải cách"); stability -3/decision; narrator distort nhẹ; event trigger chance 50% |
| **EMERGENCY (85+)** | thêm khoá `concession`; stability -5, production -5/decision; option risk factor 30% (effect bị giảm random 0–30%); banner đỏ "Trạng thái Khẩn cấp"; ép trigger 1 event mỗi decision nếu có sẵn |
| **RUPTURE (95+)** | chỉ option `uprising`/`repression`/`emergency` khả dụng; mỗi decision đẩy `revolution` +15; cinematic glitch tối đa; nếu kéo dài 2 decision → force `revolution` phase |

`optionRiskFactor`: khi apply effect, các metric **tích cực** (stability, production, tech) bị nhân với `(1 - risk*random())`; metric tiêu cực (contradiction, revolution) không bị giảm — nghĩa là "ván cờ ngày càng khó cứu".

---

## 5. Sample event implementation

```ts
// contradiction/events.ts (trích)
export const CONTRADICTION_EVENTS: ContradictionEvent[] = [
  {
    id: "strike_wave",
    title: "Làn sóng bãi công",
    minTier: "tension",
    weight: 3,
    cooldown: 2,
    narrator: {
      ruler:  "Các xưởng im tiếng máy. Báo cáo nói 'tạm dừng kỹ thuật' — ta biết đó là dối trá.",
      worker: "Anh em buông búa cùng lúc. Lần đầu, nhà máy im lặng vì *chúng ta* im lặng.",
      historian: "Khi giá trị thặng dư bị từ chối tạo ra — nền sản xuất lộ rõ ai thực sự vận hành nó.",
    },
    effect: { production: -8, contradiction: +4, stability: -5 },
    pressureImpact: { organization: +12, classTension: +8 },
  },
  {
    id: "treasury_collapse",
    title: "Ngân khố cạn",
    minTier: "emergency",
    weight: 2,
    cooldown: 4,
    condition: (s) => s.metrics.production < 50,
    narrator: {
      ruler:  "Két sắt rỗng. Lính đánh thuê đòi lương bằng bạc, không bằng lời hứa.",
      worker: "Họ tăng thuế lần thứ ba quý này. Bánh mì đắt gấp đôi.",
      historian: "Khủng hoảng tài khoá luôn báo trước khủng hoảng chính trị.",
    },
    effect: { production: -10, stability: -12, contradiction: +6 },
    pressureImpact: { legitimacyLoss: +15, productionInstability: +20 },
  },
  // famine, elite_fragmentation, military_unrest, underground_organizing, propaganda_surge…
];
```

Event picker (trong resolver):
```ts
function pickEvent(state, tier): ContradictionEvent | null {
  const pool = CONTRADICTION_EVENTS.filter(e =>
    TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(e.minTier) &&
    (state.eventCooldowns[e.id] ?? 0) === 0 &&
    (e.condition?.(state) ?? true)
  );
  // weighted random; emergency tier → force trigger; tension tier → 25% gate
  ...
}
```

---

## 6. Reducer integration (minimal touch)

`case "decide"`:
1. apply option effect (như cũ) — nhưng pass qua `applyRisk(effect, tier.optionRiskFactor)`
2. derivePressures(next) → `tier = resolveTier(next.metrics.contradiction)`
3. apply `tier.stabilityDecay` / `productionDecay`
4. compute `lockedOptionIds` cho decision kế tiếp
5. roll event → nếu trigger: push vào `activeEvents`, apply `effect+pressureImpact`, set cooldown; nếu có `forcedDecision` → chèn trước decision kế tiếp (giữ `decisionIdx` logic bằng cách extend stage decision queue runtime)

`case "ackConsequence"`: decrement `eventCooldowns`, clear consumed `activeEvents`.

Existing revolution trigger giữ nguyên — chỉ thêm: nếu `tier === "rupture"` 2 decision liên tiếp → force `phase = "revolution"`.

---

## 7. UI integration (presentation only)

- **HUD**: PerspectiveHUD render thêm `<ContradictionTierBadge tier={...} />` + `<PressureGauges p={pressures} />` (6 bar mỏng, xám khi 0).
- **DecisionPanel** (`HistoricalSim.tsx`): option có id ∈ `lockedOptionIds` → render với `opacity-40`, lock icon, tooltip lý do (`tier.label + "khoá tag X"`).
- **EventBanner**: trên decision card, hiển thị `activeEvents[0].title + narrator[perspective]`, accent đỏ.
- **StressOverlay**: `intensity = tier.uiDistortion` (đổi từ raw contradiction).
- **Narrator**: nếu `tier.narratorTone !== "neutral"` → add class `narrator-${tone}` (CSS: uneasy = slight letter-spacing wobble; strained = subtle RGB split; urgent = bold uppercase pulse; fractured = full glitch).
- **EmergencyBanner**: khi `tier ∈ {emergency,rupture}` → sticky banner top với pulse đỏ + countdown decisions đến rupture.

---

## 8. Acceptance checklist

- [ ] 6 pressures derived, hiển thị HUD, cập nhật realtime sau mỗi decision
- [ ] Tier badge thay đổi đúng theo contradiction (test 5 ngưỡng)
- [ ] Ở UNSTABLE: ít nhất 1 option bị khoá có tooltip lý do
- [ ] Ở EMERGENCY: stability/production decay quan sát được; banner đỏ hiện
- [ ] Ở RUPTURE: chỉ còn emergency options; sau 2 decision → revolution
- [ ] Optionrisk factor giảm metric tích cực ở tier cao (test bằng cùng option ở CALM vs EMERGENCY)
- [ ] Ít nhất 7 contradiction events, cooldown hoạt động, không spam
- [ ] Narrator tone class đổi theo tier; visible distortion
- [ ] StressOverlay intensity drive bởi tier, không phải raw value
- [ ] Build pass, perspective/cinematic/replay không regression
- [ ] Có ít nhất 1 playthrough thấy 3+ contradiction events khác nhau

---

## 9. Triển khai (1 PR)

1. `src/data/contradiction/*` (types + thresholds + pressures + events + resolver) — compile-only
2. simStore: state field mới + applyRisk + decay + tier compute (chưa wire UI)
3. Event injection + cooldown
4. UI hooks: HUD gauges, tier badge, locked option render, event banner
5. Narrator tone + StressOverlay tier source
6. QA 3 playthrough perspective
