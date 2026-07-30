import { useEffect, useRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

/*
 * M3 buttons: pill shape, and hover/press expressed as a state layer of the
 * content colour rather than a second background colour per variant.
 */
const buttonBase =
  "state-layer inline-flex items-center justify-center gap-2 font-medium rounded-(--radius-control) cursor-pointer select-none " +
  "transition-[background-color,border-color] duration-150 ease-(--ease-emphasized) " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent",
  secondary: "text-accent-text border border-line-strong",
  ghost: "text-accent-text",
  danger: "bg-live text-on-live",
};

/* 44px touch-target floor (DESIGN.md): every size is at least h-11. */
const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

/** For styling a <Link>/<a> as a button (never nest a Link inside <button>). */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cx(buttonBase, buttonVariants[variant], buttonSizes[size], extra);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

/**
 * Native <dialog> modal: Esc, focus trap, initial focus and inert background
 * come from the platform. Backdrop click closes.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  variant = "center",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  variant?: "center" | "sheet";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const downOnBackdrop = useRef(false);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  // showModal() makes the background inert but does not stop it scrolling.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      /* Backdrop-only dismiss: the dialog has zero padding of its own (the
         inner div owns it), and both mousedown AND click must hit the dialog
         element so a drag that started inside never closes it. */
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === ref.current;
      }}
      onClick={(e) => {
        if (e.target === ref.current && downOnBackdrop.current) onClose();
      }}
      className={
        variant === "center"
          ? "m-auto w-[calc(100%-2rem)] max-w-sm rounded-(--radius-sheet) bg-raised text-ink border border-line p-0 backdrop:bg-black/50"
          : "m-0 mt-auto w-full max-w-full rounded-t-(--radius-sheet) bg-raised text-ink border-t border-line p-0 backdrop:bg-black/50"
      }
    >
      <div className={variant === "center" ? "p-6" : "p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"}>
        {children}
      </div>
    </dialog>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("bg-surface border border-line rounded-(--radius-card)", className)}>{children}</div>
  );
}

export function Field({
  label,
  htmlFor,
  helper,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  helper?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {helper && !error && <p className="text-[13px] text-ink-faint leading-snug">{helper}</p>}
      {error && (
        <p className="text-[13px] text-live leading-snug" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "h-12 px-4 rounded-(--radius-field) bg-surface border border-line-strong text-[15px] text-ink",
        "placeholder:text-ink-faint focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-0",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        "h-12 px-4 rounded-(--radius-field) bg-surface border border-line-strong text-[15px] text-ink cursor-pointer",
        "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-0",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "state-layer h-10 px-4 rounded-(--radius-field) text-sm font-medium cursor-pointer",
        "transition-[background-color,border-color] duration-150 ease-(--ease-emphasized)",
        active
          ? "bg-accent-soft text-on-accent-soft border border-transparent"
          : "text-ink-muted border border-line",
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "warn" | "good" | "live";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-sunken text-ink-muted",
    accent: "bg-accent-soft text-on-accent-soft",
    warn: "bg-warn-soft text-on-warn-soft",
    good: "bg-good-soft text-on-good-soft",
    live: "bg-live-soft text-on-live-soft",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6">
      <div className="text-ink-faint" aria-hidden>
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="text-[15px] text-ink-muted max-w-sm leading-relaxed">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse bg-sunken rounded-(--radius-card)", className)} aria-hidden />;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{children}</h2>
      {right}
    </div>
  );
}
