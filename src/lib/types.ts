import type { UserRole } from "@/auth";

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type ContactInput = Omit<Contact, "id" | "created_at" | "updated_at">;

// Extend NextAuth session type
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }
}
