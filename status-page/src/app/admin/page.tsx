import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminRootPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    redirect("/admin/login");
  }
  redirect("/admin/dashboard");
}
