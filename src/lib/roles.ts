import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { UserRole } from "@/auth";
import type { Session } from "next-auth";

export async function getSessionRole(): Promise<{
  session: Session | null;
  role: UserRole;
}> {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = ((session?.user as any)?.role as UserRole) ?? "none";
  return { session, role };
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
