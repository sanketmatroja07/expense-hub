import { compare } from "bcryptjs";
import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDisplayNameFromEmail, type AuthIdentity } from "@/lib/expense-hub-core";
import {
  findAuthUserByEmail,
  findAuthUserById,
  getNormalizedEmail,
} from "@/lib/server/auth-user-store";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await findAuthUserByEmail(email);
        if (!user) {
          return null;
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      if (token.sub) {
        const storedUser = await findAuthUserById(token.sub);
        if (storedUser) {
          token.email = storedUser.email;
          token.name = storedUser.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = (token.email as string) || session.user.email || "";
        session.user.name =
          (token.name as string) ||
          session.user.name ||
          getDisplayNameFromEmail(session.user.email);
      }

      return session;
    },
  },
};

export async function getOptionalAuthIdentity() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user?.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: getNormalizedEmail(user.email),
    name: user.name || getDisplayNameFromEmail(user.email),
  } satisfies AuthIdentity;
}

export async function requireAuthIdentity() {
  const identity = await getOptionalAuthIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}
