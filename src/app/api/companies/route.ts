import { NextRequest, NextResponse } from "next/server";
import { getAllCompanies, createCompany } from "@/lib/companies";
import { getSessionRole, forbidden } from "@/lib/roles";
import type { CompanyInput } from "@/lib/types";

export async function GET() {
  const { session, role } = await getSessionRole();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role === "none") return forbidden();

  const companies = await getAllCompanies();
  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const { session, role } = await getSessionRole();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "admin") return forbidden();

  const body: CompanyInput = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const company = await createCompany(body);
  return NextResponse.json(company, { status: 201 });
}
