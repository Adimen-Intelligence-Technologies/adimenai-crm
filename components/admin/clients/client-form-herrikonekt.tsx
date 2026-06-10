"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, CreditCard, MapPin, Plus, Receipt, Tag, X } from "lucide-react";
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
  type DayHours,
  type HerrikonektType,
  type OpeningHours,
  type PaymentMethod,
  type TaxIdType,
} from "@/lib/schemas/client";
import type { Client } from "@/lib/repositories/clients";
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

type StepId = "basics" | "category" | "contact" | "billing";

const stepOrder: StepId[] = ["basics", "category", "contact", "billing"];

const stepMeta: Record<
  StepId,
  { id: StepId; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  basics: {
    id: "basics",
    title: "Datos básicos",
    subtitle: "Nombre, email, web, teléfonos y redes del comercio.",
    icon: Receipt,
  },
  category: {
    id: "category",
    title: "Categoría",
    subtitle: "Tipo y subtipo dentro de Herrikonekt.",
    icon: Tag,
  },
  contact: {
    id: "contact",
    title: "Direcciones",
    subtitle: "Dirección del comercio. Puedes añadir varias.",
    icon: MapPin,
  },
  billing: {
    id: "billing",
    title: "Facturación",
    subtitle: "Datos fiscales para emitir facturas cuando se necesite.",
    icon: CreditCard,
  },
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
  const [step, setStep] = useState<StepId>("basics");
  const [stepErrors, setStepErrors] = useState<Partial<Record<StepId, string>>>({});
  const [customTypeDialogOpen, setCustomTypeDialogOpen] = useState(false);

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

  const stepValidity = useMemo(
    () => ({
      basics: form.name.trim().length > 0,
      category: true,
      contact: true,
      billing: true,
    }),
    [form]
  );

  const allValid = stepValidity.basics && stepValidity.category && stepValidity.contact && stepValidity.billing;

  const currentIndex = stepOrder.indexOf(step);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === stepOrder.length - 1;

  function goNext() {
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[step];
      return next;
    });
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  }

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
        if (mode === "create") {
          router.push("/admin/clients");
        } else {
          router.push("/admin/clients");
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          aria-label="Volver"
          className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Link
            href="/admin/clients"
          >
            <ChevronLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">
            {mode === "create" ? "Nuevo cliente" : "Editar cliente"}
          </h1>
          <p className="text-sm text-zinc-500">Herrikonekt · Comercio local</p>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Stepper
        currentStep={step}
        onSelect={(s) => {
          if (s === step) return;
          const targetIndex = stepOrder.indexOf(s);
          if (targetIndex < currentIndex) {
            setStep(s);
            return;
          }
          for (let i = 0; i < targetIndex; i++) {
            if (!stepValidity[stepOrder[i]]) return;
          }
          setStep(s);
        }}
        isStepReachable={(s) => {
          const targetIndex = stepOrder.indexOf(s);
          if (targetIndex <= currentIndex) return true;
          for (let i = 0; i < targetIndex; i++) {
            if (!stepValidity[stepOrder[i]]) return false;
          }
          return true;
        }}
        isStepValid={(s) => stepValidity[s]}
      />

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        {step === "basics" && (
          <StepShell
            title={stepMeta.basics.title}
            subtitle={stepMeta.basics.subtitle}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nombre" required>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ej. Bar Amaya"
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
              <Field label="Página web">
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
                    update("social", {
                      ...form.social,
                      instagram: e.target.value,
                    })
                  }
                  placeholder="@usuario o URL"
                />
              </Field>
              <Field label="Facebook">
                <Input
                  value={form.social.facebook}
                  onChange={(e) =>
                    update("social", {
                      ...form.social,
                      facebook: e.target.value,
                    })
                  }
                  placeholder="URL de la página"
                />
              </Field>
              <Field label="Sincronizar con la app">
                <Switch
                  checked={form.syncToApp}
                  onChange={(v) => update("syncToApp", v)}
                  label={form.syncToApp ? "Activado" : "Desactivado"}
                />
              </Field>

              <Field label="Teléfonos" className="sm:col-span-2">
                <div className="flex flex-col gap-2">
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
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => update("phones", [...form.phones, ""])}
                    className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
                  >
                    <Plus />
                    Añadir teléfono
                  </Button>
                </div>
              </Field>

              <Field label="Descripción" className="sm:col-span-2">
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Notas internas sobre el comercio"
                  rows={3}
                />
              </Field>
            </div>

            <div className="mt-6 border-t border-zinc-200 pt-6">
              <h3 className="mb-1 text-sm font-semibold text-zinc-900">
                Horario de apertura
              </h3>
              <p className="mb-4 text-xs text-zinc-500">
                Horarios por día de la semana. Déjalo vacío si el comercio
                cierra ese día.
              </p>
              <div className="flex flex-col gap-3">
                {(Object.keys(dayLabels) as (keyof OpeningHours)[]).map(
                  (day) => {
                    const slots = form.openingHours[day];
                    return (
                      <div
                        key={day}
                        className="flex flex-wrap items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50/30 p-3"
                      >
                        <span className="mt-1.5 min-w-20 text-sm font-medium text-zinc-700">
                          {dayLabels[day]}
                        </span>
                        <div className="flex flex-1 flex-col gap-1.5">
                          {slots.length === 0 && (
                            <span className="text-xs text-zinc-400 italic">
                              Cerrado
                            </span>
                          )}
                          {slots.map((slot, si) => (
                            <div
                              key={si}
                              className="flex items-center gap-1.5"
                            >
                              <Input
                                type="time"
                                value={slot.open}
                                onChange={(e) => {
                                  const next = { ...form.openingHours };
                                  const copy = [...next[day]];
                                  copy[si] = { ...copy[si], open: e.target.value };
                                  next[day] = copy;
                                  update("openingHours", next);
                                }}
                                className="h-8 w-32"
                                aria-label={`${dayLabels[day]} apertura`}
                              />
                              <span className="text-xs text-zinc-400">a</span>
                              <Input
                                type="time"
                                value={slot.close}
                                onChange={(e) => {
                                  const next = { ...form.openingHours };
                                  const copy = [...next[day]];
                                  copy[si] = { ...copy[si], close: e.target.value };
                                  next[day] = copy;
                                  update("openingHours", next);
                                }}
                                className="h-8 w-32"
                                aria-label={`${dayLabels[day]} cierre`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Quitar horario"
                                className="size-8 shrink-0 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => {
                                  const next = { ...form.openingHours };
                                  next[day] = slots.filter(
                                    (_, idx) => idx !== si
                                  );
                                  update("openingHours", next);
                                }}
                              >
                                <X />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Añadir horario"
                            className="size-8 shrink-0 text-zinc-400 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
                            onClick={() => {
                              const next = { ...form.openingHours };
                              next[day] = [...slots, { open: "09:00", close: "17:00" }];
                              update("openingHours", next);
                            }}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </StepShell>
        )}

        {step === "category" && (
          <StepShell
            title={stepMeta.category.title}
            subtitle={stepMeta.category.subtitle}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-zinc-700">Tipo</label>
                  <button
                    type="button"
                    onClick={() => setCustomTypeDialogOpen(true)}
                    className="flex size-5 items-center justify-center rounded-[4px] bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
                    aria-label="Crear categoría personalizada"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
                <TypeCombobox
                  value={form.type}
                  onChange={(v, ct) => {
                    update("type", v);
                    if (ct) update("customTypeIcon", ct.icon);
                  }}
                  placeholder="Selecciona un tipo…"
                />
              </div>
            </div>
          </StepShell>
        )}

        {step === "contact" && (
          <StepShell
            title={stepMeta.contact.title}
            subtitle={stepMeta.contact.subtitle}
          >
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-3 text-sm font-medium text-zinc-900">
                  Direcciones
                </h3>
                <div className="flex flex-col gap-3">
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                        <Field
                          label="Calle y número"
                          className="sm:col-span-4"
                        >
                          <Input
                            value={address.line1}
                            onChange={(e) =>
                              updateAddress(i, { line1: e.target.value })
                            }
                            placeholder="Kale Nagusia 12"
                          />
                        </Field>
                        <Field label="Complemento" className="sm:col-span-2">
                          <Input
                            value={address.line2}
                            onChange={(e) =>
                              updateAddress(i, { line2: e.target.value })
                            }
                            placeholder="Bajo A"
                          />
                        </Field>
                        <Field
                          label="Ciudad"
                          className="sm:col-span-3"
                        >
                          <Input
                            value={address.city}
                            onChange={(e) =>
                              updateAddress(i, { city: e.target.value })
                            }
                            placeholder="Elgoibar"
                          />
                        </Field>
                        <Field label="Código postal" className="sm:col-span-1">
                          <Input
                            value={address.zip}
                            onChange={(e) =>
                              updateAddress(i, { zip: e.target.value })
                            }
                            placeholder="20870"
                          />
                        </Field>
                        <Field label="País" className="sm:col-span-2">
                          <Input
                            value={address.country}
                            onChange={(e) =>
                              updateAddress(i, { country: e.target.value })
                            }
                            placeholder="España"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      update("addresses", [
                        ...form.addresses,
                        emptyAddress(false),
                      ])
                    }
                    className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
                  >
                    <Plus />
                    Añadir dirección
                  </Button>
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {step === "billing" && (
          <StepShell
            title={stepMeta.billing.title}
            subtitle={stepMeta.billing.subtitle}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Activar datos de facturación
                  </p>
                  <p className="text-sm text-zinc-500">
                    Necesarios para emitir facturas de servicios publicitarios.
                  </p>
                </div>
                <Switch
                  checked={form.billing.invoicingActive}
                  onChange={(v) => updateBilling("invoicingActive", v)}
                  label={form.billing.invoicingActive ? "Activado" : "Desactivado"}
                />
              </div>

              {form.billing.invoicingActive && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Razón social" className="sm:col-span-2">
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
                  <Field label="NIF / CIF">
                    <Input
                      value={form.billing.taxId}
                      onChange={(e) => updateBilling("taxId", e.target.value)}
                      placeholder="B12345678"
                    />
                  </Field>
                  <Field label="Email de facturación">
                    <Input
                      type="email"
                      value={form.billing.billingEmail}
                      onChange={(e) =>
                        updateBilling("billingEmail", e.target.value)
                      }
                      placeholder="facturacion@cliente.com"
                    />
                  </Field>
                  <Field label="Teléfono de facturación">
                    <Input
                      value={form.billing.billingPhone}
                      onChange={(e) =>
                        updateBilling("billingPhone", e.target.value)
                      }
                      placeholder="943 12 34 56"
                    />
                  </Field>
                  <Field
                    label="Calle y número (fiscal)"
                    className="sm:col-span-2"
                  >
                    <Input
                      value={form.billing.address.line1}
                      onChange={(e) =>
                        updateBillingAddress({ line1: e.target.value })
                      }
                      placeholder="Kale Nagusia 12"
                    />
                  </Field>
                  <Field label="Complemento (fiscal)">
                    <Input
                      value={form.billing.address.line2}
                      onChange={(e) =>
                        updateBillingAddress({ line2: e.target.value })
                      }
                      placeholder="Bajo A"
                    />
                  </Field>
                  <Field label="Ciudad (fiscal)">
                    <Input
                      value={form.billing.address.city}
                      onChange={(e) =>
                        updateBillingAddress({ city: e.target.value })
                      }
                      placeholder="Elgoibar"
                    />
                  </Field>
                  <Field label="Código postal (fiscal)">
                    <Input
                      value={form.billing.address.zip}
                      onChange={(e) =>
                        updateBillingAddress({ zip: e.target.value })
                      }
                      placeholder="20870"
                    />
                  </Field>
                  <Field label="País (fiscal)">
                    <Input
                      value={form.billing.address.country}
                      onChange={(e) =>
                        updateBillingAddress({ country: e.target.value })
                      }
                      placeholder="España"
                    />
                  </Field>
                  <Field label="Método de pago">
                    <NativeSelect
                      value={form.billing.paymentMethod}
                      onChange={(e) =>
                        updateBilling(
                          "paymentMethod",
                          e.target.value as PaymentMethod
                        )
                      }
                    >
                      {paymentMethodEnum.options.map((p) => (
                        <option key={p} value={p}>
                          {paymentMethodLabels[p]}
                        </option>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field label="Condiciones de pago">
                    <Input
                      value={form.billing.paymentTerms}
                      onChange={(e) =>
                        updateBilling("paymentTerms", e.target.value)
                      }
                      placeholder="Pago a 30 días, día 5 del mes siguiente…"
                    />
                  </Field>
                  <Field label="Notas internas" className="sm:col-span-2">
                    <Textarea
                      value={form.billing.internalNotes}
                      onChange={(e) =>
                        updateBilling("internalNotes", e.target.value)
                      }
                      placeholder="Persona de contacto, forma de envío de factura, observaciones…"
                      rows={3}
                    />
                  </Field>
                  <div className="sm:col-span-2 -mt-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyPrimaryAddressToBilling}
                      className="text-[#3B1E8A] hover:bg-[#3B1E8A]/10"
                    >
                      Copiar dirección principal como dirección fiscal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </StepShell>
        )}
      </div>

      <footer className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={isFirst}
        >
          <ChevronLeft />
          Atrás
        </Button>
        <p className="hidden text-xs text-zinc-500 sm:block">
          Paso {currentIndex + 1} de {stepOrder.length}
        </p>
        {isLast ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !allValid}
            className="bg-[#3B1E8A] text-white hover:bg-[#2D1666] disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            {isPending
              ? "Guardando…"
              : mode === "create"
                ? "Crear cliente"
                : "Guardar cambios"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={goNext}
            className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
          >
            Siguiente
            <ChevronRight />
          </Button>
        )}
      </footer>

      {stepErrors[step] && (
        <div
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {stepErrors[step]}
        </div>
      )}

      <CustomTypeDialog
        open={customTypeDialogOpen}
        onClose={() => setCustomTypeDialogOpen(false)}
        onConfirm={(name, icon) => {
          update("type", name);
          update("customTypeIcon", icon);
          setCustomTypeDialogOpen(false);
        }}
      />
    </div>
  );
}

function Stepper({
  currentStep,
  onSelect,
  isStepReachable,
  isStepValid,
}: {
  currentStep: StepId;
  onSelect: (step: StepId) => void;
  isStepReachable: (step: StepId) => boolean;
  isStepValid: (step: StepId) => boolean;
}) {
  return (
    <ol
      className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-2"
      aria-label="Pasos del formulario"
    >
      {stepOrder.map((s, i) => {
        const meta = stepMeta[s];
        const Icon = meta.icon;
        const isCurrent = s === currentStep;
        const reachable = isStepReachable(s);
        const valid = isStepValid(s);
        return (
          <li key={s} className="flex flex-1 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => reachable && onSelect(s)}
              disabled={!reachable}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                isCurrent
                  ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
                  : reachable
                    ? "text-zinc-700 hover:bg-zinc-50"
                    : "cursor-not-allowed text-zinc-400"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isCurrent
                    ? "border-[#3B1E8A] bg-[#3B1E8A] text-white"
                    : valid && reachable
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-white text-zinc-500"
                )}
              >
                {valid && !isCurrent ? (
                  <Check className="size-3.5" />
                ) : (
                  <Icon className="size-3.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {meta.title}
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  Paso {i + 1}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      {children}
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
      <label className="text-sm font-semibold text-zinc-700">
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
        "inline-flex h-9 w-full items-center justify-between gap-3 rounded-md border px-3 text-sm transition-colors",
        checked
          ? "border-[#3B1E8A] bg-[#3B1E8A] text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      )}
    >
      <span className="shrink-0">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors",
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
