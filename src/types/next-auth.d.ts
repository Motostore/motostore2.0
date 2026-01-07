// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extendemos la interfaz de SESIÓN para incluir el ID y otros datos
   */
  interface Session {
    user: {
      id: string;        // 👈 ¡Esto es lo que arregla el error!
      username?: string;
      role?: string;
      balance?: number;
      accessToken?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extendemos la interfaz de USUARIO (lo que devuelve authorize)
   */
  interface User {
    id: string;
    username?: string;
    role?: string;
    accessToken?: string;
    balance?: number;
    [key: string]: any; // Permite propiedades extra del backend
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: any;
    accessToken?: string;
    sub?: string;
  }
}
