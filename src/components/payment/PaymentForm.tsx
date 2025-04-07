
import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  orderId: string;
  orderTotal: number;
}

export const PaymentForm = ({ orderId, orderTotal }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
      },
    });
    
    setIsLoading(false);
    
    if (error) {
      // This point will only be reached if there is a payment error
      setErrorMessage(error.message || 'An unexpected error occurred.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-destructive mt-4 text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="mt-6">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <>Pay ${orderTotal.toFixed(2)}</>
          )}
        </Button>
      </div>
    </form>
  );
};
