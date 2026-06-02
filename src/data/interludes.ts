import type { DecisionOption, PerspectiveId } from "./historicalSim";

export type InterludeKind = "dark_age" | "consolidation";

export interface InterludeConfig {
  id: InterludeKind;
  eyebrow: string;
  title: string;
  body: string;
  prompt: string;
  options: Record<PerspectiveId, DecisionOption[]>;
}

export const INTERLUDES: Record<InterludeKind, InterludeConfig> = {
  dark_age: {
    id: "dark_age",
    eyebrow: "Khoảng tối lịch sử",
    title: "Thời kỳ đen tối",
    body:
      "Sụp đổ không sinh ra hình thái mới ngay lập tức. Sản xuất đứt gãy, tri thức thất lạc, quyền lực tan thành mảnh nhỏ. Xã hội bước sang era kế tiếp với một vết sẹo vật chất.",
    prompt: "Trong khoảng trống sau sụp đổ, điều gì được cứu trước?",
    options: {
      ruler: [
        {
          id: "dark-ruler-granary",
          label: "Lập kho lương và đội hộ vệ",
          flavor:
            "Tái lập trật tự tối thiểu quanh lương thực, nhưng quyền lực địa phương sẽ trở lại dưới hình thức cưỡng chế.",
          effect: { stability: 10, production: 4, contradiction: 5 },
          causeChain: [
            "Lương thực được tập trung lại",
            "→ Bạo lực bảo vệ kho thay thế luật chung",
            "→ Trật tự phục hồi một phần, nhưng chính danh vẫn rạn",
          ],
          tag: "reactionary",
        },
        {
          id: "dark-ruler-charter",
          label: "Nhượng tự trị cho các cộng đồng sống sót",
          flavor:
            "Trung tâm yếu đi để cơ sở tự cứu lấy mình. Sự phục hồi chậm hơn, nhưng ít đốt thêm mâu thuẫn.",
          effect: { stability: 4, production: 7, contradiction: -4, revolution: -2 },
          causeChain: [
            "Các làng tự quản phần sinh tồn",
            "→ Sản xuất nhỏ nối lại trước nhà nước",
            "→ Mâu thuẫn hạ nhiệt vì cưỡng chế trung tâm giảm",
          ],
          tag: "concession",
        },
        {
          id: "dark-ruler-requisition",
          label: "Trưng thu để dựng lại trung tâm",
          flavor:
            "Tập trung nguồn lực có thể dựng lại đường sá và kho xưởng nhanh hơn, nhưng người sống sót phải trả giá ngay.",
          effect: { production: 10, stability: -6, contradiction: 8 },
          causeChain: [
            "Trung tâm thu gom nhân lực và vật lực",
            "→ Hạ tầng phục hồi nhanh hơn",
            "→ Cưỡng bức sau sụp đổ làm vết nứt xã hội sâu thêm",
          ],
          tag: "emergency",
        },
      ],
      worker: [
        {
          id: "dark-worker-commune",
          label: "Dựng công xã cứu đói",
          flavor:
            "Chia lương thực, nối lại lao động chung, giữ người sống sót khỏi bị kéo về lệ thuộc cá nhân.",
          effect: { stability: 8, production: 5, contradiction: -2, revolution: 4 },
          causeChain: [
            "Người sống sót chia nhau kho và công cụ",
            "→ Lao động chung thay thế mệnh lệnh cũ",
            "→ Ý thức tự quản sống sót qua thời kỳ đen tối",
          ],
          progressive: true,
          tag: "reform",
        },
        {
          id: "dark-worker-network",
          label: "Giữ mạng lưới ngầm",
          flavor:
            "Không đủ sức dựng xã hội mới, nhưng còn đủ để người bị trị nhận ra nhau khi trật tự quay lại.",
          effect: { revolution: 8, contradiction: 3, stability: -3 },
          causeChain: [
            "Nhóm nhỏ giữ liên lạc qua đổ vỡ",
            "→ Ký ức đấu tranh không bị xoá",
            "→ Tổ chức tương lai có mầm sống",
          ],
          progressive: true,
          tag: "uprising",
        },
        {
          id: "dark-worker-household",
          label: "Rút về sinh tồn gia đình",
          flavor:
            "Đây là lựa chọn dễ hiểu khi đói rét quá gần. Nó cứu một phần đời sống, nhưng làm tổ chức chung tan mỏng.",
          effect: { stability: 4, production: -2, contradiction: -5, revolution: -5 },
          causeChain: [
            "Gia đình trở thành đơn vị sinh tồn cuối cùng",
            "→ Áp lực trước mắt giảm",
            "→ Năng lực hành động tập thể bị bào mòn",
          ],
          tag: "neutral",
        },
      ],
      historian: [
        {
          id: "dark-historian-archive",
          label: "Cứu văn khố kỹ thuật",
          flavor:
            "Một bản đồ tưới tiêu, một công thức luyện kim, một sổ kho có thể rút ngắn hàng thập kỷ phục hồi.",
          effect: { tech: 8, production: 2, stability: -2 },
          causeChain: [
            "Tri thức vật chất được bảo toàn",
            "→ Era kế tiếp không bắt đầu từ số không",
            "→ Lịch sử cho thấy công nghệ cũng có thể thất truyền",
          ],
          tag: "document",
        },
        {
          id: "dark-historian-chronicle",
          label: "Lập niên biểu sụp đổ",
          flavor:
            "Không chỉ ghi ai thua, mà ghi vì sao sản xuất, chính danh và tổ chức cùng gãy.",
          effect: { tech: 5, contradiction: -3 },
          causeChain: [
            "Chuỗi nhân quả được dựng lại",
            "→ Sụp đổ không còn là tai họa mù mờ",
            "→ Thế hệ sau nhìn được giới hạn của trật tự cũ",
          ],
          tag: "document",
        },
        {
          id: "dark-historian-survivors",
          label: "Ghi lời kể người sống sót",
          flavor:
            "Dữ liệu của người thường giữ lại phần lịch sử mà văn thư chính quyền đánh mất đầu tiên.",
          effect: { tech: 4, stability: 3, revolution: 2 },
          causeChain: [
            "Ký ức dân gian được lưu lại",
            "→ Tổn thất xã hội có khuôn mặt cụ thể",
            "→ Lịch sử không chỉ còn tiếng nói của người thắng",
          ],
          tag: "document",
        },
      ],
    },
  },
  consolidation: {
    id: "consolidation",
    eyebrow: "Sau đứt gãy",
    title: "Xây cái mới",
    body:
      "Cách mạng chỉ mở cửa. Quan hệ sản xuất mới phải được tổ chức trong đời sống hằng ngày, nếu không khoảng trống sẽ gọi bộ máy cũ quay lại dưới tên khác.",
    prompt: "Sau khi cái cũ vỡ, nguyên tắc nào giữ xã hội mới không trượt ngược?",
    options: {
      ruler: [
        {
          id: "cons-ruler-charter",
          label: "Hợp thức hóa trật tự mới bằng hiến chương",
          flavor:
            "Quyền lực cũ rút lui một phần để đổi lấy ổn định và một vị trí trong cấu trúc mới.",
          effect: { stability: 10, contradiction: -5, revolution: -4 },
          causeChain: [
            "Trật tự mới được ghi thành luật",
            "→ Chuyển giao bớt lệ thuộc vào bạo lực đường phố",
            "→ Mâu thuẫn hạ nhiệt vì quyền sở hữu đã đổi hình thức",
          ],
          progressive: true,
          tag: "reform",
        },
        {
          id: "cons-ruler-old-bureaucracy",
          label: "Giữ bộ máy cũ để điều phối nhanh",
          flavor:
            "Sản xuất cần chạy lại ngay, nhưng bộ máy quen ra lệnh có thể biến thành lợi ích riêng mới.",
          effect: { production: 8, stability: 4, contradiction: 7 },
          causeChain: [
            "Cán bộ cũ giữ nhịp phân phối",
            "→ Hạ tầng ít bị đứt đoạn",
            "→ Quan liêu có cơ hội tái sinh như tầng lớp đặc quyền",
          ],
          tag: "reactionary",
        },
        {
          id: "cons-ruler-audit",
          label: "Mở kiểm toán quyền lực bắt buộc",
          flavor:
            "Bộ máy vẫn cần điều phối, nhưng mọi quyết định lớn phải để lại dấu vết cho xã hội kiểm tra.",
          effect: { stability: 6, tech: 4, contradiction: -6 },
          causeChain: [
            "Quyền lực được ghi dấu và kiểm chứng",
            "→ Chính danh của điều phối tăng",
            "→ Nguy cơ phục hồi đặc quyền giảm",
          ],
          progressive: true,
          tag: "reform",
        },
      ],
      worker: [
        {
          id: "cons-worker-councils",
          label: "Bầu hội đồng có quyền bãi nhiệm",
          flavor:
            "Người lao động không chỉ lật chủ cũ; họ giữ quyền sửa người đại diện khi đại diện xa cơ sở.",
          effect: { stability: 9, production: 3, contradiction: -8, revolution: -3 },
          causeChain: [
            "Hội đồng được bầu từ nơi sản xuất",
            "→ Đại biểu có thể bị bãi nhiệm",
            "→ Quan hệ sở hữu mới có cơ chế tự bảo vệ",
          ],
          progressive: true,
          tag: "reform",
        },
        {
          id: "cons-worker-self-management",
          label: "Chiếm và tự quản nơi sản xuất",
          flavor:
            "Nhà máy, ruộng đất, nền tảng không còn chỉ đổi chủ trên giấy mà đổi cách vận hành.",
          effect: { production: 8, contradiction: -3, revolution: 5, stability: -3 },
          causeChain: [
            "Người lao động quản trực tiếp tư liệu sản xuất",
            "→ Năng suất phục hồi bằng động lực mới",
            "→ Xung đột ngắn hạn tăng vì quyền sở hữu bị chạm vào tận gốc",
          ],
          progressive: true,
          tag: "uprising",
        },
        {
          id: "cons-worker-rations",
          label: "Chia ngay kho dự trữ",
          flavor:
            "Nhu cầu sống còn phải được đáp ứng trước, dù sản xuất dài hạn cần một kế hoạch chặt hơn.",
          effect: { stability: 6, production: -4, contradiction: -3, revolution: -5 },
          causeChain: [
            "Kho dự trữ được mở cho nhu cầu trực tiếp",
            "→ Sự ủng hộ xã hội tăng",
            "→ Tái sản xuất dài hạn cần được giải quyết sau",
          ],
          progressive: true,
          tag: "concession",
        },
      ],
      historian: [
        {
          id: "cons-historian-property",
          label: "Lưu hồ sơ sở hữu mới",
          flavor:
            "Cách mạng thất bại trong trí nhớ nếu không ai ghi chính xác tư liệu sản xuất đã chuyển từ ai sang ai.",
          effect: { tech: 7, contradiction: -4 },
          causeChain: [
            "Sở hữu mới được tư liệu hóa",
            "→ Tranh chấp sau cách mạng có bằng chứng",
            "→ Lý luận không tách khỏi vật chất",
          ],
          tag: "document",
        },
        {
          id: "cons-historian-restoration",
          label: "So sánh cách mạng và phục hồi",
          flavor:
            "Mỗi đứt gãy đều có bóng của phản cách mạng. Ghi nó lại để không nhầm thắng lợi với ổn định.",
          effect: { tech: 6, contradiction: 1 },
          causeChain: [
            "Dấu hiệu phục hồi trật tự cũ được đối chiếu",
            "→ Khoảng trống thể chế được nhìn như một nguy cơ",
            "→ Lịch sử giữ lại bài học về counter-revolution",
          ],
          tag: "document",
        },
        {
          id: "cons-historian-bureaucracy",
          label: "Ghi cơ chế kiểm soát quan liêu",
          flavor:
            "Một xã hội mới phải được đo bằng cơ chế chống đặc quyền, không chỉ bằng tên gọi của nó.",
          effect: { tech: 5, stability: 4, contradiction: -5 },
          causeChain: [
            "Quy trình kiểm soát bộ máy được ghi lại",
            "→ Tổ chức mới có tiêu chí tự phê bình",
            "→ Nguy cơ tầng lớp đặc quyền mới giảm",
          ],
          tag: "document",
        },
      ],
    },
  },
};

export function getInterlude(kind: InterludeKind): InterludeConfig {
  return INTERLUDES[kind];
}

export function resolveInterludeOptions(
  kind: InterludeKind,
  perspective: PerspectiveId,
): DecisionOption[] {
  return INTERLUDES[kind].options[perspective];
}
