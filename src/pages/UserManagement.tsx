import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, User as UserIcon, Trash2, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { userQueryConfig } from "../hooks/useQueryConfig";
import { PaginationControls } from "../components/PaginationControls";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'superAdmin' | 'user';
  created_at: string;
}

const UserManagement = () => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const fetchUsers = async (): Promise<UserWithRole[]> => {
    // Fetch all profiles with their roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch roles for each user
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) throw rolesError;

    // Combine data
    const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.id);
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: userRole?.role || 'user',
        created_at: profile.created_at || '',
      };
    });

    return usersWithRoles;
  };

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    ...userQueryConfig,
  });

  const logAuditAction = async (targetUserId: string, action: string, oldValue?: string, newValue?: string) => {
    try {
      await supabase.from('audit_logs').insert({
        performed_by: currentUser?.id,
        target_user_id: targetUserId,
        action,
        old_value: oldValue,
        new_value: newValue,
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  };

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'superAdmin' | 'user' }) => {
      const oldRole = users.find(u => u.id === userId)?.role;
      
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      await logAuditAction(userId, 'role_change', oldRole, newRole);
      return { userId, newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setUpdating(null),
  });

  const handleRoleChange = (userId: string, newRole: 'superAdmin' | 'user') => {
    setUpdating(userId);
    updateRoleMutation.mutate({ userId, newRole });
  };

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, userEmail }: { userId: string; userEmail: string }) => {
      const { error } = await supabase.rpc('delete_user' as any, { _user_id: userId });
      if (error) throw error;
      
      await logAuditAction(userId, 'user_deleted', userEmail, null);
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setDeleting(null),
  });

  const handleDeleteUser = (userId: string, userEmail: string) => {
    setDeleting(userId);
    deleteUserMutation.mutate({ userId, userEmail });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">User Management</CardTitle>
          <CardDescription>
            Manage user accounts and assign roles. Users can sign up via the login page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="superAdmin">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {searchQuery || roleFilter !== "all" ? "No users match your filters" : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.role === 'superAdmin' ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          {user.full_name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'superAdmin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value as 'superAdmin' | 'user')}
                            disabled={updating === user.id || deleting === user.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="superAdmin">SuperAdmin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                disabled={updating === user.id || deleting === user.id}
                              >
                                {deleting === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the user <strong>{user.email}</strong> and all their associated data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredUsers.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> New users can register via the login page. Once registered, 
              you can assign them the appropriate role here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;