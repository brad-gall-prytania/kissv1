"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Company, CompanyInput } from "@/lib/types";
import { CompanyForm } from "./CompanyForm";
import { DeleteDialog } from "./DeleteDialog";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

interface CompaniesTableProps {
  initialCompanies: Company[];
  canWrite: boolean;
}

export function CompaniesTable({ initialCompanies, canWrite }: CompaniesTableProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);

  async function refreshCompanies() {
    setLoading(true);
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } finally {
      setLoading(false);
    }
    router.refresh();
  }

  async function handleCreate(data: CompanyInput) {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create");
    await refreshCompanies();
  }

  async function handleUpdate(data: CompanyInput) {
    if (!editingCompany) return;
    const res = await fetch(`/api/companies/${editingCompany.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update");
    setEditingCompany(null);
    await refreshCompanies();
  }

  async function handleDelete() {
    if (!deletingCompany) return;
    const res = await fetch(`/api/companies/${deletingCompany.id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete");
    setDeletingCompany(null);
    await refreshCompanies();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-prytania-dark/60">
          {companies.length} compan{companies.length !== 1 ? "ies" : "y"}
        </p>
        {canWrite && (
          <Button onClick={() => setShowForm(true)}>Add Company</Button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {!loading && companies.length === 0 && (
        <div className="rounded-lg border border-dashed border-prytania-green/30 py-12 text-center">
          <p className="text-sm text-prytania-dark/60">No companies yet.</p>
          {canWrite && (
            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => setShowForm(true)}
            >
              Add your first company
            </Button>
          )}
        </div>
      )}

      {!loading && companies.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-prytania-green-light text-xs uppercase text-prytania-dark/70">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">State</th>
                {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map((co) => (
                <tr key={co.id} className="hover:bg-prytania-green-light/50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-prytania-dark">
                    {co.name}
                  </td>
                  <td className="px-4 py-3 text-prytania-dark/70">{co.email}</td>
                  <td className="px-4 py-3 text-prytania-dark/70">{co.phone}</td>
                  <td className="px-4 py-3 text-prytania-dark/70">{co.website}</td>
                  <td className="px-4 py-3 text-prytania-dark/70">{co.city}</td>
                  <td className="px-4 py-3 text-prytania-dark/70">{co.state}</td>
                  {canWrite && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        className="mr-1"
                        onClick={() => {
                          setEditingCompany(co);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeletingCompany(co)}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canWrite && (
        <CompanyForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingCompany(null);
          }}
          onSave={editingCompany ? handleUpdate : handleCreate}
          company={editingCompany}
        />
      )}

      {canWrite && deletingCompany && (
        <DeleteDialog
          open={true}
          onClose={() => setDeletingCompany(null)}
          onConfirm={handleDelete}
          itemName={deletingCompany.name}
          itemType="Company"
        />
      )}
    </div>
  );
}
