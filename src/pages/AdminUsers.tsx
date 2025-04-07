import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Edit, MoreHorizontal, Search, UserCog, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  role: string | null;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Function to fetch users
  const fetchUsers = async () => {
    let query = supabase
      .from("profiles")
      .select("*, user:id(email)")
      .order("created_at", { ascending: false });

    // Apply search if present
    if (searchQuery) {
      query = query.or(`user.email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error(error.message);
    }

    // Transform the data to match our User interface
    const users: User[] = data.map(profile => ({
      id: profile.id,
      email: profile.user?.email || 'No email provided',
      created_at: profile.created_at,
      full_name: profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}` 
        : profile.first_name || profile.last_name || null,
      role: 'User' // Default role
    }));

    return users;
  };

  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["adminUsers", searchQuery],
    queryFn: fetchUsers
  });

  // Function to handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive mx-auto my-8 max-w-2xl">
          <h2 className="text-lg font-semibold">Error Loading Users</h2>
          <p>{error instanceof Error ? error.message : "Unknown error occurred"}</p>
          <Button 
            variant="outline"
            className="mt-2"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Users</h1>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by email or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[240px]"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {users && users.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'No name provided'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {user.role || 'User'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/users/${user.id}`}>
                              <UserCog className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/users/${user.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md bg-background">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
