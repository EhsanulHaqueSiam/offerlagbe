import { useCallback, useEffect, useRef, useState } from "react";

interface ImageCarouselProps {
  images: string[];
  onImageClick: (index: number) => void;
}

export function ImageCarousel({ images, onImageClick }: ImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: index * width, behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (width === 0) return;
    setCurrentIndex(Math.round(el.scrollLeft / width));
  }, []);

  const goNext = useCallback(() => {
    const next = Math.min(currentIndex + 1, images.length - 1);
    scrollToIndex(next);
  }, [currentIndex, images.length, scrollToIndex]);

  const goPrev = useCallback(() => {
    const prev = Math.max(currentIndex - 1, 0);
    scrollToIndex(prev);
  }, [currentIndex, scrollToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  if (images.length === 0) return null;

  return (
    <div className="relative -mx-4 sm:-mx-6 mb-4">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const delta = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(delta) > 50) {
            if (delta > 0) goNext();
            else goPrev();
          }
        }}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((url, i) => (
          <button key={i} onClick={() => onImageClick(i)} className="flex-shrink-0 w-full snap-start">
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="w-full h-48 sm:h-64 object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </button>
        ))}
      </div>

      {/* Arrow buttons */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
