import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">KISS Contacts</h1>
        <p className="text-sm text-gray-500 mb-6">
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
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign in with Microsoft
          </button>
        </form>
      </div>
    </div>
  );
}
