/**
 * Transition outcomes — the 6 ways a stage can end.
 * Stage advance is NOT guaranteed; only `evolve` and `rupture` move forward.
 */
export type PathOutcome =
  | "evolve"          // normal advance to the next stage
  | "rupture"         // revolutionary advance (existing cinematic)
  | "freeze"          // stagnation — repeat stage with decay + memory
  | "collapse"        // breakdown — heavy metric loss, dark-age modifier
  | "suppress"        // authoritarian lock-in — reform locked rest of run
  | "failed_uprising" // revolt crushed — repression+, organization halved
  ;

export interface OutcomeNarration {
  title: string;
  body: string;
  tone: "calm" | "tense" | "rupture" | "uneasy" | "urgent" | "fractured" | "strained";
}

export const OUTCOME_NARRATION: Record<PathOutcome, OutcomeNarration> = {
  evolve: {
    title: "Quá độ êm dịu",
    body: "Lực lượng sản xuất mới len lỏi vào vỏ cũ. Không đứt gãy, không đổ vỡ — chỉ có sự lệch chuyển.",
    tone: "calm",
  },
  rupture: {
    title: "Đứt gãy",
    body: "Trật tự cũ tan vỡ. Một quan hệ sản xuất mới tự tổ chức trong đống tro tàn.",
    tone: "rupture",
  },
  freeze: {
    title: "Đóng băng",
    body: "Không đủ áp lực để chuyển hoá, cũng không đủ sức để tự đổi mới. Một thập kỷ trượt qua mà chẳng có gì xảy ra.",
    tone: "uneasy",
  },
  collapse: {
    title: "Sụp đổ",
    body: "Sản xuất kiệt quệ, chính quyền tan rã, dân chúng phân tán. Lịch sử thụt lùi.",
    tone: "fractured",
  },
  suppress: {
    title: "Đàn áp toàn diện",
    body: "Trật tự được giữ — bằng nhà tù, mật vụ, và sự im lặng. Cánh cửa cải cách đã khép.",
    tone: "strained",
  },
  failed_uprising: {
    title: "Khởi nghĩa thất bại",
    body: "Cờ bị xé. Người tổ chức bị bắt. Ký ức về thất bại này sẽ đè nặng một thế hệ.",
    tone: "fractured",
  },
};
