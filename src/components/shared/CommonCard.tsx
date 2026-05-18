import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CommonCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  noHeader?: boolean;
}

export const CommonCard = ({
  title,
  description,
  children,
  headerAction,
  className,
  headerClassName,
  contentClassName,
  noHeader = false,
}: CommonCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {!noHeader && (title || description || headerAction) && (
        <CardHeader className={cn("flex flex-row items-center justify-between gap-4", headerClassName)}>
          <div className="space-y-1">
            {title && <CardTitle className="text-xl font-bold">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-6 pt-0", noHeader && "pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};
