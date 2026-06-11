import { auth, signOut } from "@/auth";
import Link from "next/link";
import BraveLogo from "@/components/ui/brand/BraveLogo";
import { redirect } from "next/navigation";
import { getSidebarData } from "@/app/actions";
import AdminTopNav from "@/components/admin/shell/AdminTopNav";
import AdminShell from "@/components/admin/shell/AdminShell";
import type { SurveyItem } from "@/components/admin/shell/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { active: activeSurveys, submitted: submittedSurveys, draftCount, customerCount } = await getSidebarData();

  const active: SurveyItem[] = activeSurveys.map(s => ({
    id: s.id,
    companyName: s.customer.companyName,
    status: "active",
    date: new Date(s.sentAt ?? s.createdAt).toISOString(),
    answeredCount: s._count.answers,
    totalQuestions: s._count.questions,
    surveyName: s.name ?? s.template?.name ?? null,
  }));

  const submitted: SurveyItem[] = submittedSurveys.map(s => ({
    id: s.id,
    companyName: s.customer.companyName,
    status: "submitted",
    date: new Date(s.submittedAt ?? s.createdAt).toISOString(),
    answeredCount: s._count.answers,
    totalQuestions: s._count.questions,
    surveyName: s.name ?? s.template?.name ?? null,
  }));

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Top bar */}
      <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-midnight border-b border-line">
        <div className="flex items-center gap-5">
          <Link href="/admin">
            <BraveLogo className="h-7 w-auto text-brand" />
          </Link>
          <AdminTopNav customerCount={customerCount} />
        </div>
        <div className="flex items-center gap-5 text-[13px]">
          {(session.user?.name || session.user?.email) && (
            <span className="text-muted hidden sm:block">{session.user.name ?? session.user.email}</span>
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
