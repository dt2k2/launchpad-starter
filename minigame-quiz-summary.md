# Tóm tắt Minigame & Quiz trong repo

Tài liệu này mô tả hai mảng chính:
- **Minigame mô phỏng lịch sử (Historical Simulation)**: trải nghiệm tương tác dựa trên quyết định và mâu thuẫn xã hội.
- **Các quiz**: gồm mini-quiz theo 5 ải (Hành trình Tiến hoá) và quiz nhanh 5 câu.

---

## 1) Minigame mô phỏng lịch sử (Historical Simulation)

### 1.1. Tinh thần cốt truyện
Minigame dựng theo logic **duy vật lịch sử**: xã hội vận động qua 5 hình thái kinh tế – xã hội. Người chơi không trả lời câu hỏi đúng/sai, mà **ra quyết định chính trị – kinh tế**, kéo theo chuỗi nhân quả, làm biến đổi các chỉ số xã hội. Khi **mâu thuẫn tích tụ vượt ngưỡng**, cách mạng bùng nổ, hình thái mới được sinh ra.

Hành trình gồm 5 thời kỳ:
1. **Cộng sản nguyên thuỷ** – thặng dư bắt đầu xuất hiện.
2. **Chiếm hữu nô lệ** – lao động cưỡng bức, đế chế nở rộ rồi kìm hãm kỹ thuật.
3. **Phong kiến** – đất đai là quyền lực, thương nghiệp lớn lên.
4. **Tư bản chủ nghĩa** – công nghiệp hoá, giá trị thặng dư, mâu thuẫn lao động – tư bản.
5. **Xã hội chủ nghĩa** – câu hỏi sở hữu và phân phối trong thời tự động hoá – AI.

### 1.2. 5 chỉ số xã hội (metrics)
Mỗi quyết định tác động trực tiếp vào 5 chỉ số (0–100):
- **Lực lượng sản xuất**: năng suất, công cụ, kỹ thuật.
- **Ổn định**: mức chấp nhận trật tự hiện hành.
- **Công nghệ**: tri thức kỹ thuật tích luỹ.
- **Mâu thuẫn**: khoảng cách giữa LLSX và QHSX.
- **Áp lực cách mạng**: khi vượt ngưỡng sẽ kích hoạt chuyển hoá.

### 1.3. 3 góc nhìn (Perspective)
Người chơi chọn 1 trong 3 góc nhìn, mỗi góc nhìn có giọng kể, mục tiêu và thiên lệch khác nhau:
- **Giai cấp thống trị**: ưu tiên ổn định, kiềm chế cách mạng. Một số lựa chọn “trật tự” được nhấn mạnh.
- **Giai cấp lao động**: thúc đẩy mâu thuẫn và cách mạng. Lựa chọn tiến bộ được nhấn mạnh.
- **Nhà sử học**: cân bằng và hiểu chuỗi nhân quả; mở khoá nhiều insight/tech.

Đặc biệt:
- **Giọng kể** thay đổi theo góc nhìn (đều có câu mở đầu, cảnh báo, hậu quả, cách mạng).
- **Insight bị che khuất** theo “mù giai cấp”: ví dụ nhà thống trị khó thấy insight về đoàn kết, còn người lao động khó thấy logic chính danh.
- **Một số lựa chọn “độc quyền”** chỉ xuất hiện ở một góc nhìn (ví dụ: “tổ chức mạng lưới giúp tù binh trốn” chỉ cho worker, “phân tích chu kỳ khủng hoảng” chỉ cho historian).

### 1.4. Quyết định & chuỗi nhân quả
Mỗi giai đoạn có các **decision/event** gồm nhiều lựa chọn. Mỗi lựa chọn có:
- **Tác động chỉ số**.
- **Chuỗi nguyên nhân → hệ quả** (cause chain) để người chơi thấy hệ logic.
- **Mở khoá công nghệ** hoặc **insight**.

Ví dụ (tóm lược theo thời kỳ):
- **Nguyên thuỷ**: chia sẻ hay độc quyền lửa, thử trồng trọt hay di cư, xử lý tù binh.
- **Nô lệ**: mở rộng chiến tranh, cải cách nô lệ, đàn áp khởi nghĩa, phản ứng với phát minh kỹ thuật.
- **Phong kiến**: bảo hộ phường hội hay mở thị trường, tài trợ phát kiến địa lý, đàn áp hay cải cách chính trị.
- **Tư bản**: xử lý khủng hoảng thừa, tự động hoá tư nhân hay chia sẻ, kế hoạch hoá xanh hay tin vào thị trường.
- **XHCN**: phân phối thời tự động hoá, sở hữu dữ liệu/AI, kiểm soát bộ máy quyền lực.

