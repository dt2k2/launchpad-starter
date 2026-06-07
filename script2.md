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

## 2. Ba Góc Nhìn: Không Phải Skin, Mà Là Vị Trí Giai Cấp

*Demo gợi ý: Chọn nhanh từng vai để cho thấy HUD/giọng/option khác nhau. Nếu ít thời gian, chọn Worker để demo chính.*

Điểm em muốn nhấn mạnh nhất là: 3 vai trong game không chỉ đổi màu giao diện. Chúng đại diện cho **vị trí xã hội khác nhau**, nên nhìn thấy thế giới khác nhau và có quyền hành động khác nhau.

### Ruler

Ruler là người cai trị. Vai này quan tâm đến trật tự, chính danh, sản xuất và khả năng duy trì bộ máy.

Ruler có thể:
- Cải cách từ trên xuống.
- Nhân nhượng để giảm mâu thuẫn.
- Dùng đàn áp để giữ trật tự.
- Ban chính sách, điều tiết tài nguyên, bảo vệ quyền sở hữu hiện hành.

Nhưng **điểm mù** của Ruler là: họ không phải lúc nào cũng nhìn thấy đầy đủ mức độ tổ chức của người bị trị. Họ có thể nghĩ xã hội đã yên, trong khi bên dưới đang tích tụ bất mãn.

### Worker

Worker là người lao động. Vai này quan tâm đến sinh tồn, tổ chức, phản kháng và khả năng tự quản.

Worker có thể:
- Tổ chức đình công hoặc mạng lưới ngầm.
- Đòi phân phối lại.
- Tự quản công cụ sản xuất.
- Chuẩn bị khởi nghĩa khi mâu thuẫn đủ cao.

Nhưng Worker cũng không toàn năng. Nếu nổi dậy khi tổ chức chưa đủ, **kết cục có thể là một cuộc khởi nghĩa thất bại (failed uprising)**: đàn áp (repression) tăng lên, và ký ức thất bại đó còn lưu lại trong các era sau.

### Historian

Historian là sử gia. Đây là vai đặc biệt nhất: không can thiệp trực tiếp vào xã hội.

Khi Ruler và Worker chọn hành động, Historian chọn cách ghi chép, so sánh, phân tích. Các option thường được chuyển thành dạng `record:*`.

Điều này giữ đúng vai trò triết học của sử gia: họ không trực tiếp ban lệnh hay khởi nghĩa, nhưng có thể nhìn rộng, mở insight, ghi lại nguyên nhân và hệ quả.

Vì vậy, cùng một sự kiện lịch sử, game cho ba trải nghiệm khác nhau:
- **Ruler hỏi:** "Làm sao giữ trật tự?"
- **Worker hỏi:** "Làm sao sống và tổ chức?"
- **Historian hỏi:** "Cơ chế xã hội nào đang bộc lộ ở đây?"

Đây chính là cách game mô phỏng luận điểm: **vị trí giai cấp định hình nhận thức xã hội**.

---


## 4. Decision Và Event: Câu Hỏi Không Chỉ Là "Chọn Gì?"

*Mở một decision trong game.*

Mỗi decision trong game được viết theo 3 lớp:
1. **Điều kiện vật chất**: xã hội đang thiếu gì, sản xuất đang ở đâu, công cụ nào xuất hiện.
2. **Xung đột giai cấp**: ai được lợi, ai bị ép, ai đang phản kháng.
3. **Trade-off hành động**: lựa chọn nào cũng có giá của nó.

Ví dụ, cùng một biến cố: Ruler có thể thấy vấn đề như một cuộc khủng hoảng trật tự; Worker thấy đó là câu hỏi sinh tồn; Historian thấy đó là dấu hiệu của một quan hệ sản xuất đang lộ giới hạn.

Đây là lý do phần câu hỏi trong minigame không chỉ hỏi: "Bạn quyết định gì?"
Nó phải làm người chơi hình dung được:
- Xã hội đang căng thẳng ở điểm nào.
- Mâu thuẫn nằm giữa lực lượng nào.
- Hành động của mình cứu được cái gì và làm hỏng cái gì.

---

## 5. Transition Engine: Vì Sao Lịch Sử Không Tuyến Tính

*Chuyển sang phần giải thích outcome. Có thể mở replay/timeline nếu đã chơi demo.*

Cuối mỗi era, game không tự động đưa người chơi sang era sau. Nó dùng transition engine để chọn một trong 6 outcome:

