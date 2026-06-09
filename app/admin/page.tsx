import { listSurveys } from "@/app/actions";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

export default async function AdminDashboard() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const surveys = await listSurveys();

  const needsFollowUp   = surveys
    .filter(s => s.status === "active" && s.sentAt && new Date(s.sentAt) < sevenDaysAgo)
    .sort((a, b) => new Date(a.sentAt!).getTime() - new Date(b.sentAt!).getTime());
  const recentSubmitted = surveys
    .filter(s => s.status === "submitted")
    .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      
      <PageHeader title="Dashboard" label="Admin" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trenger oppfølging */}
        <Section
          title="Trenger oppfølging"
          subtitle="Ubesvarte undersøkelser uten svar i over 7 dager"
          cta={{ label: "Se alle undersøkelser", href: "/admin/surveys" }}
        >
          {needsFollowUp.length === 0 ? (
            <Empty text="Ingen undersøkelser venter på oppfølging." />
          ) : (
            needsFollowUp.map(s => (
              <Row
                key={s.id}
                href={`/admin/surveys/${s.id}`}
                primary={s.customer.companyName}
                secondary={`Sendt ${formatDate(s.sentAt)}`}
                badge={{ label: "Venter", color: "amber" }}
              />
            ))
          )}
        </Section>

        {/* Nylig mottatt */}
        <Section
          title="Nylig besvart"
          subtitle="Sist besvarte undersøkelser"
          cta={{ label: "Se alle", href: "/admin/surveys" }}
        >
          {recentSubmitted.length === 0 ? (
            <Empty text="Ingen besvarte undersøkelser ennå." />
          ) : (
            recentSubmitted.map(s => (
              <Row
                key={s.id}
                href={`/admin/surveys/${s.id}`}
                primary={s.customer.companyName}
                secondary={`Besvart ${formatDate(s.submittedAt)}`}
                badge={{ label: "Besvart", color: "teal" }}
              />
            ))
          )}
        </Section>

        {/* Siste kunder | Removed for now*/}
        {/*}
        <Section
          title="Siste kunder"
          subtitle="Nylig opprettede kunder"
          cta={{ label: "Se alle kunder", href: "/admin/customers" }}
        >
          {recentCustomers.length === 0 ? (
            <Empty text="Ingen kunder ennå." />
          ) : (
            recentCustomers.map(c => (
              <Row
                key={c.id}
                href={`/admin/customers/${c.id}`}
                primary={c.companyName}
                secondary={`${c._count.surveys} undersøkelse${c._count.surveys === 1 ? "" : "r"}`}
                action={{ label: "+ Ny undersøkelse", href: `/admin/surveys/new?customerId=${c.id}` }}
              />
            ))
          )}
        </Section>
        {/* Siste kunder | Removed for now*/}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return "i dag";
  if (days === 1) return "i går";
  if (days < 7)  return `${days} d siden`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function Section({ title, subtitle, cta, children }: {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card bg-midnight shadow-card overflow-hidden">
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-cloud">{title}</h2>
          <p className="text-[12.5px] text-muted mt-0.5">{subtitle}</p>
        </div>
        <Link href={cta.href} className="text-[12.5px] text-accent hover:underline shrink-0 mt-0.5">
          {cta.label} →
        </Link>
      </div>
      <div className="divide-y divide-line">
        {children}
      </div>
    </div>
  );
}

function Row({ href, primary, secondary, badge, action }: {
  href: string;
  primary: string;
  secondary: string;
  badge?: { label: string; color: "teal" | "amber" };
  action?: { label: string; href: string };
}) {
  const badgeClass = badge?.color === "teal"
    ? "bg-accent/10 text-accent"
    : "bg-[#b45309]/10 text-[#b45309]";

  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-black/[0.03] transition-colors">
      <Link href={href} className="flex flex-col min-w-0 group">
        <span className="text-[13.5px] font-medium text-cloud group-hover:text-brand transition-colors truncate">
          {primary}
        </span>
        <span className="text-[12px] text-muted mt-0.5">{secondary}</span>
      </Link>
      <div className="flex items-center gap-2 ml-3 shrink-0">
        {badge && (
          <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
            {badge.label}
          </span>
        )}
        {action && (
          <Link
            href={action.href}
            className="text-[12px] font-medium text-accent hover:underline"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-5 py-4 text-[13px] text-muted italic">{text}</p>;
}
