import { motion } from "framer-motion";

export function ContradictionMeter({ value }: { value: number }) {
  const segments = 20;
  const active = Math.round((value / 100) * segments);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/50">
        <span>Chỉ số mâu thuẫn</span>
        <span className="font-mono text-white/80">{value}/100</span>
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: segments }).map((_, i) => {
          const on = i < active;
          const heat = i / segments;
          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0.3, opacity: 0.2 }}
              whileInView={{ scaleY: on ? 1 : 0.4, opacity: on ? 1 : 0.2 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              className="h-6 flex-1 origin-bottom rounded-sm"
              style={{
                background: on
                  ? `oklch(${0.75 - heat * 0.1} ${0.12 + heat * 0.12} ${60 - heat * 50})`
                  : "oklch(0.3 0.01 60)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}