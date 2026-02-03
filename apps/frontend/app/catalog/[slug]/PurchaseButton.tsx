'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PurchaseButtonProps {
  assetId: string;
  assetTitle: string;
}

export function PurchaseButton({ assetId, assetTitle }: PurchaseButtonProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/api/auth/login';
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/backend/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetIds: [assetId] }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create order');
      }

      // Redirect to Stripe Checkout
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handlePurchase}
      disabled={isLoading || isUserLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {user ? 'Buy Now' : 'Sign in to Purchase'}
        </>
      )}
    </Button>
  );
}
