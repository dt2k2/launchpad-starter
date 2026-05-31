# Bản đồ Lịch sử các Hình thái Kinh tế – Xã hội

> **Tài liệu thuyết trình project** — tổng quan, mục đích, kiến trúc trải nghiệm, và đặc tả chi tiết cơ chế minigame "Hành trình Tiến hoá".

---

## 1. Giới thiệu chung

**Tên project:** *Bản đồ Lịch sử các Hình thái Kinh tế – Xã hội*
**Chủ đề học thuật:** Chủ nghĩa duy vật lịch sử (Mác – Lênin) — 5 hình thái kinh tế xã hội.
**Hình thức:** Web tương tác (TanStack Start + React + Tailwind), gồm **2 module chính**:

1. **Trang chủ (Index)** — một bài giảng cuộn dọc, điện ảnh, kể lại 5 hình thái:
   *Cộng sản nguyên thuỷ → Chiếm hữu nô lệ → Phong kiến → Tư bản chủ nghĩa → Xã hội chủ nghĩa.*
2. **Mini game "Hành trình Tiến hoá"** — mô phỏng tương tác, người chơi không trả lời quiz mà **ra quyết định dưới áp lực mâu thuẫn**, dẫn dắt một xã hội đi qua 5 ải.

### 1.1 Mục đích

- **Học thuật:** trực quan hoá quy luật vận động của lịch sử theo lý luận Mác – Lênin: *lực lượng sản xuất – quan hệ sản xuất – mâu thuẫn – cách mạng*.
- **Sư phạm:** chuyển khái niệm trừu tượng thành cảm giác trực tiếp (chỉ số, áp lực, hậu quả) để sinh viên *cảm* được lịch sử thay vì *học thuộc*.
- **Trải nghiệm:** mỗi lần chơi là một "thí nghiệm tư tưởng" — không có đáp án đúng tuyệt đối, chỉ có những trade-off mang trọng lượng lịch sử.

### 1.2 Thông điệp project muốn truyền tải

1. **Lịch sử không tuyến tính.** Tiến bộ không tự đến; nó là kết quả của mâu thuẫn được giải quyết.
2. **Mỗi hình thái có hạt giống của hình thái kế tiếp.** Khi LLSX phát triển vượt QHSX, đứt gãy xảy ra.
3. **Không có "win" tuyệt đối.** Mọi quyết định đều có cái giá: ổn định đổi bằng tự do, cách mạng đổi bằng máu, đàn áp đổi bằng chính danh.
4. **Vị trí giai cấp định hình nhận thức.** Cùng một sự kiện, người cai trị, người lao động và sử gia kể lại khác nhau.

### 1.3 Benefits / Giá trị mang lại

| Đối tượng        | Lợi ích                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Sinh viên        | Học lý luận chính trị qua trải nghiệm, không phải đọc chay.                              |
| Giảng viên       | Công cụ trình chiếu tương tác trên lớp; mỗi click sinh ra một case study để bình luận.    |
| Người tự học     | Có thể replay nhiều lần với 3 góc nhìn khác nhau — mỗi run là một bài đọc lại lịch sử.   |
| Cộng đồng làm edu-game | Mẫu kiến trúc mở: state machine + perspective lens + transition engine có thể tái dùng. |

---

