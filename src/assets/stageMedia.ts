import type { EraId } from "@/data/eras";
import type { PerspectiveId } from "@/data/historicalSim";

import bg1 from "./background/stage1.png";
import bg2 from "./background/stage2.png";
import bg3 from "./background/stage3.png";
import bg4 from "./background/stage4.png";
import bg5 from "./background/stage5.png";

import mg1 from "./background/minigame_bg/stage1.png";
import mg2 from "./background/minigame_bg/stage2.png";
import mg3 from "./background/minigame_bg/stage3.png";
import mg4 from "./background/minigame_bg/stage4.png";
import mg5 from "./background/minigame_bg/stage5.png";

import a1 from "./audio/stage1.mp3";
import a2 from "./audio/stage2.mp3";
import a3 from "./audio/stage3.mp3";
import a4 from "./audio/stage4.mp3";
import a5 from "./audio/stage5.mp3";

// Narrator voiceovers are loaded by glob below; shared legacy files are optional.

export const ERA_BG: Record<EraId, string> = {
  primitive: bg1,
  slave: bg2,
  feudal: bg3,
  capitalist: bg4,
  socialist: bg5,
};

export const STAGE_BG: Record<EraId, string> = {
  primitive: mg1,
  slave: mg2,
  feudal: mg3,
  capitalist: mg4,
  socialist: mg5,
};

export const STAGE_AUDIO: Record<EraId, string> = {
  primitive: a1,
  slave: a2,
  feudal: a3,
  capitalist: a4,
  socialist: a5,
};

export type NarratorMoment = "enter" | "tension" | "revolution";

const NARRATOR_AUDIO_FILES = import.meta.glob<string>("./audio/narrator/**/*.mp3", {
  eager: true,
  import: "default",
});

const ERA_BY_AUDIO_INDEX: Record<string, EraId> = {
  "1": "primitive",
  "2": "slave",
  "3": "feudal",
  "4": "capitalist",
  "5": "socialist",
};

export const NARRATOR_AUDIO: Partial<Record<EraId, Partial<Record<NarratorMoment, string>>>> = {};

export const ROLE_NARRATOR_AUDIO: Partial<
  Record<EraId, Partial<Record<PerspectiveId, Partial<Record<NarratorMoment, string>>>>>
> = {};

for (const [path, src] of Object.entries(NARRATOR_AUDIO_FILES)) {
  const filename = path.split("/").pop() ?? "";
  const roleMatch = /^era([1-5])-(ruler|worker|historian)-(enter|tension|revolution)\.mp3$/.exec(
    filename,
  );
  if (roleMatch) {
    const [, eraIndex, role, moment] = roleMatch;
    const eraId = ERA_BY_AUDIO_INDEX[eraIndex];
    if (!eraId) continue;
    const eraAudio = (ROLE_NARRATOR_AUDIO[eraId] ??= {});
    const roleAudio = (eraAudio[role as PerspectiveId] ??= {});
    roleAudio[moment as NarratorMoment] = src;
    continue;
  }

  const sharedMatch = /^era([1-5])-(enter|tension|revolution)\.mp3$/.exec(filename);
  if (sharedMatch) {
    const [, eraIndex, moment] = sharedMatch;
    const eraId = ERA_BY_AUDIO_INDEX[eraIndex];
    if (!eraId) continue;
    const eraAudio = (NARRATOR_AUDIO[eraId] ??= {});
    eraAudio[moment as NarratorMoment] = src;
  }
}

export function resolveNarratorAudio(
  eraId: EraId,
  perspective: PerspectiveId,
  moment: NarratorMoment,
): string | undefined {
  return ROLE_NARRATOR_AUDIO[eraId]?.[perspective]?.[moment] ?? NARRATOR_AUDIO[eraId]?.[moment];
}
