import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllContacts } from "@/lib/contacts";
import { ContactsTable } from "@/components/ContactsTable";
import type { UserRole } from "@/auth";

export default async function HomePage() {
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

  const contacts = await getAllContacts();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-prytania-dark">Contacts</h2>
      </div>
      <ContactsTable initialContacts={contacts} canWrite={role === "admin"} />
    </div>
  );
}