## 2. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│  Trang chủ /                                                │
│  ├─ Hero (cinematic intro)                                  │
│  ├─ StickyLegend (chỉ báo era đang xem)                     │
│  ├─ 5 × EraChapter (cuộn dọc + background ảnh từng era)     │
│  ├─ TechTree (cây công nghệ xuyên 5 hình thái)              │
│  ├─ CompareMode (so sánh 2 hình thái cạnh nhau)             │
│  ├─ Glossary (thuật ngữ Mác – Lênin)                        │
│  └─ Quiz (13 câu rà theo SGK)                               │
│                                                             │
│  Mini game /minigame                                        │
│  └─ HistoricalSim                                           │
│     ├─ PerspectiveProvider (3 lăng kính)                    │
│     ├─ WorldBackdrop + StageAudio + AmbientEngine           │
│     ├─ PerspectiveHUD + PressureGauges + TierBadge          │
│     ├─ Decision panel (option set lọc theo perspective+tier)│
│     ├─ Narrator + CompanionVoice                            │
│     ├─ RevolutionCinematic (chuyển ải)                      │
│     └─ EndingScreen + ReplayTimeline                        │
└─────────────────────────────────────────────────────────────┘
```

**Tech stack:** TanStack Start v1 (SSR + file-based routing), React 19, Tailwind v4, Zustand (state machine), Motion (animation), tokens màu trong `src/styles.css`.

---

## 3. Trang chủ — "Bản đồ Lịch sử"

### 3.1 Cấu trúc tự sự

Mỗi `EraChapter` là một "chương" full-screen với:

- **Background ảnh riêng** (`STAGE_BG` trong `src/assets/stageMedia.ts`).
- **Tagline** (1 câu chốt khái niệm: *"Của chung. Săn chung. Đói chung."*).
- **3 cột nội dung:** Lực lượng sản xuất / Quan hệ sản xuất / Mâu thuẫn.
- **Contradiction meter** — thanh trực quan mức mâu thuẫn ở đỉnh điểm.
- **Transition narrative** — cách hình thái này chết đi để sinh ra hình thái sau.

### 3.2 Các phụ kiện học tập

- **TechTree** — trục thời gian công nghệ: đá ghè → đá mài → đồng → sắt → cày → cối xay nước → máy hơi nước → điện → năng lượng tái tạo.
- **CompareMode** — đặt 2 hình thái cạnh nhau theo 3 mặt của QHSX (sở hữu TLSX, tổ chức quản lý, phân phối).
- **Glossary** — định nghĩa: giá trị thặng dư, địa tô, tích luỹ nguyên thuỷ, chính danh, mâu thuẫn cơ bản…
- **Quiz** — 13 câu trắc nghiệm, mỗi câu có giải thích nguồn sau khi trả lời.

### 3.3 Mục tiêu sư phạm

Người đọc *cảm* được sự dịch chuyển 5 hình thái như một dòng chảy điện ảnh, **trước khi** vào minigame để *thử nghiệm* nó.

---

## 4. Mini game — "Hành trình Tiến hoá"

> Mô phỏng: bạn lèo lái một xã hội qua 5 ải. Mỗi ải có nhiều decision. Mỗi decision đẩy 5 chỉ số gốc, sinh ra 6 áp lực phái sinh, có thể trigger sự kiện, và cuối ải sẽ rẽ vào 1 trong 6 kết cục.

### 4.1 Triết lý thiết kế

- **Không quiz, mà là quyết định.** Không có "đáp án đúng".
- **Mọi option đều có trade-off âm.** Tăng sản xuất → tăng mâu thuẫn; đàn áp → mất chính danh; cải cách → có thể mất ổn định ngắn hạn.
- **Lịch sử có trọng lượng.** Quyết định cũ để lại *memory tag* ảnh hưởng narrator, ending, và option set tương lai.
- **3 lăng kính, 3 bài đọc.** Cùng một xã hội, dưới góc Ruler / Worker / Historian sẽ trông khác hẳn.

### 4.2 Vòng lặp chính (game loop)

```
Chọn perspective → Stage start → [Decision → Apply deltas → Pressure + Tier update
                                  → (maybe) Event → Companion line → Next decision] × N
                              → resolveTransition() → 1 trong 6 outcome
                              → (Cinematic nếu cần) → Stage tiếp theo
