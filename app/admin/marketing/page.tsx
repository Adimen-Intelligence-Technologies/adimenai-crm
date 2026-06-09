import { BusinessLinePicker } from "@/components/admin/clients/business-line-picker";

export default function MarketingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Marketing
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Selecciona una línea de negocio para gestionar su marketing.
        </p>
      </header>
      <BusinessLinePicker allReady />
    </div>
  );
}
