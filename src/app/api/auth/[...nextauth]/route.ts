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
  return "https://motostore-api.onrender.com/api/v1";
}

/* ----------------------------------------------
   2. HELPERS PARA SALDO Y WALLET
---------------------------------------------- */

function extractToken(data: any): string | null {
  return data?.access_token || data?.token || null;
}

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

// 🛠️ FUNCIÓN CLAVE: AQUÍ MAPEA LOS DATOS DEL PERFIL
function createAuthUser(rawUser: any, token: string, username: string): User {
  const initialBalance = rawUser?.balance ?? 0;

  // Intentamos obtener fecha de registro. Si no viene, usamos la fecha actual como fallback.
  const createdDate = rawUser?.created_at || rawUser?.createdAt || new Date().toISOString();

  // Intentamos obtener datos del distribuidor (padre) si el backend los envía anidados
  const parentName = rawUser?.parent_agent?.name || rawUser?.parentName || 'Soporte MotoStore';
  const parentPhone = rawUser?.parent_agent?.phone || rawUser?.parentPhone || '0412-0000000';
  const parentEmail = rawUser?.parent_agent?.email || rawUser?.parentEmail || 'soporte@motostore.com';

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
    cedula: rawUser?.cedula || rawUser?.dni || null,
    telefono: rawUser?.telefono || rawUser?.phone || null,
    
    // --- NUEVOS CAMPOS AGREGADOS ---
    createdAt: createdDate,
    parentName: parentName,
    parentPhone: parentPhone,
    parentEmail: parentEmail,
    
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
      async authorize(credentials, req) {
        try {
          const baseApi = getBaseApi();
          const username = credentials?.username?.trim();
          const password = credentials?.password;

          if (!username || !password) return null;

          // --- CIBERSEGURIDAD: CAPTURA DE IP Y PAÍS ---
          const headersList = (req as any)?.headers || {};
          const forwardedFor = headersList["x-forwarded-for"] || "";
          const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1";
          const country = headersList["x-vercel-ip-country"] || headersList["cf-ipcountry"] || "XX";
          const userAgent = headersList["user-agent"] || "NextAuth Client";

          console.log(`🔐 INTENTO DE LOGIN: ${username} desde IP: ${ip} (${country})`);

          // 🟢 PETICIÓN AL BACKEND
          const loginUrl = `${baseApi}/auth/login/access-token`;
          
          const res = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Accept": "application/json",
              "X-Forwarded-For": ip,
              "X-Client-Country": country,
              "User-Agent": userAgent
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

          let userData = data.user || {}; 
          
          // Consultamos Wallet
          const walletData = await fetchWalletMe(baseApi, token);
          
          if (walletData) {
              const walletBalance = extractWalletBalance(walletData);
              userData = { ...userData, ...walletData, balance: walletBalance ?? userData.balance };
          }

          if (userData.disabled === true) {
             throw new Error("⛔ Tu cuenta está pendiente de aprobación. Contacta al administrador.");
          }

          return createAuthUser(userData, token, username);

        } catch (err: any) {
          console.error("🔥 [NextAuth] Error CRÍTICO en authorize:", err);
          if (err.message.includes("pendiente de aprobación")) {
             throw err;
          }
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
    async jwt({ token, user, trigger, session }) {
      // 1. Login inicial
      if (user) {
        token.user = user as any;
        token.accessToken = (user as any).accessToken;
        (token as any).walletSyncAt = Date.now();
      }

      // 2. Soporte para actualizar sesión desde el cliente (Settings)
      if (trigger === "update" && session) {
        // Fusionamos los datos nuevos con los viejos
        token.user = { ...(token.user as any), ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      // Pasamos todos los datos del token a la sesión del cliente
      session.user = token.user as any;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };























