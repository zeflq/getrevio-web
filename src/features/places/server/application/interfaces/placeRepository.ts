export type PlaceCreateRecord = {
  merchantId: string;
  localName: string;
  address?: string | null;
};

export type PlaceUpdateRecord = {
  id: string;
  merchantId?: string;
  localName?: string;
  address?: string | null;
};

export interface PlaceRepository {
  create(data: PlaceCreateRecord): Promise<string>;
  update(data: PlaceUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
}
