"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Merchant } from "@/types/domain";
import { Building2, Calendar, CreditCard, Mail, User, CircleCheck as CheckCircle2, Circle as XCircle, Globe } from "lucide-react";

export interface MerchantDetailsCardProps {
  merchant?: Merchant;
  isLoading?: boolean;
}

function getPlanBadgeVariant(plan: string) {
  switch (plan) {
    case "enterprise":
      return "default" as const;
    case "pro":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function getStatusBadgeVariant(status: string) {
  return status === "active" ? ("default" as const) : ("destructive" as const);
}

export function MerchantDetailsCard({ merchant, isLoading }: MerchantDetailsCardProps) {
  if (isLoading) {
    return (
      <Card >
        <CardHeader>
          <CardTitle className="text-xl">Merchant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!merchant) return null;

  const created = new Date(merchant.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Merchant Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Merchant ID</p>
              <p className="text-sm font-medium">{merchant.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{merchant.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{merchant.email || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Plan</p>
              <div>
                <Badge variant={getPlanBadgeVariant(merchant.plan)} className="text-xs">
                  {merchant.plan}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              {merchant.status === "active" ? (
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div>
                <Badge variant={getStatusBadgeVariant(merchant.status)} className="text-xs">
                  {merchant.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Locale</p>
              <p className="text-sm font-medium">{merchant.locale || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{created}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MerchantDetailsCard;