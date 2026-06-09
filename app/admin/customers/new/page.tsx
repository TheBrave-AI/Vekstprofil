import { NewCustomerForm } from "@/components/admin/customers/NewCustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-cloud">Ny kunde</h1>
      <NewCustomerForm />
    </div>
  );
}
