import type { LandingAddonPlugin } from "../plugin";
import { GoogleReviewActionDrawerInspector } from "./Inspector";
import { GoogleReviewActionDrawerRenderer } from "./Renderer";
import {
  googleReviewActionDrawerDefault,
  googleReviewActionDrawerSchema,
  type GoogleReviewActionDrawerData,
} from "./schema";

const googleReviewActionDrawerPlugin: LandingAddonPlugin<
  GoogleReviewActionDrawerData
> = {
  kind: "googleReviewActionDrawer",
  label: "Google Review action drawer",
  schema: googleReviewActionDrawerSchema,
  defaultData: googleReviewActionDrawerDefault,
  Inspector: GoogleReviewActionDrawerInspector,
  Renderer: GoogleReviewActionDrawerRenderer,
};

export default googleReviewActionDrawerPlugin;
export { googleReviewActionDrawerSchema, type GoogleReviewActionDrawerData };
