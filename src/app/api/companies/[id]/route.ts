import { NextRequest, NextResponse } from "next/server";
import { getCompanyById, updateCompany, deleteCompany } from "@/lib/companies";
import { getSessionRole, forbidden } from "@/lib/roles";
import type { CompanyInput } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { session, role } = await getSessionRole();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role === "none") return forbidden();

  const { id } = await params;
  const company = await getCompanyById(parseInt(id));
  if (!company)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(company);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, role } = await getSessionRole();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return forbidden();

  const { id } = await params;
  const body: CompanyInput = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const company = await updateCompany(parseInt(id), body);
  if (!company)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(company);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, role } = await getSessionRole();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return forbidden();

  const { id } = await params;
  const deleted = await deleteCompany(parseInt(id));
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ message: "Deleted" });
}
