import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink">
      <div className="w-full max-w-sm rounded-card bg-midnight p-10 shadow-card text-center space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest uppercase text-accent">Brave</p>
          <h1 className="font-display text-2xl text-cloud">Admin-innlogging</h1>
          <p className="text-sm text-mist">Kun for @thebrave.no-kontoer</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-medium text-onbrand transition hover:bg-brand-deep"
          >
            Logg inn med Google
          </button>
        </form>
      </div>
    </main>
  );
}
