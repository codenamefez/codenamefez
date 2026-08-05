import { formatDistanceToNow, format } from "date-fns";
import type { AnnouncementType } from "@/lib/types";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/lib/status";

interface AnnouncementBannerProps {
  title: string;
  message: string;
  type: AnnouncementType;
}

export function AnnouncementBanner({ title, message, type }: AnnouncementBannerProps) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-100",
    maintenance:
      "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-100",
    warning:
      "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 ${styles[type]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {ANNOUNCEMENT_TYPE_LABELS[type]}
      </p>
      <p className="mt-1 font-semibold">{title}</p>
      <p className="mt-1 text-sm opacity-90">{message}</p>
    </div>
  );
}

export function FormattedDate({ date }: { date: string }) {
  const parsed = new Date(date);
  return (
    <time dateTime={date} title={format(parsed, "PPpp")}>
      {formatDistanceToNow(parsed, { addSuffix: true })}
    </time>
  );
}
