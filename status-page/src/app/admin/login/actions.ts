"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { verifyAdminPassword } from "@/lib/db";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  if (!password || !verifyAdminPassword(password)) {
    redirect("/admin/login?error=Invalid+password");
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  redirect("/admin/dashboard");
}