1. **Evolve**: Xã hội chuyển tiếp tương đối êm. Mâu thuẫn chưa vỡ, ổn định còn đủ, quan hệ sản xuất có thể thích nghi một phần.
2. **Rupture**: Cách mạng thành công. Trật tự cũ bị phá vỡ, quan hệ sản xuất mới bắt đầu hình thành. Game không mô tả rupture như "happy ending" tuyệt đối. Nó là một đứt gãy lịch sử, có chi phí và có hậu quả.
3. **Failed Uprising**: Khởi nghĩa thất bại. Mâu thuẫn cao nhưng tổ chức chưa đủ hoặc đàn áp quá mạnh. Người chơi bị giữ lại trong era, với ký ức thất bại nặng nề.
4. **Freeze**: Xã hội đóng băng. Không đủ sức chuyển hoá, cũng không đủ sức sụp đổ ngay. Era có thể bị lặp lại với sự suy tàn (decay), thể hiện tình trạng trì trệ.
5. **Collapse**: Sụp đổ. Khi sản xuất và ổn định đều quá thấp, xã hội không sinh ra hình thái mới ngay lập tức mà bước vào một khoảng tối.
6. **Suppress**: Đàn áp toàn diện. Trật tự được giữ bằng bạo lực, nhưng cải cách bị khoá về sau. Đây là kiểu "thắng ngắn hạn, thua dài hạn".

Điểm em muốn nhấn mạnh: Game không dạy rằng lịch sử tự động tiến bộ. Duy vật lịch sử không nói mọi xã hội chắc chắn đi lên một cách đẹp đẽ. Nó nói rằng xã hội vận động trong mâu thuẫn, và kết quả phụ thuộc vào điều kiện vật chất, tổ chức, lực lượng xã hội và cách mâu thuẫn được giải quyết.

---

## 6. Dark Age Và Consolidation: Sau Đứt Gãy Chưa Phải Là Kết Thúc

Một nâng cấp quan trọng của minigame là có **interlude**, tức màn trung gian sau biến cố lớn.

Nếu outcome là `collapse`, người chơi bước vào **dark_age**.
Dark age không phải một era mới. Nó là khoảng tối sau sụp đổ: sản xuất đứt gãy, tri thức có thể thất truyền, quyền lực phân mảnh. Người chơi phải chọn cứu điều gì trước: lương thực, tri thức, cộng đồng hay tổ chức.

Nếu outcome là `rupture`, người chơi bước vào **consolidation**.
Consolidation nhấn mạnh rằng cách mạng không kết thúc ở khoảnh khắc lật đổ. Sau đó còn câu hỏi khó hơn: Quan hệ sản xuất mới được tổ chức thế nào? Quyền lực có quay lại tay thiểu số không? Công cụ sản xuất thuộc về ai?

Hai interlude này làm game đúng triết học hơn, vì nó tránh cách hiểu đơn giản rằng:
> Cách mạng xảy ra là xong, hoặc sụp đổ là tự động sinh ra cái mới.

Trong game, sự quá độ luôn cần được tổ chức và kiến tạo.

---

## 8. Thông Điệp Sư Phạm

*[Chậm lại, nhấn mạnh từng điểm]*

Xuyên suốt quá trình trải nghiệm minigame này, người chơi sẽ tự đúc kết được những thông điệp cốt lõi mà không cần ai thuyết giáo:

**Một là, lịch sử không vận động tuyến tính.** Tiến bộ không tự nhiên sinh ra. Kết cục của một thời đại phụ thuộc vào sự tích luỹ mâu thuẫn, tổ chức lực lượng và tính thời điểm.

**Hai là, mọi quyết định đều có giá của nó (Trade-off).** Ổn định đổi bằng sự kiểm soát. Cách mạng đánh đổi bằng đứt gãy. Không có chiến thắng nào là tuyệt đối — đây không phải là sự bi quan, mà là chủ nghĩa hiện thực lịch sử.

**Và điều cuối cùng, cũng là điều em tâm đắc nhất: Vị trí giai cấp định hình nhận thức.** Ruler không hẳn là phản diện, Worker không phải lúc nào cũng toàn năng. Họ đơn giản là **không nhìn thấy cùng một hiện thực xã hội**. Đó là thứ đọc sách rất khó mường tượng, nhưng khi tự tay trải nghiệm trong game, người chơi sẽ thấu hiểu sâu sắc.

---

## 9. Kết Luận

*[Dừng màn hình ở ending, timeline hoặc màn chọn vai]*

Minigame **"Hành Trình Tiến Hoá"** không cố làm cho triết học trở nên dễ dãi hay giải trí đơn thuần. Nó giữ lại toàn bộ sự phức tạp của lịch sử, nhưng trao cho người chơi quyền được tương tác, được sai lầm và được chứng kiến hệ quả.

Em xin kết thúc phần trình bày bằng thông điệp ngắn gọn của dự án:

> **"Mỗi quyết định đều mang trọng lượng lịch sử. Không có hành động nào nằm ngoài quy luật vận động của xã hội."**

Em xin cảm ơn!