import type { EraId } from "@/data/eras";

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

// Narrator voiceover — 15 files, era{1..5}-{enter|tension|revolution}.mp3
import n1e from "./audio/narrator/era1-enter.mp3";
import n1t from "./audio/narrator/era1-tension.mp3";
import n1r from "./audio/narrator/era1-revolution.mp3";
import n2e from "./audio/narrator/era2-enter.mp3";
import n2t from "./audio/narrator/era2-tension.mp3";
import n2r from "./audio/narrator/era2-revolution.mp3";
import n3e from "./audio/narrator/era3-enter.mp3";
import n3t from "./audio/narrator/era3-tension.mp3";
import n3r from "./audio/narrator/era3-revolution.mp3";
import n4e from "./audio/narrator/era4-enter.mp3";
import n4t from "./audio/narrator/era4-tension.mp3";
import n4r from "./audio/narrator/era4-revolution.mp3";
import n5e from "./audio/narrator/era5-enter.mp3";
import n5t from "./audio/narrator/era5-tension.mp3";
import n5r from "./audio/narrator/era5-revolution.mp3";

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

export const NARRATOR_AUDIO: Record<EraId, Record<NarratorMoment, string>> = {
  primitive: { enter: n1e, tension: n1t, revolution: n1r },
  slave: { enter: n2e, tension: n2t, revolution: n2r },
  feudal: { enter: n3e, tension: n3t, revolution: n3r },
  capitalist: { enter: n4e, tension: n4t, revolution: n4r },
  socialist: { enter: n5e, tension: n5t, revolution: n5r },
};
