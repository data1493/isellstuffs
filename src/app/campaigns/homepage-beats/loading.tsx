export default function CampaignLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Opening the campaign…
      </p>
      <div className="mt-8 h-72 animate-pulse rounded-2xl bg-[oklch(0.27_0.035_42)]" />
    </div>
  );
}
