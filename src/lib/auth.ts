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
    plugins:[
        organization(
            {
                schema: {
                    organization: {
                        modelName: "Merchant", //map the organization table to organizations
                        fields: {
                            name: "name", //map the name field to title
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