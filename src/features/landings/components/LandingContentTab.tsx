import { EditSection } from "@/shared/ui/EditSection";
import { LandingContentEditor } from "../editor/LandingContentEditor";

type Props = {
  landing: any;
  isSubmitting: boolean;
  t: ReturnType<typeof import("next-intl").useTranslations>;
};

export function LandingContentTab({ landing, isSubmitting, t }: Props) {
  return (
    <div className="space-y-4">
      <EditSection
        title={landing?.name}
        description={t("common.changesSavedOnSubmit")}
      >
        <LandingContentEditor landing={landing} disabled={isSubmitting} />
      </EditSection>
    </div>
  );
}
