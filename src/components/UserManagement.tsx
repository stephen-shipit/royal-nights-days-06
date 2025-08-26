import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, RotateCcw } from "lucide-react";

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  metadata: any;
}

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showTempPassword, setShowTempPassword] = useState<string | null>(null);

  // Fetch admin users
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdminUser[];
    },
  });

  // Create admin user mutation
  const createUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data, error } = await supabase.rpc('create_admin_user', {
        p_email: email,
        p_role: role
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      
      // Send welcome email with temporary password
      try {
        const result = data as { user_id: string; temp_password: string };
        const { error: emailError } = await supabase.functions.invoke('send-admin-welcome-email', {
          body: {
            email: variables.email,
            tempPassword: result.temp_password,
            role: variables.role
          }
        });
        
        if (emailError) {
          console.error('Failed to send welcome email:', emailError);
          toast({ 
            title: "User created but email failed", 
            description: "User was created successfully, but we couldn't send the welcome email. Please share their credentials manually.", 
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Admin user created and welcomed!", 
            description: "User account created and welcome email sent with login credentials." 
          });
        }
      } catch (error) {
        console.error('Error sending welcome email:', error);
        toast({ 
          title: "User created but email failed", 
          description: "User was created successfully, but we couldn't send the welcome email.", 
          variant: "destructive" 
        });
      }
      
      setIsAddingUser(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.rpc('update_admin_user_role', {
        p_user_id: userId,
        p_role: role
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User role updated successfully!" });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('delete_admin_user', {
        p_user_id: userId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('reset_admin_password', {
        p_user_id: userId
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (tempPassword, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowTempPassword(tempPassword);
      toast({ title: "Password reset successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error resetting password", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    
    createUserMutation.mutate({ email, role });
  };

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string;
    
    updateUserRoleMutation.mutate({ userId: editingUser.user_id, role });
  };

  const handleDeleteUser = (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete admin access for ${user.email}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.user_id);
    }
  };

  const handleResetPassword = (user: AdminUser) => {
    if (confirm(`Generate a new temporary password for ${user.email}?`)) {
      resetPasswordMutation.mutate(user.user_id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage admin users and their access levels</p>
        </div>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Admin User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="admin_user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_user">Admin User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users ({adminUsers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.metadata?.has_temp_password ? "destructive" : "default"}>
                      {user.metadata?.has_temp_password ? "Temp Password" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(user.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User Role</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                              <Label>Email</Label>
                              <Input value={user.email} disabled />
                            </div>
                            <div>
                              <Label htmlFor="role">Role</Label>
                              <Select name="role" defaultValue={user.role}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin_user">Admin User</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button type="submit" disabled={updateUserRoleMutation.isPending}>
                                {updateUserRoleMutation.isPending ? "Updating..." : "Update Role"}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetPassword(user)}
                        disabled={resetPasswordMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deleteUserMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!adminUsers?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No admin users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Temporary Password Display Dialog */}
      <Dialog open={!!showTempPassword} onOpenChange={() => setShowTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary Password Generated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A temporary password has been generated. Please share this with the user securely:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono">{showTempPassword}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(showTempPassword!);
                    toast({ title: "Password copied to clipboard" });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The user will be prompted to change this password on their first login.
            </p>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;