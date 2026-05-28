import { createFileRoute, Link } from "@tanstack/react-router";
import { MiniGame } from "@/components/minigame/MiniGame";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/minigame")({
  head: () => ({
    meta: [
      { title: "Mini Game — Hành trình Tiến hoá | Bản đồ Lịch sử" },
      {
        name: "description",
        content:
          "Mini game tương tác 5 ải: vượt qua từng hình thái kinh tế – xã hội, từ cộng sản nguyên thuỷ đến xã hội chủ nghĩa.",
      },
      {
        property: "og:title",
        content: "Mini Game — Hành trình Tiến hoá",
      },
      {
        property: "og:description",
        content:
          "Trò chơi giáo dục tương tác về duy vật lịch sử: lực lượng sản xuất, quan hệ sản xuất, mâu thuẫn & cách mạng.",
      },
    ],
  }),
  component: MiniGamePage,
});

function MiniGamePage() {
  return (
    <div className="relative">
      <Link
        to="/"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/15 bg-stone-950/60 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/80 backdrop-blur hover:bg-white/10"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Bản đồ
      </Link>
      <MiniGame />
    </div>
  );
}
