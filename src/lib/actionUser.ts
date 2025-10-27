import { createSafeActionClient } from "next-safe-action";
export type ServerErr = { code: number; message: string };

export const actionUser = createSafeActionClient<undefined, ServerErr>({
  handleServerError(e): ServerErr {
    // If the error has a code property (custom ActionError), pass through
    if (typeof (e as any).code === "number") {
      const code = (e as any).code;
      // return something structured to the client
      return { code, message: e.message };
    }

    // fallback generic
    return { code: 500, message: "Something went wrong while executing the operation." };
  },
});
