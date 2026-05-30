# Mini Game "Hành trình Tiến hoá" — Tài liệu cơ chế

> Mô phỏng tương tác về **Duy vật lịch sử**: người chơi điều khiển một xã hội đi qua 5 hình thái kinh tế – xã hội, từ Cộng sản nguyên thuỷ → Chiếm hữu nô lệ → Phong kiến → Tư bản → Xã hội chủ nghĩa. Người chơi **không trả lời quiz** — họ ra **quyết định** dưới áp lực mâu thuẫn.

---

## 1. Tổng quan

Mini game được thiết kế quanh 3 trụ cột lý luận:

1. **Lực lượng sản xuất vs Quan hệ sản xuất** — mọi quyết định đẩy hai vector này lệch nhau, sinh ra mâu thuẫn.
2. **Mâu thuẫn tích tụ → Cách mạng** — khi `contradiction` vượt ngưỡng và tổ chức đủ mạnh, xã hội bước vào điểm rạn nứt.
3. **Lăng kính lịch sử (Perspective)** — cùng một sự kiện được kể lại khác nhau tuỳ vị trí giai cấp người chơi đứng.

Vòng lặp chính:

```text
Stage start → Decision N (option pick) → Apply deltas →
  Pressures + Tier update → (maybe) Event roll →
  Companion line → Next decision …
  Last decision → resolveTransition() → {evolve | rupture | freeze | collapse | suppress | failed_uprising}
                                      → Cinematic (nếu cần) → Stage tiếp theo
End of Era 5 → resolveEnding() → EndingScreen + Replay timeline
```

---

## 2. Cấu trúc dữ liệu

### 2.1 Metrics (5 chỉ số gốc, 0–100)

| Key             | Ý nghĩa lý luận                                       |
| --------------- | ----------------------------------------------------- |
| `production`    | Lực lượng sản xuất — năng suất, công cụ, kỹ thuật.    |
| `stability`     | Mức xã hội tự nguyện chấp nhận trật tự hiện hành.     |
| `tech`          | Tri thức kỹ thuật tích luỹ — mở cây công nghệ.        |
| `contradiction` | Khoảng cách giữa LLSX và QHSX.                        |
| `revolution`    | Áp lực cách mạng đã tích luỹ.                         |

File: `src/data/historicalSim.ts`.

### 2.2 Pressures (6 áp lực phái sinh, 0–100)

Tính từ metrics + lịch sử tag bằng hàm thuần `derivePressures()`:

| Pressure                | Công thức rút gọn                                                   |
| ----------------------- | ------------------------------------------------------------------- |
| `classTension`          | `0.6·contradiction + 0.3·(100-stability) + 0.1·revolution`          |
| `repression`            | `18·#repression - 10·#concession`                                   |
| `legitimacyLoss`        | `100 - stability + 0.2·contradiction - 4·progressiveCount`          |
| `organization`          | `14·#uprising + 0.4·revolution + (worker?+12) - 0.25·repression`    |
| `productionInstability` | `0.4·contradiction + 0.35·(100-production)`                         |
| `ruptureRisk`           | `0.4·contradiction + 0.25·classTension + 0.15·legitimacyLoss + 0.2·organization - 0.15·repression` |

File: `src/data/contradiction/pressures.ts`.

### 2.3 Contradiction Tier

Tier xác định độ "căng" của thanh mâu thuẫn và mở khoá cơ chế đặc biệt:

| Tier        | Ngưỡng (contradiction) | Hệ quả                                                          |
| ----------- | ---------------------- | --------------------------------------------------------------- |
| `STABLE`    | 0–34                   | Không có gì đặc biệt.                                           |
| `UNSTABLE`  | 35–59                  | Narrator bắt đầu cảnh báo; option `reform` được nhấn mạnh.      |
| `EMERGENCY` | 60–84                  | Khoá một số option `passive/luxury`; tăng `eventChance`.        |
| `RUPTURE`   | 85–100                 | Có thể trigger cách mạng; khoá `decree`/`reform` cho Worker.    |

