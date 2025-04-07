
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, User } from "lucide-react";

interface UserFormData {
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

const AdminUserEdit = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UserFormData>({
    first_name: "",
    last_name: "",
    is_admin: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (profileError) throw profileError;
        
        // Get auth user data to get email and metadata
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId || "");
        
        if (authError) throw authError;
        
        const isAdmin = authUser?.user?.user_metadata?.role === 'admin';
        
        setFormData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          is_admin: isAdmin
        });
        
        setUserEmail(authUser?.user?.email || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_admin: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name
        })
        .eq("id", userId);
      
      if (profileError) throw profileError;
      
      // Update auth user metadata (admin status)
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        userId || "",
        {
          user_metadata: { role: formData.is_admin ? 'admin' : 'user' }
        }
      );
      
      if (metadataError) throw metadataError;
      
      toast.success("User updated successfully");
      navigate(`/admin/users/${userId}`);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link to={`/admin/users/${userId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Update user details and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={userEmail}
                  disabled
                  className="bg-secondary/40"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="admin_status">Admin Privileges</Label>
                  <p className="text-sm text-muted-foreground">
                    Grant this user admin access to the dashboard
                  </p>
                </div>
                <Switch
                  id="admin_status"
                  checked={formData.is_admin}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link to={`/admin/users/${userId}`}>
                  Cancel
                </Link>
              </Button>
              <Button 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUserEdit;
