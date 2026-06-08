import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getSidebarData } from "@/app/actions";
import AdminTopNav from "@/components/admin/AdminTopNav";
import AdminShell from "@/components/admin/AdminShell";
import type { SurveyItem } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { active: activeSurveys, submitted: submittedSurveys, draftCount } = await getSidebarData();

  const active: SurveyItem[] = activeSurveys.map(s => ({
    id: s.id,
    companyName: s.customer.companyName,
    status: "active",
    date: new Date(s.sentAt ?? s.createdAt).toISOString(),
    answeredCount: s._count.answers,
    totalQuestions: s._count.questions,
  }));

  const submitted: SurveyItem[] = submittedSurveys.map(s => ({
    id: s.id,
    companyName: s.customer.companyName,
    status: "submitted",
    date: new Date(s.submittedAt ?? s.createdAt).toISOString(),
  }));

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Top bar */}
      <header className="h-12 shrink-0 flex items-center justify-between px-5 bg-midnight border-b border-line">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="font-display font-semibold text-brand text-[24px] tracking-tight">Brave</span>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2" cy="14" r="1.8" fill="#bf4d27"/>
              <path d="M2 10 A4 4 0 0 1 6 14"  stroke="#bf4d27" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M2 6.5 A7.5 7.5 0 0 1 9.5 14"  stroke="#bf4d27" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M2 3 A11 11 0 0 1 13 14" stroke="#bf4d27" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <AdminTopNav />
        </div>
        <div className="flex items-center gap-5 text-[13px]">
          {session.user?.email && (
            <span className="text-muted hidden sm:block">{session.user.email}</span>
          )}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button type="submit" className="text-muted hover:text-cloud transition-colors">
              Logg ut
            </button>
          </form>
        </div>
      </header>

      {/* Body */}
      <AdminShell active={active} submitted={submitted} draftCount={draftCount}>
        {children}
      </AdminShell>
    </div>
  );
}
