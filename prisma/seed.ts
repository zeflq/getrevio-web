import { PrismaClient, Plan, Status } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const merchants = [
    {
      id: "mer_1",
      name: "Bella Pizza",
      email: "owner@bella.com",
      plan:  Plan.free,
      status: Status.active,
      createdAt: new Date("2025-09-20T10:00:00Z"),
    },
    {
      id: "mer_2",
      name: "Hotel Lumière",
      email: "gm@lumiere.com",
      plan: Plan.pro,
      status: Status.active,
      createdAt: new Date("2025-09-21T09:00:00Z"),
    },
    {
      id: "mer_3",
      name: "Daybreak Coffee Roasters",
      email: "hello@daybreak.coffee",
      plan: Plan.pro,
      status: Status.active,
      locale: "en-US",
      createdAt: new Date("2025-09-22T08:30:00Z"),
    },
    {
      id: "mer_4",
      name: "La Table du Jardin",
      email: "reservations@latabledujardin.fr",
      plan: Plan.enterprise,
      status: Status.active,
      locale: "fr-FR",
      createdAt: new Date("2025-09-23T12:00:00Z"),
    },
    {
      id: "mer_5",
      name: "Cityscape Fitness",
      email: "contact@cityscapefit.com",
      plan: Plan.free,
      status: Status.suspended,
      locale: "en-US",
      createdAt: new Date("2025-09-24T07:15:00Z"),
    },
  ];

  await Promise.all(
    merchants.map((merchant) =>
      prisma.merchant.upsert({
        where: { id: merchant.id },
        update: {
          name: merchant.name,
          email: merchant.email,
          locale: merchant.locale,
          plan: merchant.plan,
          status: merchant.status,
          defaultThemeId: merchant?.defaultThemeId,
        },
        create: merchant,
      })
    )
  );

  const places = [
    {
      id: "pl_bella_1",
      merchantId: "mer_1",
      localName: "Bella Pizza",
      slug: "bella-pizza",
      address: "12 Rue Exemple, Paris",
      googlePlaceId: "1Zza",
      createdAt: new Date("2025-09-20T10:05:00Z"),
    },
    {
      id: "pl_lum_1",
      merchantId: "mer_2",
      localName: "Hotel Lumière - Lobby",
      slug: "hotel-lumiere-lobby",
      address: "18 Rue du Louvre, Paris",
      createdAt: new Date("2025-09-21T09:05:00Z"),
      landingDefaults: {
        primaryCtaLabel: "Share feedback",
        primaryCtaUrl: "https://example.com/review",
        secondaryCtaLabel: "See menu",
        secondaryCtaUrl: "https://example.com/menu",
      },
    },
    {
      id: "pl_daybreak_1",
      merchantId: "mer_3",
      localName: "Daybreak Coffee - Downtown",
      slug: "daybreak-coffee-downtown",
      address: "415 Market Street, Seattle",
      createdAt: new Date("2025-09-22T08:45:00Z"),
    },
    {
      id: "pl_cityscape_1",
      merchantId: "mer_5",
      localName: "Cityscape Fitness - Uptown",
      slug: "cityscape-fitness-uptown",
      address: "220 Highline Ave, Denver",
      createdAt: new Date("2025-09-24T08:00:00Z"),
    },
  ];

  await Promise.all(
    places.map((place) =>
      prisma.place.upsert({
        where: { id: place.id },
        update: {
          localName: place.localName,
          slug: place.slug,
          address: place.address,
          //themeId: place?.themeId,
          landingDefaults: place.landingDefaults,
          googlePlaceId: place.googlePlaceId,
        },
        create: place,
      })
    )
  );

  const themes = [
    {
      id: "th_modern",
      merchantId: "mer_1",
      name: "Modern Minimal",
      logoUrl: "https://example.com/assets/bella-logo.png",
      brandColor: "#1D3557",
      accentColor: "#E63946",
      textColor: "#F1FAEE",
      createdAt: new Date("2025-09-20T10:10:00Z"),
    },
    {
      id: "th_warm",
      merchantId: "mer_2",
      name: "Warm Luxe",
      brandColor: "#8D5524",
      accentColor: "#C68642",
      textColor: "#F5E6DA",
      createdAt: new Date("2025-09-21T09:10:00Z"),
    },
    {
      id: "th_daybreak",
      merchantId: "mer_3",
      name: "Daybreak Espresso",
      brandColor: "#2a9d8f",
      accentColor: "#e9c46a",
      textColor: "#264653",
      createdAt: new Date("2025-09-22T08:50:00Z"),
    },
  ];

  await Promise.all(
    themes.map((theme) =>
      prisma.theme.upsert({
        where: { id: theme.id },
        update: {
          name: theme.name,
          logoUrl: theme.logoUrl,
          brandColor: theme.brandColor,
          accentColor: theme.accentColor,
          textColor: theme.textColor,
        },
        create: theme,
      })
    )
  );

  await prisma.merchant.updateMany({
    where: { id: "mer_1" },
    data: { defaultThemeId: "th_modern" },
  });

  const superAdminEmail = "flaviodelmondo@gmail.com";

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: "Flavio Delmondo",
      globalRole: "SUPER_ADMIN",
      emailVerified: true,
    },
    create: {
      id: "usr_super_admin",
      name: "Flavio Delmondo",
      email: superAdminEmail,
      globalRole: "SUPER_ADMIN",
      emailVerified: true,
    },
  });

  console.log(
    `Seeded ${merchants.length} merchants, ${places.length} places, and ${themes.length} themes.`
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