Mỗi tier có:
- `eventChance` — xác suất roll contradiction event mỗi decision.
- `optionRiskFactor` — làm giảm ngẫu nhiên các delta dương (`production`, `stability`, `tech`).
- `lockTags[]` — danh sách option tag bị khoá.

File: `src/data/contradiction/thresholds.ts`.

### 2.4 Option Tags

Mỗi `DecisionOption` được gắn tag (`repression`, `concession`, `uprising`, `reform`, `decree`, `strike`, `organize`, `sabotage`, `solidarity`, `analyze`, `document`, …). Tag dùng cho:

- **Lock** theo tier.
- **Filter** theo perspective (lens.optionTags).
- **Đếm** trong `tagCounts` để feed lại pressures.

---

## 3. Perspective System — 3 lăng kính

Người chơi chọn 1 trong 3 vai trước khi bắt đầu. Đây không phải skin — nó định lại UI, hội thoại, và lựa chọn.

| Perspective | Vai           | Mục tiêu lịch sử                                | Companion       |
| ----------- | ------------- | ----------------------------------------------- | --------------- |
| `ruler`     | Người cai trị | Giữ chính danh, duy trì sản xuất, ngăn rạn nứt. | Cận thần / Cố vấn |
| `worker`    | Người lao động| Tổ chức giai cấp, tăng `organization`, lật trật tự bất công. | Đồng đội |
| `historian` | Sử gia        | Ghi chép, phân tích, không can thiệp trực tiếp. | Trợ lý lưu trữ  |

### 3.1 Lens — visibility

Mỗi perspective định một `lens` với 3 trạng thái (`visible | muted | hidden`) cho từng gauge & metric:

- **Ruler** thấy rõ `stability`, `legitimacyLoss`, `production`; ẩn `organization`; mờ `classTension`.
- **Worker** thấy rõ `classTension`, `organization`, `productionInstability`, `repression` (cảm trực tiếp); ẩn macro `tech`; mờ `legitimacyLoss`.
- **Historian** thấy tất cả nhưng **trễ một bước** (past-tense), kèm memory tag được mở rộng thành chú thích.

### 3.2 Option filter

- **Ruler** độc quyền `repression`, `decree`; bị ẩn `sabotage`, `underground`.
- **Worker** độc quyền `strike`, `organize`, `sabotage`, `solidarity`; bị ẩn `decree`.
- **Historian** không pick được option `direct_action`; thay vào đó nhận biến thể `record:<id>` — không thay đổi metric nhưng mở khoá insight & memory tag.

File: `src/data/perspective/perspectiveConfig.ts`, `PerspectiveProvider.tsx`, `PerspectiveHUD.tsx`.

---

## 4. Transition Engine — vì sao game không tuyến tính

Sau decision cuối của mỗi stage, `resolveTransition()` chọn 1 trong 6 outcome theo weighted-pick có ưu tiên:

| Outcome           | Điều kiện chính                                    | Hệ quả                                                                |
| ----------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| `evolve`          | `stability>40 && contradiction<70`                 | Sang stage kế tiếp như bình thường (qua cinematic chuyển ải).         |
| `rupture`         | `contradiction≥85 && organization≥60`              | Cách mạng thắng → cinematic + `pushMemory("rupture_legacy")`.         |
| `failed_uprising` | `contradiction≥85 && organization<40`              | Khởi nghĩa bị đàn áp: ở lại stage, +30 repression, halve organization.|
| `freeze`          | `contradiction<50 && production<40 && org<30`      | Lặp lại stage, decay metric, `stagnation_decade` memory. Max 1 lần/stage. |
| `collapse`        | `stability<20 && production<25`                    | Nhảy vào `dark_age` mini-stage → evolve với `collapse_scar`.          |
| `suppress`        | `perspective==="ruler" && repression>60`           | Stage tiếp theo bị ép biến thể authoritarian; khoá `reform` đến hết run. |

