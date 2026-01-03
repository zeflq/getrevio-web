"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: { local: string };
  searchParams?: {
    error?: string;
    reason?: string;
    redirect?: string;
  };
};

export default function AuthErrorPage({ params, searchParams }: PageProps) {
  const t = useTranslations("auth.error");
  const error = searchParams?.error ?? t("unknownError");
  const reason = searchParams?.reason ?? "";

  const isUserCancelled =
    error === "access_denied" ||
    error === "user_cancelled" ||
    reason === "user_cancelled";

  const title = isUserCancelled ? t("titleCancelled") : t("titleDefault");
  const message = isUserCancelled ? t("messageCancelled") : t("messageDefault");

  const redirect = searchParams?.redirect;
  const loginHref =
    redirect != null && redirect.length > 0
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : `/login`;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-muted/60 via-background to-muted/80 px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-destructive/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-start gap-3">
          <span className="mt-1 rounded-full bg-destructive/10 p-2 text-destructive">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm">{message}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("errorCodeLabel")}</span>
            <Badge
              variant="outline"
              className="font-mono text-[11px] px-2 py-0.5"
            >
              {error}
            </Badge>
          </div>

          {reason && (
            <div className="rounded-md bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
              <span className="font-semibold">{t("technicalDetailsLabel")}</span>{" "}
              <code className="font-mono break-all">{reason}</code>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={loginHref}>{t("backToLogin")}</Link>
          </Button>

          <p className="w-full text-center text-[11px] text-muted-foreground">
            {t("supportHint")}
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
