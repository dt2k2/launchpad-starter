# Refactor: Perspective System — Ruler / Worker / Historian

Mục tiêu: làm cho 3 góc nhìn cảm thấy như 3 trải nghiệm lịch sử khác nhau, không phải 3 stat-modifier. **Không** đập lại kiến trúc — chỉ mở rộng các hệ thống đang có (decision, narrator, HUD, ending, insight).

---

## 1. Chiến lược refactor (data-driven, additive)

- Giữ nguyên: `simStore`, contradiction/revolution trigger, tech tree, replay timeline, cinematic, ending classifier infrastructure.
- Thêm 1 module config trung tâm: `src/data/perspective/` → tách thành nhiều file nhỏ, được consume bởi các component đã có.
- Mọi sự khác biệt (voice, theme, objective, ending, insight filter, option gating) đều **đọc từ data** thay vì hardcode trong JSX.
- Khi player chọn perspective → một `PerspectiveContext` cung cấp `theme + voice resolver + objective + insight filter` cho toàn bộ cây con.

---

## 2. Cấu trúc thư mục mới

```text
src/data/perspective/
  index.ts                      // re-export + getPerspectiveConfig(id)
  perspectiveThemes.ts          // tokens cho mỗi perspective
  perspectiveVoices.ts          // voice mặc định + helper resolveVoice()
  perspectiveObjectives.ts      // success rules + HUD warning thresholds
  perspectiveEndingNarrations.ts// template ending theo (endingId, perspective)
  perspectiveInsightFilters.ts  // tag → visibility map
  perspectiveOptionGates.ts     // optionId → perspective[] (visibility/exclusive)

src/components/minigame/sim/perspective/
  PerspectiveProvider.tsx       // context + CSS var injection
  PerspectiveHUD.tsx            // emblem, objective, warning
  PerspectiveVoiceRenderer.tsx  // <VoiceText decision={..} event="prompt"/>
  PerspectiveTransition.tsx     // overlay khi switch / khi vào ải
  InsightFilterEngine.ts        // pure fn: filterInsights(list, perspective)
```

Cập nhật:
- `src/data/historicalSim.ts`: mở rộng `DecisionOption` với optional `tags`, `gatedTo`; mở rộng `Insight` với `tags`; voice schema giữ tương thích ngược.
- `simStore.ts`: thêm `perspectiveScore` (3 con số riêng theo objective).
- `HistoricalSim.tsx`: bọc trong `<PerspectiveProvider>`, thay HUD bằng `<PerspectiveHUD>`, dùng `<VoiceText>` thay vì đọc `decision.voice[]` trực tiếp, dùng `filterOptions()` và `filterInsights()`.
- `Narrator.tsx`: nhận `perspective` → đổi font/tone class từ theme.
- Ending screen: dùng `renderEnding(endingId, perspective, state)`.

---

## 3. Data schema

```ts
// perspectiveThemes.ts
export interface PerspectiveTheme {
  id: PerspectiveId;
  emblem: string;            // glyph or short symbol
  label: string;
  // CSS custom properties — injected to root via PerspectiveProvider
  tokens: {
    "--p-accent": string;        // oklch
    "--p-accent-soft": string;
    "--p-bg": string;
    "--p-surface": string;
    "--p-border": string;
    "--p-text": string;
    "--p-muted": string;
    "--p-danger": string;
    "--p-grain-url": string;     // svg/png data-uri
    "--p-radius": string;        // rigid vs rough vs soft
    "--p-shadow": string;
    "--p-font-display": string;
    "--p-font-body": string;
  };
  hudClass: string;            // tailwind preset combining tokens
  buttonClass: string;
  progressClass: string;
  narratorClass: string;       // tone-of-voice typography
}

// perspectiveVoices.ts
type VoiceEvent =
  | "decisionPrompt"
  | "optionLabel"
  | "consequence"
  | "stageEnter"
  | "stageTension"
  | "revolution"
  | "warning"
  | "objectiveHint";

// Default narrator persona per event when decision-specific voice missing
export const DEFAULT_VOICE: Record<PerspectiveId, Record<VoiceEvent, (ctx: VoiceCtx) => string>>;

// Override per decision: decision.voiceOverrides?[perspective]?[event]

// perspectiveObjectives.ts
export interface PerspectiveObjective {
  primary: string;                  // shown in HUD ("Giữ trật tự")
  successRule: (s: SimState) => number; // 0..1 score
  warning: (s: SimState) => string | null; // contextual HUD warning
  metricsWatched: MetricKey[];      // highlighted in HUD
}

// perspectiveEndingNarrations.ts
type EndingId = ReturnType<typeof classifyEnding>["id"];
export const ENDING_NARRATIONS: Record<EndingId, Record<PerspectiveId, {
  title: string; body: string; epitaph: string;
}>>;

// perspectiveInsightFilters.ts
export type InsightTag =
  | "labor" | "exploitation" | "solidarity" | "classStruggle"
  | "governance" | "order" | "stability" | "legitimacy"
  | "structural" | "causal" | "comparative";

export const INSIGHT_VISIBILITY: Record<PerspectiveId, {
  primary: InsightTag[];   // always visible
  hidden: InsightTag[];    // never visible (class blindness)
  // everything else: visible but with muted styling
}>;

// perspectiveOptionGates.ts
export const OPTION_GATES: Record<string /*optionId*/, {
  visibleTo: PerspectiveId[];          // hard gate
  emphasizeFor?: PerspectiveId[];      // soft highlight
  tooltipBy?: Partial<Record<PerspectiveId, string>>;
}>;
```

