# Script Thuyết Trình Minigame — "Hành Trình Tiến Hoá"

> **Thời lượng gợi ý:** 10-12 phút.  
> **Cách dùng:** phần *in nghiêng* là gợi ý thao tác/nhấn giọng khi trình bày.  
> **Trọng tâm:** giới thiệu minigame như một mô phỏng tương tác về **chủ nghĩa duy vật lịch sử**, không phải một bài quiz.

---

## 0. Mở Đầu Nhanh

*Mở trang minigame, để màn hình chọn vai hiện lên. Dừng 2-3 giây trước khi nói.*

Kính chào thầy cô và các bạn.

Hôm nay em xin giới thiệu phần minigame của project: **"Hành Trình Tiến Hoá"**.

Nếu phần website chính giúp người học đọc và nhìn thấy 5 hình thái kinh tế - xã hội, thì minigame này cho người học **tự bước vào lịch sử**. Người chơi không trả lời câu hỏi trắc nghiệm kiểu "đúng hay sai", mà phải ra quyết định trong một xã hội đang có mâu thuẫn.

Ý tưởng cốt lõi của game là:

> **Lịch sử không tiến lên vì một cá nhân muốn như vậy. Lịch sử vận động vì lực lượng sản xuất phát triển, quan hệ sản xuất cũ trở nên chật hẹp, và mâu thuẫn xã hội buộc phải được giải quyết.**

Minigame biến ý tưởng đó thành trải nghiệm có lựa chọn, có chỉ số, có khủng hoảng, có cách mạng, có sụp đổ, và có nhiều kết cục khác nhau.

---

## 1. Vì Sao Là Minigame?

Thông thường, khi học chủ nghĩa duy vật lịch sử, người học dễ nhớ công thức:

> Lực lượng sản xuất phát triển → quan hệ sản xuất không còn phù hợp → mâu thuẫn tăng → cách mạng xã hội xảy ra.

Nhưng nếu chỉ học như một câu định nghĩa, người học rất khó cảm nhận được:

- Tại sao cải cách đôi khi cứu được một trật tự cũ, nhưng đôi khi lại quá muộn.
- Tại sao đàn áp có thể tạo ổn định ngắn hạn nhưng làm mâu thuẫn sâu hơn.
- Tại sao một cuộc nổi dậy có thể thất bại nếu chưa có tổ chức.
- Tại sao cùng một biến cố, người cai trị và người lao động lại nhìn thấy hai thực tại rất khác nhau.

Vì vậy, minigame được thiết kế như một **phòng thí nghiệm tư tưởng**. Người chơi thử lựa chọn, nhìn hệ quả, rồi tự rút ra quy luật.

---

## 2. Cấu Trúc Tổng Thể Của Game

*Chỉ vào màn hình chọn vai.*

Game có 3 lớp lớn.

Thứ nhất là **5 era**, tương ứng với 5 hình thái kinh tế - xã hội:

1. Cộng sản nguyên thuỷ.
2. Chiếm hữu nô lệ.
3. Phong kiến.
4. Tư bản chủ nghĩa.
5. Xã hội chủ nghĩa.

Mỗi era có phần giới thiệu, lực lượng sản xuất, quan hệ sản xuất, mâu thuẫn cốt lõi, 3 decision hoặc event, công nghệ có thể mở khoá và insight lý luận.

Thứ hai là **3 góc nhìn**:

- **Ruler**: người cai trị.
- **Worker**: người lao động.
- **Historian**: sử gia.

Thứ ba là **transition engine**, tức hệ thống quyết định xã hội sau mỗi era sẽ đi tiếp bằng con đường nào: chuyển hoá êm dịu, cách mạng, đóng băng, sụp đổ, đàn áp, hoặc khởi nghĩa thất bại.

Vòng lặp chính của game là:

```text
Chọn vai → vào era → đọc tình huống → chọn quyết định
→ chỉ số thay đổi → mâu thuẫn tăng/giảm → có thể phát sinh event
→ hết era → hệ thống chọn kết cục chuyển tiếp
→ cinematic / interlude → era tiếp theo
→ cuối game → ending + timeline
```

Điểm quan trọng là: người chơi không "qua màn" theo đường thẳng. Mỗi era có thể rẽ sang nhiều hướng khác nhau.

---

## 3. Ba Góc Nhìn: Không Phải Skin, Mà Là Vị Trí Giai Cấp

*Demo gợi ý: chọn nhanh từng vai để cho thấy HUD/giọng/option khác nhau. Nếu ít thời gian, chọn Worker để demo chính.*

