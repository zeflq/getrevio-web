"use client";

import * as React from "react";

import { landingBlockPluginMap, type LandingBlock } from "@/features/landings/blocks";
import { renderAddons } from "@/features/landings/addons";
import { StepProvider, useStepController } from "./useStepController";
import { BlockChannelProvider } from "./BlockChannelContext";

export function TemplateLinearRenderer({ blocks }: { blocks: LandingBlock[] }) {
  return (
    <StepProvider total={blocks.length}>
      <TemplateSteps blocks={blocks} />
    </StepProvider>
  );
}

function TemplateSteps({ blocks }: { blocks: LandingBlock[] }) {
  const { isActive } = useStepController();

  return (
    <>
      {blocks.map((block, index) => {
        if (!isActive(index)) {
          return null;
        }
        const Renderer = landingBlockPluginMap[block.kind]?.Renderer;
        if (!Renderer) {
          return null;
        }
        return (
          <BlockChannelProvider key={block.id ?? index}>
            <Renderer data={block.data} />
            {renderAddons(block.addons)}
          </BlockChannelProvider>
        );
      })}
    </>
  );
}
