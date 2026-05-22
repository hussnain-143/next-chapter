export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-sm font-semibold">Loading lesson details…</p>
      </div>
    </div>
  );
}
