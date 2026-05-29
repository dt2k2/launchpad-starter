/**
 * EmergencyBanner — sticky top banner shown when contradiction tier is
 * emergency or rupture. Pulses red, surfaces the active event narrator.
 */
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Flame } from "lucide-react";
import { resolveTier } from "@/data/contradiction";
import type { SimState } from "../simStore";

export function EmergencyBanner({ state }: { state: SimState }) {
  const tier = resolveTier(state.metrics.contradiction);
  const show = tier.id === "emergency" || tier.id === "rupture";
  const event = state.activeEvents[0];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={tier.id}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4"
        >
          <div
            className={`pointer-events-auto mx-auto flex max-w-5xl items-center gap-3 rounded-xl border px-4 py-2.5 text-sm backdrop-blur-md ${
              tier.id === "rupture"
                ? "border-fuchsia-400/50 bg-fuchsia-950/60 text-fuchsia-50 shadow-[0_0_40px_-10px_rgba(232,121,249,0.6)]"
                : "border-rose-400/50 bg-rose-950/60 text-rose-50 shadow-[0_0_30px_-12px_rgba(244,63,94,0.6)]"
            }`}
          >
            {tier.id === "rupture" ? (
              <Flame className="h-4 w-4 shrink-0 animate-pulse" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
            )}
            <div className="flex-1 leading-tight">
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">
                {tier.label}
              </p>
              <p className="text-xs sm:text-sm">
                {event
                  ? `${event.title} — ${event.narrator}`
                  : tier.id === "rupture"
                    ? "Hệ thống đang vỡ. Quyết định tiếp theo sẽ kích nổ chuyển hoá."
                    : "Trật tự lung lay. Lựa chọn cải lương đã bị khoá."}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
