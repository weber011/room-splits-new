import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login?redirectTo=/account");
  }

  if (user.ownerId || user.role === "owner") {
    redirect("/owner/dashboard");
  }

  redirect("/student/dashboard");
}
