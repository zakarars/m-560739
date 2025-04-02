
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";

const AuthError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorCode, setErrorCode] = useState<string>("");
  
  useEffect(() => {
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    const errorDescription = searchParams.get("error_description");
    
    setErrorCode(errorCode || "");
    setErrorMessage(errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, " ")) : error || "An authentication error occurred");
  }, [searchParams]);

  const handleResendEmail = async () => {
    const email = localStorage.getItem("pendingVerificationEmail");
    if (!email) {
      setErrorMessage("No email found to resend verification. Please try signing up again.");
      return;
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      
      if (error) throw error;
      
      setErrorMessage("Verification email resent. Please check your inbox.");
    } catch (error) {
      console.error("Error resending verification email:", error);
      setErrorMessage("Failed to resend verification email. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-16">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          {errorCode === "otp_expired" && (
            <Button onClick={handleResendEmail} className="w-full">
              Resend Verification Email
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => navigate("/auth")}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AuthError;