Hết Era 5                    → resolveEnding() → EndingScreen + Replay timeline
```

### 4.3 Hệ thống điểm — 5 chỉ số gốc (Metrics)

Mỗi chỉ số 0–100. Đây là "máu" của xã hội.

| Chỉ số            | Ý nghĩa lý luận                                              | Cách tăng                                      | Cách giảm                                |
| ----------------- | ------------------------------------------------------------ | ---------------------------------------------- | ---------------------------------------- |
| **production**    | Lực lượng sản xuất — năng suất, công cụ, kỹ thuật.            | Đầu tư công cụ, mở rộng canh tác, công nghiệp hoá. | Chiến tranh, đàn áp lao động, sụp đổ. |
| **stability**     | Mức xã hội tự nguyện chấp nhận trật tự hiện hành.             | Nhân nhượng, cải cách, lễ nghi, phúc lợi.       | Mâu thuẫn cao, đàn áp lộ liễu, đói kém. |
| **tech**          | Tri thức kỹ thuật tích luỹ — mở khoá cây công nghệ.            | Đầu tư nghiên cứu, ghi chép, giao thương.       | Sụp đổ, đốt sách, đóng cửa.            |
| **contradiction** | Khoảng cách giữa LLSX và QHSX (mâu thuẫn cơ bản).             | Bóc lột mạnh, công nghệ vượt khung, bất bình đẳng. | Cải cách, phân phối lại, nhân nhượng. |
| **revolution**    | Áp lực cách mạng đã tích luỹ — "nhiệt" của giai cấp bị trị.   | Tổ chức, khởi nghĩa, đàn áp gây phản ứng.       | Đàn áp thành công, thoả hiệp, mệt mỏi. |

### 4.4 6 áp lực phái sinh (Pressures)

Tính tự động từ metrics + lịch sử tag bằng hàm thuần `derivePressures()`.

| Pressure                  | Ý nghĩa                                              | Công thức rút gọn                                                          |
| ------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| **classTension**          | Căng thẳng giai cấp đang nhìn thấy được.              | `0.6·contradiction + 0.3·(100-stability) + 0.1·revolution`                  |
| **repression**            | Mức độ bộ máy đàn áp đã triển khai.                   | `18·#repression − 10·#concession`                                          |
| **legitimacyLoss**        | Mức độ chính danh đã mất.                             | `100 − stability + 0.2·contradiction − 4·progressiveCount`                  |
| **organization**          | Mức tổ chức của giai cấp bị trị.                      | `14·#uprising + 0.4·revolution + (worker?+12) − 0.25·repression`            |
| **productionInstability** | Sản xuất chập chờn, dễ đứt gãy.                       | `0.4·contradiction + 0.35·(100−production)`                                |
| **ruptureRisk**           | Khả năng đứt gãy thực sự xảy ra ở cuối ải.            | `0.4·c + 0.25·classTension + 0.15·legitimacyLoss + 0.2·org − 0.15·rep`    |

> **Lưu ý sư phạm:** `ruptureRisk` cao **không** = cách mạng thành công. Còn cần **organization** đủ mạnh — đúng theo Lenin: *"không có lý luận cách mạng thì không có phong trào cách mạng"*.

### 4.5 Contradiction Tier (4 mức)

| Tier        | Ngưỡng (contradiction) | Hệ quả                                                          |
| ----------- | ---------------------- | --------------------------------------------------------------- |
| `STABLE`    | 0–34                   | Không có gì đặc biệt. Option đa dạng.                            |
| `UNSTABLE`  | 35–59                  | Narrator cảnh báo. Option `reform` được nhấn mạnh.               |
| `EMERGENCY` | 60–84                  | Khoá option `passive/luxury`. Tăng `eventChance` event đặc biệt. |
| `RUPTURE`   | 85–100                 | Có thể trigger cách mạng. Worker mất `decree/reform`, Ruler mất `concession`. |

Mỗi tier có `optionRiskFactor` — làm **giảm ngẫu nhiên các delta dương** (sản xuất, ổn định, tech) khi xã hội đang căng. Càng mâu thuẫn càng khó có kết quả tốt.

### 4.6 Cơ chế "cộng điểm" / áp dụng option

Khi chọn 1 option:

