import { LandingEditPageContent } from "@/features/landings";

type Props = {
  params: { id: string };
};

export default function LandingEditPage({ params }: Props) {
  return <LandingEditPageContent id={params.id} />;
}

