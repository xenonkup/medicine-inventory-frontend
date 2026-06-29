import { motion } from "framer-motion";
import {
  FileQuestion,
  PackageX,
  Inbox,
  AlertTriangle,
  SearchX,
} from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyVariant = "no-data" | "no-results" | "no-items" | "error" | "warning";

interface EmptyStateProps {
  title: string;
  description?: string;
  variant?: EmptyVariant;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const variantIcons: Record<EmptyVariant, React.ReactNode> = {
  "no-data": <Inbox className="h-10 w-10" />,
  "no-results": <SearchX className="h-10 w-10" />,
  "no-items": <PackageX className="h-10 w-10" />,
  error: <AlertTriangle className="h-10 w-10" />,
  warning: <FileQuestion className="h-10 w-10" />,
};

export function EmptyState({
  title,
  description,
  variant = "no-data",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-2xl bg-muted/50 p-4 text-muted-foreground/60">
        {icon ?? variantIcons[variant]}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
