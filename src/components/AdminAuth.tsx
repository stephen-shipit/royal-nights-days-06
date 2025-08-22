import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

export function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin
          setTimeout(async () => {
            const { data: isAdmin } = await supabase
              .rpc('is_admin', { user_id: session.user.id });
            
            if (isAdmin) {
              // Check if user has temporary password using database function
              const { data: hasTempPassword } = await supabase
                .rpc('has_temporary_password', { user_id: session.user.id });
              
              if (hasTempPassword) {
                setShowPasswordChange(true);
              } else {
                onAuthSuccess();
              }
            } else {
              toast({
                title: "Access Denied",
                description: "You don't have admin permissions.",
                variant: "destructive",
              });
              await supabase.auth.signOut();
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordChangeLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Password Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Mark password as changed in database
        const { error: markError } = await supabase.rpc('mark_password_changed', { 
          user_id: user?.id 
        });
        
        if (markError) {
          console.error('Failed to mark password as changed:', markError);
        }
        
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
        });
        setShowPasswordChange(false);
        onAuthSuccess();
      }
    } catch (error) {
      toast({
        title: "Password Update Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Your Password</DialogTitle>
            <DialogDescription>
              You're using a temporary password. Please set a new secure password to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={passwordChangeLoading}
            >
              {passwordChangeLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}