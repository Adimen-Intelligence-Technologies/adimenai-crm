"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  herrikonektSubTypeByType,
  herrikonektTypeEnum,
  herrikonektTypeLabels,
  paymentMethodEnum,
  paymentMethodLabels,
  taxIdTypeEnum,
  taxIdTypeLabels,
  type HerrikonektType,
  type PaymentMethod,
  type TaxIdType,
} from "@/lib/schemas/client";
import type { Client } from "@/lib/repositories/clients";

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
  type: HerrikonektType;
  subType: string;
  syncToApp: boolean;
  billing: BillingForm;
};

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

function toFormState(initial?: InitialClient): FormState {
  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    website: initial?.website ?? "",
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
    type:
      (initial?.type as HerrikonektType | undefined) ??
      herrikonektTypeEnum.enum.bares_y_restaurantes,
    subType: initial?.subType ?? "",
    syncToApp: initial?.syncToApp ?? true,
    billing: billingFromClient(initial?.billing),
  };
}

export function ClientFormHerrikonekt({ mode, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => toFormState(initial));

  const subTypeOptions = herrikonektSubTypeByType[form.type] ?? [];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "type") next.subType = "";
      return next;
    });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      businessLine: "herrikonekt" as const,
      name: form.name.trim(),
      description: form.description.trim(),
      website: form.website.trim(),
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
      subType: form.subType,
      syncToApp: form.syncToApp,
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
    };

    if (payload.addresses.length === 0) {
      setError("Añade al menos una dirección completa.");
      return;
    }

    if (payload.billing.invoicingActive && !payload.billing.taxId) {
      setError("Si activas facturación, indica el NIF/CIF del cliente.");
      return;
    }

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
        if (mode === "create") {
          const created = (await res.json()) as Client;
          router.push(`/admin/clients/${created._id}`);
        } else {
          router.push(`/admin/clients/${initial?._id}`);
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Volver"
            className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Link
              href={
                mode === "create" ? "/admin/clients" : `/admin/clients/${initial?._id}`
              }
            >
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">
              {mode === "create" ? "Nuevo cliente" : "Editar cliente"}
            </h1>
            <p className="text-sm text-zinc-500">
              Herrikonekt · Comercio local
            </p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
        >
          {isPending
            ? "Guardando…"
            : mode === "create"
              ? "Crear cliente"
              : "Guardar cambios"}
        </Button>
      </header>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <Subgroup
          title="Datos básicos"
          description="Nombre, descripción y sitio web del comercio."
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-4">
            <Field label="Nombre" required>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ej. Bar Amaya"
                required
              />
            </Field>
            <Field label="Descripción">
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Notas internas sobre el comercio"
                rows={2}
              />
            </Field>
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3">
              <Field label="Página web" className="md:col-span-2">
                <Input
                  type="url"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://"
                />
              </Field>
              <Field label="Sincronizar app">
                <Switch
                  checked={form.syncToApp}
                  onChange={(v) => update("syncToApp", v)}
                  label={form.syncToApp ? "Activado" : "Desactivado"}
                />
              </Field>
            </div>
          </div>
        </Subgroup>

        <Subgroup
          title="Categoría"
          description="Tipo y subtipo dentro de Herrikonekt."
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
            <Field label="Tipo" required>
              <NativeSelect
                value={form.type}
                onChange={(e) => update("type", e.target.value as HerrikonektType)}
              >
                {herrikonektTypeEnum.options.map((t) => (
                  <option key={t} value={t}>
                    {herrikonektTypeLabels[t]}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Subtipo" required>
              <NativeSelect
                value={form.subType}
                onChange={(e) => update("subType", e.target.value)}
                required
              >
                <option value="">Selecciona…</option>
                {subTypeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
        </Subgroup>

        <Subgroup
          title="Facturación"
          description="Datos fiscales para emitir facturas cuando el cliente contrate publicidad."
        >
          <div className="mb-4 flex flex-col gap-3 rounded-md border border-zinc-200 bg-zinc-50/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900">
                Activar facturación
              </p>
              <p className="text-sm text-zinc-500">
                Guarda los datos fiscales para poder emitir facturas tras los
                servicios publicitarios.
              </p>
            </div>
            <Switch
              checked={form.billing.invoicingActive}
              onChange={(v) => updateBilling("invoicingActive", v)}
              label={form.billing.invoicingActive ? "Activado" : "Desactivado"}
            />
          </div>

          {form.billing.invoicingActive && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
                <Field label="Razón social" className="md:col-span-2">
                  <Input
                    value={form.billing.legalName}
                    onChange={(e) => updateBilling("legalName", e.target.value)}
                    placeholder={form.name || "Nombre fiscal"}
                  />
                </Field>
                <Field label="Tipo de identificador">
                  <NativeSelect
                    value={form.billing.taxIdType}
                    onChange={(e) =>
                      updateBilling("taxIdType", e.target.value as TaxIdType)
                    }
                  >
                    {taxIdTypeEnum.options.map((t) => (
                      <option key={t} value={t}>
                        {taxIdTypeLabels[t]}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="NIF / CIF" required>
                  <Input
                    value={form.billing.taxId}
                    onChange={(e) => updateBilling("taxId", e.target.value)}
                    placeholder="B12345678"
                    required
                  />
                </Field>
                <Field label="Email de facturación" className="md:col-span-2">
                  <Input
                    type="email"
                    value={form.billing.billingEmail}
                    onChange={(e) => updateBilling("billingEmail", e.target.value)}
                    placeholder="facturacion@cliente.com"
                  />
                </Field>
                <Field label="Teléfono de facturación" className="md:col-span-2">
                  <Input
                    value={form.billing.billingPhone}
                    onChange={(e) => updateBilling("billingPhone", e.target.value)}
                    placeholder="943 12 34 56"
                  />
                </Field>
              </div>

              <div className="rounded-md border border-zinc-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900">
                    Dirección fiscal
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyPrimaryAddressToBilling}
                    className="text-[#3B1E8A] hover:bg-[#3B1E8A]/10"
                  >
                    Usar la principal
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-6">
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
                  <Field label="Código postal" className="sm:col-span-1">
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

              <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3">
                <Field label="Método de pago">
                  <NativeSelect
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
                  </NativeSelect>
                </Field>
                <Field label="Condiciones de pago" className="md:col-span-2">
                  <Input
                    value={form.billing.paymentTerms}
                    onChange={(e) => updateBilling("paymentTerms", e.target.value)}
                    placeholder="Pago a 30 días, día 5 del mes siguiente…"
                  />
                </Field>
                <Field
                  label="Notas internas de facturación"
                  className="md:col-span-3"
                >
                  <Textarea
                    value={form.billing.internalNotes}
                    onChange={(e) => updateBilling("internalNotes", e.target.value)}
                    placeholder="Persona de contacto, forma de envío de factura, observaciones…"
                    rows={2}
                  />
                </Field>
              </div>
            </div>
          )}
        </Subgroup>

        <Subgroup
          title="Teléfonos"
          description="Añade uno o varios teléfonos de contacto."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => update("phones", [...form.phones, ""])}
              className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
            >
              <Plus />
              Añadir
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {form.phones.map((phone, i) => (
              <div key={i} className="flex items-center gap-2">
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
                    size="icon-sm"
                    aria-label="Quitar teléfono"
                    className="text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() =>
                      update(
                        "phones",
                        form.phones.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    <X />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Subgroup>

        <Subgroup
          title="Direcciones"
          description="Marca una como principal. Puedes añadir varias."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() =>
                update("addresses", [...form.addresses, emptyAddress(false)])
              }
              className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
            >
              <Plus />
              Añadir
            </Button>
          }
          isLast
        >
          <div className="flex flex-col gap-4">
            {form.addresses.map((address, i) => (
              <div
                key={i}
                className="rounded-md border border-zinc-200 bg-zinc-50/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="radio"
                      name="primaryAddress"
                      checked={address.isPrimary}
                      onChange={() => setPrimaryAddress(i)}
                      className="size-4 accent-[#3B1E8A]"
                    />
                    Dirección principal
                  </label>
                  {form.addresses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Quitar dirección"
                      className="text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() =>
                        update(
                          "addresses",
                          form.addresses.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      <X />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-6">
                  <Field label="Calle y número" required className="sm:col-span-4">
                    <Input
                      value={address.line1}
                      onChange={(e) => updateAddress(i, { line1: e.target.value })}
                      placeholder="Kale Nagusia 12"
                      required
                    />
                  </Field>
                  <Field label="Complemento" className="sm:col-span-2">
                    <Input
                      value={address.line2}
                      onChange={(e) => updateAddress(i, { line2: e.target.value })}
                      placeholder="Bajo A"
                    />
                  </Field>
                  <Field label="Ciudad" required className="sm:col-span-3">
                    <Input
                      value={address.city}
                      onChange={(e) => updateAddress(i, { city: e.target.value })}
                      placeholder="Elgoibar"
                      required
                    />
                  </Field>
                  <Field label="Código postal" className="sm:col-span-1">
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
        </Subgroup>
      </div>
    </form>
  );
}

function Subgroup({
  title,
  description,
  children,
  action,
  isLast = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={cn(isLast ? "" : "border-b border-zinc-200 pb-6 mb-6")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
        "placeholder:text-zinc-400",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        props.className
      )}
    />
  );
}

function NativeSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        props.className
      )}
    />
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm transition-colors",
        checked
          ? "border-[#3B1E8A] bg-[#3B1E8A] text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative inline-flex h-4 w-7 items-center rounded-full transition-colors",
          checked ? "bg-white/30" : "bg-zinc-300"
        )}
      >
        <span
          className={cn(
            "inline-block size-3 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-3.5" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}
