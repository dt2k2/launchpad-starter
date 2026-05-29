/**
 * PerspectiveProvider — injects theme CSS vars + exposes perspective context.
 * Also exports <VoiceText> for rendering perspective-aware text.
 */
import { createContext, useContext, useMemo, type ReactNode, type CSSProperties } from "react";
import type { Decision, DecisionOption, PerspectiveId } from "@/data/historicalSim";
import {
  PERSPECTIVE_THEMES,
  PERSPECTIVE_OBJECTIVES,
  resolveVoice,
  type PerspectiveTheme,
  type PerspectiveObjective,
  type VoiceEvent,
} from "@/data/perspective/perspectiveConfig";

interface PerspectiveCtxValue {
  perspective: PerspectiveId;
  theme: PerspectiveTheme;
  objective: PerspectiveObjective;
}

const PerspectiveCtx = createContext<PerspectiveCtxValue | null>(null);

export function usePerspective(): PerspectiveCtxValue {
  const v = useContext(PerspectiveCtx);
  if (!v) throw new Error("usePerspective must be used inside <PerspectiveProvider>");
  return v;
}

export function PerspectiveProvider({
  perspective,
  children,
  className = "",
}: {
  perspective: PerspectiveId;
  children: ReactNode;
  className?: string;
}) {
  const theme = PERSPECTIVE_THEMES[perspective];
  const objective = PERSPECTIVE_OBJECTIVES[perspective];
  const value = useMemo(
    () => ({ perspective, theme, objective }),
    [perspective, theme, objective],
  );
  const style: CSSProperties = {
    ...(theme.tokens as CSSProperties),
    // expose grain via ::before through a CSS class — but we also expose as background var
    backgroundImage: theme.tokens["--p-grain"],
    backgroundBlendMode: "overlay",
  };
  return (
    <PerspectiveCtx.Provider value={value}>
      <div
        data-perspective={perspective}
        className={`perspective-root transition-colors duration-700 ${theme.classes.grain ?? ""} ${className}`}
        style={style}
      >
        {children}
      </div>
    </PerspectiveCtx.Provider>
  );
}

/**
 * VoiceText — renders text run through the perspective voice resolver.
 */
export function VoiceText({

  event,
  decision,
  option,
  fallback,
  stageTitle,
  className = "",
}: {
  event: VoiceEvent;
  decision?: Decision;
  option?: DecisionOption;
  fallback?: string;
  stageTitle?: string;
  className?: string;
}) {
  const { perspective } = usePerspective();
  const text = resolveVoice(perspective, event, { decision, option, fallback, stageTitle });
  return <span className={className}>{text}</span>;
}
