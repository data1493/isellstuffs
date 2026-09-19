export function StallMixBar({
  physical,
  digital,
}: {
  physical: number;
  digital: number;
}) {
  const total = physical + digital;

  if (total === 0) {
    return null;
  }

  return (
    <div className="max-w-md space-y-2">
      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        aria-hidden
      >
        <div
          className="bg-primary/70"
          style={{ width: `${(physical / total) * 100}%` }}
        />
        <div
          className="bg-[color-mix(in_oklch,var(--accent-foreground)_45%,var(--accent))]"
          style={{ width: `${(digital / total) * 100}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {physical} on the table · {digital} {digital === 1 ? "file" : "files"}{" "}
        under it · same stall
      </p>
    </div>
  );
}
