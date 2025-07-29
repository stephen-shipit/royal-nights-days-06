import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: string;
  gallery_type: string;
}

interface EnhancedGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryItem[];
  initialIndex: number;
}

export const EnhancedGalleryModal: React.FC<EnhancedGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update current index when initial index changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, goToNext, goToPrevious, onClose]);

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-[95vw] max-h-[95vh] p-0 bg-black border-0 overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 md:top-4 right-2 md:right-4 z-50 text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10 p-0"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10 p-0"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
          </>
        )}

        <div className="flex flex-col h-full overflow-hidden">
          {/* Main image */}
          <div className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden min-h-0">
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              onError={(e) => {
                console.log('Image failed to load:', currentImage.src);
                (e.target as HTMLImageElement).src = '/api/placeholder/800/600';
              }}
            />
          </div>

          {/* Image info */}
          <div className="bg-white p-3 md:p-4 border-t flex-shrink-0 max-h-[30vh] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 truncate">
                {currentImage.alt}
              </h3>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{currentImage.category}</Badge>
                <Badge variant="secondary">{currentImage.gallery_type}</Badge>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">
                  {currentIndex + 1} of {images.length} images
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentIndex
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};