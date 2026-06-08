# Minigame Role Narrator Voice Audio

Route `/minigame` hiện có 15 narrator audio chung theo era. Bộ dưới đây là 45 audio theo role để tăng cảm giác nhập vai.

Quy ước đặt file hiện tại:

```text
src/assets/audio/narrator/era{1-5}-{role}-{moment}.mp3
```

Code cũng chấp nhận cấu trúc cũ `src/assets/audio/narrator/role/era{1-5}-{role}-{moment}.mp3`, nhưng nên dùng đường dẫn trực tiếp ở trên để khớp repo hiện tại.

`role`: `ruler`, `worker`, `historian`

`moment`: `enter`, `tension`, `revolution`

Nếu file role-specific chưa tồn tại, code sẽ fallback về audio chung dạng `era{1-5}-{moment}.mp3` nếu còn có. Nếu cả hai đều thiếu, narrator vẫn hiện text nhưng không phát audio.

## Era 1 - Cộng sản nguyên thuỷ

| File | Voice text |
| --- | --- |
| `era1-ruler-enter.mp3` | Bộ lạc còn sống nhờ chia phần, nhưng người giữ kho và giữ lửa bắt đầu được nghe nhiều hơn. |
| `era1-ruler-tension.mp3` | Thặng dư đầu tiên không chỉ cứu đói. Nó đặt câu hỏi: ai được quyền giữ phần dư? |
| `era1-ruler-revolution.mp3` | Quyền lực sinh ra không phải từ ý muốn, mà từ vật có thể tích trữ và người có thể sai khiến. |
| `era1-worker-enter.mp3` | Ta săn cùng nhau, ăn cùng nhau, sống nhờ nhau. Không ai tự sống nổi ngoài cộng đồng. |
| `era1-worker-tension.mp3` | Khi hạt giống cho mùa sau nằm trong một kho riêng, cái đói bắt đầu có chủ. |
| `era1-worker-revolution.mp3` | Ngày đất và tù binh bị tính thành của cải, cộng đồng cũ không còn nguyên vẹn nữa. |
| `era1-historian-enter.mp3` | Chưa có giai cấp. Chưa có nhà nước. Nhưng năng suất thấp buộc sở hữu chung tồn tại. |
| `era1-historian-tension.mp3` | Nông nghiệp tạo thặng dư; thặng dư tạo khả năng tư hữu; tư hữu mở cửa cho phân tầng. |
| `era1-historian-revolution.mp3` | Cuộc cách mạng nông nghiệp là nền vật chất làm xã hội có giai cấp trở nên khả thi. |

## Era 2 - Chiếm hữu nô lệ

| File | Voice text |
| --- | --- |
| `era2-ruler-enter.mp3` | Đế chế cần ruộng, mỏ và thân người lao động. Luật pháp được viết để bảo vệ quyền sở hữu ấy. |
| `era2-ruler-tension.mp3` | Khi nô lệ chỉ làm vì roi, sản xuất phải mua thêm bạo lực để tự tiếp tục. |
| `era2-ruler-revolution.mp3` | Một trật tự sống bằng cưỡng bức sẽ sụp khi cưỡng bức đắt hơn sản phẩm nó lấy được. |
| `era2-worker-enter.mp3` | Ta không được gọi là người, nhưng chính tay ta cày ruộng, xây thành và rèn vũ khí. |
| `era2-worker-tension.mp3` | Mỗi đòn roi giữ yên một ngày, rồi để lại trong đêm một lời hứa bỏ trốn. |
| `era2-worker-revolution.mp3` | Xiềng xích bị bẻ không chỉ để chạy. Nó bị bẻ để nói rằng công cụ biết nói đã thành người. |
| `era2-historian-enter.mp3` | Chế độ nô lệ biến con người thành tư liệu sản xuất và cần nhà nước để bảo vệ quan hệ đó. |
| `era2-historian-tension.mp3` | Lao động cưỡng bức kìm hãm kỹ thuật: khi người rẻ hơn máy, phát minh bị bỏ quên. |
| `era2-historian-revolution.mp3` | Sự tan rã của nô lệ mở đường cho nông nô: một quan hệ lệ thuộc mềm hơn nhưng vẫn bóc lột. |

## Era 3 - Phong kiến

