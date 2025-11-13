import { GameRenderer } from "./Renderer";
import { GameInspector } from "./Inspector";
import { gameSchema, type GameData } from "./schema";
import type { LandingBlockPlugin } from "../plugin";

const gamePlugin: LandingBlockPlugin<GameData> = {
  kind: "game",
  label: "Game",
  schema: gameSchema,
  defaultData: {
    ctaLabel: "",
    linkedCampaignId: "",
    linkedPlaceId: "",
  },
  Renderer: GameRenderer,
  Inspector: GameInspector,
};

export default gamePlugin;