1. **applyOption(optionId)** — đọc `option.deltas` (vd. `{production:+8, contradiction:+5, stability:-3}`).
2. **applyOptionRisk(tier)** — nếu tier ≥ UNSTABLE, các delta dương bị **hao hụt** theo `optionRiskFactor` (mô phỏng xã hội căng thì làm gì cũng kém hiệu quả).
3. **pushMemory(tag)** — nếu option có tag thuộc {`repression, uprising, reform, sabotage, ...`}, lưu vào memory với decay `0.7^stagesSince`.
4. **derivePressures()** — tính lại 6 áp lực.
5. **rollContradictionEvent()** — roll 1 event nếu tier cho phép. Event có thể *sửa option set của decision tiếp theo* (vd. `military_unrest` mở option *Mutiny*).
6. **advanceDecision()** hoặc nếu hết decision → **advanceStage()**.

### 4.7 6 kết cục chuyển ải (Transition Outcomes)

Cuối mỗi ải, `resolveTransition()` chọn 1 trong 6 outcome theo weighted-pick:

| Outcome           | Điều kiện chính                                    | Hệ quả                                                                |
| ----------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| **evolve**        | `stability>40 && contradiction<70`                 | Sang ải kế tiếp êm dịu (qua cinematic chuyển ải).                      |
| **rupture**       | `contradiction≥85 && organization≥60`              | **Cách mạng thành công** → cinematic + memory `rupture_legacy`.       |
| **failed_uprising** | `contradiction≥85 && organization<40`           | **Khởi nghĩa thất bại**: ở lại ải, +30 repression, halve organization. |
| **freeze**        | `contradiction<50 && production<40 && org<30`      | **Đóng băng**: lặp ải, decay metric, memory `stagnation_decade`. Max 1 lần/ải. |
| **collapse**      | `stability<20 && production<25`                    | **Sụp đổ**: nhảy vào `dark_age` mini-stage → sau đó evolve với `collapse_scar`. |
| **suppress**      | `perspective=ruler && repression>60`               | **Đàn áp toàn diện**: ải tiếp theo bị ép biến thể authoritarian; khoá `reform` đến hết run. |

**Chống loop:** freeze 2 lần liên tiếp tự nâng cấp thành `evolve | rupture | collapse`.

### 4.8 Cơ chế sụp đổ (collapse) — chi tiết

Khi `stability<20 && production<25`:

1. Outcome = `collapse`. Memory `collapse_scar` được push.
2. Game **không** sang ải kế ngay — vào `dark_age` mini-stage (1 decision đặc biệt: gom dân, tái lập trật tự, hoặc đầu hàng).
3. Metrics bị decay mạnh (`production -25, stability -15, tech -10`).
4. **Baseline tech** của ải mới vẫn được cấp (để xã hội không "kẹt" vì thiếu công cụ cơ bản — xem `BASELINE_TECH_BY_STAGE` trong `simStore.ts`).
5. Sau dark_age, game evolve sang ải kế tiếp với di chứng — Narrator gọi lại memory `collapse_scar` ở các stage sau.

### 4.9 Cơ chế cách mạng (rupture) — chi tiết

1. Điều kiện: `contradiction≥85 && organization≥60` (hoặc `revolution≥70`).
2. `RevolutionCinematic` chạy: overlay đỏ, particle, narrator đọc "Đứt gãy", audio `era{N}-revolution.mp3`.
3. Memory `rupture_legacy` push → ảnh hưởng companion line + ending template.
4. Ải tiếp theo bắt đầu với `stability` reset thấp, `organization` được giữ → xã hội mới phải xây lại trật tự.

### 4.10 3 lăng kính (Perspective System)

Người chơi chọn 1 trong 3 vai **trước khi bắt đầu**. Đây không phải skin — nó định lại UI, hội thoại, và option set.

| Perspective | Vai           | Mục tiêu                                          | Companion       | Theme        |
| ----------- | ------------- | ------------------------------------------------- | --------------- | ------------ |
| `ruler`     | Người cai trị | Giữ chính danh, duy trì sản xuất, ngăn rạn nứt.    | Cận thần triều đình | tối, đỏ trầm |
| `worker`    | Người lao động| Tổ chức giai cấp, tăng organization, lật trật tự bất công. | Đồng đội     | đỏ rực, đen  |
| `historian` | Sử gia        | Ghi chép, phân tích, không can thiệp trực tiếp.    | Trợ lý lưu trữ  | sáng, giấy cũ |

**Lens — visibility theo perspective:**

