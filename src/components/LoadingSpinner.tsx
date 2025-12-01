import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export const LoadingSpinner = ({ fullScreen = false, size = "md" }: LoadingSpinnerProps) => {
  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      </div>
    );
  }

  return <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />;
};

export default LoadingSpinner;