import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export type UserRole = "admin" | "reader" | "none";

async function fetchUserRole(accessToken: string): Promise<UserRole> {
  try {
    const res = await fetch("https://graph.microsoft.com/v1.0/me/memberOf", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[KISS-RBAC] Graph /me/memberOf failed: ${res.status} ${res.statusText}`, body);
      return "none";
    }
    const data = await res.json();
    const groupNames: string[] = (data.value ?? [])
      .filter((entry: Record<string, unknown>) => entry["@odata.type"] === "#microsoft.graph.group")
      .map((g: Record<string, unknown>) => g.displayName as string);

    console.log("[KISS-RBAC] User belongs to groups:", groupNames);

    if (groupNames.includes("kiss_admin")) return "admin";
    if (groupNames.includes("kiss_readers")) return "reader";

    console.warn("[KISS-RBAC] User not in kiss_admin or kiss_readers. Groups found:", groupNames);
    return "none";
  } catch (err) {
    console.error("[KISS-RBAC] Error fetching group membership:", err);
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