- **Ruler** thấy rõ `stability, legitimacyLoss, production`; **ẩn** `organization`; mờ `classTension`.
- **Worker** thấy rõ `classTension, organization, productionInstability, repression`; **ẩn** macro `tech`; mờ `legitimacyLoss`.
- **Historian** thấy tất cả nhưng **trễ một bước** (past-tense), kèm chú thích memory.

**Option filter:**

- **Ruler** độc quyền `repression, decree`; bị ẩn `sabotage, underground`.
- **Worker** độc quyền `strike, organize, sabotage, solidarity`; bị ẩn `decree`.
- **Historian** không pick được option `direct_action`; thay vào đó nhận biến thể `record:<id>` — không đổi metric nhưng mở memory tag.

### 4.11 Memory System — quá khứ có trọng lượng

`simStore.memory` lưu tối đa 20 tag, mỗi tag có trọng số decay `0.7^stagesSince`.

Tag tiêu biểu: `mass_repression, failed_revolt, successful_reform, famine, elite_purge, underground_network, collapse_scar, rupture_legacy, stagnation_decade`.

**Được đọc bởi:**
- Stage intro composer — chèn câu *"Sau nạn đói thập kỷ trước…"*.
- Narrator — echo lại ở tier ≥ UNSTABLE.
- ReplayTimeline — render icon mỗi tag.
- Ending resolver — `match()` chọn template theo memory.

### 4.12 Contradiction Events

Khi tier cho phép, `rollContradictionEvent()` chọn 1 event hợp lệ (`minTier`, `condition`, `cooldown`). Event **sửa luôn option set** của decision tiếp theo:

- `military_unrest` → mở *Mutiny*.
- `famine` → mở *Mở kho cứu đói* / *Cấm xuất khẩu*.
- `wildcat_strike` → mở *Đàm phán* / *Đàn áp ngay*.

### 4.13 Companion Voice & Narrator

- **Companion line**: bắn ở `stage_start, high_pressure, event:<id>, outcome:<id>`. Có hàng đợi, dedupe, không lặp 2 decision liên tiếp. ≥6 line/perspective/ải.
- **Narrator audio**: 15 file MP3 (`era{1..5}-{enter|tension|revolution}.mp3`) bắn sync với narrative prompt.
- **StageAudio**: crossfade pad nhạc nền giữa các ải (fade 650ms để tránh pop).
- **AmbientEngine**: pad ambient thay đổi theo tier (càng cao càng dày, càng méo).

### 4.14 Ending v2

`resolveEnding(finalState)` quét `templates[]`, chọn template đầu tiên `match()`:

```ts
{
  id: "worker_revolution_won",
  match: s => s.path === "rupture" && s.perspective === "worker",
  perspectiveNarration: { ruler: "...", worker: "...", historian: "..." },
  tone: "defiant",
  reflectiveQuestion: "Nếu tổ chức yếu hơn 10%, liệu cuộc khởi nghĩa có thành công?"
}
```

Có **≥6 template**: `ruler_authoritarian_continuity`, `worker_revolution_won`, `worker_failed_uprising_legacy`, `historian_collapse_documented`, `shared_stagnation`, `shared_rupture_unfinished`…

`EndingScreen` render: narration theo perspective + nền theo tone + reflective question + ReplayTimeline (mọi quyết định + memory tag).

### 4.15 Tutorial / HelpDrawer

`HelpDrawer.tsx` mở từ TopBar — giải thích trực tiếp:
- 5 metric gốc và ý nghĩa lý luận.
- 6 áp lực phái sinh và ảnh hưởng.
- 4 tier mâu thuẫn và hệ quả unlock/lock.
- 6 outcome chuyển ải.

---

## 5. Quiz minigame (rà SGK Mác – Lênin)

13 câu, đã được rà theo SGK:
- Tiến hoá công cụ: đá ghè → đá mài → đồng → sắt → máy.
- Hình thái địa tô: lao dịch → hiện vật → tiền tệ.
- Giá trị thặng dư: `m = v'·v` (tỷ suất bóc lột).
- Quan hệ sản xuất: 3 mặt — sở hữu TLSX, tổ chức quản lý, phân phối.

