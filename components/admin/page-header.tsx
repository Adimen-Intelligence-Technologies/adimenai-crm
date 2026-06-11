type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
  search?: React.ReactNode;
  actionsBottom?: React.ReactNode;
};

export function PageHeader({ title, description, actions, eyebrow, search, actionsBottom }: Props) {
  return (
    <div className="flex flex-col gap-4">
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
        <div className="flex items-center gap-2">
          {search}
          {actions}
        </div>
      </div>
      {actionsBottom && (
        <div className="flex items-center gap-2">{actionsBottom}</div>
      )}
    </div>
  );
}
