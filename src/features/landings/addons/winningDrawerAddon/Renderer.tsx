"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

import type { WinningDrawerAddonData } from "./schema";
import { useBlockChannel } from "../../preview/BlockChannelContext";
import { useLandingRenderContext } from "../../preview/LandingRenderContext";
import type { WinData, ContactPayload } from "../shared/types";

async function redeemWin(winId: string, contact: ContactPayload) {
  console.log("Redeem win", { winId, contact });
  console.log("lottery:redeemed", { winId, contact });
}

type WinningDrawerAddonRendererProps = {
  data: WinningDrawerAddonData;
};

export function WinningDrawerAddonRenderer({
  data,
}: WinningDrawerAddonRendererProps) {
  const { belongsTo } = useLandingRenderContext();
  const { on } = useBlockChannel();

  const [open, setOpen] = React.useState(false);
  const [win, setWin] = React.useState<WinData | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [contactValue, setContactValue] = React.useState("");
  const [contactError, setContactError] = React.useState<string | null>(null);

  const placeName = belongsTo?.label;

  // ✅ Listen to "revealWin" only (after the spin ends)
  React.useEffect(() => {
    const offReveal = on("lottery:revealWin", (payload: WinData) => {
      setWin(payload);
      setContactValue("");
      setContactError(null);
      setIsSubmitted(false);
      setIsSubmitting(false);
      setOpen(true);
    });

    return () => {
      offReveal();
    };
  }, [on]);

  const closeDrawer = React.useCallback(() => {
    setOpen(false);
  }, []);

  // ✅ Always compute with null-safe values (NO early return before hooks)
  const payload = win?.giftSnapshot;

  const rewardLabel = payload?.rewardLabel;

  const formattedMinPurchase = React.useMemo(() => {
    const amount = payload?.minPurchaseAmount;
    const currency = payload?.minPurchaseCurrency;

    if (amount == null || !currency) return null;

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "JPY" ? 0 : 2,
      }).format(amount);
    } catch (error) {
      console.error("[WinningDrawerAddon] failed to format min purchase", error);
      return null;
    }
  }, [payload?.minPurchaseAmount, payload?.minPurchaseCurrency]);

  const minPurchaseLine = formattedMinPurchase
    ? `Minimum purchase: ${formattedMinPurchase}`
    : null;

  const validityLine = payload?.validityDays
    ? `Valid for ${payload.validityDays} days after win`
    : null;

  const currentContactMethod = win?.contactMethod === "sms" ? "sms" : "email";

  const contactLabel =
    currentContactMethod === "sms"
      ? "Your mobile number to receive the confirmation"
      : "Your email to receive the confirmation";

  const placeholder =
    currentContactMethod === "sms" ? "+33 6 12 34 56 78" : "you@email.com";

  const successChannel = currentContactMethod === "sms" ? "SMS" : "email";

  const successMessage =
    data.successMessage ??
    `✅ Your prize is registered. Check your ${successChannel} for details.`;

  const contactValidationMessage =
    currentContactMethod === "sms"
      ? "Please provide a phone number to confirm your prize."
      : "Please provide an email to confirm your prize.";

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!win?.winId) return;

      const trimmed = contactValue.trim();
      if (!trimmed) {
        setContactError(contactValidationMessage);
        return;
      }

      setContactError(null);
      setIsSubmitting(true);

      try {
        const contactPayload: ContactPayload =
          currentContactMethod === "sms"
            ? { phone: trimmed }
            : { email: trimmed };

        await redeemWin(win.winId, contactPayload);
        setIsSubmitted(true);
      } catch (error) {
        console.error("[WinningDrawerAddon] redeeming win failed", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [win, contactValue, currentContactMethod, contactValidationMessage],
  );

  // ✅ Only conditionally render AFTER hooks
  if (!win) return null;

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && closeDrawer()}>
      <DrawerContent className="bg-[var(--landing-surface)] border-[var(--landing-border)]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Winning drawer</DrawerTitle>
          <DrawerDescription>Confirm your lottery win.</DrawerDescription>
        </DrawerHeader>

        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--landing-muted-text)]">
                  Victory
                </p>
                <h2 className="text-2xl font-semibold text-[var(--landing-text)]">
                  {data.title ?? "Bravo ! 🎉"}
                </h2>
                <p className="text-sm text-[var(--landing-muted-text)]">
                  {data.subtitle ?? "You just won a reward"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={closeDrawer} type="button">
              Close
            </Button>
          </div>

          <div
            className="mt-6 space-y-2 rounded-2xl border p-4"
            style={{ borderColor: "var(--landing-border)" }}
          >
            {rewardLabel && (
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--landing-muted-text)]">
                Reward
              </p>
            )}
            <p className="text-xl font-semibold text-[var(--landing-text)]">
              {rewardLabel ?? "Your prize"}
            </p>
            {placeName && (
              <p className="text-sm text-[var(--landing-muted-text)]">at {placeName}</p>
            )}
            {minPurchaseLine && (
              <p className="text-sm text-[var(--landing-muted-text)]">{minPurchaseLine}</p>
            )}
            {validityLine && (
              <p className="text-sm text-[var(--landing-muted-text)]">{validityLine}</p>
            )}
          </div>

          <div className="mt-6">
            {isSubmitted ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-[var(--landing-text)]">
                {successMessage}
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleSubmit}>
                <label className="text-sm font-medium text-[var(--landing-text)]">
                  {contactLabel}
                </label>
                <Input
                  type={currentContactMethod === "sms" ? "tel" : "email"}
                  value={contactValue}
                  onChange={(event) => {
                    setContactValue(event.target.value);
                    if (contactError) setContactError(null);
                  }}
                  placeholder={placeholder}
                  aria-invalid={Boolean(contactError)}
                  required
                />
                {contactError && (
                  <p className="text-xs text-destructive">{contactError}</p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Confirm my prize"}
                </Button>
              </form>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={closeDrawer} type="button">
              Close
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}