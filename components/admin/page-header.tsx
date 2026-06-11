type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
};

export function PageHeader({ title, description, actions, eyebrow }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.06em] text-[#3B1E8A] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-zinc-500 text-pretty">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
