import prisma from "@/lib/prisma";

export async function resolveLandingAssociations(landingId: string): Promise<{
  campaignId: string | undefined;
  placeId: string | undefined;
}> {
  const landing = await prisma.landing.findUnique({
    where: { id: landingId },
    select: {
      id: true,
      campaigns: {
        select: { id: true },
        take: 1,
      },
      places: {
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!landing) {
    throw new Error("LANDING_NOT_FOUND");
  }

  return {
    campaignId: landing.campaigns?.[0]?.id,
    placeId: landing.places?.[0]?.id,
  };
}
