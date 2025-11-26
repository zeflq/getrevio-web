import type { LandingAddonPlugin } from "../plugin";
import { GoogleReviewActionDrawerAddonInspector } from "./Inspector";
import { GoogleReviewActionDrawerAddonRenderer } from "./Renderer";
import {
  googleReviewActionDrawerAddonDefault,
  googleReviewActionDrawerAddonSchema,
  type GoogleReviewActionDrawerAddonData,
} from "./schema";

const googleReviewActionDrawerAddonPlugin: LandingAddonPlugin<
  GoogleReviewActionDrawerAddonData
> = {
  kind: "googleReviewActionDrawerAddon",
  label: "Google Review action drawer",
  schema: googleReviewActionDrawerAddonSchema,
  defaultData: googleReviewActionDrawerAddonDefault,
  Inspector: GoogleReviewActionDrawerAddonInspector,
  Renderer: GoogleReviewActionDrawerAddonRenderer,
};

export default googleReviewActionDrawerAddonPlugin;
export { googleReviewActionDrawerAddonSchema, type GoogleReviewActionDrawerAddonData };
