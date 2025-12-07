import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const locale = (await getLocale()) ?? routing.defaultLocale;
  redirect(`/${locale}`);
}
