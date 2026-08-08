'use client';

interface PlayPauseButtonProps {
  readonly playing: boolean;
  readonly onToggle: () => void;
  readonly disabled?: boolean;
}

export function PlayPauseButton({
  playing,
  onToggle,
  disabled,
}: PlayPauseButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={playing}
      className="flex items-center gap-2 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] disabled:opacity-40 transition-opacity"
    >
      {playing ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <rect x="1" y="1" width="3.5" height="10" fill="currentColor" />
            <rect x="7.5" y="1" width="3.5" height="10" fill="currentColor" />
          </svg>
          Pause
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1.5 0.5 L11 6 L1.5 11.5 Z" fill="currentColor" />
          </svg>
          Play
        </>
      )}
    </button>
  );
}
