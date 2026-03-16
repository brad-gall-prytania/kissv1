import { auth, signOut } from "@/auth";
import type { UserRole } from "@/auth";

export async function Navbar() {
  const session = await auth();

  if (!session?.user) return null;

  const role = (session.user as Record<string, unknown>)?.role as UserRole ?? "none";
  const roleBadge =
    role === "admin"
      ? { label: "Admin", color: "bg-prytania-green text-white" }
      : role === "reader"
        ? { label: "Reader", color: "bg-gray-600 text-white" }
        : { label: "No Access", color: "bg-red-700 text-white" };

  return (
    <nav className="bg-prytania-nav px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Prytania globe icon */}
          <svg className="h-8 w-8" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#009B48" strokeWidth="2" />
            <ellipse cx="20" cy="20" rx="10" ry="18" stroke="#009B48" strokeWidth="1.5" />
            <line x1="2" y1="14" x2="38" y2="14" stroke="#009B48" strokeWidth="1.5" />
            <line x1="2" y1="26" x2="38" y2="26" stroke="#009B48" strokeWidth="1.5" />
          </svg>
          <h1 className="text-lg font-semibold text-white tracking-wide">
            KISS Contacts
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge.color}`}
          >
            {roleBadge.label}
          </span>
          <span className="text-sm text-gray-300">{session.user.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
