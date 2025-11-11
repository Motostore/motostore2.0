// src/app/dashboard/super/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function SuperPage() {
  const s = await getServerSession(authOptions);
  if (!s) redirect("/login");
  if (s.user.role !== "SUPERUSER") redirect("/403");
  return <main className="p-6">Panel SUPERUSER</main>;
}

