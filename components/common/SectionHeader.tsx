import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionText?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionHref,
  actionText = "Xem tất cả",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {actionHref && (
        <Link
          href={actionHref}
          className="group flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors shrink-0"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