Điểm em muốn nhấn mạnh nhất là: 3 vai trong game không chỉ đổi màu giao diện. Chúng đại diện cho **vị trí xã hội khác nhau**, nên nhìn thấy thế giới khác nhau và có quyền hành động khác nhau.

### Ruler

Ruler là người cai trị. Vai này quan tâm đến trật tự, chính danh, sản xuất và khả năng duy trì bộ máy.

Ruler có thể:

- Cải cách từ trên xuống.
- Nhân nhượng để giảm mâu thuẫn.
- Dùng đàn áp để giữ trật tự.
- Ban chính sách, điều tiết tài nguyên, bảo vệ quyền sở hữu hiện hành.

Nhưng cái mù của Ruler là: họ không luôn nhìn thấy đầy đủ mức độ tổ chức của người bị trị. Họ có thể nghĩ xã hội đã yên, trong khi bên dưới đang tích tụ bất mãn.

### Worker

Worker là người lao động. Vai này quan tâm đến sinh tồn, tổ chức, phản kháng và khả năng tự quản.

Worker có thể:

- Tổ chức đình công hoặc mạng lưới ngầm.
- Đòi phân phối lại.
- Tự quản công cụ sản xuất.
- Chuẩn bị khởi nghĩa khi mâu thuẫn đủ cao.

Nhưng Worker cũng không toàn năng. Nếu nổi dậy khi tổ chức chưa đủ, outcome có thể là **failed uprising**: khởi nghĩa thất bại, repression tăng, memory thất bại còn lưu lại trong các era sau.

### Historian

Historian là sử gia. Đây là vai đặc biệt nhất: không can thiệp trực tiếp vào xã hội.

Khi Ruler và Worker chọn hành động, Historian chọn cách ghi chép, so sánh, phân tích. Các option thường được chuyển thành dạng `record:*`.

Điều này giữ đúng vai trò triết học của sử gia: họ không trực tiếp ban lệnh hay khởi nghĩa, nhưng có thể nhìn rộng, mở insight, ghi lại nguyên nhân và hệ quả.

Vì vậy, cùng một sự kiện lịch sử, game cho ba trải nghiệm khác nhau:

- Ruler hỏi: "Làm sao giữ trật tự?"
- Worker hỏi: "Làm sao sống và tổ chức?"
- Historian hỏi: "Cơ chế xã hội nào đang bộc lộ ở đây?"

Đây chính là cách game mô phỏng luận điểm: **vị trí giai cấp định hình nhận thức xã hội**.

---

## 4. Hệ Chỉ Số: Xã Hội Được Mã Hoá Như Thế Nào?

*Chỉ vào HUD chỉ số.*

Để người chơi cảm nhận được xã hội đang vận động, game dùng 5 chỉ số gốc.

### 5 chỉ số gốc

- **Sản xuất**: đại diện cho lực lượng sản xuất, năng suất, công cụ, kỹ thuật.
- **Ổn định**: mức xã hội còn chấp nhận trật tự hiện hành.
- **Công nghệ**: tri thức kỹ thuật tích luỹ, dùng để mở khoá tech.
- **Mâu thuẫn**: khoảng cách giữa lực lượng sản xuất và quan hệ sản xuất.
- **Cách mạng**: áp lực cách mạng đã tích tụ trong xã hội.

Người chơi không kéo trực tiếp các thanh này. Người chơi chỉ chọn quyết định. Sau mỗi lựa chọn, các chỉ số thay đổi.

Ví dụ:

- Đầu tư công cụ có thể tăng sản xuất và công nghệ, nhưng cũng làm mâu thuẫn tăng nếu quan hệ sở hữu cũ không đổi.
- Đàn áp có thể tăng ổn định ngắn hạn, nhưng tăng repression và làm mất chính danh.
- Nhân nhượng có thể giảm mâu thuẫn, nhưng làm tầng lớp thống trị mất một phần quyền kiểm soát.
- Tổ chức quần chúng có thể tăng khả năng cách mạng, nhưng cũng làm xã hội căng hơn.

Không có option nào là tốt tuyệt đối. Mỗi lựa chọn đều có trade-off.

---

## 5. Áp Lực Hệ Thống Và Tier Mâu Thuẫn

Từ 5 chỉ số gốc, hệ thống tính thêm các áp lực phái sinh như:

- Căng thẳng giai cấp.
- Đàn áp.
- Mất chính danh.
- Tổ chức quần chúng.
- Bất ổn sản xuất.
- Nguy cơ đứt gãy.

Những áp lực này khiến game không chỉ là cộng trừ điểm đơn giản. Nó mô phỏng việc xã hội có những lực ngầm mà người chơi không luôn kiểm soát được.

