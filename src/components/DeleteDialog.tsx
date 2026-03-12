"use client";

import { useState } from "react";
import type { Contact } from "@/lib/types";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  contact: Contact | null;
}

export function DeleteDialog({ open, onClose, onConfirm, contact }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // keep dialog open on error
    } finally {
      setDeleting(false);
    }
  }

  if (!contact) return null;

  return (
    <Modal open={open} onClose={onClose} title="Delete Contact" size="sm">
      <p className="text-sm text-gray-600">
        Are you sure you want to delete{" "}
        <span className="font-medium text-gray-900">
          {contact.first_name} {contact.last_name}
        </span>
        ? This action cannot be undone.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} loading={deleting}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
