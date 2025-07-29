import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BulkImageUploadProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface ImageUploadItem {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  altText: string;
  category: string;
  galleryType: string;
}

export const BulkImageUpload: React.FC<BulkImageUploadProps> = ({
  onComplete,
  onCancel
}) => {
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [globalCategory, setGlobalCategory] = useState('');
  const [globalGalleryType, setGlobalGalleryType] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      altText: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      category: globalCategory,
      galleryType: globalGalleryType
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, [globalCategory, globalGalleryType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: uploading
  });

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const updateImageField = (index: number, field: keyof ImageUploadItem, value: string) => {
    setImages((prev) => 
      prev.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    );
  };

  const applyGlobalSettings = () => {
    if (!globalCategory || !globalGalleryType) {
      toast.error('Please set global category and gallery type first');
      return;
    }

    setImages((prev) => 
      prev.map((img) => ({
        ...img,
        category: globalCategory,
        galleryType: globalGalleryType
      }))
    );
    toast.success('Applied global settings to all images');
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      toast.error('Please add some images first');
      return;
    }

    // Validate all images have required fields
    const invalidImages = images.filter(img => !img.altText || !img.category || !img.galleryType);
    if (invalidImages.length > 0) {
      toast.error(`${invalidImages.length} images are missing required fields (alt text, category, or gallery type)`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Update status to uploading
      setImages((prev) => 
        prev.map((img, index) => 
          index === i ? { ...img, status: 'uploading' } : img
        )
      );

      try {
        // Upload to Supabase Storage
        const fileExt = image.file.name.split('.').pop();
        const fileName = `bulk-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('admin-uploads')
          .upload(filePath, image.file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('admin-uploads')
          .getPublicUrl(filePath);

        // Insert into gallery_items table
        const { error: dbError } = await supabase
          .from('gallery_items')
          .insert([{
            src: data.publicUrl,
            alt: image.altText,
            category: image.category,
            gallery_type: image.galleryType
          }]);

        if (dbError) throw dbError;

        // Update status to success
        setImages((prev) => 
          prev.map((img, index) => 
            index === i ? { ...img, status: 'success' } : img
          )
        );

      } catch (error) {
        console.error('Error uploading image:', error);
        setImages((prev) => 
          prev.map((img, index) => 
            index === i ? { 
              ...img, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            } : img
          )
        );
      }

      // Update progress
      setUploadProgress(((i + 1) / images.length) * 100);
    }

    setUploading(false);
    
    const successCount = images.filter(img => img.status === 'success').length;
    const errorCount = images.filter(img => img.status === 'error').length;
    
    if (errorCount === 0) {
      toast.success(`Successfully uploaded ${successCount} images!`);
      onComplete();
    } else {
      toast.error(`Uploaded ${successCount} images, ${errorCount} failed`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="globalCategory">Global Category</Label>
          <Select value={globalCategory} onValueChange={setGlobalCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select default category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atmosphere">Atmosphere</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="interior">Interior</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="globalGalleryType">Global Gallery Type</Label>
          <Select value={globalGalleryType} onValueChange={setGlobalGalleryType}>
            <SelectTrigger>
              <SelectValue placeholder="Select default gallery type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main Gallery</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="atmosphere">Atmosphere</SelectItem>
              <SelectItem value="archive">Archive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={applyGlobalSettings}
          disabled={!globalCategory || !globalGalleryType}
        >
          Apply to All Images
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </h3>
            <p className="text-muted-foreground">
              or click to select multiple images
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports JPEG, PNG, WebP
            </p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Images to Upload ({images.length})</h3>
            {uploading && (
              <div className="flex items-center gap-2">
                <Progress value={uploadProgress} className="w-32" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {images.map((image, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-3">
                <div className="relative">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {image.status === 'success' && (
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    {image.status === 'error' && (
                      <div className="bg-red-500 text-white rounded-full p-1">
                        <AlertCircle className="h-3 w-3" />
                      </div>
                    )}
                    {image.status === 'uploading' && (
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                      </div>
                    )}
                    {!uploading && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Input
                    placeholder="Alt text"
                    value={image.altText}
                    onChange={(e) => updateImageField(index, 'altText', e.target.value)}
                    disabled={uploading}
                    className="text-xs"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Select 
                      value={image.category} 
                      onValueChange={(value) => updateImageField(index, 'category', value)}
                      disabled={uploading}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="atmosphere">Atmosphere</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="interior">Interior</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={image.galleryType} 
                      onValueChange={(value) => updateImageField(index, 'galleryType', value)}
                      disabled={uploading}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="atmosphere">Atmosphere</SelectItem>
                        <SelectItem value="archive">Archive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {image.error && (
                    <p className="text-xs text-red-500">{image.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
              Cancel
            </Button>
            <Button type="button" onClick={uploadImages} disabled={uploading || images.length === 0}>
              {uploading ? 'Uploading...' : `Upload ${images.length} Images`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};