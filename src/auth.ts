import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export type UserRole = "admin" | "reader" | "none";

async function fetchUserRole(accessToken: string): Promise<UserRole> {
  try {
    const res = await fetch("https://graph.microsoft.com/v1.0/me/memberOf", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.error("Graph memberOf call failed:", res.status);
      return "none";
    }
    const data = await res.json();
    const groupNames: string[] = (data.value ?? [])
      .filter((entry: Record<string, unknown>) => entry["@odata.type"] === "#microsoft.graph.group")
      .map((g: Record<string, unknown>) => g.displayName as string);

    if (groupNames.includes("kiss_admin")) return "admin";
    if (groupNames.includes("kiss_readers")) return "reader";
    return "none";
  } catch (err) {
    console.error("Error fetching group membership:", err);
    return "none";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
      authorization: {
        params: {
          scope: "openid profile email User.Read GroupMember.Read.All",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      // On initial sign-in, fetch group memberships from Graph
      if (account?.access_token) {
        token.role = await fetchUserRole(account.access_token);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role ?? "none";
      }
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
});
