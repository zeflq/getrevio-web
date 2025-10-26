export type CampaignProps = {
  merchantId: string;
  placeId: string;
  name: string;
  slug: string;
  primaryCtaUrl: string;
  status: "draft" | "active" | "archived";
  theme?: {
    brandColor?: string;
    logoUrl?: string;
  };
};

export class CampaignEntity {
  constructor(private readonly props: CampaignProps) {}

  get merchantId() {
    return this.props.merchantId;
  }

  get placeId() {
    return this.props.placeId;
  }

  get name() {
    return this.props.name;
  }

  get slug() {
    return this.props.slug;
  }

  get primaryCtaUrl() {
    return this.props.primaryCtaUrl;
  }

  get status() {
    return this.props.status;
  }

  get theme() {
    return this.props.theme;
  }

  toJSON() {
    return { ...this.props };
  }
}
