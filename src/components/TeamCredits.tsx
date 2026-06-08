import { useState } from "react";
import { Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TEAM = [
  { id: "SE192802", name: "Lưu Ngọc Ngân Giang" },
  { id: "SE161931", name: "Bùi Đức Thắng" },
  { id: "SE170105", name: "Nguyễn Lê Đăng Khoa" },
];

const BOTS = ["Lovable", "Claude"];

export function TeamCredits() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed left-4 top-4 z-40 select-none font-sans">
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-[260px] rounded-xl border border-white/10 bg-stone-950/80 p-4 text-white/85 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-200/80">
                Nhóm thực hiện
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
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
        ) : (
          <motion.button
            key="pill"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-stone-950/60 px-3.5 py-2 text-[11px] uppercase tracking-[0.25em] text-white/75 backdrop-blur-md transition-colors hover:border-white/30 hover:bg-stone-950/80 hover:text-white"
            aria-label="Hiển thị thông tin nhóm"
          >
            <Users className="h-3.5 w-3.5 text-amber-200/80" />
            Nhóm
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
