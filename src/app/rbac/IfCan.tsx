'use client';

import { useSession } from "next-auth/react";
import { can } from "./permissions";

interface IfCanProps {
  permission: string; 
  children: React.ReactNode;
}

export default function IfCan({ permission, children }: IfCanProps) {
  const { data: session } = useSession();
  
  // 1. Aseguramos que el rol no sea undefined
  const userRole = (session?.user as any)?.role || 'CLIENT';

  // 2. EL FIX: Usamos 'as any' para que TypeScript deje pasar el string
  if (can(userRole, permission as any)) {
    return <>{children}</>;
  }

  return null;
}