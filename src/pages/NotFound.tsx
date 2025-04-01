
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">404</h1>
        <p className="text-xl md:text-2xl mb-8">Page not found</p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