Chống loop: freeze 2 lần liên tiếp tự nâng cấp thành `evolve | rupture | collapse`.

File: `src/data/transition/{outcomes.ts, resolver.ts}`.

---

## 5. Memory System — quá khứ có trọng lượng

`simStore.memory: MemoryTag[]` (cap 20). Trọng số decay `0.7^stagesSince`.

Các tag tiêu biểu: `mass_repression`, `failed_revolt`, `successful_reform`, `famine`, `elite_purge`, `underground_network`, `collapse_scar`, `rupture_legacy`, `stagnation_decade`.

Memory được **đẩy ra** từ: `applyOutcome`, contradiction events, transition resolver.

Memory được **đọc bởi**:

- Stage intro composer — chèn câu *"Sau nạn đói thập kỷ trước…"*.
- Narrator — echo lại ở tier ≥ UNSTABLE.
- `ReplayTimeline` — render icon mỗi tag.
- Ending resolver — template `match()` theo memory.

File: `src/data/memory/index.ts`.

---

## 6. Companion Voice — tiếng nói con người

Mỗi perspective có **một nhân vật xuất hiện theo trigger** (`stage_start`, `high_pressure`, `event:<id>`, `outcome:<id>`). Lines viết riêng cho từng ải × perspective (xem `src/data/companion/lines.ts`).

- **Ruler** speaker tiến hoá theo ải: Bô lão → Quan tế tự → Cận thần triều đình → Cố vấn nội các → Bí thư.
- **Worker** speaker: Bạn săn → Đồng cảnh nô lệ → Dân làng → Đồng nghiệp → Đồng chí.
- **Historian** speaker: Trợ lý lưu trữ (xuyên suốt).

Cơ chế chống spam: hàng đợi, dedupe theo `line.id`, không lặp lại 2 decision liên tiếp.

File: `CompanionVoice.tsx`.

---

## 7. Contradiction Events

Khi tier cho phép, `rollContradictionEvent()` chọn 1 event hợp lệ (có `minTier`, `condition`, `cooldown`). Event sửa luôn option set của decision tiếp theo (vd. `military_unrest` mở `Mutiny`).

File: `src/data/contradiction/{events.ts, resolver.ts}`.

---

## 8. Cinematic & Audio

- `RevolutionCinematic` — chạy khi outcome ∈ {`rupture`}, và cả khi `evolve` để làm transition mượt (xem `simStore.advanceStage`).
- `AmbientEngine` — pad nhạc nền theo tier.
- `StageAudio` — crossfade MP3 riêng cho mỗi stage (`src/assets/stageMedia.ts`).
- `WorldBackdrop` — ảnh nền stage với `AnimatePresence`.
- `StressOverlay`, `Narrator`, `ReplayTimeline`, `ContradictionTierBadge`, `EmergencyBanner` — UI phụ trợ.

Reduced-motion: tất cả animation đều có fallback fade-only.

---

## 9. Ending v2

`resolveEnding(finalState)` quét `templates[]` theo thứ tự, chọn template đầu tiên `match()`. Mỗi template:

```ts
{
  id: "worker_revolution_won",
  match: (s) => s.path === "rupture" && s.perspective === "worker",
  perspectiveNarration: { ruler: "...", worker: "...", historian: "..." },
  tone: "defiant",
  reflectiveQuestion: "Nếu tổ chức yếu hơn 10%, liệu cuộc khởi nghĩa có thành công?"
}
```

Có ≥ 6 template (vd. `ruler_authoritarian_continuity`, `worker_failed_uprising_legacy`, `historian_collapse_documented`, `shared_stagnation`, `shared_rupture_unfinished`).

`EndingScreen` render narration + tone-driven background + reflective question + replay timeline.

File: `src/data/endings/templates.ts`, `EndingScreen.tsx`.

