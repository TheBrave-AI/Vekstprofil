import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const whitelistedUsers = ["av@thebrave.no", "yi@thebrave.no", "hs@thebrave.no", "or@thebrave.no", "js@thebrave.no", "eh@thebrave.no" ];
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      // Only allow @thebrave.no Google accounts
      return whitelistedUsers.includes(profile?.email as string);
    },
  },
  pages: {
    signIn: "/login",
  },
});
