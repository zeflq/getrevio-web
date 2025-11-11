import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@prisma/client";
import { customSession, organization } from "better-auth/plugins"

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: { 
        enabled: true, 
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            scope: ["https://www.googleapis.com/auth/business.manage"],
            accessType: "offline",        // important: pour avoir refresh_token
            prompt: "select_account consent",            // important: pour forcer refresh_token
        },
    }, 
    user:{
        additionalFields: {
            globalRole: { 
                type: "string", 
                required: false, 
                defaultValue: "TENANT_USER",
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
        customSession(async ({ user, session }) => {
            // Fetch the user's account to determine the provider
            const account = await prisma.account.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            });
            
            const provider = account?.providerId || 'email';
            
            return {
                user: {
                    ...user,
                    provider
                },
                session
            };
        }),
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
