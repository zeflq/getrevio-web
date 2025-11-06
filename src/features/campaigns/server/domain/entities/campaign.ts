export type CampaignProps = {
  merchantId: string;
  placeId: string;
  name: string;
  slug: string;
  status: "draft" | "active" | "archived";
  themeId?: string | null;
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

  get status() {
    return this.props.status;
  }

  get themeId() {
    return this.props.themeId ?? null;
  }

  toJSON() {
    return { ...this.props };
  }
}
