import React, { useEffect, useState } from 'react';

const BACKGROUND_MAP: Record<string, string> = {
  default: '/assets/vrishti/themes/default.webp',
  general: '/assets/vrishti/themes/default.webp',
  construction: '/assets/vrishti/themes/construction-rain.webp',
  agriculture: '/assets/vrishti/themes/agriculture-rain.webp',
  landslide: '/assets/vrishti/themes/hill-safety.webp',
  hill: '/assets/vrishti/themes/hill-safety.webp',
  urban_flood: '/assets/vrishti/themes/city-rain.webp',
  city: '/assets/vrishti/themes/city-rain.webp',
  transport: '/assets/vrishti/themes/highway-rain.webp',
  highway: '/assets/vrishti/themes/highway-rain.webp',
};

interface Props {
  sectorId?: string | null;
}

export const DynamicThemeBackground: React.FC<Props> = ({ sectorId }) => {
  const key = (sectorId || 'default').toLowerCase();
  const targetImage = BACKGROUND_MAP[key] || BACKGROUND_MAP.default;

  const [currentImage, setCurrentImage] = useState<string>(targetImage);
  const [prevImage, setPrevImage] = useState<string>(targetImage);
  const [isCrossFading, setIsCrossFading] = useState<boolean>(false);

  useEffect(() => {
    if (targetImage !== currentImage) {
      setPrevImage(currentImage);
      
      // Test image loading before applying, fallback to default.webp if load error
      const img = new Image();
      img.src = targetImage;
      img.onload = () => {
        setCurrentImage(targetImage);
      };
      img.onerror = () => {
        console.warn(`[VRISHTI Theme Fallback] Image ${targetImage} failed to load. Falling back to default.webp`);
        setCurrentImage('/assets/vrishti/themes/default.webp');
      };

      setIsCrossFading(true);
      const timer = setTimeout(() => {
        setIsCrossFading(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [targetImage]);

  return (
    <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-0">
      {/* 1. Previous photograph layer for smooth cross-fade */}
      {prevImage && isCrossFading && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-0"
          style={{ backgroundImage: `url("${prevImage}")` }}
        />
      )}

      {/* 2. Active Photograph Layer */}
      {currentImage && (
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
            isCrossFading ? 'opacity-90 animate-fade-in' : 'opacity-100'
          }`}
          style={{ backgroundImage: `url("${currentImage}")` }}
        />
      )}

      {/* 3. Subtle Dark Overlay for Text Contrast (NO blur, NO SVG rain streaks) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(5,12,28,0.25) 0%, rgba(5,12,28,0.40) 100%)'
        }}
      />
    </div>
  );
};
