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
| `calm`      | 0–49                   | Trật tự còn vận hành; không decay và chưa roll event.           |
| `tension`   | 50–69                  | Decay nhẹ, `eventChance` 35%, risk factor bắt đầu tác động.     |
| `unstable`  | 70–84                  | Khoá option `reform`, decay sản xuất/ổn định rõ hơn.            |
| `emergency` | 85–94                  | Khoá `reform` và `concession`, event gần như chắc chắn.         |
| `rupture`   | 95–100                 | Chỉ còn `uprising`, `repression`, `emergency`, `document`; dễ vỡ trận. |

Mỗi tier có:
- `eventChance` — xác suất roll contradiction event mỗi decision.
- `optionRiskFactor` — làm giảm ngẫu nhiên các delta dương (`production`, `stability`, `tech`).
- `lockTags[]` — danh sách option tag bị khoá.
- `emergencyOnly` — ở tier `rupture`, chỉ cho phép hành động nổi dậy/đàn áp/khẩn cấp hoặc ghi chép lịch sử; store có fallback chống kẹt nếu một decision không còn option hợp lệ.

File: `src/data/contradiction/thresholds.ts`.

### 2.4 Option Tags

Mỗi `DecisionOption` được chuẩn hoá về một trong 7 tag:
`reform`, `concession`, `repression`, `uprising`, `reactionary`, `emergency`, `document`, `neutral`.
Base option được gắn qua `STANDARD_OPTION_TAGS`; perspective-only option tự khai báo `tag`.
Tag dùng cho:

- **Lock** theo tier.
- **Filter / thêm option** theo perspective qua `OPTION_GATES` và `EXTRA_OPTIONS`.
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
- **Historian** thấy rộng nhất, ưu tiên tri thức/insight và đọc memory như chú thích lịch sử.

### 3.2 Option filter

- Base option có thể được nhấn mạnh hoặc ẩn bằng `OPTION_GATES`.
- Hard-gate được giữ ở mức vừa phải: game vẫn cho so sánh cùng một biến cố lịch sử qua ba vị trí giai cấp, nhưng ẩn các hành động vô lý theo vai. Worker không thấy các action thuần mệnh lệnh như `crush`, `repress`, `layoff`, `automate-private`, `topdown`; Historian không chọn hành động gốc mà chuyển sang ghi chép/phân tích.
- Base option được viết lại theo vai bằng `OPTION_COPY_OVERRIDES`: effect/tag giữ nguyên để cùng một biến cố vẫn so sánh được, nhưng label/flavor/causeChain đổi theo vị trí giai cấp. Ví dụ `fund` ở Ruler là cấp ngân khố cho hải trình, ở Worker là bị huy động thuế cho hải trình, ở Historian là ghi nhận tích lũy nguyên thủy.
- Perspective-only option được thêm bằng `EXTRA_OPTIONS[decisionId][perspective]`; mỗi era hiện có ít nhất một option riêng cho từng vai.
- **Ruler** có thêm lựa chọn củng cố trật tự, đàn áp, điều tiết bộ máy hoặc bảo toàn hệ thống.
- **Worker** có thêm lựa chọn tổ chức, nổi dậy, tự quản hoặc dân chủ trực tiếp.
- **Historian** không dùng base option như hành động trực tiếp: `resolveOptions()` tự chuyển chúng thành `record:<decisionId>:<optionId>` với delta nhỏ về `tech/contradiction`, không unlock công nghệ vật chất và không tính là progressive action. Các option extra của Historian là ghi chép/phân tích để mở insight.

File: `src/data/perspective/perspectiveConfig.ts`, `PerspectiveProvider.tsx`, `PerspectiveHUD.tsx`.

---

## 4. Transition Engine — vì sao game không tuyến tính

Sau decision cuối của mỗi stage, `resolveTransition()` chọn 1 trong 6 outcome theo weighted-pick có ưu tiên:

| Outcome           | Điều kiện chính                                    | Hệ quả                                                                |
| ----------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| `evolve`          | `stability>35 && contradiction<75`                 | Sang stage kế tiếp như bình thường (qua cinematic chuyển ải).         |
| `rupture`         | `(contradiction≥80 && organization≥55) \|\| revolution≥70` | Cách mạng thắng → cinematic + `pushMemory("rupture_legacy")`. |
| `failed_uprising` | `contradiction≥80 && organization<45 && repression>40` | Khởi nghĩa bị đàn áp: ở lại stage, thêm ký ức thất bại.          |
| `freeze`          | `contradiction<55 && revolution<35 && production<45 && org<35` | Lặp lại stage, decay metric, `stagnation_decade` memory. Max 1 lần/stage. |
| `collapse`        | `stability<22 && production<28`                    | Chịu penalty nặng rồi nhảy sang stage kế tiếp với `collapse_scar`.    |
| `suppress`        | `ruler && repression>60 && stability>45`, hoặc `repression>75 && stability>35` | Stage tiếp theo bị ép biến thể authoritarian; khoá `reform` đến hết run. |

Chống loop: freeze 2 lần liên tiếp tự nâng cấp thành `evolve | rupture | collapse`.

File: `src/data/transition/{outcomes.ts, resolver.ts}`.

---

## 5. Memory System — quá khứ có trọng lượng

`simStore.memory: MemoryTag[]` (cap 20). Trọng số decay `0.7^stagesSince`.

Các tag tiêu biểu: `mass_repression`, `failed_revolt`, `successful_reform`, `famine`, `elite_purge`, `underground_network`, `collapse_scar`, `rupture_legacy`, `stagnation_decade`.

Memory được **đẩy ra** từ: decision tag (`memoryFromChoice`) và outcome cuối stage trong `simStore`.

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

