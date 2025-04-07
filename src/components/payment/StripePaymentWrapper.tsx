
import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { PaymentForm } from './PaymentForm';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Stripe publishable key - this is safe to expose in the frontend code
const stripePromise = loadStripe("pk_test_REPLACE_WITH_YOUR_KEY");

interface StripePaymentWrapperProps {
  orderId: string;
  orderTotal: number;
}

export const StripePaymentWrapper = ({ orderId, orderTotal }: StripePaymentWrapperProps) => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("You must be logged in to make a payment");
          return;
        }
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            orderId,
            amount: orderTotal,
          }),
        });
        
        const { clientSecret, error } = await response.json();
        
        if (error) {
          throw new Error(error);
        }
        
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast.error('Failed to initialize payment', {
          description: error.message || 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId && orderTotal > 0) {
      fetchPaymentIntent();
    }
  }, [orderId, orderTotal]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0F172A',
      },
    },
  };

  if (isLoading || !clientSecret) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm orderId={orderId} orderTotal={orderTotal} />
        </Elements>
      </CardContent>
    </Card>
  );
};
