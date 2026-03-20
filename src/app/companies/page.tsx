import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllCompanies } from "@/lib/companies";
import { CompaniesTable } from "@/components/CompaniesTable";
import type { UserRole } from "@/auth";

export default async function CompaniesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as Record<string, unknown>)?.role as UserRole ?? "none";

  if (role === "none") {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-prytania-dark">Access Denied</h2>
        <p className="mt-2 text-sm text-prytania-dark/60">
          You are not a member of the <strong>kiss_admin</strong> or{" "}
          <strong>kiss_readers</strong> group. Contact your administrator.
        </p>
      </div>
    );
  }

  const companies = await getAllCompanies();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-prytania-dark">Companies</h2>
      </div>
      <CompaniesTable initialCompanies={companies} canWrite={role === "admin"} />
    </div>
  );
}
