
import { Clock, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

interface ErrorStateProps {
  error: string;
}

export const LoadingState = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
        <h1 className="text-2xl font-bold">Loading orders...</h1>
      </div>
    </Layout>
  );
};

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h1 className="text-2xl font-bold text-destructive mb-4">{error}</h1>
        <Button asChild>
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </Layout>
  );
};

export const AccessDeniedState = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page
        </p>
        <Button asChild>
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </Layout>
  );
};
