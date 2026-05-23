

export default function SkeletonLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground p-6">
      <div className="w-full max-w-5xl space-y-6 animate-pulse">
        <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xl">
          <div className="space-y-4">
            <div className="h-7 w-56 rounded-full bg-muted/20" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-28 rounded-3xl bg-muted/20" />
              <div className="h-28 rounded-3xl bg-muted/20" />
              <div className="h-28 rounded-3xl bg-muted/20" />
            </div>
            <div className="space-y-3">
              <div className="h-4 rounded-full bg-muted/20 w-3/4" />
              <div className="h-4 rounded-full bg-muted/20 w-full" />
              <div className="h-4 rounded-full bg-muted/20 w-5/6" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xl">
          <div className="space-y-3 flex-1">
            <div className="h-4 rounded-full bg-muted/20 w-1/2" />
            <div className="h-4 rounded-full bg-muted/20 w-2/3" />
          </div>
          <div className="h-12 w-28 rounded-full bg-muted/20" />
        </div>
      </div>
    </div>
  );
}
