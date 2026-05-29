/**
 * Historical memory system — tags persist across eras and shape narration,
 * events, and endings.
 */
import type { EraId } from "@/data/eras";
import type { PerspectiveId } from "@/data/historicalSim";

export type MemoryTagId =
  | "mass_repression"
  | "failed_revolt"
  | "successful_reform"
  | "famine"
  | "elite_purge"
  | "underground_network"
  | "collapse_scar"
  | "rupture_legacy"
  | "stagnation_decade"
  | "betrayed_promise"
  | "general_strike";

export interface MemoryTag {
  id: MemoryTagId;
  stage: EraId;
  weight: number;             // 0..1 — decays each stage
  perspective?: PerspectiveId;
  note?: string;              // short caption
}

export const MEMORY_META: Record<MemoryTagId, { label: string; icon: string; echo: string }> = {
  mass_repression:     { label: "Đàn áp lớn", icon: "⛓", echo: "Tiếng la của đêm đó vẫn còn." },
  failed_revolt:       { label: "Khởi nghĩa thất bại", icon: "✖", echo: "Họ không dám gọi tên cô ấy nữa." },
  successful_reform:   { label: "Cải cách thành công", icon: "✓", echo: "Một thoáng tin rằng hệ thống có thể tự sửa." },
  famine:              { label: "Đói kém", icon: "✺", echo: "Mùi bánh cũ vẫn không thể quên." },
  elite_purge:         { label: "Thanh trừng giới chóp", icon: "♛", echo: "Không ai còn dám nói thẳng trong cung." },
  underground_network: { label: "Mạng lưới ngầm", icon: "◈", echo: "Những cuộc họp trong tầng hầm chưa từng kết thúc." },
  collapse_scar:       { label: "Vết sẹo sụp đổ", icon: "☂", echo: "Ai từng sống qua nó sẽ không bao giờ tin vào nhà nước." },
  rupture_legacy:      { label: "Di sản đứt gãy", icon: "⚡", echo: "Có một thế hệ chỉ biết thế giới sau khi nó vỡ." },
  stagnation_decade:   { label: "Thập kỷ trì trệ", icon: "◯", echo: "Thời gian trôi mà không có dấu vết." },
  betrayed_promise:    { label: "Lời hứa phản bội", icon: "✂", echo: "Lần sau, đừng ai tin văn bản nữa." },
  general_strike:      { label: "Tổng đình công", icon: "✊", echo: "Bóng dáng những máy ngừng vẫn ám ảnh tư bản." },
};

/** Decay weights by one stage (≈ 0.7^stages). Used between stages. */
export function decayMemory(mem: MemoryTag[]): MemoryTag[] {
  return mem
    .map((m) => ({ ...m, weight: m.weight * 0.72 }))
    .filter((m) => m.weight > 0.08)
    .slice(0, 20);
}

/** Push a tag (or refresh weight if already present from same stage). */
export function pushMemory(mem: MemoryTag[], tag: Omit<MemoryTag, "weight"> & { weight?: number }): MemoryTag[] {
  const w = tag.weight ?? 1;
  const idx = mem.findIndex((m) => m.id === tag.id && m.stage === tag.stage);
  if (idx >= 0) {
    const next = mem.slice();
    next[idx] = { ...next[idx], weight: Math.min(1, next[idx].weight + w * 0.4) };
    return next;
  }
  return [{ ...tag, weight: w }, ...mem].slice(0, 20);
}

export function hasMemory(mem: MemoryTag[], id: MemoryTagId, minWeight = 0.15): boolean {
  return mem.some((m) => m.id === id && m.weight >= minWeight);
}

export function memoryEcho(mem: MemoryTag[]): string | null {
  const top = mem.slice().sort((a, b) => b.weight - a.weight)[0];
  if (!top || top.weight < 0.25) return null;
  return MEMORY_META[top.id].echo;
}