| File | Voice text |
| --- | --- |
| `era3-ruler-enter.mp3` | Đất đai nuôi triều đình. Tô thuế nuôi lãnh chúa. Chính danh giữ nông nô ở lại ruộng. |
| `era3-ruler-tension.mp3` | Thị dân và thương nhân mang tiền vào thành, còn đặc quyền cũ không biết phải chứa họ ở đâu. |
| `era3-ruler-revolution.mp3` | Khi thị trường lớn hơn lãnh địa, ngai vàng chỉ còn chọn cải cách hoặc bị lật qua cổng thành. |
| `era3-worker-enter.mp3` | Ta sinh trên đất của lãnh chúa, nộp tô trên đất ấy, và bị gọi là kẻ mang ơn. |
| `era3-worker-tension.mp3` | Trong phố, người ta nói về tự do. Ngoài ruộng, sổ tô vẫn ghi tên từng nhà. |
| `era3-worker-revolution.mp3` | Đốt sổ tô không đủ. Phải xóa cả quyền nói rằng đời ta thuộc về đất của người khác. |
| `era3-historian-enter.mp3` | Phong kiến đặt quyền lực trên sở hữu đất và ràng buộc cá nhân qua tô, thân phận, giáo hội. |
| `era3-historian-tension.mp3` | Thị trường hàng hóa và tích lũy tư bản nguyên thủy làm quan hệ phong kiến thành vật cản. |
| `era3-historian-revolution.mp3` | Cách mạng tư sản phá đặc quyền phong kiến, nhưng quyền lực mới chuyển vào sở hữu tư bản. |

## Era 4 - Tư bản chủ nghĩa

| File | Voice text |
| --- | --- |
| `era4-ruler-enter.mp3` | Nhà máy chạy vì lợi nhuận. Lao động tự do ký hợp đồng, nhưng không sở hữu thứ mình vận hành. |
| `era4-ruler-tension.mp3` | Kho đầy không cứu được thị trường khi người sản xuất ra hàng hóa không đủ sức mua hàng hóa. |
| `era4-ruler-revolution.mp3` | Tư bản tạo ra công nhân tập thể, rồi kinh ngạc khi tập thể ấy đòi quyền sở hữu. |
| `era4-worker-enter.mp3` | Ta tự do bán sức lao động, và tự do đói nếu không ai mua nó. |
| `era4-worker-tension.mp3` | Máy chạy nhanh hơn, định mức cao hơn, lương đứng yên. Mâu thuẫn bước vào từng ca làm. |
| `era4-worker-revolution.mp3` | Khi ta hiểu nhà máy sống nhờ tay mình, câu hỏi không còn là xin thêm, mà là giành lại. |
| `era4-historian-enter.mp3` | CNTB giải phóng lao động khỏi lãnh chúa để buộc nó bán mình trên thị trường. |
| `era4-historian-tension.mp3` | Sản xuất xã hội hóa và chiếm hữu tư nhân là mâu thuẫn cơ bản của phương thức tư bản. |
| `era4-historian-revolution.mp3` | Tự động hóa đẩy mâu thuẫn tới cực hạn: lực lượng sản xuất đòi một quan hệ sở hữu khác. |

## Era 5 - Cộng sản chủ nghĩa

| File | Voice text |
| --- | --- |
| `era5-ruler-enter.mp3` | Sở hữu xã hội mở ra khả năng kế hoạch hóa, nhưng quyền lực chung phải được kiểm soát chung. |
| `era5-ruler-tension.mp3` | Quan liêu không phải tàn dư nhỏ. Nó là nguy cơ biến bộ máy đại diện thành lợi ích riêng. |
| `era5-ruler-revolution.mp3` | Hình thái mới không thắng bằng tuyên bố; nó thắng khi quan hệ hằng ngày không tái sinh đặc quyền. |
| `era5-worker-enter.mp3` | Máy móc làm bớt phần nặng. Lần đầu, thời gian tự do có thể thuộc về người lao động. |
| `era5-worker-tension.mp3` | Nếu dữ liệu chung bị khóa trong tay một nhóm, hình thức mới sẽ nuôi lại bất bình đẳng cũ. |
| `era5-worker-revolution.mp3` | Tự quản không phải khẩu hiệu. Nó là quyền bầu, bãi nhiệm và kiểm soát thứ ta cùng sở hữu. |
| `era5-historian-enter.mp3` | CSCN bắt đầu khi tư liệu sản xuất chủ yếu không còn là tài sản tư nhân của giai cấp bóc lột. |
| `era5-historian-tension.mp3` | Tự động hóa không tự giải phóng. Quan hệ sở hữu quyết định công nghệ phục vụ ai. |
| `era5-historian-revolution.mp3` | Một hình thái hậu tư bản phải được đo bằng quan hệ thật, không chỉ bằng tên gọi của nhà nước. |
