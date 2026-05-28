import { useState } from "react";
import { ERAS, type Era } from "@/data/eras";
import { motion } from "framer-motion";

export function CompareMode() {
  const [a, setA] = useState<Era>(ERAS[2]);
  const [b, setB] = useState<Era>(ERAS[3]);

  return (
    <section id="compare" className="relative border-t border-white/10 bg-stone-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
              Chế độ so sánh
            </p>
            <h2 className="font-display text-4xl md:text-5xl">
              Đặt hai thời đại cạnh nhau.
            </h2>
          </div>
          <p className="max-w-md text-sm text-white/60">
            Thay đổi hai hình thái ở cột trái và phải để thấy rõ sự dịch chuyển của
            công cụ, sở hữu và giai cấp.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <CompareColumn era={a} onChange={setA} side="A" />
          <CompareColumn era={b} onChange={setB} side="B" />
        </div>
      </div>
    </section>
  );
}

function CompareColumn({
  era,
  onChange,
  side,
}: {
  era: Era;
  onChange: (e: Era) => void;
  side: string;
}) {
  return (
    <motion.div
      key={era.id}
      data-era={era.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="era-surface relative overflow-hidden rounded-3xl border border-white/10 p-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">
          Cột {side}
        </span>
        <select
          value={era.id}
          onChange={(e) => onChange(ERAS.find((x) => x.id === e.target.value)!)}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-wider outline-none"
          aria-label={`Chọn hình thái cho cột ${side}`}
        >
          {ERAS.map((e) => (
            <option key={e.id} value={e.id} className="bg-stone-900">
              {e.title}
            </option>
          ))}
        </select>
      </div>
      <div className="era-accent-text mb-3 font-display text-5xl">{era.glyph}</div>
      <h3 className="font-display text-3xl">{era.title}</h3>
      <p className="mt-1 text-xs italic opacity-70">{era.subtitle}</p>

      <dl className="mt-6 space-y-4 text-sm">
        <Row label="Sở hữu">{era.dominantClass.ownership}</Row>
        <Row label="Thống trị">{era.dominantClass.rulers}</Row>
        <Row label="Lao động">{era.dominantClass.workers}</Row>
        <Row label="Công cụ tiêu biểu">
          {era.keyInventions.map((k) => k.name).join(" · ")}
        </Row>
        <Row label="Mâu thuẫn">{era.contradictions[0]}</Row>
      </dl>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 border-t border-white/10 pt-4">
      <dt className="text-[10px] uppercase tracking-[0.25em] opacity-50">{label}</dt>
      <dd className="leading-relaxed opacity-90">{children}</dd>
    </div>
  );
}