---

## 10. State machine (simStore)

```text
phase: "intro" → "stage" → ("event" → "stage")*  → "revolution" → "stage" …
                                                  → "finale" → "ending"
```

Slice chính:

```ts
{
  perspective: PerspectiveId;
  eraId: EraId;
  decisionIdx: number;
  stagesCompleted: number;
  metrics: Metrics;
  pressures: Pressures;
  tier: Tier;
  memory: MemoryTag[];
  stagePath: PathOutcome | null;
  companionQueue: CompanionLine[];
  eventCooldowns: Record<string, number>;
  tagCounts: Record<OptionTag, number>;
  endingType: string | null;
}
```

Action chính: `applyOption(optionId)` → tính delta → `applyOptionRisk(tier)` → `pushMemory` nếu tag là `repression/uprising/...` → `advanceDecision()` hoặc `advanceStage()`.

File: `src/components/minigame/sim/simStore.ts`.

---

## 11. Quiz trong minigame

Quiz nằm trong các stage chuyển tiếp lý luận (xem `src/components/Quiz.tsx` & `src/data/minigame.ts`), 13 câu đã được rà theo SGK Mác – Lênin:

- Tiến hoá công cụ: đá ghè → đá mài → đồng → sắt → máy.
- Hình thái địa tô: lao dịch → hiện vật → tiền tệ.
- Giá trị thặng dư: `m = v'·v` (tỷ suất bóc lột).
- Quan hệ sản xuất: 3 mặt — sở hữu TLSX, tổ chức quản lý, phân phối sản phẩm.

Sai số ở `correctMap` đã được sửa; mọi câu có nguồn chú giải hiển thị sau khi trả lời.

---

## 12. Acceptance checklist

- [x] Stage advance không còn đảm bảo; ≥4 outcome non-evolve có thể đạt.
- [x] Tier ≥ EMERGENCY có thể trigger event biến đổi option set.
- [x] Mỗi perspective ẩn ≥1 gauge và ≥1 option tag; nhấn mạnh ≥1 exclusive tag.
- [x] Historian không pick được `direct_action`; chỉ có `record` variant.
- [x] Memory tag persist qua stage, decay, xuất hiện trong narrator + replay + ending.
- [x] Companion line bắn ở stage_start, high_pressure, key outcomes (≥6 line/perspective).
- [x] ≥6 ending template, mỗi template có narration cho cả 3 perspective + reflective question.
- [x] Không option nào "đúng tuyệt đối" — mọi option đều có trade-off âm.
- [x] Reduced-motion + design tokens được tôn trọng.

---

## 13. Bản đồ file

```text
src/data/
  historicalSim.ts                # metrics, decisions, eras
  eras.ts                         # 5 hình thái
  minigame.ts                     # quiz data
  perspective/perspectiveConfig.ts
  contradiction/{pressures,thresholds,events,resolver,index}.ts
  transition/{outcomes,resolver}.ts
  memory/index.ts
  companion/lines.ts
  endings/templates.ts

src/components/minigame/sim/
  HistoricalSim.tsx               # entry point + layout
  simStore.ts                     # zustand state machine
  perspective/{PerspectiveProvider,PerspectiveHUD}.tsx
  pressure/{PressureGauges,ContradictionTierBadge,EmergencyBanner}.tsx
  cinematic/{AmbientEngine,Narrator,RevolutionCinematic,
             ReplayTimeline,StressOverlay,SettingsToggle,cinematicConfig}.tsx
  companion/CompanionVoice.tsx
  ending/EndingScreen.tsx

src/assets/stageMedia.ts          # ERA_BG, STAGE_BG, STAGE_AUDIO
```

---

**Tóm tắt triết lý thiết kế:** không có "win" tuyệt đối. Mỗi run là một thí nghiệm tư tưởng — cùng một xã hội, dưới ba lăng kính, với những quyết định mang trọng lượng lịch sử.
