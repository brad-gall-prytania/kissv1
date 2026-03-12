"use client";

import { useState } from "react";
import type { Contact, ContactInput } from "@/lib/types";
import { Modal } from "./ui/Modal";
import { Input, Textarea } from "./ui/Input";
import { Button } from "./ui/Button";

const EMPTY: ContactInput = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  company: "",
  job_title: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  notes: "",
};

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContactInput) => Promise<void>;
  contact?: Contact | null;
}

export function ContactForm({ open, onClose, onSave, contact }: ContactFormProps) {
  const [form, setForm] = useState<ContactInput>(
    contact
      ? {
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          job_title: contact.job_title,
          address: contact.address,
          city: contact.city,
          state: contact.state,
          zip: contact.zip,
          notes: contact.notes,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset form when contact changes
  const contactId = contact?.id;
  const [prevId, setPrevId] = useState<number | undefined>(contactId);
  if (contactId !== prevId) {
    setPrevId(contactId);
    setForm(
      contact
        ? {
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            job_title: contact.job_title,
            address: contact.address,
            city: contact.city,
            state: contact.state,
            zip: contact.zip,
            notes: contact.notes,
          }
        : EMPTY
    );
    setError("");
  }

  function set(field: keyof ContactInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      setForm(EMPTY);
      onClose();
    } catch {
      setError("Failed to save contact. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? "Edit Contact" : "Add Contact"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name *"
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            placeholder="Alice"
          />
          <Input
            label="Last Name *"
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            placeholder="Johnson"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="alice@example.com"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="555-0101"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Company"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Acme Corp"
          />
          <Input
            label="Job Title"
            value={form.job_title}
            onChange={(e) => set("job_title", e.target.value)}
            placeholder="CEO"
          />
        </div>

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

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {contact ? "Update" : "Add"} Contact
          </Button>
        </div>
      </form>
    </Modal>
  );
}
