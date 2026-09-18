export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Background ambient radial glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-violet-600/10 dark:bg-violet-600/5 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Animated pulsing spinner pod */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-400 p-[2px] animate-spin [animation-duration:3s]">
            <div className="w-full h-full bg-[var(--bg-main)] rounded-[22px] flex items-center justify-center">
              <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-400 animate-pulse" />
            </div>
          </div>
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-violet-600 to-cyan-400 blur-xl opacity-30 animate-pulse" />
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span>Awakening Chapter</span>
          </div>
          <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[var(--text-main)]">
            Loading High Definition Canvas...
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Synchronizing panels and vertical scroll buffers
          </p>
        </div>

        {/* Shimmer skeleton bars */}
        <div className="max-w-xs mx-auto space-y-2.5 pt-2">
          <div className="h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-x-full animate-[shimmer-sweep_1.5s_infinite]" />
          </div>
          <div className="h-2 w-3/4 mx-auto rounded-full bg-[var(--bg-surface)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent -translate-x-full animate-[shimmer-sweep_1.5s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
