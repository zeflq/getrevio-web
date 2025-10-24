// app/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server"; // implement with Better Auth
import { SUPER_ADMIN } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.globalRole;
  if (role === SUPER_ADMIN) {
    redirect("/admin");
  }

  // Default landing for normal users
  redirect("/m");
}
