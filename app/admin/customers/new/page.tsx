import { NewCustomerForm } from "@/components/admin/customers/NewCustomerForm";
import Link from "next/link";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link href="/admin/customers" className="text-xs text-mist hover:text-accent transition">← Kunder</Link>
        <h1 className="font-display text-2xl text-cloud mt-1">Ny kunde</h1>
      </div>
      <NewCustomerForm />
    </div>
  );
}
