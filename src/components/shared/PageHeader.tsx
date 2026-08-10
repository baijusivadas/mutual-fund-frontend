import { ReactNode } from "react";
import { Breadcrumbs } from "../layout/Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
}

export const PageHeader = ({
  title,
  description,
  actions,
  className,
  showBreadcrumbs = true,
}: PageHeaderProps) => {
  return (
    <div className={cn("space-y-4 mb-6", className)}>
      {showBreadcrumbs && <Breadcrumbs />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl font-normal leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
