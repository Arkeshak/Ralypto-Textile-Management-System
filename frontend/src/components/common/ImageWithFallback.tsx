import React, { useState } from 'react';
import { Shirt, Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackIcon?: 'shirt' | 'image';
  className?: string;
  aspectRatioClass?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackIcon = 'shirt',
  className = '',
  aspectRatioClass = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showFallback = !src || hasError;

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${aspectRatioClass} ${className}`}>
      {!showFallback ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-neutral-200/70 animate-pulse flex items-center justify-center">
              <Shirt className="w-5 h-5 text-neutral-400 opacity-40 animate-pulse" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            {...props}
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400 p-3 select-none">
          {fallbackIcon === 'shirt' ? (
            <Shirt className="w-6 h-6 stroke-[1.5] text-neutral-400 mb-1" />
          ) : (
            <ImageIcon className="w-6 h-6 stroke-[1.5] text-neutral-400 mb-1" />
          )}
          <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[90%] text-center">
            {alt || 'Garment'}
          </span>
        </div>
      )}
    </div>
  );
};
