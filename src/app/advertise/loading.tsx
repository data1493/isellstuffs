export default function AdvertiseLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Pulling the rate card…
      </p>
      <div className="mt-8 grid gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
