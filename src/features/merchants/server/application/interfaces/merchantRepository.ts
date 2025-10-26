export type MerchantRecord = {
  id: string;
  name: string;
  email: string | null;
  locale: string | null;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended";
  createdAt: Date;
};

export type MerchantCreateRecord = {
  name: string;
  email?: string | null;
  locale?: string | null;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended";
};

export type MerchantUpdateRecord = {
  id: string;
  name?: string;
  email?: string | null;
  locale?: string | null;
  plan?: "free" | "pro" | "enterprise";
  status?: "active" | "suspended";
};

export interface MerchantRepository {
  create(data: MerchantCreateRecord): Promise<MerchantRecord>;
  update(data: MerchantUpdateRecord): Promise<MerchantRecord>;
  delete(id: string): Promise<MerchantRecord | null>;
  findById(id: string): Promise<MerchantRecord | null>;
}
