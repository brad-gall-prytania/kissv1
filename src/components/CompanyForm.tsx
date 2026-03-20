"use client";

import { useState } from "react";
import type { Company, CompanyInput } from "@/lib/types";
import { Modal } from "./ui/Modal";
import { Input, Textarea } from "./ui/Input";
import { Button } from "./ui/Button";

const EMPTY: CompanyInput = {
  name: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  notes: "",
};

interface CompanyFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CompanyInput) => Promise<void>;
  company?: Company | null;
}

export function CompanyForm({ open, onClose, onSave, company }: CompanyFormProps) {
  const [form, setForm] = useState<CompanyInput>(
    company
      ? {
          name: company.name,
          phone: company.phone,
          email: company.email,
          website: company.website,
          address: company.address,
          city: company.city,
          state: company.state,
          zip: company.zip,
          notes: company.notes,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset form when company changes
  const companyId = company?.id;
  const [prevId, setPrevId] = useState<number | undefined>(companyId);
  if (companyId !== prevId) {
    setPrevId(companyId);
    setForm(
      company
        ? {
            name: company.name,
            phone: company.phone,
            email: company.email,
            website: company.website,
            address: company.address,
            city: company.city,
            state: company.state,
            zip: company.zip,
            notes: company.notes,
          }
        : EMPTY
    );
    setError("");
  }

  function set(field: keyof CompanyInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      setForm(EMPTY);
      onClose();
    } catch {
      setError("Failed to save company. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={company ? "Edit Company" : "Add Company"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Input
          label="Company Name *"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Acme Corp"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="info@acme.com"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="555-0100"
          />
        </div>

        <Input
          label="Website"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="https://acme.com"
        />

        <Input
          label="Address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="100 Main St"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="City"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="New York"
          />
          <Input
            label="State"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            placeholder="NY"
          />
          <Input
            label="Zip"
            value={form.zip}
            onChange={(e) => set("zip", e.target.value)}
            placeholder="10001"
          />
        </div>

        <Textarea
          label="Notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Any additional notes..."
        />

        <div className="flex justify-end gap-3 border-t border-prytania-green/20 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {company ? "Update" : "Add"} Company
          </Button>
        </div>
      </form>
    </Modal>
  );
}
