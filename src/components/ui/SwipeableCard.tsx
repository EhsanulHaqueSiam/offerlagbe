import { type ReactNode, useCallback, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
}

const THRESHOLD = 60;

export function SwipeableCard({ children, onSwipeRight, onSwipeLeft }: SwipeableCardProps) {
  const { t } = useTranslation();
  const [offsetX, setOffsetX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const isScrolling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    isScrolling.current = false;
    setIsAnimating(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Determine gesture direction on first significant movement
    if (!isSwiping.current && !isScrolling.current) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isScrolling.current = true;
        return;
      }
      if (Math.abs(deltaX) > 8) {
        isSwiping.current = true;
      }
      return;
    }

    if (isScrolling.current) return;

    // Apply dampening at edges
    const dampened = deltaX * 0.6;
    setOffsetX(dampened);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) {
      setOffsetX(0);
      return;
    }

    isSwiping.current = false;
    setIsAnimating(true);

    if (offsetX > THRESHOLD && onSwipeRight) {
      onSwipeRight();
    } else if (offsetX < -THRESHOLD && onSwipeLeft) {
      onSwipeLeft();
    }

    // Spring back
    setOffsetX(0);
  }, [offsetX, onSwipeRight, onSwipeLeft]);

  const absOffset = Math.abs(offsetX);
  const revealOpacity = Math.min(absOffset / THRESHOLD, 1);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Right swipe background — Save */}
      <div
        className="absolute inset-0 flex items-center pl-4 bg-emerald-600/90 rounded-2xl transition-opacity"
        style={{ opacity: offsetX > 0 ? revealOpacity : 0 }}
      >
        <div className="flex items-center gap-2 text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm font-semibold">{t("swipe.save")}</span>
        </div>
      </div>

      {/* Left swipe background — Dismiss */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-4 bg-red-600/90 rounded-2xl transition-opacity"
        style={{ opacity: offsetX < 0 ? revealOpacity : 0 }}
      >
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm font-semibold">{t("swipe.dismiss")}</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      {/* Foreground card content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isAnimating ? "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
