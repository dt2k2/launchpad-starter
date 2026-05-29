/**
 * Companion lines — lightweight human presence per perspective.
 * Triggers are matched at runtime; the first matching, not-yet-said line fires.
 */
import type { PerspectiveId } from "@/data/historicalSim";
import type { MemoryTagId } from "@/data/memory";
import type { PathOutcome } from "@/data/transition/outcomes";

export type CompanionTrigger =
  | { kind: "stage_start" }
  | { kind: "high_pressure" }       // tier >= unstable
  | { kind: "rupture" }
  | { kind: "outcome"; outcome: PathOutcome }
  | { kind: "memory"; tag: MemoryTagId };

export interface CompanionLine {
  id: string;
  perspective: PerspectiveId;
  trigger: CompanionTrigger["kind"];
  match?: (ctx: { outcome?: PathOutcome; tag?: MemoryTagId; stage?: string }) => boolean;
  text: string;
  speaker: string;
}

export const COMPANION_SPEAKER: Record<PerspectiveId, { name: string; role: string; emoji: string }> = {
  ruler:     { name: "Cận thần", role: "Người cố vấn", emoji: "✒" },
  worker:    { name: "Đồng chí", role: "Người cùng tổ", emoji: "✊" },
  historian: { name: "Trợ lý lưu trữ", role: "Văn thư", emoji: "📜" },
};

export const COMPANION_LINES: CompanionLine[] = [
  // ───── RULER ─────
  { id: "r-start-1", perspective: "ruler", trigger: "stage_start", speaker: "Cận thần",
    text: "Bẩm, các lãnh chúa đất xa đang chậm nộp thuế. Họ chờ xem ngài có cứng tay không." },
  { id: "r-start-2", perspective: "ruler", trigger: "stage_start", speaker: "Cận thần",
    text: "Một bản tấu trình mới đêm qua. Lại là chuyện kho lương." },
  { id: "r-press-1", perspective: "ruler", trigger: "high_pressure", speaker: "Cận thần",
    text: "Bẩm, có tin các cận vệ chưa nhận lương đã ba tháng." },
  { id: "r-press-2", perspective: "ruler", trigger: "high_pressure", speaker: "Cận thần",
    text: "Người ngoài thành đang bàn tán điều mà người trong thành đã quên cách nghe." },
  { id: "r-rupt", perspective: "ruler", trigger: "rupture", speaker: "Cận thần",
    text: "Ngài… không nên dùng cửa chính nữa." },
  { id: "r-supp", perspective: "ruler", trigger: "outcome", match: ({outcome})=>outcome==="suppress",
    speaker: "Cận thần", text: "Họ im. Nhưng cái im này không giống cái im của trật tự." },
  { id: "r-fail", perspective: "ruler", trigger: "outcome", match: ({outcome})=>outcome==="failed_uprising",
    speaker: "Cận thần", text: "Đã giải tán. Đã treo cờ. Chuyện này nên ghi vào sổ ngắn gọn thôi." },

  // ───── WORKER ─────
  { id: "w-start-1", perspective: "worker", trigger: "stage_start", speaker: "Đồng chí",
    text: "Hôm nay Maria không ra ca. Đã ba ngày rồi." },
  { id: "w-start-2", perspective: "worker", trigger: "stage_start", speaker: "Đồng chí",
    text: "Em trai tao vẫn không chịu ăn bánh. Nó nhớ vị bánh trước cái mùa đó." },
  { id: "w-press-1", perspective: "worker", trigger: "high_pressure", speaker: "Đồng chí",
    text: "Đêm qua lại có người gõ cửa. Mày có nghe không?" },
  { id: "w-press-2", perspective: "worker", trigger: "high_pressure", speaker: "Đồng chí",
    text: "Bọn cai bắt đầu đếm số người ra ca từng giờ. Nó đang đợi cớ." },
  { id: "w-rupt", perspective: "worker", trigger: "rupture", speaker: "Đồng chí",
    text: "Hôm nay tao ký tên — không phải để xin việc. Mày hiểu chưa?" },
  { id: "w-fail", perspective: "worker", trigger: "outcome", match: ({outcome})=>outcome==="failed_uprising",
    speaker: "Đồng chí", text: "Đừng nói tên cô ấy ngoài đường nữa. Đừng." },
  { id: "w-supp", perspective: "worker", trigger: "outcome", match: ({outcome})=>outcome==="suppress",
    speaker: "Đồng chí", text: "Có người mất tích đêm qua. Không phải lần đầu. Đừng tin ai cười với mày." },

  // ───── HISTORIAN ─────
  { id: "h-start-1", perspective: "historian", trigger: "stage_start", speaker: "Trợ lý",
    text: "Đối chiếu sơ bộ: mẫu này gần với chu kỳ 1848. Cần thêm dữ liệu." },
  { id: "h-start-2", perspective: "historian", trigger: "stage_start", speaker: "Trợ lý",
    text: "Hồ sơ thuế của giai đoạn trước có một khoảng trống lạ. Em đánh dấu để xem lại." },
  { id: "h-press-1", perspective: "historian", trigger: "high_pressure", speaker: "Trợ lý",
    text: "Chỉ số mất chính danh đang nhích lên với hình dạng quen thuộc. Ta đã thấy nó trước." },
  { id: "h-rupt", perspective: "historian", trigger: "rupture", speaker: "Trợ lý",
    text: "Em sẽ đánh dấu thời điểm này. Sau này nó sẽ có một cái tên." },
  { id: "h-collapse", perspective: "historian", trigger: "outcome", match: ({outcome})=>outcome==="collapse",
    speaker: "Trợ lý", text: "Chúng ta sẽ mất một thế hệ dữ liệu sau cái này." },
  { id: "h-freeze", perspective: "historian", trigger: "outcome", match: ({outcome})=>outcome==="freeze",
    speaker: "Trợ lý", text: "Không có gì để ghi. Bản thân điều đó cũng là một dữ liệu." },
];

export function pickCompanionLine(
  perspective: PerspectiveId,
  trigger: CompanionTrigger,
  said: Set<string>,
): CompanionLine | null {
  const ctx: any = { outcome: (trigger as any).outcome, tag: (trigger as any).tag };
  const pool = COMPANION_LINES.filter(
    (l) => l.perspective === perspective && l.trigger === trigger.kind && (!l.match || l.match(ctx)),
  );
  const unsaid = pool.filter((l) => !said.has(l.id));
  if (unsaid.length === 0) {
    // allow repeats only if exhausted
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }
  return unsaid[Math.floor(Math.random() * unsaid.length)];
}
