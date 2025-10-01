"use client";

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { merchantUpdateSchema, MerchantUpdateInput } from '../model/merchantSchema';
import { useMerchant } from '../hooks/useMerchant';
import { useUpdateMerchant } from '../hooks/useUpdateMerchant';

export interface EditMerchantSheetProps {
  merchantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMerchantSheet({ merchantId, open, onOpenChange }: EditMerchantSheetProps) {
  const { data: merchant, isLoading } = useMerchant({ id: merchantId });
  const updateMerchant = useUpdateMerchant({ id: merchantId });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<MerchantUpdateInput>({
    resolver: zodResolver(merchantUpdateSchema),
    defaultValues: {
      plan: 'free',
      status: 'active',
    },
  });

  useEffect(() => {
    if (merchant) {
      reset({
        name: merchant.name,
        email: merchant.email,
        locale: merchant.locale,
        plan: merchant.plan,
        status: merchant.status,
      });
    }
  }, [merchant, reset]);

  const onSubmit = async (data: MerchantUpdateInput) => {
    try {
      await updateMerchant.mutateAsync({
        id: merchantId,
        data,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update merchant:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Edit Merchant</SheetTitle>
          <SheetDescription>
            Update merchant information. Changes will be saved immediately.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter merchant name"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="merchant@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-locale">Locale</Label>
              <Input
                id="edit-locale"
                placeholder="en-US"
                {...register('locale')}
                aria-invalid={!!errors.locale}
              />
              {errors.locale && (
                <p className="text-sm text-destructive">{errors.locale.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-plan">Plan</Label>
              <Controller
                name="plan"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-plan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.plan && (
                <p className="text-sm text-destructive">{errors.plan.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMerchant.isPending}>
                {updateMerchant.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}