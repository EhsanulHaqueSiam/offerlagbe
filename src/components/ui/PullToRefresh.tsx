import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => void;
}

const THRESHOLD = 60;
const SPINNER_DURATION = 1000;

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const spinnerTimerId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    return () => {
      if (spinnerTimerId.current) clearTimeout(spinnerTimerId.current);
    };
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return;
      const container = containerRef.current;
      if (!container || container.scrollTop !== 0) return;

      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    },
    [isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Cancel if scrolling up
      if (deltaY < 0) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      // Apply resistance: pull distance is dampened
      const resistedDistance = Math.min(deltaY * 0.4, THRESHOLD * 2);
      setPullDistance(resistedDistance);
    },
    [isRefreshing],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD);
      onRefresh?.();

      // Visual-only spinner since Convex is real-time
      spinnerTimerId.current = setTimeout(() => {
        spinnerTimerId.current = null;
        setIsRefreshing(false);
        setPullDistance(0);
      }, SPINNER_DURATION);
    } else {
      // Spring back
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  if (!isTouchDevice) {
    return <>{children}</>;
  }

  const isPastThreshold = pullDistance >= THRESHOLD;
  const rotation = Math.min((pullDistance / THRESHOLD) * 180, 180);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative h-full overflow-y-auto"
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-opacity"
        style={{
          height: pullDistance,
          opacity: pullDistance > 10 ? 1 : 0,
          transition: isPulling.current ? "none" : "height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s",
        }}
      >
        {isRefreshing ? (
          <svg className="w-5 h-5 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg
            className={`w-5 h-5 transition-colors ${isPastThreshold ? "text-indigo-400" : "text-slate-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isPulling.current ? "none" : "transform 0.3s ease",
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
      </div>

      {/* Content shifted down during pull */}
      <div
        style={{
          transform: `translateY(0px)`,
          transition: isPulling.current ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