Mâu thuẫn được chia thành 5 tier:

```text
calm      : 0-49
tension   : 50-69
unstable  : 70-84
emergency : 85-94
rupture   : 95-100
```

Khi tier tăng, hệ thống bắt đầu thay đổi hành vi:

- Ở `tension`, event xã hội có thể phát sinh.
- Ở `unstable`, cải cách bắt đầu khó hơn.
- Ở `emergency`, nhượng bộ không còn dễ cứu tình hình.
- Ở `rupture`, xã hội chỉ còn các hành động khủng hoảng: nổi dậy, đàn áp, khẩn cấp hoặc ghi chép.

Điều này rất quan trọng về mặt triết học: khi mâu thuẫn đã tích tụ quá cao, con người không còn được lựa chọn trong một không gian bình thường nữa. Họ bị lịch sử ép vào những lựa chọn cực đoan hơn.

---

## 6. Decision Và Event: Câu Hỏi Không Chỉ Là "Chọn Gì?"

*Mở một decision trong game.*

Mỗi decision trong game được viết theo 3 lớp:

1. **Điều kiện vật chất**: xã hội đang thiếu gì, sản xuất đang ở đâu, công cụ nào xuất hiện.
2. **Xung đột giai cấp**: ai được lợi, ai bị ép, ai đang phản kháng.
3. **Trade-off hành động**: lựa chọn nào cũng có giá.

Ví dụ cùng một biến cố, Ruler có thể thấy vấn đề như một cuộc khủng hoảng trật tự; Worker thấy đó là câu hỏi sinh tồn; Historian thấy đó là dấu hiệu của một quan hệ sản xuất đang lộ giới hạn.

Đây là lý do phần câu hỏi trong minigame không chỉ hỏi: "Bạn quyết định gì?"

Nó phải làm người chơi hình dung được:

- Xã hội đang căng ở đâu.
- Mâu thuẫn nằm giữa lực lượng nào.
- Hành động của mình cứu được cái gì và làm hỏng cái gì.

---

## 7. Transition Engine: Vì Sao Lịch Sử Không Tuyến Tính

*Chuyển sang phần giải thích outcome. Có thể mở replay/timeline nếu đã chơi demo.*

Cuối mỗi era, game không tự động đưa người chơi sang era sau. Nó dùng transition engine để chọn một trong 6 outcome.

### 1. Evolve

Xã hội chuyển tiếp tương đối êm. Mâu thuẫn chưa vỡ, ổn định còn đủ, quan hệ sản xuất có thể thích nghi một phần.

### 2. Rupture

Cách mạng thành công. Trật tự cũ bị phá vỡ, quan hệ sản xuất mới bắt đầu hình thành. Nhưng game không mô tả rupture như "happy ending" tuyệt đối. Nó là một đứt gãy lịch sử, có chi phí và có hậu quả.

### 3. Failed Uprising

Khởi nghĩa thất bại. Mâu thuẫn cao nhưng tổ chức chưa đủ hoặc đàn áp quá mạnh. Người chơi bị giữ lại trong era, với ký ức thất bại nặng hơn.

### 4. Freeze

Xã hội đóng băng. Không đủ sức chuyển hoá, cũng không đủ sức sụp đổ ngay. Era có thể bị lặp lại với decay, thể hiện tình trạng trì trệ.

### 5. Collapse

Sụp đổ. Khi sản xuất và ổn định đều quá thấp, xã hội không sinh ra hình thái mới ngay lập tức mà bước vào một khoảng tối.

### 6. Suppress

Đàn áp toàn diện. Trật tự được giữ bằng bạo lực, nhưng cải cách bị khoá về sau. Đây là kiểu "thắng ngắn hạn, thua dài hạn".

Điểm em muốn nhấn mạnh: game không dạy rằng lịch sử tự động tiến bộ. Duy vật lịch sử không nói mọi xã hội chắc chắn đi lên một cách đẹp đẽ. Nó nói rằng xã hội vận động trong mâu thuẫn, và kết quả phụ thuộc vào điều kiện vật chất, tổ chức, lực lượng xã hội và cách mâu thuẫn được giải quyết.

---

## 8. Dark Age Và Consolidation: Sau Đứt Gãy Chưa Phải Là Kết Thúc

Một nâng cấp quan trọng của minigame là có **interlude**, tức màn trung gian sau biến cố lớn.

Nếu outcome là `collapse`, người chơi bước vào **dark_age**.

