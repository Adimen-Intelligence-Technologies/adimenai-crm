type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500">
          <span className="leading-none text-[#6C47FF]">+</span>Panel
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
