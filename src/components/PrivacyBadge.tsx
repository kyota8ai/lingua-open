import { LockKey } from "@phosphor-icons/react";
import { REPO_URL } from "../lib/constants";

/**
 * The standing privacy note. Honesty rule: the subject of the claim is always
 * "we", because audio does reach the provider the user chose.
 * Shown in the sidebar and on Settings.
 */
export function PrivacyBadge() {
  return (
    <div className="rounded-(--radius-card) border border-line bg-sunken p-3.5">
      <div className="flex items-center gap-2 text-ink">
        <LockKey size={16} aria-hidden />
        <span className="text-[13px] font-semibold">Nothing leaves this browser for us</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
        We run no servers. Your key, history and vocabulary live here. Audio goes only to the AI provider you chose.
      </p>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
      >
        Verify it in the source
      </a>
    </div>
  );
}
