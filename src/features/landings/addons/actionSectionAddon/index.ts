import type { LandingAddonPlugin } from "../plugin";
import { ActionSectionAddonInspector } from "./Inspector";
import { ActionSectionAddonRenderer } from "./Renderer";
import { actionSectionAddonDefault, actionSectionAddonSchema , type ActionSectionAddonData} from "./schema";

const actionSectionAddonPlugin: LandingAddonPlugin<ActionSectionAddonData> = {
  kind: "actionSectionAddon",
  label: "Action section",
  schema: actionSectionAddonSchema,
  defaultData: actionSectionAddonDefault,
  Inspector: ActionSectionAddonInspector,
  Renderer: ActionSectionAddonRenderer,
};

export default actionSectionAddonPlugin;