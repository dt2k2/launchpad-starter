/**
 * Small inline cinematic settings: mute audio, reduce FX.
 * Persists to localStorage.
 */
import { useEffect, useState } from "react";
import { Volume2, VolumeX, Sparkles, MinusSquare } from "lucide-react";

const KEY = "minigame.cinematic.v1";

export interface CinematicSettings {
  muted: boolean;
  reducedFx: boolean;
}

export function useCinematicSettings(): [
  CinematicSettings,
  (patch: Partial<CinematicSettings>) => void,
] {
  const [state, setState] = useState<CinematicSettings>({
    muted: true, // default muted so first load is silent until user opts in
    reducedFx: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...state, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<CinematicSettings>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  return [state, update];
}

interface Props {
  settings: CinematicSettings;
  onChange: (patch: Partial<CinematicSettings>) => void;
}

export function SettingsToggle({ settings, onChange }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={settings.muted ? "Bật âm thanh" : "Tắt âm thanh"}
        onClick={() => onChange({ muted: !settings.muted })}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 backdrop-blur transition hover:bg-white/10"
      >
        {settings.muted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        aria-label={settings.reducedFx ? "Bật hiệu ứng" : "Giảm hiệu ứng"}
        onClick={() => onChange({ reducedFx: !settings.reducedFx })}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 backdrop-blur transition hover:bg-white/10"
      >
        {settings.reducedFx ? (
          <MinusSquare className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
