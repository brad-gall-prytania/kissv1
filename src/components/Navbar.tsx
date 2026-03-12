import { auth, signOut } from "@/auth";

export async function Navbar() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">KISS Contacts</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session.user.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
