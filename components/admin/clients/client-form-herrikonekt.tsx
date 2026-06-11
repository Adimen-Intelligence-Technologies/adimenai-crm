"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  Building2,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  Store,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  dayLabels,
  emptyOpeningHours,
  herrikonektTypeEnum,
  paymentMethodEnum,
  paymentMethodLabels,
  taxIdTypeEnum,
  taxIdTypeLabels,
  type OpeningHours,
  type PaymentMethod,
  type TaxIdType,
} from "@/lib/schemas/client";
import type { Client } from "@/lib/repositories/clients";
import { useCustomTypes } from "@/lib/stores/custom-types";
import { CustomTypeDialog } from "./custom-type-dialog";
import { TypeCombobox } from "./type-combobox";

type InitialClient = Partial<Client> & { _id?: string };

type Props = {
  mode: "create" | "edit";
  initial?: InitialClient;
};

type AddressForm = {
  line1: string;
  line2: string;
  city: string;
  zip: string;
  country: string;
  isPrimary: boolean;
};

type BillingForm = {
  invoicingActive: boolean;
  legalName: string;
  taxIdType: TaxIdType;
  taxId: string;
  billingEmail: string;
  billingPhone: string;
  address: AddressForm;
  paymentMethod: PaymentMethod;
  paymentTerms: string;
  internalNotes: string;
};

type FormState = {
  name: string;
  description: string;
  website: string;
  phones: string[];
  addresses: AddressForm[];
  type: string;
  syncToApp: boolean;
  email: string;
  social: { instagram: string; facebook: string };
  billing: BillingForm;
  openingHours: OpeningHours;
  customTypeIcon: string;
};

const DRAFT_KEY_PREFIX = "client-form-draft:";

function emptyAddress(isPrimary = false): AddressForm {
  return { line1: "", line2: "", city: "", zip: "", country: "España", isPrimary };
}

function emptyBilling(): BillingForm {
  return {
    invoicingActive: false,
    legalName: "",
    taxIdType: "nif",
    taxId: "",
    billingEmail: "",
    billingPhone: "",
    address: emptyAddress(true),
    paymentMethod: "transfer",
    paymentTerms: "",
    internalNotes: "",
  };
}

function billingFromClient(billing?: Client["billing"]): BillingForm {
  if (!billing) return emptyBilling();
  return {
    invoicingActive: billing.invoicingActive ?? false,
    legalName: billing.legalName ?? "",
    taxIdType: billing.taxIdType ?? "nif",
    taxId: billing.taxId ?? "",
    billingEmail: billing.billingEmail ?? "",
    billingPhone: billing.billingPhone ?? "",
    address: billing.address
      ? {
          line1: billing.address.line1 ?? "",
          line2: billing.address.line2 ?? "",
          city: billing.address.city ?? "",
          zip: billing.address.zip ?? "",
          country: billing.address.country ?? "España",
          isPrimary: true,
        }
      : emptyAddress(true),
    paymentMethod: billing.paymentMethod ?? "transfer",
    paymentTerms: billing.paymentTerms ?? "",
    internalNotes: billing.internalNotes ?? "",
  };
}

function socialFromClient(
  social?: Client["social"]
): { instagram: string; facebook: string } {
  return {
    instagram: social?.instagram ?? "",
    facebook: social?.facebook ?? "",
  };
}

function toFormState(initial?: InitialClient): FormState {
  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    website: initial?.website ?? "",
    email: initial?.email ?? "",
    phones: initial?.phones && initial.phones.length > 0 ? initial.phones : [""],
    addresses:
      initial?.addresses && initial.addresses.length > 0
        ? initial.addresses.map((a, idx) => ({
            line1: a.line1 ?? "",
            line2: a.line2 ?? "",
            city: a.city ?? "",
            zip: a.zip ?? "",
            country: a.country ?? "España",
            isPrimary: a.isPrimary ?? idx === 0,
          }))
        : [emptyAddress(true)],
    type: initial?.type ?? herrikonektTypeEnum.enum.bares_y_restaurantes,
    syncToApp: initial?.syncToApp ?? true,
    social: socialFromClient(initial?.social),
    billing: billingFromClient(initial?.billing),
    openingHours: initial?.openingHours ?? emptyOpeningHours(),
    customTypeIcon: initial?.customTypeIcon ?? "",
  };
}

