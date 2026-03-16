import { NextRequest, NextResponse } from "next/server";
import { getContactById, updateContact, deleteContact } from "@/lib/contacts";
import { getSessionRole, forbidden } from "@/lib/roles";
import type { ContactInput } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { session, role } = await getSessionRole();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role === "none") return forbidden();

  const { id } = await params;
  const contact = await getContactById(parseInt(id));
  if (!contact)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(contact);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, role } = await getSessionRole();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return forbidden();

  const { id } = await params;
  const body: ContactInput = await req.json();

  if (
    !body.first_name?.trim() ||
    !body.last_name?.trim() ||
    !body.email?.trim()
  ) {
    return NextResponse.json(
      { error: "first_name, last_name, and email are required" },
      { status: 400 }
    );
  }

  const contact = await updateContact(parseInt(id), body);
  if (!contact)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(contact);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, role } = await getSessionRole();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return forbidden();

  const { id } = await params;
  const deleted = await deleteContact(parseInt(id));
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ message: "Deleted" });
}
