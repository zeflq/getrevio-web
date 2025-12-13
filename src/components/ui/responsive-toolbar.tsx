
"use client";
import * as React from "react";
import {
  ToolbarGroup,
} from "./toolbar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";



export function ResponsiveToolbarGroup({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ToolbarGroup className={cn("", className)} {...props}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className=" h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {React.Children.map(children, (child, i) => (
              <DropdownMenuItem key={i}>
                {(child as React.ReactElement<any>).props.children}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarGroup>
    );
  }

  return (
    <ToolbarGroup className={className} {...props}>
      {children}
    </ToolbarGroup>
  );
}
