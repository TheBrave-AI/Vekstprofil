import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-line bg-midnight px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <span className="text-xs tracking-widest uppercase text-accent font-semibold">Brave</span>
          <Link href="/admin"            className="text-cloud hover:text-accent transition">Kunder</Link>
          <Link href="/admin/templates"  className="text-cloud hover:text-accent transition">Maler</Link>
          <Link href="/admin/questions"  className="text-cloud hover:text-accent transition">Spørsmål</Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          {session?.user?.email && <span className="text-mist hidden sm:block">{session.user.email}</span>}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
            <button type="submit" className="text-mist hover:text-cloud transition">Logg ut</button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
