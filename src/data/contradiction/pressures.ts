/**
 * Pressure derivation — turns raw metrics + history into 6 layered systemic pressures.
 * Pure functions, deterministic. Output 0..100 each.
 */
import type { PerspectiveId } from "../historicalSim";

export interface Pressures {
  classTension: number;
  repression: number;
  legitimacyLoss: number;
  organization: number;
  productionInstability: number;
  ruptureRisk: number;
}

export const EMPTY_PRESSURES: Pressures = {
  classTension: 0,
  repression: 0,
  legitimacyLoss: 0,
  organization: 0,
  productionInstability: 0,
  ruptureRisk: 0,
};

export const PRESSURE_META: Record<keyof Pressures, { label: string; short: string; description: string }> = {
  classTension: {
    label: "Căng thẳng giai cấp",
    short: "Căng thẳng",
    description: "Khoảng cách giữa lực lượng đang vận hành sản xuất và những người nắm sở hữu.",
  },
  repression: {
    label: "Đàn áp",
    short: "Đàn áp",
    description: "Mức độ bạo lực nhà nước/giai cấp thống trị sử dụng để giữ trật tự.",
  },
  legitimacyLoss: {
    label: "Mất tính chính danh",
    short: "Chính danh",
    description: "Trật tự hiện hành không còn được xã hội tự nguyện thừa nhận.",
  },
  organization: {
    label: "Tổ chức",
    short: "Tổ chức",
    description: "Mức độ tự tổ chức của giai cấp bị trị — điều kiện cho cách mạng thắng lợi.",
  },
  productionInstability: {
    label: "Bất ổn sản xuất",
    short: "Sản xuất",
    description: "Đình công, thiếu hụt, đứt gãy chuỗi cung ứng.",
  },
  ruptureRisk: {
    label: "Rủi ro vỡ trận",
    short: "Vỡ trận",
    description: "Tổng hợp khả năng hệ thống bước vào điểm rạn nứt.",
  },
};

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

interface DeriveInput {
  metrics: { production: number; stability: number; contradiction: number; revolution: number; tech: number };
  perspective: PerspectiveId;
  /** Counts collected from the run-log */
  tagCounts: Partial<Record<string, number>>;
  progressiveCount: number;
}

export function derivePressures(input: DeriveInput): Pressures {
  const { metrics, perspective, tagCounts, progressiveCount } = input;
  const repressionTag = tagCounts.repression ?? 0;
  const concessionTag = tagCounts.concession ?? 0;
  const uprisingTag = tagCounts.uprising ?? 0;

  const classTension = clamp(
    metrics.contradiction * 0.6 + (100 - metrics.stability) * 0.3 + metrics.revolution * 0.1,
  );
  const repression = clamp(repressionTag * 18 - concessionTag * 10);
  const legitimacyLoss = clamp(
    100 - metrics.stability + metrics.contradiction * 0.2 - progressiveCount * 4,
  );
  const organization = clamp(
    uprisingTag * 14 +
      metrics.revolution * 0.4 +
      (perspective === "worker" ? 12 : 0) -
      repression * 0.25,
  );
  const productionInstability = clamp(
    metrics.contradiction * 0.4 + (100 - metrics.production) * 0.35,
  );
  const ruptureRisk = clamp(
    metrics.contradiction * 0.4 +
      classTension * 0.25 +
      legitimacyLoss * 0.15 +
      organization * 0.2 -
      repression * 0.15,
  );

  return {
    classTension,
    repression,
    legitimacyLoss,
    organization,
    productionInstability,
    ruptureRisk,
  };
}