### 1.5. Cây công nghệ (Tech tree)
Mỗi era có tech pool riêng (đồ đá, lửa, đồ sắt, cối xay, dây chuyền, AI, hợp tác xã số, ...). Khi chọn một số quyết định, tech được mở khoá và bổ sung hiệu ứng vào chỉ số.

### 1.6. Hệ “Mâu thuẫn” – tầng áp lực
Khi **mâu thuẫn** tăng, game đẩy người chơi vào các **tier**:
- Bình lặng → Căng thẳng → Bất ổn → Khẩn cấp → Vỡ trận.

Mỗi tier tạo hiệu ứng gameplay:
- **Giảm ổn định/sản xuất** theo thời gian.
- **Khóa lựa chọn** (ví dụ: quá muộn để cải lương khi đã bất ổn).
- **Tăng rủi ro**: giảm hiệu quả các lựa chọn tích cực.
- **Bắn sự kiện ngẫu nhiên** (strike wave, khan hiếm lương thực, rạn nứt quyền lực...).

Ngoài mâu thuẫn, game còn mô hình hoá **6 lớp áp lực hệ thống**:
- Căng thẳng giai cấp
- Đàn áp
- Mất tính chính danh
- Tổ chức (nền tảng cách mạng)
- Bất ổn sản xuất
- Rủi ro vỡ trận

### 1.7. Ký ức lịch sử (Memory system)
Một số lựa chọn/sự kiện tạo ra **Memory Tag** (đàn áp lớn, tổng đình công, thất bại khởi nghĩa…). Tag này được **mang qua các thời kỳ**, tác động đến lời kể và ending. Ký ức có trọng số và sẽ suy giảm dần.

### 1.8. Chuyển pha & kết cục (Transitions & Endings)
Kết thúc mỗi giai đoạn, hệ thống cân nhắc **chuyển pha** theo các trạng thái:
- **Evolve**: quá độ êm dịu.
- **Rupture**: đứt gãy cách mạng.
- **Freeze**: đóng băng, lặp giai đoạn.
- **Collapse**: sụp đổ, tụt lùi.
- **Suppress**: đàn áp toàn diện, khoá cải cách.
- **Failed uprising**: khởi nghĩa thất bại.

Cuối game, **Ending Template** được chọn dựa trên lịch sử đường đi + ký ức. Mỗi ending có:
- Lời kể theo góc nhìn (ruler/worker/historian).
- Tông cảm xúc (somber, defiant, frozen, hopeful, ironic, fractured).
- Câu hỏi phản tư cho người chơi.

### 1.9. Trình diễn & cinematic
- **Narrator** đọc các câu dẫn theo từng era (enter / tension / revolution).
- **Revolution cinematic** biểu tượng tan rã – biểu tượng mới xuất hiện.
- **Âm thanh nền** khác nhau cho từng thời kỳ.
- **HUD góc nhìn** hiển thị mục tiêu, cảnh báo và áp lực hệ thống theo perspective.

### 1.10. Giai thoại người dẫn truyện (trích nguyên văn)

**Cộng sản nguyên thuỷ**
- Vào thời kỳ: “Trước khi có lịch sử, có khan hiếm. Trước khi có giai cấp, có bộ lạc.”
- Tension: “Hạt giống đầu tiên đã nảy mầm. Cùng với nó, mầm mống của tư hữu.”
- Cách mạng: “Khi một người làm ra nhiều hơn nhu cầu, một người khác có thể sống bằng lao động của họ.”

**Chiếm hữu nô lệ**
- Vào thời kỳ: “Đế chế được dựng trên lưng những người không được coi là người.”
- Tension: “Lưỡi cày han gỉ trong tay nô lệ kiệt sức.”
- Cách mạng: “Đế chế không sụp vì kẻ thù bên ngoài. Nó sụp vì hệ thống bên trong đã ngừng tự tái sản xuất.”

**Phong kiến**
- Vào thời kỳ: “Đất đai là quyền lực. Máu thống là số phận. Tôn giáo là trật tự.”
- Tension: “Tàu rời cảng mang theo hàng hoá — và mang về một thế giới khác.”
- Cách mạng: “Tư sản gọi quần chúng làm cách mạng. Quần chúng nhận ra mình đã đổi chủ.”

**Tư bản chủ nghĩa**
- Vào thời kỳ: “Lao động được tự do — tự do bán chính nó.”
- Tension: “Sản xuất ngày càng mang tính xã hội. Chiếm hữu vẫn mang tính tư nhân.”
- Cách mạng: “Trật tự cũ không thể chứa nổi lực lượng sản xuất mới mà nó đã sinh ra.”

**Xã hội chủ nghĩa**
- Vào thời kỳ: “Máy móc có thể làm thay con người. Câu hỏi còn lại là: của ai, vì ai?”
- Tension: “Tự động hoá không tự nó giải phóng. Quyền sở hữu mới quyết định ý nghĩa của nó.”
- Cách mạng: “Một hình thái mới không được công bố. Nó được tổ chức, ngày qua ngày, trong từng quan hệ.”