export function ClientFormHerrikonekt({ mode, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [customTypeDialogOpen, setCustomTypeDialogOpen] = useState(false);
  const customTypes = useCustomTypes((s) => s.types);
  const addCustomType = useCustomTypes((s) => s.add);

  useEffect(() => {
    if (mode !== "create" || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}new`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as FormState;
      if (parsed && typeof parsed === "object" && parsed.name !== undefined) {
        setForm(parsed);
      }
    } catch {
      // noop
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "create" || typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      window.localStorage.setItem(`${DRAFT_KEY_PREFIX}new`, JSON.stringify(form));
    }, 400);
    return () => window.clearTimeout(t);
  }, [form, mode]);

  function clearDraft() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}new`);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateBilling<K extends keyof BillingForm>(key: K, value: BillingForm[K]) {
    setForm((prev) => ({ ...prev, billing: { ...prev.billing, [key]: value } }));
  }

  function updateBillingAddress(patch: Partial<AddressForm>) {
    setForm((prev) => ({
      ...prev,
      billing: { ...prev.billing, address: { ...prev.billing.address, ...patch } },
    }));
  }

  function copyPrimaryAddressToBilling() {
    const primary = form.addresses.find((a) => a.isPrimary) ?? form.addresses[0];
    if (!primary) return;
    updateBillingAddress({
      line1: primary.line1,
      line2: primary.line2,
      city: primary.city,
      zip: primary.zip,
      country: primary.country,
    });
  }

  function updateAddress(i: number, patch: Partial<AddressForm>) {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    }));
  }

  function setPrimaryAddress(i: number) {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a, idx) => ({ ...a, isPrimary: idx === i })),
    }));
  }

  const required = useMemo(
    () => ({
      name: form.name.trim().length > 0,
      city: (form.addresses[0]?.city ?? "").trim().length > 0,
      line1: (form.addresses[0]?.line1 ?? "").trim().length > 0,
    }),
    [form]
  );
  const completedRequired = [required.name, required.city, required.line1].filter(Boolean).length;
  const totalRequired = 3;
  const progress = (completedRequired / totalRequired) * 100;
  const canSubmit = required.name;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (canSubmit) handleSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit, form]);

  async function handleSubmit() {
    setError(null);

    const payload = {
      businessLine: "herrikonekt" as const,
      name: form.name.trim(),
      description: form.description.trim(),
      website: form.website.trim(),
      email: form.email.trim(),
      phones: form.phones.map((p) => p.trim()).filter(Boolean),
      addresses: form.addresses
        .filter((a) => a.line1.trim() && a.city.trim())
        .map((a) => ({
          line1: a.line1.trim(),
          line2: a.line2.trim(),
          city: a.city.trim(),
          zip: a.zip.trim(),
          country: a.country.trim() || "España",
          isPrimary: a.isPrimary,
        })),
      type: form.type,
      customTypeIcon: form.customTypeIcon,
      syncToApp: form.syncToApp,
      social: {
        instagram: form.social.instagram.trim(),
        facebook: form.social.facebook.trim(),
      },
      billing: form.billing.invoicingActive
        ? {
            invoicingActive: true,
            legalName: form.billing.legalName.trim() || form.name.trim(),
            taxIdType: form.billing.taxIdType,
            taxId: form.billing.taxId.trim(),
            billingEmail: form.billing.billingEmail.trim(),
            billingPhone: form.billing.billingPhone.trim(),
            address: form.billing.address.line1.trim()
              ? {
                  line1: form.billing.address.line1.trim(),
                  line2: form.billing.address.line2.trim(),
                  city: form.billing.address.city.trim(),
                  zip: form.billing.address.zip.trim(),
                  country: form.billing.address.country.trim() || "España",
                  isPrimary: true,
                }
              : undefined,
            paymentMethod: form.billing.paymentMethod,
            paymentTerms: form.billing.paymentTerms.trim(),
            internalNotes: form.billing.internalNotes.trim(),
          }
        : { invoicingActive: false },
      openingHours: form.openingHours,
    };

    startTransition(async () => {
      try {
        const url = mode === "create" ? "/api/clients" : `/api/clients/${initial?._id}`;
        const method = mode === "create" ? "POST" : "PATCH";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "No se pudo guardar el cliente");
        }
        clearDraft();
        router.push("/admin/clients");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Cabecera compacta en una línea */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 h-7 px-2 text-zinc-900 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
          >
            <Link href="/admin/clients">
              <ArrowLeft className="size-3.5" />
              Volver
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            {mode === "create" ? "Nuevo cliente Herrikonekt" : "Editar cliente"}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-900">
          <span className="font-semibold tabular-nums">
            {completedRequired}/{totalRequired}
          </span>
          <span>obligatorios</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-900">
            ⌘↵ guardar
          </kbd>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Columna principal: 2/3 */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Identidad: datos básicos + categoría + teléfonos + direcciones */}
          <Section title="Identidad">
            <div className="flex flex-col gap-4">
              {/* Datos básicos */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Nombre" required className="sm:col-span-2">
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Ej. Bar Amaya"
                    autoFocus
                    required
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="info@cliente.com"
                  />
                </Field>
                <Field label="Web">
                  <Input
                    type="url"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://"
                  />
                </Field>
                <Field label="Instagram">
                  <Input
                    value={form.social.instagram}
                    onChange={(e) =>
                      update("social", { ...form.social, instagram: e.target.value })
                    }
                    placeholder="@usuario o URL"
                  />
                </Field>
                <Field label="Facebook">
                  <Input
                    value={form.social.facebook}
                    onChange={(e) =>
                      update("social", { ...form.social, facebook: e.target.value })
                    }
                    placeholder="URL de la página"
                  />
                </Field>
                <Field label="Categoría" className="sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <TypeCombobox
                        value={form.type}
                        onChange={(v, ct) => {
                          update("type", v);
                          if (ct) update("customTypeIcon", ct.icon);
                        }}
                        placeholder="Selecciona un tipo…"
                        customTypes={customTypes}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCustomTypeDialogOpen(true)}
                      aria-label="Crear categoría personalizada"
                      className="size-9 shrink-0"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </Field>
              </div>

              {/* Teléfonos */}
              <div>
                <h3 className="mb-2 text-xs font-bold text-zinc-900">Teléfonos</h3>
                <div className="flex flex-col gap-1.5">
                  {form.phones.map((phone, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Input
                        value={phone}
                        onChange={(e) => {
                          const next = [...form.phones];
                          next[i] = e.target.value;
                          update("phones", next);
                        }}
                        placeholder="943 12 34 56"
                      />
                      {form.phones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Quitar teléfono"
                          className="size-9 shrink-0 text-zinc-900 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() =>
                            update(
                              "phones",
                              form.phones.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update("phones", [...form.phones, ""])}
                  className="mt-1.5 h-7 px-2 text-xs text-zinc-900 hover:bg-zinc-100"
                >
                  <Plus className="size-3.5" />
                  Añadir teléfono
                </Button>
              </div>

              {/* Direcciones */}
              <div>
                <h3 className="mb-2 text-xs font-bold text-zinc-900">Direcciones</h3>
                <div className="flex flex-col gap-3">
                  {form.addresses.map((address, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg border p-3 transition-colors",
                        address.isPrimary
                          ? "border-emerald-300 bg-emerald-50/40"
                          : "border-zinc-200"
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-zinc-900">
                          <input
                            type="radio"
                            name="primaryAddress"
                            checked={address.isPrimary}
                            onChange={() => setPrimaryAddress(i)}
                            className="size-3.5 accent-emerald-600"
                          />
                          {address.isPrimary ? "Principal" : `Dirección ${i + 1}`}
                        </label>
                        {form.addresses.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Quitar dirección"
                            className="size-7 text-zinc-900 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() =>
                              update(
                                "addresses",
                                form.addresses.filter((_, idx) => idx !== i)
                              )
                            }
                          >
                            <X className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-6">
                        <Field label="Calle y número" className="sm:col-span-4" required={i === 0}>
                          <Input
                            value={address.line1}
                            onChange={(e) => updateAddress(i, { line1: e.target.value })}
                            placeholder="Kale Nagusia 12"
                          />
                        </Field>
                        <Field label="Complemento" className="sm:col-span-2">
                          <Input
                            value={address.line2}
                            onChange={(e) => updateAddress(i, { line2: e.target.value })}
                            placeholder="Bajo A"
                          />
                        </Field>
                        <Field label="Ciudad" className="sm:col-span-3" required={i === 0}>
                          <Input
                            value={address.city}
                            onChange={(e) => updateAddress(i, { city: e.target.value })}
                            placeholder="Elgoibar"
                          />
                        </Field>
                        <Field label="C.P." className="sm:col-span-1">
                          <Input
                            value={address.zip}
                            onChange={(e) => updateAddress(i, { zip: e.target.value })}
                            placeholder="20870"
                          />
                        </Field>
                        <Field label="País" className="sm:col-span-2">
                          <Input
                            value={address.country}
                            onChange={(e) => updateAddress(i, { country: e.target.value })}
                            placeholder="España"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    update("addresses", [...form.addresses, emptyAddress(false)])
                  }
                  className="mt-2 h-7 px-2 text-xs text-zinc-900 hover:bg-zinc-100"
                >
                  <Plus className="size-3.5" />
                  Añadir dirección
                </Button>
              </div>
            </div>
          </Section>

          {/* Horario oculto por ahora */}
          {false && (
            <Section title="Horario">
              <OpeningHoursEditor
                value={form.openingHours}
                onChange={(next) => update("openingHours", next)}
              />
            </Section>
          )}

          {/* Facturación colapsable */}
          <Section title="Facturación">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3">
              <div className="flex items-center gap-2">
                <CreditCard
                  className={cn(
                    "size-4",
                    form.billing.invoicingActive ? "text-[#3B1E8A]" : "text-zinc-400"
                  )}
                />
                <span className="text-sm font-semibold text-zinc-900">
                  Activar datos de facturación
                </span>
              </div>
              <Switch
                checked={form.billing.invoicingActive}
                onChange={(v) => updateBilling("invoicingActive", v)}
              />
            </div>

            {form.billing.invoicingActive && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Razón social" className="sm:col-span-2">
                  <Input
                    value={form.billing.legalName}
                    onChange={(e) => updateBilling("legalName", e.target.value)}
                    placeholder={form.name || "Nombre fiscal"}
                  />
                </Field>
                <Field label="Tipo identificador">
                  <Select
                    value={form.billing.taxIdType}
                    onChange={(e) => updateBilling("taxIdType", e.target.value as TaxIdType)}
                  >
                    {taxIdTypeEnum.options.map((t) => (
                      <option key={t} value={t}>
                        {taxIdTypeLabels[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="NIF / CIF">
                  <Input
                    value={form.billing.taxId}
                    onChange={(e) => updateBilling("taxId", e.target.value)}
                    placeholder="B12345678"
                  />
                </Field>
                <Field label="Email facturación">
                  <Input
                    type="email"
                    value={form.billing.billingEmail}
                    onChange={(e) => updateBilling("billingEmail", e.target.value)}
                    placeholder="facturacion@cliente.com"
                  />
                </Field>
                <Field label="Teléfono facturación">
                  <Input
                    value={form.billing.billingPhone}
                    onChange={(e) => updateBilling("billingPhone", e.target.value)}
                    placeholder="943 12 34 56"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-900">Dirección fiscal</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyPrimaryAddressToBilling}
                      className="h-6 px-2 text-[11px] text-[#3B1E8A] hover:bg-[#3B1E8A]/10"
                    >
                      <Copy className="size-3" />
                      Copiar dirección principal
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-6">
                    <Field label="Calle y número" className="sm:col-span-4">
                      <Input
                        value={form.billing.address.line1}
                        onChange={(e) => updateBillingAddress({ line1: e.target.value })}
                        placeholder="Kale Nagusia 12"
                      />
                    </Field>
                    <Field label="Complemento" className="sm:col-span-2">
                      <Input
                        value={form.billing.address.line2}
                        onChange={(e) => updateBillingAddress({ line2: e.target.value })}
                        placeholder="Bajo A"
                      />
                    </Field>
                    <Field label="Ciudad" className="sm:col-span-3">
                      <Input
                        value={form.billing.address.city}
                        onChange={(e) => updateBillingAddress({ city: e.target.value })}
                        placeholder="Elgoibar"
                      />
                    </Field>
                    <Field label="C.P." className="sm:col-span-1">
                      <Input
                        value={form.billing.address.zip}
                        onChange={(e) => updateBillingAddress({ zip: e.target.value })}
                        placeholder="20870"
                      />
                    </Field>
                    <Field label="País" className="sm:col-span-2">
                      <Input
                        value={form.billing.address.country}
                        onChange={(e) => updateBillingAddress({ country: e.target.value })}
                        placeholder="España"
                      />
                    </Field>
                  </div>
                </div>
                <Field label="Método de pago">
                  <Select
                    value={form.billing.paymentMethod}
                    onChange={(e) =>
                      updateBilling("paymentMethod", e.target.value as PaymentMethod)
                    }
                  >
                    {paymentMethodEnum.options.map((p) => (
                      <option key={p} value={p}>
                        {paymentMethodLabels[p]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Condiciones">
                  <Input
                    value={form.billing.paymentTerms}
                    onChange={(e) => updateBilling("paymentTerms", e.target.value)}
                    placeholder="Pago a 30 días, día 5…"
                  />
                </Field>
                <Field label="Notas internas" className="sm:col-span-2">
                  <Textarea
                    value={form.billing.internalNotes}
                    onChange={(e) => updateBilling("internalNotes", e.target.value)}
                    placeholder="Contacto, envío de factura, observaciones…"
                    rows={2}
                  />
                </Field>
              </div>
            )}
          </Section>
        </div>

        {/* Columna lateral más delgada y compacta */}
        <div className="flex flex-col gap-4">
          <Section title="Sincronizar con la app">
            <div className="flex items-center gap-3">
              <Store
                className={cn(
                  "size-5 shrink-0",
                  form.syncToApp ? "text-emerald-600" : "text-zinc-900"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-900">
                  {form.syncToApp ? "Sincronizado" : "Sin sincronizar"}
                </p>
                <p className="text-[11px] text-zinc-900">
                  {form.syncToApp ? "Visible en la app móvil" : "No aparece en la app"}
                </p>
              </div>
              <Switch
                checked={form.syncToApp}
                onChange={(v) => update("syncToApp", v)}
              />
            </div>
          </Section>

          <Section title="Resumen">
            <ul className="divide-y divide-zinc-100">
              <SummaryRow label="Nombre" value={form.name || "—"} ok={!!form.name} />
              <SummaryRow label="Email" value={form.email || "—"} ok={!!form.email} />
              <SummaryRow
                label="Teléfonos"
                value={String(form.phones.filter((p) => p.trim()).length)}
                ok={form.phones.some((p) => p.trim())}
              />
              <SummaryRow
                label="Direcciones"
                value={String(
                  form.addresses.filter((a) => a.line1.trim() && a.city.trim()).length
                )}
                ok={form.addresses.some((a) => a.line1.trim() && a.city.trim())}
              />
              <SummaryRow
                label="Sincronizar app"
                value={form.syncToApp ? "Sí" : "No"}
                ok={form.syncToApp}
              />
              <SummaryRow
                label="Facturación"
                value={form.billing.invoicingActive ? "Activa" : "No"}
                ok={form.billing.invoicingActive}
              />
            </ul>
          </Section>

          <Section title="Notas internas">
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Contexto del comercio, acuerdos, observaciones…"
              rows={3}
            />
          </Section>
        </div>
      </div>

      {/* Footer sticky compacto */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="hidden truncate text-xs text-zinc-900 sm:block">
            <span className="font-semibold">{form.name || "Sin nombre"}</span>
            {form.type && <span className="text-zinc-900"> · {form.type}</span>}
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              asChild
              type="button"
              variant="ghost"
              className="text-zinc-900 hover:bg-zinc-100"
            >
              <Link href="/admin/clients">Cancelar</Link>
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !canSubmit}
              className="min-w-32 bg-[#3B1E8A] text-white shadow-sm hover:bg-[#2D1666] disabled:bg-zinc-200 disabled:text-zinc-500"
            >
              {isPending ? (
                "Guardando…"
              ) : mode === "create" ? (
                "Crear cliente"
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </div>
      </footer>

      <CustomTypeDialog
        open={customTypeDialogOpen}
        onClose={() => setCustomTypeDialogOpen(false)}
        onConfirm={(name, icon) => {
          addCustomType(name, icon);
          update("type", name);
          update("customTypeIcon", icon);
          setCustomTypeDialogOpen(false);
        }}
      />
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4">
      <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-950">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-xs font-semibold text-zinc-900">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "flex w-full rounded-md border border-zinc-200/80 bg-white px-3 py-2 text-sm shadow-xs outline-none",
        "placeholder:text-zinc-400",
        "focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-9 w-full rounded-md border border-zinc-200/80 bg-white px-3 text-sm shadow-xs outline-none",
        "focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200",
        props.className
      )}
    />
  );
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
        checked ? "bg-emerald-500" : "bg-zinc-300"
      )}
    >
      <span
        className={cn(
          "size-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
}) {
  const dayOrder: (keyof OpeningHours)[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  function setClosed(day: keyof OpeningHours, closed: boolean) {
    onChange({ ...value, [day]: closed ? [] : [{ open: "09:00", close: "17:00" }] });
  }

  function updateSlot(day: keyof OpeningHours, idx: number, patch: { open?: string; close?: string }) {
    const next = [...value[day]];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...value, [day]: next });
  }

  function addSlot(day: keyof OpeningHours) {
    onChange({ ...value, [day]: [...value[day], { open: "09:00", close: "17:00" }] });
  }

  function removeSlot(day: keyof OpeningHours, idx: number) {
    onChange({ ...value, [day]: value[day].filter((_, i) => i !== idx) });
  }

  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {dayOrder.map((day) => {
        const slots = value[day];
        const isClosed = slots.length === 0;
        return (
          <div
            key={day}
            className={cn(
              "flex flex-col gap-1.5 rounded-lg border px-3 py-2",
              isClosed ? "border-zinc-200 bg-zinc-50/40" : "border-emerald-200 bg-emerald-50/20"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">{dayLabels[day]}</span>
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-[10px] text-zinc-900">
                <input
                  type="checkbox"
                  checked={!isClosed}
                  onChange={(e) => setClosed(day, !e.target.checked)}
                  className="size-3 accent-emerald-600"
                />
                {isClosed ? "Cerrado" : "Abierto"}
              </label>
            </div>
            {!isClosed && (
              <div className="flex flex-col gap-1">
                {slots.map((slot, si) => (
                  <div key={si} className="flex items-center gap-1">
                    <Input
                      type="time"
                      value={slot.open}
                      onChange={(e) => updateSlot(day, si, { open: e.target.value })}
                      className="h-7 px-1.5 font-mono text-[11px] tabular-nums"
                      aria-label={`${dayLabels[day]} apertura`}
                    />
                    <span className="text-[10px] text-zinc-900">–</span>
                    <Input
                      type="time"
                      value={slot.close}
                      onChange={(e) => updateSlot(day, si, { close: e.target.value })}
                      className="h-7 px-1.5 font-mono text-[11px] tabular-nums"
                      aria-label={`${dayLabels[day]} cierre`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Quitar tramo"
                      onClick={() => removeSlot(day, si)}
                      className="size-6 text-zinc-900 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addSlot(day)}
                  className="h-6 px-1.5 text-[10px] text-[#3B1E8A] hover:bg-[#3B1E8A]/10"
                >
                  <Plus className="size-3" />
                  Tramo
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-1.5 first:pt-0 last:pb-0">
      <span className="text-xs text-zinc-900">{label}</span>
      <span
        className={cn(
          "flex items-center gap-1 truncate text-right text-xs font-semibold",
          ok ? "text-zinc-950" : "text-zinc-900"
        )}
      >
        {value}
        {ok && <Check className="size-3 shrink-0 text-emerald-500" />}
      </span>
    </li>
  );
}
