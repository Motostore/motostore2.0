import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Base del API del backend (toma la que tengas, con fallback seguro)
const API_BASE =
  (process.env.NEXT_PUBLIC_API_FULL && process.env.NEXT_PUBLIC_API_FULL.replace(/\/$/, "")) ||
  ((process.env.API_BASE && process.env.API_AUTH)
    ? `${process.env.API_BASE.replace(/\/$/, "")}${process.env.API_AUTH}`
    : "http://localhost:8080/api/v1");

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          });

          if (!res.ok) {
            console.error("Login API status:", res.status);
            return null; // → NextAuth responde 401
          }

          const user = await res.json();
          // Devuelve el objeto de usuario/tokens que te dé el backend
          return user || null;
        } catch (e) {
          console.error("Login API error:", e);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      // cuando hay login, mezcla lo que vino del backend en el JWT
      if (user) Object.assign(token, user);
      return token;
    },
    async session({ session, token }) {
      // expone todo en session.user para el cliente
      session.user = token as any;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
