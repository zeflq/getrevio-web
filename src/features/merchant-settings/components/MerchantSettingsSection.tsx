import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { MerchantSettingsForm } from "@/features/merchants/components/MerchantSettingsForm";
import { SingleThemeEditor } from "@/features/merchants/components/SingleThemeEditor";
import type { MerchantSettingsData } from "../server/loadMerchantSettings";

export function MerchantSettingsSection({
  merchant,
  themes,
  singleThemeLite,
  singleTheme,
}: MerchantSettingsData) {
  if (!merchant) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            We couldn&apos;t load your merchant data. Please refresh the page or contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <MerchantSettingsForm
        merchantId={merchant.id}
        defaultName={merchant.name}
        defaultEmail={merchant.email}
        defaultThemeId={merchant.defaultThemeId}
        themes={themes}
      />
      {singleThemeLite ? (
        <Card>
          <CardContent className="space-y-6">
            <SingleThemeEditor themeId={singleThemeLite.value} theme={singleTheme ?? undefined} />
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