Mọi câu có nguồn chú giải hiển thị sau khi trả lời.

---

## 6. Acceptance — đã đạt

- [x] Stage advance không còn đảm bảo; ≥4 outcome non-evolve có thể đạt.
- [x] Tier ≥ EMERGENCY có thể trigger event biến đổi option set.
- [x] Mỗi perspective ẩn ≥1 gauge và ≥1 option tag; nhấn mạnh ≥1 exclusive tag.
- [x] Historian không pick được `direct_action`; chỉ có `record` variant.
- [x] Memory tag persist qua stage, decay, xuất hiện ở narrator + replay + ending.
- [x] Companion line bắn ở stage_start, high_pressure, key outcomes (≥6/perspective).
- [x] ≥6 ending template, mỗi template có narration cho cả 3 perspective + reflective question.
- [x] **Không option nào "đúng tuyệt đối"** — mọi option đều có trade-off âm.
- [x] Background ảnh + audio + narrator voiceover đồng bộ theo từng ải.
- [x] HelpDrawer tutorial giải thích đầy đủ chỉ số.
- [x] Baseline tech cấp tự động khi vào ải mới (không còn tech bị khoá vĩnh viễn).
- [x] Reduced-motion + design tokens được tôn trọng.

---

## 7. Bản đồ file (tham khảo nhanh)

```text
src/routes/
  index.tsx                       # Trang chủ
  minigame.tsx                    # Mini game entry

src/data/
  eras.ts                         # 5 hình thái
  historicalSim.ts                # metrics, decisions
  minigame.ts                     # quiz data
  perspective/perspectiveConfig.ts
  contradiction/{pressures,thresholds,events,resolver}.ts
  transition/{outcomes,resolver}.ts
  memory/index.ts
  companion/lines.ts
  endings/templates.ts

src/components/
  EraChapter.tsx, Hero.tsx, TechTree.tsx, Quiz.tsx, ...
  minigame/sim/
    HistoricalSim.tsx             # entry layout
    simStore.ts                   # zustand state machine
    HelpDrawer.tsx                # tutorial
    perspective/{PerspectiveProvider,PerspectiveHUD}.tsx
    pressure/{PressureGauges,ContradictionTierBadge,EmergencyBanner}.tsx
    cinematic/{AmbientEngine,Narrator,RevolutionCinematic,...}.tsx
    companion/CompanionVoice.tsx
    ending/EndingScreen.tsx

src/assets/stageMedia.ts          # ERA_BG, STAGE_BG, STAGE_AUDIO, NARRATOR
src/audio/narrator/               # 15 file voiceover

docs/MINIGAME.md                  # tài liệu kỹ thuật minigame
document.md                       # tài liệu thuyết trình (file này)
```

---

## 8. Slide thuyết trình gợi ý (10 slide)

1. **Tên project + tagline** — *"Lịch sử không tuyến tính. Tiến bộ là mâu thuẫn được giải quyết."*
2. **Vấn đề:** lý luận chính trị bị coi là khô khan, học thuộc.
3. **Giải pháp:** bài giảng điện ảnh + simulation tương tác.
4. **Trang chủ:** demo cuộn dọc qua 5 hình thái.
5. **Mini game — triết lý:** không có "win" tuyệt đối, 3 lăng kính.
6. **Hệ thống điểm:** 5 metric → 6 pressure → 4 tier.
7. **6 kết cục:** evolve / rupture / failed_uprising / freeze / collapse / suppress.
8. **Memory & ending:** quá khứ có trọng lượng, ≥6 ending template.
9. **Công nghệ:** TanStack Start + React 19 + Zustand + Motion.
10. **Thông điệp:** *"Mỗi quyết định mang trọng lượng lịch sử."*

---

**Tóm tắt một câu:** một bản đồ điện ảnh + một phòng thí nghiệm tư tưởng, để người học **cảm** được vì sao xã hội thay đổi — không phải vì ai đó muốn, mà vì mâu thuẫn buộc nó phải.
