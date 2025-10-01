'use client';

import { useState } from 'react';
import { MerchantsTable, MerchantsTableFilters } from '@/features/merchants';

export default function MerchantsPage() {
  const [filters, setFilters] = useState<MerchantsTableFilters>({
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc',
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
          <p className="text-muted-foreground">
            Manage merchants and their settings
          </p>
        </div>
        <MerchantsTable filters={filters} onFiltersChange={setFilters} />
      </div>
    </div>
  );
}