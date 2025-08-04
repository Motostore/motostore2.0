import { Login } from '../../../types/login.interface';
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Login) {
        const { username, password } = credentials;

        const response = await fetch(`${process.env.API_BASE}${process.env.API_AUTH}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const user = await response.json();
        if (response.ok && user) {
            return user;
        } else return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({token, user}) {
        return ({...token, ...user})
    },
    async session({session, token, user}) {
        session.user = token;
        return session;
    }
  }
});

export { handler as GET, handler as POST };