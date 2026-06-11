import { BusinessLinePicker } from "@/components/admin/clients/business-line-picker";
import { PageHeader } from "@/components/admin/page-header";

export default function MarketingPage() {
  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <PageHeader
        eyebrow="6 · Marketing"
        title="Marketing"
        description="Selecciona una línea de negocio para gestionar su marketing."
      />
      <BusinessLinePicker allReady baseHref="/admin/marketing" />
    </div>
  );
}
