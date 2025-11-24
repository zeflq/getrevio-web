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
  //       kind: "heroWithCta",
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
  //       kind: "legalText",
  //       label: "Legal text",
  //       mode: "optional",
  //       maxInstances: 1,
  //     },
  //     {
  //       id: "hero-cta-simple",
  //       kind: "simpleHero",
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
  //       kind: "simpleHero",
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
  //       kind: "game",
  //       label: "Game",
  //       mode: "fixed",
  //       maxInstances: 1,
  //       defaultData: {
  //         ctaLabel: "Play now",
  //       },
  //     },
  //     {
  //       id: "campaign-game-legal",
  //       kind: "legalText",
  //       label: "Legal text",
  //       mode: "optional",
  //       maxInstances: 1,
  //     },
  //   ],
  // },

  {
    id: "slot-game",
    blocks: [
      {
        id: "slot-game-intent",
        kind: "intentHero",
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
            id: "slot-game-footer",
            kind: "footerAddon",
            mode: "fixed",
            maxInstances: 1,
            defaultData: {
              text: "© 2024 Casino Inc. Play responsibly. Terms apply.!",
              align: "center",
              tone: "muted",
            },
          },
        ],
      },
      {
        id: "slot-game-legal",
        kind: "legalText",
        mode: "optional",
        maxInstances: 1,
      },
    ],
  },
];

export const getTemplateById = (id?: string | null) =>
  landingTemplates.find((template) => template.id === id);
