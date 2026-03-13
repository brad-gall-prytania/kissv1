import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllContacts } from "@/lib/contacts";
import { ContactsTable } from "@/components/ContactsTable";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const contacts = await getAllContacts();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-prytania-dark">Contacts</h2>
      </div>
      <ContactsTable initialContacts={contacts} />
    </div>
  );
}
