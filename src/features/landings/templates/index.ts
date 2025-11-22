import type { LandingTemplate } from "./types";

export const landingTemplates: LandingTemplate[] = [
  // {
  //   id: "hero-cta",
  //   name: "Hero with CTA",
  //   description: {
  //     en: "Highlight your primary message with a hero and CTA. Legal copy is optional for compliance.",
  //     fr: "Mettez en avant votre message principal avec un hero et des CTA. Le texte légal reste optionnel pour la conformité.",
  //   },
  //   blocks: [
  //     {
  //       id: "hero-cta-hero",
  //       blockType: "heroWithCta",
  //       label: "Hero",
  //       mode: "fixed",
  //       maxInstances: 1,
  //       defaultData: {
  //         title: "Welcome to our place",
  //         subtitle: "Book your next visit",
  //         ctas: [
  //           {
  //             label: "Book now",
  //             url: "",
  //             style: "primary",
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       id: "hero-cta-legal",
  //       blockType: "legalText",
  //       label: "Legal text",
  //       mode: "optional",
  //       maxInstances: 1,
  //     },
  //     {
  //       id: "hero-cta-simple",
  //       blockType: "simpleHero",
  //       label: "Secondary hero",
  //       mode: "optional",
  //       defaultData: {
  //         title: "More to discover",
  //         subtitle: "Share your experience",
  //       },
  //     },
  //   ],
  // },
  // {
  //   id: "campaign-game",
  //   name: "Campaign landing",
  //   description: {
  //     en: "Great for promotion-oriented landings with an interactive game block.",
  //     fr: "Parfait pour les landings promotionnelles avec un bloc jeu interactif.",
  //   },
  //   blocks: [
  //     {
  //       id: "campaign-game-hero",
  //       blockType: "simpleHero",
  //       label: "Hero",
  //       mode: "fixed",
  //       maxInstances: 1,
  //       defaultData: {
  //         title: "Join the campaign",
  //         subtitle: "Play for a chance to win",
  //       },
  //     },
  //     {
  //       id: "campaign-game-game",
  //       blockType: "game",
  //       label: "Game",
  //       mode: "fixed",
  //       maxInstances: 1,
  //       defaultData: {
  //         ctaLabel: "Play now",
  //       },
  //     },
  //     {
  //       id: "campaign-game-legal",
  //       blockType: "legalText",
  //       label: "Legal text",
  //       mode: "optional",
  //       maxInstances: 1,
  //     },
  //   ],
  // },

  {
    id: "slot-game",
    name: "Slot game",
    description: {
      en: "A bold CTA hero to kick off your slot-game-specific landing.",
      fr: "Un hero accrocheur pour lancer votre landing dédié au slot-game.",
    },
    blocks: [
      {
        id: "slot-game-intent",
        blockType: "intentHero",
        label: "Intent hero",
        mode: "fixed",
        maxInstances: 1,
        defaultData: {
          title: "Play the slot—big fun awaits",
          subtitle: "Spin the reels and grab a bonus",
          cta: {
            label: "Je tente ma chance",
          },
        },
        addons: [
          {
            kind: "footerAddon",
            mode: "optional",
            maxInstances: 1,
            defaultData: {
              text: "© 2024 Casino Inc. Play responsibly. Terms apply.",
              align: "center",
              tone: "muted",
            },
          },
        ],
      },
      {
        id: "slot-game-legal",
        blockType: "legalText",
        label: "Legal text",
        mode: "optional",
        maxInstances: 1,
      },
    ],
  },
];

export const getTemplateById = (id?: string | null) =>
  landingTemplates.find((template) => template.id === id);
