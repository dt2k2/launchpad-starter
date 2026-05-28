import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ERAS, type Era, type EraId } from "@/data/eras";
import { Hero } from "@/components/Hero";
import { EraChapter } from "@/components/EraChapter";
import { EraDetailSheet } from "@/components/EraDetailSheet";
import { StickyLegend } from "@/components/StickyLegend";
import { CompareMode } from "@/components/CompareMode";
import { TechTree } from "@/components/TechTree";
import { Glossary } from "@/components/Glossary";
import { Quiz } from "@/components/Quiz";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Bản đồ Lịch sử các Hình thái Kinh tế — Xã hội",
      },
      {
        name: "description",
        content:
          "Hành trình cuộn dọc qua năm phương thức sản xuất đã định hình loài người — từ cộng sản nguyên thuỷ đến xã hội chủ nghĩa.",
      },
      {
        property: "og:title",
        content: "Bản đồ Lịch sử các Hình thái Kinh tế — Xã hội",
      },
      {
        property: "og:description",
        content:
          "Một bản đồ tương tác về chủ nghĩa duy vật lịch sử: lực lượng sản xuất, quan hệ sản xuất, mâu thuẫn và cách mạng.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [openEra, setOpenEra] = useState<Era | null>(null);
  const [currentEra, setCurrentEra] = useState<EraId | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // observe which era is in view
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-era-section]");
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const el = visible.target as HTMLElement;
          setCurrentEra(el.dataset.eraSection as EraId);
        }
      },
      { threshold: [0.3, 0.6] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const startJourney = () => {
    timelineRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SmoothScroll />
      <main className="relative bg-stone-950 text-stone-100">
        <Hero onStart={startJourney} />

        <StickyLegend currentEra={currentEra} />

        <div ref={timelineRef}>
          {ERAS.map((era) => (
            <div
              id={`era-${era.id}`}
              key={era.id}
              data-era-section={era.id}
            >
              <EraChapter
                era={era}
                isLast={era.index === ERAS.length - 1}
                onOpen={() => setOpenEra(era)}
              />
            </div>
          ))}
        </div>

        <TechTree />
        <CompareMode />
        <Glossary />
        <Quiz />
        <Footer />

        <EraDetailSheet era={openEra} onClose={() => setOpenEra(null)} />
      </main>
    </>
  );
}