---

## 4. Theme tokens (sample)

```text
Ruler  : accent oklch(.78 .14 85) gold, bg oklch(.10 .02 60) ink-black,
         border 1px solid gold, radius 2px, font-display Cormorant,
         seal grain (svg crest watermark), narrator: decree small-caps.
Worker : accent oklch(.62 .19 30) rust, bg oklch(.14 .03 30) iron,
         border 2px dashed rust, radius 0, font-display Archivo Black,
         heavy noise grain, narrator: urgent uppercase + ragged.
Histor.: accent oklch(.55 .03 250) ink-blue, bg oklch(.94 .02 90) paper,
         border 1px solid ink, radius 6px, font-display Libre Baskerville,
         paper-grain svg, narrator: justified serif with margin notes.
```

Injected via `PerspectiveProvider` setting CSS vars on a wrapper `<div>` — every existing component that uses `bg-[var(--p-surface)]` etc. picks them up automatically. We migrate the HUD/decision card/option button to these vars in one pass.

---

## 5. Voice rendering system

```tsx
// PerspectiveVoiceRenderer.tsx
export function VoiceText({ decision, option, event, ctx }: Props) {
  const { perspective } = usePerspective();
  const override = decision?.voiceOverrides?.[perspective]?.[event];
  if (override) return <span className="voice">{render(override, ctx)}</span>;
  const fn = DEFAULT_VOICE[perspective][event];
  return <span className="voice">{fn({ decision, option, ...ctx })}</span>;
}
```

Every prompt/option/consequence/narrator string in `HistoricalSim.tsx` and `Narrator.tsx` is replaced by `<VoiceText … />`. Authors only have to write overrides for moments worth customizing — default voice always exists, so the same event automatically *feels* different per perspective even with zero overrides.

---

## 6. Perspective scoring

```ts
// simStore.ts addition
perspectiveScore: { ruler: number; worker: number; historian: number }
// Recomputed after every decision via PERSPECTIVE_OBJECTIVES[id].successRule(state)
```

Rules:
- **Ruler**: `0.5*stability + 0.3*(100-revolution) + 0.2*production − 0.4*revolutionsBurned*10`
- **Worker**: `0.4*revolutionsBurned*25 + 0.3*progressiveCount*15 + 0.3*contradiction − 0.3*stability`
- **Historian**: `insightsUnlocked/totalInsights * 70 + unlockedTech/totalTech * 30`

Final ending picks `endingId` from existing classifier **but** narration template is selected per perspective, and a perspective-specific epitaph line is appended using `perspectiveScore`.

---

## 7. HUD logic

`PerspectiveHUD`:
- emblem + label top-left, accent color from theme
- objective line ("Giữ trật tự — duy trì stability ≥ 60")
- watched metrics highlighted, others muted
- contextual warning từ `objective.warning(state)`:
  - Ruler: "⚠ Trật tự đang lung lay" khi stability < 40
  - Worker: "⚠ Bóc lột tăng cao" khi contradiction > 60 & stability > 60
  - Historian: "⚠ Mâu thuẫn kết cấu sâu" khi contradiction > 70

Decision option list: lọc qua `OPTION_GATES`; gated options chỉ render cho perspective phù hợp, emphasized options có ring accent.

---

