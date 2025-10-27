import { z } from "zod";

export const organizationStepFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export type OrganizationStepFormInput = z.input<typeof organizationStepFormSchema>;
export type OrganizationStepFormData = z.output<typeof organizationStepFormSchema>;

export type OrganizationStepData = OrganizationStepFormData & {
  id?: string;
  onboardingStep?: number;
};

export const organizationStepSubmitSchema = organizationStepFormSchema.extend({
  organizationId: z.string().optional(),
});

export type OrganizationStepSubmitInput = z.input<typeof organizationStepSubmitSchema>;
