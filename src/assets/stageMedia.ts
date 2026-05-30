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
