import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@prisma/client";
import { organization } from "better-auth/plugins"

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: { 
        enabled: true, 
    },
    user:{
        additionalFields: {
            globalRole: { 
                type: "string", 
                required: false, 
                defaultValue: "USER",
                input: false
            }
        }
    },
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                const organizationId = await getActiveOrganization(session.userId);
                return {
                    data: {
                        ...session,
                        activeOrganizationId: organizationId,
                    },
                };
                },
            },
        },
    },
    plugins:[
        organization(
            {
               // allowUserToCreateOrganizations: true,
                schema: {
                    organization: {
                        modelName: "Merchant", //map the organization table to organizations
                        additionalFields: {
                            email: {
                                type: "string",
                                input: true,
                                required: false,
                            },
                            onboardingStep: {
                                type: "number",
                                input: true,
                                required: false,
                            },
                        },
                    },
                },
            }
        ),
        // customSession(async ({ user, session }) => {
        //     return {
        //         user: {
        //             ...user,
        //             x: "x",
        //         },
        //         session
        //     };
        // }),
    ],
});

type Session = typeof auth.$Infer.Session
export type { Session };

export async function getActiveOrganization(userId: string) {
    if (!userId) return null;

    const membership = await prisma.member.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
    });

    return membership?.organizationId ?? null;
}
