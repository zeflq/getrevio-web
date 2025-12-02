
import type { LandingBlockPlugin } from "../plugin";
import { EmptyRenderer } from "./Renderer";
import {
  emptyDefaultData,
  emptySchema,
  type EmptyData
} from "./schema";

const emptyPlugin: LandingBlockPlugin<EmptyData> = {
  kind: "empty",
  label: "Empty",
  schema: emptySchema,
  defaultData: emptyDefaultData,
  Renderer: EmptyRenderer,

  // No inspector → block is empty
  Inspector: () => null
};

export default emptyPlugin;