Khi tier cho phép, `rollContradictionEvent()` chọn 1 event hợp lệ (có `minTier`, `condition`, `cooldown`). Event tác động trực tiếp lên metrics/pressures, hiển thị banner trong vài decision và có cooldown để không spam.

File: `src/data/contradiction/{events.ts, resolver.ts}`.

---

## 8. Cinematic & Audio

- `RevolutionCinematic` — chạy khi outcome ∈ {`rupture`}, và cả khi `evolve` để làm transition mượt (xem `simStore.advanceStage`).
- `StageAudio` — nhạc nền theo stage. `AmbientEngine` chỉ còn là module dự phòng, không mount runtime để tránh chồng noise/rumble lên background music.
- `StageAudio` — crossfade MP3 riêng cho mỗi stage (`src/assets/stageMedia.ts`).
- `Narrator` có text theo role qua `ROLE_NARRATOR_LINES`: 5 era × 3 role × 3 moment (`enter`, `tension`, `revolution`). HUD giữ theo thời lượng audio thật + tail ngắn; fallback 9s nếu browser chưa đọc được metadata.
- Audio role-specific đặt tại `src/assets/audio/narrator/era{1-5}-{role}-{moment}.mp3`; resolver cũng chấp nhận thư mục `role/` và fallback về audio chung dạng `era{1-5}-{moment}.mp3` nếu có. Danh sách 45 file và lời đọc nằm ở `docs/MINIGAME_VOICE_AUDIO.md`.
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
phase: "perspective" → "intro" → "playing" → "consequence"
      → ("playing" | "transition" | "revolution" | "finale")
```

Slice chính:

```ts
{
  perspective: PerspectiveId;
  phase: SimPhase;
  stageIdx: number;
  decisionIdx: number;
  stagesCompleted: number;
  metrics: Metrics;
  pressures: Pressures;
  contradictionTier: TierId;
  memory: MemoryTag[];
  stagePath: PathOutcome[];
  companionLine: CompanionLine | null;
  eventCooldowns: Record<string, number>;
  tagCounts: Record<OptionTag, number>;
  lockedOptionIds: string[];
  lockReasons: Record<string, string>;
  endingId: string | null;
}
```

Action chính: `decide(option)` → tính delta → `applyOptionRisk(tier)` → `pushMemory` nếu tag là `repression/uprising/...` → `ackConsequence()` để đi tiếp decision hoặc resolve transition.

File: `src/components/minigame/sim/simStore.ts`.

---

## 11. Quiz legacy

Route `/minigame` hiện chạy `HistoricalSim`, không dùng quiz. Bộ `src/data/minigame.ts` và `src/components/minigame/MiniGame.tsx` là trải nghiệm quiz legacy; `src/components/Quiz.tsx` đang nằm ở trang chủ. Nếu đưa quiz quay lại minigame chính, cần nối lại route/rules rõ ràng thay vì để song song với simulation.

---

## 12. Acceptance checklist

- [x] Stage advance không còn đảm bảo; ≥4 outcome non-evolve có thể đạt.
- [x] Tier `tension+` có thể roll contradiction event; event tác động metrics/pressures và có cooldown.
- [x] Mỗi era có option riêng cho Ruler/Worker/Historian; base option vẫn được nhấn mạnh bằng `OPTION_GATES` và được viết lại theo vai bằng `OPTION_COPY_OVERRIDES`.
- [x] Historian không pick action gốc trực tiếp; base option được chuyển thành `record:<decisionId>:<optionId>`.
- [x] Memory tag persist qua stage, decay, xuất hiện trong narrator + replay + ending.
- [x] Companion line bắn ở stage_start, high_pressure, key outcomes (≥6 line/perspective).
- [x] ≥6 ending template, mỗi template có narration cho cả 3 perspective + reflective question.
- [x] Không option nào "đúng tuyệt đối" — mọi option đều có trade-off âm.
- [x] Static check `scripts/check-minigame-options.ts` đảm bảo mỗi `era × decision × role` có ≥2 option bình thường và không kẹt ở `rupture`.
- [x] Reduced-motion + design tokens được tôn trọng.

---

## 13. Bản đồ file

```text
src/data/
  historicalSim.ts                # metrics, decisions, eras
  eras.ts                         # 5 hình thái
  minigame.ts                     # legacy quiz data, không chạy ở /minigame hiện tại
  perspective/perspectiveConfig.ts
  contradiction/{pressures,thresholds,events,resolver,index}.ts
  transition/{outcomes,resolver}.ts
  memory/index.ts
  companion/lines.ts
  endings/templates.ts

src/components/minigame/sim/
  HistoricalSim.tsx               # entry point + layout
  simStore.ts                     # reducer/state machine
  perspective/{PerspectiveProvider,PerspectiveHUD}.tsx
  pressure/{PressureGauges,ContradictionTierBadge,EmergencyBanner}.tsx
  cinematic/{Narrator,RevolutionCinematic,
             ReplayTimeline,StressOverlay,SettingsToggle,cinematicConfig}.tsx
  companion/CompanionVoice.tsx
  ending/EndingScreen.tsx

src/assets/stageMedia.ts          # ERA_BG, STAGE_BG, STAGE_AUDIO
docs/MINIGAME_VOICE_AUDIO.md      # manifest 45 narrator audio theo role
src/assets/audio/narrator/        # nơi đặt file era{1-5}-{role}-{moment}.mp3
scripts/check-minigame-options.ts # static check option theo role/tier
```

---

**Tóm tắt triết lý thiết kế:** không có "win" tuyệt đối. Mỗi run là một thí nghiệm tư tưởng — cùng một xã hội, dưới ba lăng kính, với những quyết định mang trọng lượng lịch sử.
