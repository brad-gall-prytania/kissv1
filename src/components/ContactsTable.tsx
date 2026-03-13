"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Contact, ContactInput } from "@/lib/types";
import { ContactForm } from "./ContactForm";
import { DeleteDialog } from "./DeleteDialog";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

interface ContactsTableProps {
  initialContacts: Contact[];
}

export function ContactsTable({ initialContacts }: ContactsTableProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);

  async function refreshContacts() {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } finally {
      setLoading(false);
    }
    router.refresh();
  }

  async function handleCreate(data: ContactInput) {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create");
    await refreshContacts();
  }

  async function handleUpdate(data: ContactInput) {
    if (!editingContact) return;
    const res = await fetch(`/api/contacts/${editingContact.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update");
    setEditingContact(null);
    await refreshContacts();
  }

  async function handleDelete() {
    if (!deletingContact) return;
    const res = await fetch(`/api/contacts/${deletingContact.id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete");
    setDeletingContact(null);
    await refreshContacts();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-prytania-dark/60">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={() => setShowForm(true)}>Add Contact</Button>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {!loading && contacts.length === 0 && (
        <div className="rounded-lg border border-dashed border-prytania-green/30 py-12 text-center">
          <p className="text-sm text-prytania-dark/60">No contacts yet.</p>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => setShowForm(true)}
          >
            Add your first contact
          </Button>
        </div>
      )}

      {!loading && contacts.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-prytania-green-light text-xs uppercase text-prytania-dark/70">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Job Title</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-prytania-green-light/50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-prytania-dark">
                    {c.first_name} {c.last_name}
                  </td>
                  <td className="px-4 py-3 text-prytania-dark/70">{c.email}</td>
                  <td className="px-4 py-3 text-prytania-dark/70">{c.phone}</td>
                  <td className="px-4 py-3 text-prytania-dark/70">{c.company}</td>
                  <td className="px-4 py-3 text-prytania-dark/70">{c.job_title}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      className="mr-1"
                      onClick={() => {
                        setEditingContact(c);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeletingContact(c)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      <ContactForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingContact(null);
        }}
        onSave={editingContact ? handleUpdate : handleCreate}
        contact={editingContact}
      />

      {/* Delete confirmation */}
      <DeleteDialog
        open={!!deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleDelete}
        contact={deletingContact}
      />
    </div>
  );
}
