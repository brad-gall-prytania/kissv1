import { NextRequest, NextResponse } from "next/server";
import { getAllContacts, createContact } from "@/lib/contacts";
import { getSessionRole, forbidden } from "@/lib/roles";
import type { ContactInput } from "@/lib/types";

export async function GET() {
  const { session, role } = await getSessionRole();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role === "none") return forbidden();

  const contacts = await getAllContacts();
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const { session, role } = await getSessionRole();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "admin") return forbidden();

  const body: ContactInput = await req.json();

  if (!body.first_name?.trim() || !body.last_name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: "first_name, last_name, and email are required" },
      { status: 400 }
    );
  }

  const contact = await createContact(body);
  return NextResponse.json(contact, { status: 201 });
}
