import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminTopNav from "@/components/admin/AdminTopNav";
import AdminShell from "@/components/admin/AdminShell";
import type { SurveyItem } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [activeSurveys, submittedSurveys, draftCount] = await Promise.all([
    db.survey.findMany({
      where: { status: "active" },
      include: { customer: { select: { companyName: true } } },
      orderBy: { sentAt: "desc" },
    }),
    db.survey.findMany({
      where: { status: "submitted" },
      include: { customer: { select: { companyName: true } } },
      orderBy: { submittedAt: "desc" },
      take: 8,
    }),
    db.survey.count({ where: { status: "draft" } }),
  ]);

  const toItem = (s: typeof activeSurveys[number], dateField: Date | null): SurveyItem => ({
    id: s.id,
    companyName: s.customer.companyName,
    status: s.status as "active" | "submitted",
    date: (dateField ?? s.createdAt).toISOString(),
  });

  const active    = activeSurveys.map(s => toItem(s, s.sentAt));
  const submitted = submittedSurveys.map(s => toItem(s, s.submittedAt));

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
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
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
