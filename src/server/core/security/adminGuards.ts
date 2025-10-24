import { getServerSession } from "@/lib/auth-server";
import { SUPER_ADMIN } from "@/lib/utils";

export async function ensureSuperAdmin() {
  const session = await getServerSession();
  if (!session?.user || session.user.globalRole !== SUPER_ADMIN) {
    throw new Error("FORBIDDEN");
  }
}
