import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-prytania-nav">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        {/* Prytania globe icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <svg className="h-14 w-14" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#009B48" strokeWidth="2" />
            <ellipse cx="20" cy="20" rx="10" ry="18" stroke="#009B48" strokeWidth="1.5" />
            <line x1="2" y1="14" x2="38" y2="14" stroke="#009B48" strokeWidth="1.5" />
            <line x1="2" y1="26" x2="38" y2="26" stroke="#009B48" strokeWidth="1.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-prytania-dark mb-1">
          KISS Contacts
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Sign in with your Microsoft account
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-prytania-green text-white py-3 px-4 rounded-lg font-semibold hover:bg-prytania-green-dark transition-colors text-sm tracking-wide"
          >
            Sign in with Microsoft
          </button>
        </form>
        <p className="mt-6 text-xs text-gray-400">
          Prytania Managed Services
        </p>
      </div>
    </div>
  );
}
