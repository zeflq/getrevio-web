import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { auth } from "./auth";

export const authClient =  createAuthClient({
    //you can pass client configuration here
    plugins: [
        inferAdditionalFields<typeof auth>(),
        organizationClient()
    ]
})
export const { useSession, signIn, signOut } = authClient
