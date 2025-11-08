export type CampaignProps = {
  merchantId: string;
  placeId: string;
  name: string;
  status: "draft" | "active" | "archived";
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

  get status() {
    return this.props.status;
  }

  toJSON() {
    return { ...this.props };
  }
}
