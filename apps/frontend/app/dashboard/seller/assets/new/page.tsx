'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';

const categories = [
  { value: 'TEMPLATES', label: 'Templates' },
  { value: 'GRAPHICS', label: 'Graphics' },
  { value: 'UI_KITS', label: 'UI Kits' },
  { value: 'ICONS', label: 'Icons' },
  { value: 'FONTS', label: 'Fonts' },
  { value: 'CODE_SNIPPETS', label: 'Code Snippets' },
  { value: 'THEMES', label: 'Themes' },
  { value: 'PLUGINS', label: 'Plugins' },
  { value: 'OTHER', label: 'Other' },
];

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  longDescription: z.string().max(10000).optional(),
  price: z.number().min(0).max(10000),
  category: z.string(),
  tags: z.string().optional(),
  version: z.string().default('1.0.0'),
  compatibility: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewAssetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: '1.0.0',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!sourceFile) {
      toast({
        title: 'Error',
        description: 'Please upload a source file',
        variant: 'destructive',
      });
      return;
    }

    if (!thumbnailFile) {
      toast({
        title: 'Error',
        description: 'Please upload a thumbnail',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.longDescription) formData.append('longDescription', data.longDescription);
      formData.append('price', data.price.toString());
      formData.append('category', data.category);
      if (data.tags) formData.append('tags', data.tags);
      formData.append('version', data.version);
      if (data.compatibility) formData.append('compatibility', data.compatibility);
      formData.append('sourceFile', sourceFile);
      formData.append('thumbnail', thumbnailFile);
      previewFiles.forEach((file) => formData.append('previews', file));

      const res = await fetch('/api/backend/assets', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || 'Failed to create asset');
      }

      toast({
        title: 'Success',
        description: 'Asset created successfully!',
      });

      router.push('/dashboard/seller/assets');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload New Asset</h1>
        <p className="text-muted-foreground">
          Fill in the details to list your digital asset for sale
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input {...register('title')} placeholder="My Awesome Template" />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Short Description *</label>
              <textarea
                {...register('description')}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                placeholder="A brief description of your asset..."
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Long Description</label>
              <textarea
                {...register('longDescription')}
                className="w-full min-h-[150px] px-3 py-2 border rounded-md text-sm"
                placeholder="Detailed description with features, usage instructions..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price (EUR) *</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="29.99"
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Category *</label>
                <select
                  {...register('category')}
                  className="w-full h-10 px-3 border rounded-md text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input
                {...register('tags')}
                placeholder="react, nextjs, dashboard"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Version</label>
                <Input {...register('version')} placeholder="1.0.0" />
              </div>

              <div>
                <label className="text-sm font-medium">Compatibility (comma separated)</label>
                <Input
                  {...register('compatibility')}
                  placeholder="Figma, Sketch, Adobe XD"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Source File */}
            <div>
              <label className="text-sm font-medium">Source File * (ZIP, RAR)</label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                {sourceFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <Badge>{sourceFile.name}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSourceFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload source file
                    </p>
                    <input
                      type="file"
                      accept=".zip,.rar,.7z"
                      className="hidden"
                      onChange={(e) => setSourceFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-sm font-medium">Thumbnail * (JPG, PNG)</label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                {thumbnailFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <Badge>{thumbnailFile.name}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setThumbnailFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload thumbnail
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Preview Images */}
            <div>
              <label className="text-sm font-medium">Preview Images (up to 10)</label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                {previewFiles.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {previewFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Badge variant="outline">{file.name}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPreviewFiles(previewFiles.filter((_, i) => i !== index))
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {previewFiles.length < 10 && (
                      <label className="cursor-pointer">
                        <Badge variant="secondary" className="cursor-pointer">
                          + Add more
                        </Badge>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setPreviewFiles([...previewFiles, ...files].slice(0, 10));
                          }}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload preview images
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setPreviewFiles(files.slice(0, 10));
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Asset'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
