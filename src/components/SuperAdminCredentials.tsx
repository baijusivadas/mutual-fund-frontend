import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const SuperAdminCredentials = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>SuperAdmin Credentials</CardTitle>
        </div>
        <CardDescription>
          Use these credentials to login with full administrative access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Email</p>
              <p className="text-sm font-mono font-semibold">admin@test.com</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard("admin@test.com", "Email")}
            >
              {copied === "Email" ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Password</p>
              <p className="text-sm font-mono font-semibold">••••••••</p>
              <p className="text-xs text-muted-foreground mt-1">
                (Use the password you set during account creation)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Role</p>
              <Badge variant="default" className="mt-1">
                <Shield className="h-3 w-3 mr-1" />
                superAdmin
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-muted">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> This account has full administrative privileges including:
            access to all modules, user management, property management, and system settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};