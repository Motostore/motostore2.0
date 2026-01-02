// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

import { normalizeRole } from "../../../lib/roles";
import { User } from "../../../types/user.interface";

/* ----------------------------------------------
   1. CONFIGURACIÓN DEL BACKEND (RENDER)
---------------------------------------------- */
function getBaseApi(): string {
  // 🟢 CORRECCIÓN CRÍTICA: Apuntamos directo a RENDER
  return "https://motostore-api.onrender.com/api/v1";
}

/* ----------------------------------------------
   2. HELPERS PARA SALDO Y WALLET
---------------------------------------------- */

// Extrae el token de la respuesta del backend
function extractToken(data: any): string | null {
  return data?.access_token || data?.token || null;
}

// Consulta el saldo real en la Wallet
async function fetchWalletMe(baseApi: string, token: string) {
  try {
    const res = await fetch(`${baseApi}/wallet/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("[NextAuth] Wallet fetch error:", err);
    return null;
  }
}

// Busca el número del saldo dentro de la respuesta
function extractWalletBalance(payload: any): number | null {
  if (!payload) return null;
  const candidates = [
    payload?.balance,
    payload?.wallet?.balance,
    payload?.data?.balance,
    payload?.data?.wallet?.balance,
  ];

  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string" && !isNaN(Number(c))) return Number(c);
  }
  return null;
}

// Crea el objeto de usuario para la sesión
function createAuthUser(rawUser: any, token: string, username: string): User {
  const initialBalance = rawUser?.balance ?? 0;

  return {
    id: String(rawUser?.id || rawUser?._id || "1"),
    username: rawUser?.username || username,
    email: rawUser?.email || "",
    name: rawUser?.name || rawUser?.full_name || username,
    image: rawUser?.avatar || null,
    role: normalizeRole(rawUser?.role ?? "CLIENT"),
    token,
    accessToken: token,
    balance: Number(initialBalance) || 0,
    balanceText: String(Number(initialBalance) || 0),
    cedula: rawUser?.cedula ?? null,
    telefono: rawUser?.telefono ?? null,
    backendData: rawUser,
  } as any;
}

/* ----------------------------------------------
   3. OPCIONES DE NEXTAUTH
---------------------------------------------- */

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 300 * 60 }, // 5 horas
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET || "secreto_super_seguro_cambiar_en_vercel",
  
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          const baseApi = getBaseApi();
          const username = credentials?.username?.trim();
          const password = credentials?.password;

          if (!username || !password) return null;

          // 🟢 PETICIÓN AL BACKEND (CORREGIDA)
          // Usamos x-www-form-urlencoded porque FastAPI lo exige para OAuth2
          const loginUrl = `${baseApi}/auth/login/access-token`;
          
          const res = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Accept": "application/json",
            },
            body: new URLSearchParams({
              username: username,
              password: password,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data) {
            console.error("❌ Error Login Backend:", data);
            return null;
          }

          const token = extractToken(data);
          if (!token) return null;

          // Ya tenemos token, ahora obtenemos datos del usuario y wallet
          // (A veces el endpoint de login no devuelve el usuario completo, solo el token)
          // Si tu endpoint devuelve usuario, úsalo. Si no, consultamos /users/me o /wallet/me
          
          // Paso extra: Intentamos obtener info del usuario usando el token nuevo
          let userData = data.user || {}; // Si el login devolvió usuario
          
          // Consultamos Wallet para asegurar saldo y datos frescos
          const walletData = await fetchWalletMe(baseApi, token);
          
          // Si walletData trae info de usuario, la mezclamos
          if (walletData) {
              const walletBalance = extractWalletBalance(walletData);
              userData = { ...userData, ...walletData, balance: walletBalance ?? userData.balance };
          }

          return createAuthUser(userData, token, username);

        } catch (err) {
          console.error("🔥 [NextAuth] Error CRÍTICO en authorize:", err);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as any;
        token.accessToken = (user as any).accessToken;
        (token as any).walletSyncAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
