---

## 2) Mini-Quiz nhiều ải: “Hành trình Tiến hoá”

Đây là hệ quiz theo 5 thời kỳ, dữ liệu hoá hoàn toàn. Mỗi ải có: mô tả ngắn, mâu thuẫn chính, câu hỏi, điểm qua ải, thưởng, fun fact.

### 2.1. Cơ chế chung
- **Dạng câu hỏi**: trắc nghiệm (mcq), đúng/sai, nối cặp (match), sắp xếp (order), tình huống (scenario).
- **Điểm**: mỗi câu có points riêng. Dùng gợi ý sẽ bị giảm điểm.
- **Progress & Contradiction**: trả lời đúng tăng “tiến hoá”; trả lời sai tăng “mâu thuẫn”.
- **Qua ải**: cần đạt **passScore** cho mỗi stage.
- **Phần thưởng**: badge + lore + công nghệ mở khoá + fun fact.

### 2.2. Nội dung theo từng ải

**Ải 1 — Cộng sản nguyên thuỷ (passScore: 6)**
- Trọng tâm: sở hữu chung, công cụ thô sơ, chưa có giai cấp.
- Câu hỏi: ai sở hữu TLSX; sắp xếp công cụ theo lịch sử; mâu thuẫn giai cấp có tồn tại không.
- Reward: “Người Giữ Lửa”, nhấn mạnh thặng dư và tư hữu vừa manh nha.

**Ải 2 — Chiếm hữu nô lệ (passScore: 8)**
- Trọng tâm: thặng dư cho phép nô lệ; nhà nước sơ khai bảo vệ chủ nô.
- Câu hỏi: điều kiện của chế độ nô lệ; ghép khái niệm (chủ nô, nô lệ, nhà nước); tình huống kìm hãm kỹ thuật.
- Reward: “Người Phá Xiềng”, nhấn mạnh mâu thuẫn nội tại của lao động cưỡng bức.

**Ải 3 — Phong kiến (passScore: 9)**
- Trọng tâm: đất đai, tô thuế, thị dân nổi lên.
- Câu hỏi: khác biệt nông nô – nô lệ; thứ tự các hình thức tô; lý do xung đột với lãnh chúa.
- Reward: “Người Mở Cửa Thành”, mầm tư sản lớn lên phá vỡ trật tự cũ.

**Ải 4 — Tư bản chủ nghĩa (passScore: 11)**
- Trọng tâm: giá trị thặng dư, công nghiệp hoá, mâu thuẫn LLSX xã hội hoá vs chiếm hữu tư nhân.
- Câu hỏi: nguồn gốc giá trị thặng dư; ghép công nghệ với tác động xã hội; tình huống tự động hoá.
- Reward: “Người Đọc Vị Hệ Thống”, câu hỏi “của ai, vì ai” trở nên trung tâm.

**Ải 5 — Xã hội chủ nghĩa (passScore: 10)**
- Trọng tâm: điều kiện vật chất để chuyển hoá, phân phối thời tự động hoá, sở hữu dữ liệu/AI.
- Câu hỏi: điều kiện vật chất cho XHCN; phân phối phù hợp; ghép AI, dữ liệu công, hợp tác xã số với vai trò tổ chức mới.
- Reward: “Người Kiến Tạo”, nhấn mạnh sở hữu xã hội và tổ chức mới của QHSX.

### 2.3. Xếp hạng tổng
Sau khi hoàn thành toàn bộ 5 ải, hệ thống quy đổi % điểm thành cấp:
- **Đồng** / **Bạc** / **Vàng** / **Bậc thầy**.

---

## 3) Quiz nhanh 5 câu (Quick Quiz)

Bộ quiz nhỏ gắn vào trang chính, gồm 5 câu nền tảng:
1. Động lực căn bản của lịch sử theo duy vật lịch sử.
2. Ai sở hữu nô lệ trong xã hội chiếm hữu nô lệ.
3. Đặc trưng của quan hệ sản xuất phong kiến.
4. Mâu thuẫn cơ bản của chủ nghĩa tư bản.
5. Nguyên tắc phân phối ở giai đoạn đầu XHCN.

Quiz này dùng để “chốt hiểu” sau khi đọc nội dung chính.

---

## 4) Kết luận ngắn
Minigame trong repo **không chỉ là quiz**, mà là một mô hình “trải nghiệm lịch sử” có:
- hệ chỉ số – mâu thuẫn – áp lực,
- diễn tiến xã hội nhiều nhánh,
- ký ức lịch sử và kết cục đa dạng,
- cùng bộ quiz 5 ải + quiz nhanh để kiểm tra nhận thức.

Nếu cần, có thể bổ sung thêm phần **trích dẫn nguyên văn** từng quyết định/câu hỏi theo yêu cầu.
