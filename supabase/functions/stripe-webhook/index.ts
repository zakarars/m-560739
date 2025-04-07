
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;

        if (orderId) {
          // Update order status in database
          const { error } = await supabaseClient
            .from("orders")
            .update({
              status: "processing",
              payment_received: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          if (error) {
            console.error("Error updating order status:", error);
            throw new Error(`Failed to update order: ${error.message}`);
          }

          console.log(`Order ${orderId} updated to processing status`);
        }
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        const failedOrderId = failedPaymentIntent.metadata.orderId;

        if (failedOrderId) {
          // Update the order to indicate payment failure
          await supabaseClient
            .from("orders")
            .update({
              payment_received: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", failedOrderId);
        }
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${error.message}` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
