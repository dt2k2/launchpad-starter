/**
 * Ending templates v2 — match against the full final state (path history,
 * memory, pressures, perspective). The resolver picks the first match.
 */
import type { SimState } from "../../components/minigame/sim/simStore";
import type { PerspectiveId } from "../historicalSim";
import { hasMemory } from "../memory";
import type { PathOutcome } from "../transition/outcomes";

export type EndingTone = "somber" | "defiant" | "frozen" | "hopeful" | "ironic" | "fractured";

export interface EndingTemplate {
  id: string;
  tone: EndingTone;
  title: string;
  match: (s: SimState) => boolean;
  narration: Record<PerspectiveId, { body: string; epitaph: string }>;
  reflectiveQuestion: string;
}

const lastOutcome = (s: SimState): PathOutcome | undefined => s.stagePath?.[s.stagePath.length - 1];
const countOutcomes = (s: SimState, o: PathOutcome) => (s.stagePath ?? []).filter((x) => x === o).length;

export const ENDING_TEMPLATES: EndingTemplate[] = [
  {
    id: "collapse_chain",
    tone: "fractured",
    title: "Phân mảnh kéo dài",
    match: (s) => countOutcomes(s, "collapse") >= 1 && hasMemory(s.memory, "collapse_scar"),
    narration: {
      ruler: {
        body: "Các tỉnh xa đã ngừng nộp thuế. Cận vệ rời thành. Văn thư cuối cùng ngài ký không còn ai để chuyển đi.",
        epitaph: "Một trật tự không sụp một lần — nó tan thành nhiều mảnh nhỏ.",
      },
      worker: {
        body: "Không còn cai. Không còn chủ. Cũng không còn dây chuyền nào để chiếm. Mọi người tự lo cho gia đình mình.",
        epitaph: "Tự do trong đổ vỡ không phải tự do giải phóng.",
      },
      historian: {
        body: "Chuỗi sản xuất đứt. Đô thị co lại. Một thế hệ trí tuệ bị mất theo. Chu kỳ phục hồi sẽ kéo dài hàng thế kỷ.",
        epitaph: "Phản ví dụ giá trị: chứng minh tiến hoá không tự động.",
      },
    },
    reflectiveQuestion: "Có ai chịu trách nhiệm khi cả một xã hội tan rã từ bên trong?",
  },
  {
    id: "authoritarian_continuity",
    tone: "frozen",
    title: "Trật tự sắt — và lạnh",
    match: (s) => countOutcomes(s, "suppress") >= 1 || (s.pressures.repression > 70 && s.metrics.stability > 55),
    narration: {
      ruler: {
        body: "Ngài thắng. Không ai dám nói trái. Hệ thống ngầm bị quét. Ngai vàng vẫn còn — và lịch sử cũng vẫn còn, nhưng ngài không còn tham gia vào nó.",
        epitaph: "Trật tự cứng nhất là trật tự không còn ai để cải cách.",
      },
      worker: {
        body: "Họ bắt người tổ chức cuối cùng đêm qua. Anh em không tụ tập nữa. Chỉ còn những ánh mắt — chưa quên gì.",
        epitaph: "Im lặng là một dạng tích luỹ. Một ngày nó sẽ trả lãi.",
      },
      historian: {
        body: "Dữ liệu cho thấy: nhà nước bóp nghẹt mâu thuẫn không xoá nó — chỉ chuyển nó vào thì tương lai.",
        epitaph: "Mâu thuẫn không bị triệt tiêu, chỉ bị hoãn.",
      },
    },
    reflectiveQuestion: "Bạn có chấp nhận trật tự được giữ bằng cái giá nào?",
  },
  {
    id: "failed_uprising_legacy",
    tone: "somber",
    title: "Cờ rách — nhưng vẫn còn",
    match: (s) => hasMemory(s.memory, "failed_revolt") && !hasMemory(s.memory, "rupture_legacy"),
    narration: {
      ruler: {
        body: "Khởi nghĩa đã bị dập. Nhưng từ đêm đó, mỗi quyết định của ngài đều có một bóng ma dự khán.",
        epitaph: "Người chiến thắng một trận đôi khi thua cả thế kỷ.",
      },
      worker: {
        body: "Cô ấy không trở về. Bài hát cũ đã bị cấm. Nhưng trẻ con ở khu mình vẫn ngân nga một đoạn — không ai biết từ đâu.",
        epitaph: "Thất bại được nhớ kỹ hơn cả chiến thắng được tổ chức tồi.",
      },
      historian: {
        body: "Hồ sơ ghi: đàn áp thành công, phong trào tan rã. Hồ sơ không ghi: ý thức được giữ lại trong gia đình, qua hai thế hệ, chờ điều kiện vật chất chín muồi.",
        epitaph: "Lịch sử có trí nhớ dài hơn nhà nước.",
      },
    },
    reflectiveQuestion: "Một thất bại tổ chức tốt có giá trị gì so với một chiến thắng ngẫu nhiên?",
  },
  {
    id: "stagnation_long",
    tone: "frozen",
    title: "Thế kỷ trượt qua",
    match: (s) => countOutcomes(s, "freeze") >= 2 || hasMemory(s.memory, "stagnation_decade"),
    narration: {
      ruler: {
        body: "Không có khởi nghĩa nào để đè nén. Không có cải cách nào để ký. Ngài cai trị một xã hội đã quên cách thay đổi.",
        epitaph: "Cai trị mà không có lịch sử cũng là một dạng chết.",
      },
      worker: {
        body: "Cha mày cũng vào ca này. Ông nội mày cũng vào ca này. Con mày cũng sẽ vào ca này.",
        epitaph: "Khi không còn ai tin có thể đổi, áp lực không tích luỹ — nó bay hơi.",
      },
      historian: {
        body: "LLSX không đẩy QHSX. Áp lực chủ quan không hình thành. Đây là dạng quá độ thất bại nhất — vì không có gì để học từ nó.",
        epitaph: "Phản ví dụ: tiến hoá không tự động.",
      },
    },
    reflectiveQuestion: "Tại sao có những xã hội đứng im hàng thế kỷ?",
  },
  {
    id: "rupture_won",
    tone: "defiant",
    title: "Đứt gãy thắng lợi",
    match: (s) => countOutcomes(s, "rupture") >= 1 && s.stagesCompleted >= 4,
    narration: {
      ruler: {
        body: "Ngài đã ký vào văn bản cuối cùng — bàn giao cổ phần chiến lược cho hợp tác xã. Không vinh quang, không nhục nhã. Chỉ là kết thúc của một logic đã hết hạn.",
        epitaph: "Một giai cấp biết tự rút lui — hiếm.",
      },
      worker: {
        body: "Máy móc làm phần lớn việc. Anh em quyết định làm gì với thời gian còn lại. Lần đầu tiên, lao động không còn là gánh nặng để sống — mà là cách sống.",
        epitaph: "'Vương quốc tự do' không phải khẩu hiệu nữa. Nó là thời khoá biểu sáng thứ Hai.",
      },
      historian: {
        body: "Một chuỗi đứt gãy thành công đẩy quan hệ sản xuất qua các hình thái. Lý thuyết hậu-tư bản chuyển từ tiên tri sang mô tả.",
        epitaph: "Cần khung phân loại mới.",
      },
    },
    reflectiveQuestion: "Bạn sẵn sàng trả cái giá nào để rút ngắn vài thế kỷ?",
  },
  {
    id: "rupture_unfinished",
    tone: "somber",
    title: "Đứt gãy chưa xong",
    match: (s) => countOutcomes(s, "rupture") >= 1,
    narration: {
      ruler: {
        body: "Trật tự cũ vỡ. Trật tự mới chưa kịp dựng. Khoảng trống này là chỗ cho cả hy vọng và cho cả những kẻ tệ nhất.",
        epitaph: "Đứt gãy là điều kiện cần. Không phải điều kiện đủ.",
      },
      worker: {
        body: "Anh em ký tên — nhưng ai sẽ đọc? Quyền lực đã rời tay chủ cũ mà chưa đến tay ta. Ai sẽ tổ chức ngày mai?",
        epitaph: "Cách mạng không kết thúc bằng vụ cháy dinh.",
      },
      historian: {
        body: "Khoảng trống thể chế sau đứt gãy thường kéo dài 1–2 thập kỷ. Kết quả phụ thuộc cấu trúc tổ chức tiền-rupture.",
        epitaph: "Đứt gãy mở cánh cửa. Tổ chức bước qua cánh cửa đó.",
      },
    },
    reflectiveQuestion: "Sau khi đập đổ cái cũ, ai sẽ dựng cái mới — và theo nguyên tắc nào?",
  },
  {
    id: "linear_reform",
    tone: "hopeful",
    title: "Cải cách thay vì cách mạng",
    match: (s) => s.stagesCompleted >= 4 && countOutcomes(s, "evolve") >= 3,
    narration: {
      ruler: {
        body: "Ngươi đã cải cách đúng lúc, nhượng bộ đủ liều. Ngai vàng còn đó. Quyền lực loãng đi qua mỗi lần ký tên.",
        epitaph: "Một vị vua khôn ngoan — và một trật tự đang chết dần.",
      },
      worker: {
        body: "Tăng lương, giảm giờ, bảo hiểm. Nhưng máy móc vẫn không thuộc về ta. Đấu tranh bị hoãn — chưa bị dập tắt.",
        epitaph: "Mỗi thế hệ phải tự đặt lại câu hỏi: cải cách đến đâu là đủ?",
      },
      historian: {
        body: "Năm hình thái nối tiếp nhau qua cải cách. QHSX biến đổi đủ nhanh để chứa LLSX mới.",
        epitaph: "Trường hợp mẫu cho luận đề 'quá độ hoà bình'.",
      },
    },
    reflectiveQuestion: "Cải cách có phải là một dạng quản trị mâu thuẫn — hay một dạng hoãn nó?",
  },
  {
    id: "unresolved",
    tone: "ironic",
    title: "Chưa giải quyết",
    match: () => true, // fallback
    narration: {
      ruler: { body: "Trò chơi kết thúc trước khi câu chuyện kết thúc. Mọi cấu trúc ngài giữ vẫn còn — và vẫn căng thẳng.", epitaph: "Một số đế chế chết vì chiến tranh. Một số chết vì hết thời gian." },
      worker: { body: "Tổ chức chưa đủ. Áp lực chưa đỉnh. Lịch sử không chờ ai, nhưng cũng không nhanh hơn điều kiện vật chất cho phép.", epitaph: "Chờ là một dạng tích luỹ. Chờ mãi là một dạng đầu hàng." },
      historian: { body: "Hồ sơ chưa đóng. Mâu thuẫn cơ bản vẫn còn nguyên — chỉ chuyển hình thức.", epitaph: "Mọi 'kết thúc lịch sử' đều là một sai lệch quan sát." },
    },
    reflectiveQuestion: "Điều gì xảy ra với những mâu thuẫn chưa được giải quyết khi câu chuyện ngừng kể?",
  },
];

export function resolveEnding(s: SimState): EndingTemplate {
  return ENDING_TEMPLATES.find((t) => t.match(s)) ?? ENDING_TEMPLATES[ENDING_TEMPLATES.length - 1];
}
