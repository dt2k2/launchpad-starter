import { Users } from "lucide-react";
import { motion } from "framer-motion";

const TEAM = [
  { id: "SE192802", name: "Lưu Ngọc Ngân Giang" },
  { id: "SE161931", name: "Bùi Đức Thắng" },
  { id: "SE170105", name: "Nguyễn Lê Đăng Khoa" },
];

const BOTS = ["Lovable", "Claude", "ChatGPT"];

export function TeamCredits() {
  return (
    <div className="fixed left-4 top-4 z-40 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-[260px] rounded-xl border border-white/10 bg-stone-950/80 p-4 text-white/85 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="mb-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-200/80">
            Tên Môn Học
          </p>
          <p className="text-[13px] font-medium text-white">MLN111</p>
        </div>

        <div className="mb-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-200/80">
            Tên Lớp
          </p>
          <p className="text-[13px] font-medium text-white">IA1908</p>
        </div>

        <div className="mb-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-200/80">
            Nhóm thực hiện
          </p>
        </div>

        <ul className="space-y-1.5">
          {TEAM.map((m) => (
            <li key={m.id} className="flex items-baseline gap-2 text-[13px]">
              <span className="font-mono text-[10px] tracking-wider text-amber-200/60">
                {m.id}
              </span>
              <span className="font-medium text-white">{m.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-amber-200/60">
            AI hỗ trợ
          </p>
          <p className="text-[12px] text-white/65">{BOTS.join(" · ")}</p>
        </div>
      </motion.div>
    </div>
  );
}