Dark age không phải một era thứ sáu. Nó là khoảng tối sau sụp đổ: sản xuất đứt gãy, tri thức có thể thất truyền, quyền lực phân mảnh. Người chơi phải chọn cứu điều gì trước: lương thực, tri thức, cộng đồng hay tổ chức.

Nếu outcome là `rupture`, người chơi bước vào **consolidation**.

Consolidation nhấn mạnh rằng cách mạng không kết thúc ở khoảnh khắc lật đổ. Sau đó còn câu hỏi khó hơn: quan hệ sản xuất mới được tổ chức thế nào? Quyền lực có quay lại tay thiểu số không? Công cụ sản xuất thuộc về ai?

Hai interlude này làm game đúng triết học hơn, vì nó tránh cách hiểu đơn giản rằng:

> Cách mạng xảy ra là xong, hoặc sụp đổ là tự động sinh ra cái mới.

Trong game, quá độ luôn cần tổ chức.

---

## 9. Memory, Companion Và Narrator

*Chỉ vào dòng companion hoặc narrator HUD nếu đang hiện.*

Game có hệ thống memory. Một số lựa chọn và outcome để lại ký ức lịch sử như:

- Đàn áp hàng loạt.
- Khởi nghĩa thất bại.
- Cải cách thành công.
- Di chứng sụp đổ.
- Di sản cách mạng.
- Mạng lưới ngầm.
- Thập kỷ trì trệ.

Memory không biến mất ngay. Nó ảnh hưởng đến các era sau, hiện lại trong dòng "Dư âm lịch sử", replay timeline và ending.

Ngoài ra game có **Companion Voice**. Mỗi vai có một tiếng nói đi cùng:

- Ruler có cận thần hoặc cố vấn.
- Worker có đồng chí hoặc người cùng cảnh.
- Historian có trợ lý lưu trữ.

Các câu companion được viết theo từng era và từng role. Ví dụ ở thời chiếm hữu nô lệ, Worker nghe giọng của bạn nô lệ; ở tư bản chủ nghĩa, Worker nghe đồng nghiệp ca; ở xã hội chủ nghĩa, Worker nghe đồng chí cùng tổ.

Narrator cũng có audio riêng theo role:

```text
5 era × 3 role × 3 moment = 45 voice files
```

Ba moment là:

- `enter`: khi bước vào era.
- `tension`: khi mâu thuẫn căng.
- `revolution`: khi cách mạng/đứt gãy xảy ra.

Điều này giúp game không chỉ có logic đúng, mà còn có cảm giác nhập vai.

---

## 10. Ending: Không Có "Win" Tuyệt Đối

Cuối game, ending không chỉ dựa vào điểm số. Nó đọc toàn bộ lịch sử người chơi đã tạo ra:

- Đi qua era nào bằng evolve, rupture, collapse hay suppress.
- Có bao nhiêu lần cách mạng.
- Có memory đàn áp, thất bại, sụp đổ hay cải cách.
- Người chơi đang ở vai nào.

Hiện hệ thống có nhiều ending template, mỗi ending có narration riêng cho cả Ruler, Worker và Historian.

Điểm quan trọng là: không có kết thúc nào là "đúng tuyệt đối".

- Ruler có thể giữ được trật tự, nhưng cái giá là chính danh hoặc trì trệ.
- Worker có thể tạo rupture, nhưng phải đối mặt với tổ chức xã hội mới.
- Historian có thể hiểu sâu lịch sử, nhưng không trực tiếp cứu được con người trong biến cố.

Kết thúc của game là một câu hỏi phản tư: nếu chọn khác đi, nếu tổ chức mạnh hơn, nếu đàn áp ít hơn, nếu cải cách sớm hơn, lịch sử có rẽ sang hướng khác không?

---

## 11. Demo Gợi Ý Trong 2-3 Phút

Nếu có thời gian demo trực tiếp, em sẽ đi theo thứ tự này:

1. **Chọn Worker** để cảm giác nhập vai rõ nhất.
2. Vào era đầu tiên, chỉ nhanh 5 chỉ số và HUD áp lực.
3. Chọn một decision có tính trade-off, ví dụ chia sẻ tài nguyên hay tích trữ.
4. Sau consequence, chỉ cách metric thay đổi và cause-chain giải thích hậu quả.
5. Nếu có event hoặc companion xuất hiện, dừng lại đọc một câu để cho thấy game không chỉ là số.
6. Quay lại màn chọn vai hoặc nói nhanh: cùng tình huống đó, Ruler và Historian sẽ thấy prompt/option khác.

*Nếu cần tạo ấn tượng mạnh hơn, có thể demo tiếp một đoạn mâu thuẫn cao để cho thấy emergency/rupture lock option và narrator tension.*

