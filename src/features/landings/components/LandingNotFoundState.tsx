import { EditPageLayout } from "@/shared/ui/EditPageLayout";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  backLabel: string;
  backToListHref: string;
  onBack: () => void;
};

export function LandingNotFoundState({
  title,
  description,
  backLabel,
  backToListHref,
  onBack,
}: Props) {
  return (
    <EditPageLayout title={title} description={description} onBack={onBack}>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Landing introuvable</h2>
        <p className="text-sm text-muted-foreground">
          Cette page n’existe plus ou vous n’y avez pas accès.
        </p>
        <Button variant="outline" asChild>
          <a href={backToListHref}>{backLabel}</a>
        </Button>
      </div>
    </EditPageLayout>
  );
}
