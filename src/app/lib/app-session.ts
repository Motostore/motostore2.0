import { getSession } from "next-auth/react";

export async function getCurrentSession() {
  return await getSession()
}