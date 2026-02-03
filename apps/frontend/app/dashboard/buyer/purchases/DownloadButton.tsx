'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DownloadButtonProps {
  assetId: string;
  fileName: string;
}

export function DownloadButton({ assetId, fileName }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/backend/downloads/${assetId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to get download link');
      }

      // Open the presigned URL in a new tab to trigger download
      if (data.data?.url) {
        window.open(data.data.url, '_blank');
        toast({
          title: 'Download started',
          description: `Downloading ${fileName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Download className="h-4 w-4 mr-1" />
          Download
        </>
      )}
    </Button>
  );
}