## 8. Sample — Stage `slave`, decision "Đối phó nô lệ bỏ trốn"

```ts
// voice overrides
{
  voiceOverrides: {
    ruler: {
      decisionPrompt: "Sổ điền trang ghi: 47 nô lệ trốn quý này. Chiếu chỉ?",
      consequence:    "Lệnh đã ban. Trật tự được tái lập — tạm thời.",
    },
    worker: {
      decisionPrompt: "Anh em vừa trốn đêm qua bị bắt lại. Ta làm gì?",
      consequence:    "Roi vọt hôm nay. Ngày mai vẫn phải sống.",
    },
    historian: {
      decisionPrompt: "Khủng hoảng tái sản xuất sức lao động trong chế độ nô lệ.",
      consequence:    "Hệ thống lệ thuộc bạo lực để duy trì — chi phí tăng dần.",
    },
  },
}
// options
[
  { id:"crush", label:"Đàn áp công khai",
    gatedTo:["ruler"], effect:{stability:+8,contradiction:+10}},
  { id:"flee_network", label:"Tổ chức mạng lưới bỏ trốn",
    gatedTo:["worker"], effect:{revolution:+6,stability:-4}, tags:["solidarity"]},
  { id:"document", label:"Ghi chép tần suất bỏ trốn",
    gatedTo:["historian"], effect:{tech:+2}, insight:"reproductionCrisis"},
  { id:"reform_quota", label:"Giảm hạn ngạch lao dịch",
    // visible to all — neutral
    effect:{stability:+4,production:-3,contradiction:-4}},
]
```

---

## 9. Ending narration examples (ending = "RevolutionTriumphant" ở ải capitalist)

- **Ruler**: "Dinh thự ngươi cháy. Sổ sách bị đốt. Một trật tự ngươi gọi là *vĩnh cửu* sụp trong ba tuần. Lịch sử không hỏi ngươi có đồng ý."
- **Worker**: "Cờ bay trên nóc xưởng. Lần đầu trong đời, ngươi ký tên mình — không phải để xin việc, mà để biểu quyết. Cuộc đấu tranh chưa xong; nhưng đêm nay ngươi ngủ trong căn phòng của chính mình."
- **Historian**: "Lực lượng sản xuất xã hội hoá đã phá vỡ vỏ tư hữu cuối cùng. Ghi chú: thời gian từ khủng hoảng đến chuyển hoá ngắn hơn dự báo Marx 1867 khoảng 11 năm. Cần xét lại biến số tổ chức."

(File `perspectiveEndingNarrations.ts` chứa template cho mỗi ending × 3 perspective.)

---

## 10. Acceptance criteria

- [ ] Chọn perspective khác → màu, font, grain, border, button shape đổi ngay (CSS vars).
- [ ] Mọi decision prompt/option/consequence chạy qua `<VoiceText>`; có default voice cho 3 perspective ⇒ không còn câu chung.
- [ ] HUD hiển thị: emblem, objective, watched metrics, contextual warning đúng perspective.
- [ ] Ít nhất 1 option gated per perspective trong **mỗi** stage (5 ải × 3 = 15 option mới).
- [ ] Insight bị filter: Ruler không thấy `exploitation/solidarity`; Worker không thấy `legitimacy/governance`; Historian thấy tất cả + commentary.
- [ ] Ending screen render template từ `ENDING_NARRATIONS[endingId][perspective]` + epitaph dùng `perspectiveScore`.
- [ ] `perspectiveScore` được tính và hiển thị ở finale ("Bạn đã giữ trật tự 72/100").
- [ ] Replay timeline + cinematic + revolution trigger **không thay đổi behavior**.
- [ ] Build pass, không regression ở flow chính.

---

## 11. Thứ tự triển khai (1 PR, nhiều commit nội bộ)

1. Thêm `src/data/perspective/*` + types (compile-safe, chưa wire).
2. `PerspectiveProvider` + inject CSS vars; migrate HUD wrapper.
3. `VoiceText` + thay thế chỗ đọc voice trong `HistoricalSim` + `Narrator`.
4. `PerspectiveHUD` thay HUD cũ; thêm objective + warning.
5. Option gating + insight filter (data + UI).
6. Ending narration templates + epitaph + perspectiveScore.
7. Theme polish (grain svg, font import, button variants).
8. QA 3 lượt playthrough (1 perspective mỗi lượt).

Estimated diff: ~10 file mới + ~4 file sửa, không động `simStore` ngoài việc thêm field score.
