export function TeamCredits() {
  return (
    <div className="pointer-events-none fixed left-3 top-3 z-50 hidden select-none rounded-lg border border-white/10 bg-stone-950/60 px-3 py-2 text-[10px] leading-tight text-white/70 backdrop-blur-md sm:block">
      <p className="mb-1 text-[9px] uppercase tracking-[0.25em] text-amber-200/70">
        Team
      </p>
      <ul className="space-y-0.5">
        <li>SE192802 — Lưu Ngọc Ngân Giang</li>
        <li>SE161931 — Bùi Đức Thắng</li>
        <li>SE170105 — Nguyễn Lê Đăng Khoa</li>
      </ul>
      <p className="mb-1 mt-2 text-[9px] uppercase tracking-[0.25em] text-amber-200/70">
        AI Bots
      </p>
      <ul className="space-y-0.5">
        <li>Lovable</li>
        <li>Claude</li>
      </ul>
    </div>
  );
}
