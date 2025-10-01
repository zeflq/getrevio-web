"use client";

import { useState } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMerchants } from '../hooks/useMerchants';
import { CreateMerchantDialog } from './CreateMerchantDialog';
import { EditMerchantSheet } from './EditMerchantSheet';
import { DeleteMerchantDialog } from './DeleteMerchantDialog';
import { useRouter } from 'next/navigation';

export interface MerchantsTableFilters {
  q?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  status?: 'active' | 'suspended';
  page?: number;
  limit?: number;
  sort?: 'name' | 'createdAt' | 'plan' | 'status';
  order?: 'asc' | 'desc';
}

export interface MerchantsTableProps {
  filters: MerchantsTableFilters;
  onFiltersChange: (filters: MerchantsTableFilters) => void;
}

export function MerchantsTable({ filters, onFiltersChange }: MerchantsTableProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | undefined>();

  const { data: merchantsResponse, isLoading, error } = useMerchants({
    q: filters.q,
    plan: filters.plan,
    status: filters.status,
    _page: filters.page,
    _limit: filters.limit,
    _sort: filters.sort,
    _order: filters.order,
  });
  const totalCount = merchantsResponse?.total ?? 0;
  const limit = filters.limit || 10;
  const currentPage = filters.page || 1;
  const totalPages = merchantsResponse?.totalPages ?? Math.max(1, Math.ceil(totalCount / limit));

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, q: value, page: 1 });
  };

  const handlePlanChange = (value: string) => {
    onFiltersChange({
      ...filters,
      plan: value === 'all' ? undefined : (value as 'free' | 'pro' | 'enterprise'),
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as 'active' | 'suspended'),
      page: 1,
    });
  };

  const handleEdit = (merchantId: string) => {
    setSelectedMerchantId(merchantId);
    setEditSheetOpen(true);
  };

  const handleDelete = (merchantId: string) => {
    setSelectedMerchantId(merchantId);
    setDeleteDialogOpen(true);
  };

  const handleView = (merchantId: string) => {
    router.push(`/admin/merchants/${merchantId}`);
  };

  const handlePreviousPage = () => {
    if (filters.page && filters.page > 1) {
      onFiltersChange({ ...filters, page: filters.page - 1 });
    }
  };

  const handleNextPage = () => {
    onFiltersChange({ ...filters, page: (filters.page || 1) + 1 });
  };

  const handleFirstPage = () => {
    onFiltersChange({ ...filters, page: 1 });
  };

  const handleLastPage = () => {
    onFiltersChange({ ...filters, page: totalPages });
  };

  const handleRowsPerPageChange = (value: string) => {
    const nextLimit = Number(value);
    onFiltersChange({ ...filters, limit: nextLimit, page: 1 });
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'destructive';
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load merchants. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search merchants..."
              value={filters.q || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filters.plan || 'all'} onValueChange={handlePlanChange}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Merchant
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: filters.limit || 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
            ))
            ) : merchantsResponse && merchantsResponse.data?.length > 0 ? (
              merchantsResponse.data.map((merchant) => (
                <TableRow key={merchant.id}>
                  <TableCell className="font-medium">{merchant.name}</TableCell>
                  <TableCell>{merchant.email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={getPlanBadgeVariant(merchant.plan)}>
                      {merchant.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(merchant.status)}>
                      {merchant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(merchant.id)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(merchant.id)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(merchant.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">No merchants found</p>
                    {filters.q || filters.plan || filters.status ? (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => onFiltersChange({ page: 1, limit: filters.limit })}
                      >
                        Clear filters
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">0 of {totalCount} row(s) selected.</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select value={String(limit)} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleFirstPage}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLastPage}
                disabled={currentPage >= totalPages}
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreateMerchantDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {selectedMerchantId && (
        <>
          <EditMerchantSheet
            merchantId={selectedMerchantId}
            open={editSheetOpen}
            onOpenChange={setEditSheetOpen}
          />
          <DeleteMerchantDialog
            merchantId={selectedMerchantId}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </div>
  );
}