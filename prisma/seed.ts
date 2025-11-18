import { PrismaClient, Plan, Status } from "@prisma/client";
import { buildThemeMeta } from "../src/features/themes/lib/themeMeta";

const prisma = new PrismaClient();

const defaultThemeMeta = buildThemeMeta();

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
      address: "12 Rue Exemple, Paris",
      createdAt: new Date("2025-09-20T10:05:00Z"),
    },
    {
      id: "pl_lum_1",
      merchantId: "mer_2",
      localName: "Hotel Lumière - Lobby",
      address: "18 Rue du Louvre, Paris",
      createdAt: new Date("2025-09-21T09:05:00Z"),
    },
    {
      id: "pl_daybreak_1",
      merchantId: "mer_3",
      localName: "Daybreak Coffee - Downtown",
      address: "415 Market Street, Seattle",
      createdAt: new Date("2025-09-22T08:45:00Z"),
    },
    {
      id: "pl_cityscape_1",
      merchantId: "mer_5",
      localName: "Cityscape Fitness - Uptown",
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
          address: place.address,
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
      meta: defaultThemeMeta,
      createdAt: new Date("2025-09-20T10:10:00Z"),
      updatedAt: new Date("2025-09-20T10:10:00Z"),
    },
    {
      id: "th_warm",
      merchantId: "mer_2",
      name: "Warm Luxe",
      meta: defaultThemeMeta,
      createdAt: new Date("2025-09-21T09:10:00Z"),
      updatedAt: new Date("2025-09-21T09:10:00Z"),
    },
    {
      id: "th_daybreak",
      merchantId: "mer_3",
      name: "Daybreak Espresso",
      meta: defaultThemeMeta,
      createdAt: new Date("2025-09-22T08:50:00Z"),
      updatedAt: new Date("2025-09-22T08:50:00Z"),
    },
  ];

  await Promise.all(
    themes.map((theme) =>
      prisma.theme.upsert({
        where: { id: theme.id },
        update: {
          name: theme.name,
          logoUrl: theme.logoUrl,
          meta: theme.meta,
        },
        create: theme,
      })
    )
  );

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
