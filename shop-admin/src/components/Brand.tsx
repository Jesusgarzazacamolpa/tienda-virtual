export function Brand({ subtitle = 'Centro de control' }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-signal-400/30 bg-signal-400/10"
      >
        <span className="h-5 w-5 rounded-full border-2 border-signal-300/80" />
        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-signal-300" />
      </span>
      <span>
        <span className="block font-display text-lg leading-tight text-sand-50">Órbita</span>
        <span className="block text-[10px] font-semibold tracking-[0.26em] text-sand-100/50 uppercase">
          {subtitle}
        </span>
      </span>
    </div>
  );
}
