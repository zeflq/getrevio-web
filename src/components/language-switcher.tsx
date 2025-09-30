"use client";

import { useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languages, switchLocale } from "@/lib/utils";
 
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center m-0 ${className}`} aria-label="Change language">
          <span className="flex">
            {locale === "fr" ? "🇫🇷" : locale === "es" ? "🇪🇸" : "🇬🇧"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLocale(lang.code)}
            className={locale === lang.code ? "font-bold" : ""}
            aria-current={locale === lang.code ? "true" : undefined}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}