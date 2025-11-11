// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { normalizeRole } from "../../../lib/roles";

/* ─── Helpers ─── */
function pick<T = any>(obj: any, keys: string[]): T | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return null;
}

function base64UrlToString(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

function parseJwtClaims(token: string | null): any | null {
  if (!token) return null;
  try {
    const t = token.startsWith("Bearer ") ? token.slice(7) : token;
    const parts = t.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(base64UrlToString(parts[1]));
    return payload || null;
  } catch {
    return null;
  }
}

function extractRole(rawUser: any, data: any): string | null {
  const direct =
    pick(rawUser, ["role", "rol", "type", "perfil", "userRole", "user_type"]) ??
    pick(data, ["role", "rol"]);
  if (typeof direct === "string") return direct;

  if (rawUser?.role) {
    if (typeof rawUser.role === "string") return rawUser.role;
    if (typeof rawUser.role?.name === "string") return rawUser.role.name;
    if (typeof rawUser.role?.code === "string") return rawUser.role.code;
  }

  const arrs = [rawUser?.roles, rawUser?.authorities];
  for (const arr of arrs) {
    if (Array.isArray(arr) && arr.length > 0) {
      const first = arr[0];
      if (typeof first === "string") return first;
      if (typeof first?.name === "string") return first.name;
      if (typeof first?.code === "string") return first.code;
      if (typeof first?.authority === "string") return first.authority;
    }
  }

  if (rawUser?.perfil?.name) return rawUser.perfil.name;
  if (rawUser?.perfil?.code) return rawUser.perfil.code;

  return null;
}

function roleFromUsername(username: string | null | undefined): string | null {
  if (!username) return null;
  const u = username.toLowerCase();
  if (u.startsWith("super")) return "SUPERUSER";
  if (u.startsWith("admin")) return "ADMIN";
  if (u.startsWith("distri") || u.startsWith("distrib")) return "DISTRIBUTOR";
  if (u.startsWith("subdistrib")) return "SUBDISTRIBUTOR";
  if (u.includes("sustaquilla")) return "SUSTAQUILLA";
  if (u.includes("subtaquilla")) return "SUBTAQUILLA";
  if (u.includes("taquilla")) return "TAQUILLA";
  if (u.startsWith("client")) return "CLIENT";
  return null;
}

/** Devuelve la base del API sin lanzar errores al importar */
function getBaseApi(): string {
  const raw = (process.env.NEXT_PUBLIC_API_FULL || process.env.API_BASE || "").trim();
  return raw.replace(/\/$/, "");
}

async function tryLogin(base: string, payload: any) {
  if (!base) return null;
  const endpoints = ["/auth/login", "/login", "/auth/sign-in"];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}${ep}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) continue;

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        // Si no es JSON, asumimos que es un token plano
        return { token: text };
      }
    } catch {
      // siguiente endpoint
    }
  }
  return null;
}

async function fetchProfile(base: string, accessToken: string, username?: string | null) {
  if (!base) return null;
  const b = base.replace(/\/$/, "");
  const headers = {
    Accept: "application/json",
    Authorization: accessToken?.startsWith("Bearer ")
      ? accessToken
      : `Bearer ${accessToken}`,
  };

  const urls: string[] = [
    `${b}/auth/me`,
    `${b}/users/me`,
    `${b}/user/me`,
    `${b}/account/me`,
    `${b}/profile/me`,
    username ? `${b}/users/username/${encodeURIComponent(username)}` : "",
    username ? `${b}/users/find-by-username?username=${encodeURIComponent(username)}` : "",
  ].filter(Boolean);

  for (const url of urls) {
    try {
      const r = await fetch(url, { headers });
      if (!r.ok) continue;
      const txt = await r.text();
      try {
        return JSON.parse(txt);
      } catch {
        // si devuelve HTML/otro, seguimos
      }
    } catch {
      // siguiente URL
    }
  }
  return null;
}
/* ─── /Helpers ─── */

const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET || (isProd ? undefined : "dev-secret-1234567890"),
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const baseApi = getBaseApi();
        const username = credentials?.username?.toString().trim();
        const password = credentials?.password?.toString();

        // Si falta backend o credenciales → no autenticamos (pero no rompemos /session)
        if (!username || !password || !baseApi) return null;

        // 1) Login
        const data =
          (await tryLogin(baseApi, { username, password })) ??
          (await tryLogin(baseApi, { email: username, password }));
        if (!data) return null;

        // 2) Token + usuario parcial
        const rawUser =
          pick<any>(data, ["user", "usuario", "data", "account", "profile"]) ?? data;
        const id =
          pick<any>(rawUser, ["id", "userId", "uid", "_id", "uuid"]) ?? username;

        let accessToken =
          pick<string>(data, ["token", "accessToken", "jwt", "access_token"]) ??
          pick<string>(rawUser, ["token", "accessToken"]) ??
          null;
        if (!accessToken) {
          const t2 = pick<any>(data, ["token"]) ?? pick<any>(rawUser, ["token"]);
          if (t2?.access_token) accessToken = t2.access_token;
        }

        // 3) Detectar rol
        let roleDetected: string | null = extractRole(rawUser, data) ?? null;

        // 4) Claims del JWT
        if (!roleDetected && accessToken) {
          const claims = parseJwtClaims(accessToken);
          if (claims) {
            roleDetected =
              (typeof claims.role === "string" && claims.role) ||
              (Array.isArray(claims.authorities) && claims.authorities[0]) ||
              (Array.isArray(claims.roles) && claims.roles[0]) ||
              (typeof claims.rol === "string" && claims.rol) ||
              null;
          }
        }

        // 5) /me
        if (!roleDetected && accessToken) {
          const profile = await fetchProfile(baseApi, accessToken, username);
          if (profile) roleDetected = extractRole(profile, {});
        }

        // 6) Fallback username (dev)
        if (!roleDetected) roleDetected = roleFromUsername(username);

        const role = normalizeRole(roleDetected);
        if (!id) return null;

        return {
          id: String(id),
          username,
          role,
          accessToken,
          token: accessToken,
          email: pick(rawUser, ["email"]) ?? null,
          name: pick(rawUser, ["name"]) ?? username,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.username = (user as any).username;
        token.role = (user as any).role ?? token.role ?? "CLIENT";
        token.accessToken =
          (user as any).accessToken ?? (user as any).token ?? token.accessToken ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...(session.user || {}),
        id: (token as any).userId ?? "",
        username: (token as any).username ?? "",
        role: (token as any).role ?? "CLIENT",
        token: (token as any).accessToken ?? "",
        accessToken: (token as any).accessToken ?? "",
      } as any;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
























