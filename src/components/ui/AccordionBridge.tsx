"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export type AccordionSection = {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

type Props = {
  sections: AccordionSection[];
  /** default true = multiple panels can stay open */
  multiple?: boolean;
  /** for multiple → string[], for single → first entry is used */
  defaultOpenIds?: string[];
};

export function AccordionBridge({ sections, multiple = true, defaultOpenIds }: Props) {
  const allIds = sections.map(s => s.id);
  const arr = defaultOpenIds ?? (multiple ? allIds : [allIds[0]]);
  const first = arr[0];

  if (multiple) {
    return (
      <Accordion type="multiple" defaultValue={arr}>
        {sections.map((s) => (
          <AccordionItem key={s.id} value={s.id} className={s.className ?? "border rounded-md px-3"}>
            <AccordionTrigger className="text-base font-medium">{s.title}</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4 pt-2">{s.children}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  return (
    <Accordion type="single" defaultValue={first}>
      {sections.map((s) => (
        <AccordionItem key={s.id} value={s.id} className={s.className ?? "border rounded-md px-3"}>
          <AccordionTrigger className="text-base font-medium">{s.title}</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4 pt-2">{s.children}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
