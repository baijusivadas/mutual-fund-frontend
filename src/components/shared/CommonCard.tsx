import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CommonCardProps {
  title?: string;
  icon?: React.ElementType;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  noHeader?: boolean;
}

export const CommonCard = ({
  title,
  icon: Icon,
  description,
  children,
  headerAction,
  className,
  headerClassName,
  titleClassName,
  contentClassName,
  noHeader = false,
}: CommonCardProps) => {
  return (
    <Card
      className={cn(
        "bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden",
        className
      )}
    >
      {!noHeader && (title || description || headerAction) && (
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between gap-4 p-5 pb-3 border-b border-border/50",
            headerClassName
          )}
        >
          <div className="space-y-0.5 min-w-0">
            {title && (
              <CardTitle
                className={cn(
                  "text-base font-heading font-bold tracking-tight flex items-center gap-2 text-foreground",
                  titleClassName
                )}
              >
                {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
                <span className="truncate">{title}</span>
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-xs text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-5", !noHeader && "pt-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};