---

## 12. Giá Trị Của Project

Em tóm tắt giá trị của minigame bằng 4 ý.

Thứ nhất, nó biến lý thuyết thành trải nghiệm. Người học không chỉ đọc "mâu thuẫn giai cấp", mà thấy mâu thuẫn tăng lên qua từng lựa chọn.

Thứ hai, nó giữ đúng tinh thần duy vật lịch sử. Các biến đổi không đến từ đạo đức cá nhân đơn giản, mà từ sản xuất, sở hữu, tổ chức, chính danh và mâu thuẫn xã hội.

Thứ ba, nó cho phép so sánh góc nhìn. Cùng một biến cố, Ruler, Worker và Historian cho ba cách hiểu khác nhau. Đây là phần giúp người chơi cảm nhận được vai trò của vị trí giai cấp.

Thứ tư, nó có khả năng mở rộng. Có thể thêm event, ending, voice, hoặc những case lịch sử cụ thể mà không phá lõi logic.

---

## 13. Kết Luận

*Dừng màn hình ở ending, timeline hoặc màn chọn vai.*

Minigame **"Hành Trình Tiến Hoá"** không cố biến triết học thành một trò chơi dễ dãi. Ngược lại, nó giữ sự phức tạp của lịch sử, nhưng trình bày bằng trải nghiệm tương tác.

Người chơi sẽ thấy rằng:

- Sản xuất phát triển có thể mở ra tiến bộ, nhưng cũng làm lộ giới hạn của trật tự cũ.
- Cải cách, đàn áp, nổi dậy hay ghi chép đều có vai trò lịch sử khác nhau.
- Cách mạng không chỉ là một sự kiện, mà là kết quả của mâu thuẫn, tổ chức và điều kiện vật chất.
- Và quan trọng nhất: lịch sử không có một con đường đơn giản, nhưng nó có quy luật vận động.

Em xin kết thúc bằng thông điệp của minigame:

> **Mỗi quyết định đều mang trọng lượng lịch sử. Không có lựa chọn nào đứng ngoài mâu thuẫn của thời đại mình.**

Em xin cảm ơn thầy cô và các bạn đã lắng nghe.

---

# Phụ Lục Q&A

## Q1. Game có làm sai triết học khi cho người chơi "điều khiển lịch sử" không?

Không. Người chơi không điều khiển lịch sử theo ý muốn tuyệt đối. Mỗi lựa chọn bị giới hạn bởi era, vai trò, tier mâu thuẫn, chỉ số xã hội và memory đã tích luỹ. Đây là cách game mô phỏng quan hệ giữa chủ thể hành động và điều kiện vật chất.

## Q2. Vì sao Historian vẫn có lựa chọn nếu không được can thiệp?

Vì lựa chọn của Historian là lựa chọn về cách ghi chép và phân tích. Vai này không ban lệnh, không đàn áp, không khởi nghĩa trực tiếp. Nó mở insight và để người chơi thấy cấu trúc lịch sử rõ hơn.

## Q3. Game có thiên vị Worker không?

Không theo nghĩa gameplay. Worker có khả năng tổ chức và rupture, nhưng nếu tổ chức yếu thì dễ thất bại. Ruler có thể giữ ổn định nhưng dễ rơi vào suppress hoặc trì trệ. Historian hiểu rộng nhất nhưng không trực tiếp thay đổi xã hội. Mỗi vai có sức mạnh và giới hạn riêng.

## Q4. Vì sao có dark age?

Vì sụp đổ không tự động sinh ra tiến bộ. Một xã hội có thể mất sản xuất, mất tri thức và rơi vào phân mảnh. Dark age giúp game tránh cách hiểu máy móc rằng cứ trật tự cũ sụp là hình thái mới sẽ xuất hiện ngay.

## Q5. Vì sao cách mạng còn cần consolidation?

Vì lật đổ trật tự cũ chỉ là khoảnh khắc mở đầu. Nếu quan hệ sản xuất mới không được tổ chức, quyền lực cũ có thể quay lại dưới hình thức khác. Consolidation thể hiện câu hỏi: sau cách mạng, xã hội mới được xây bằng cơ chế nào?

## Q6. Điểm kỹ thuật nổi bật nhất của minigame là gì?

Nổi bật nhất là hệ thống kết hợp giữa `metrics`, `pressures`, `tier`, `option tags`, `memory`, `transition outcome`, `role lens`, `companion` và `ending resolver`. Các phần này không đứng riêng lẻ, mà nối thành một vòng phản hồi lịch sử.

