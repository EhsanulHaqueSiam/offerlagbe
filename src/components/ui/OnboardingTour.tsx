import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

const STORAGE_KEY = "offerlagbe_onboarded";

interface Step {
  target: string;
  textKey: "tour.step1" | "tour.step2" | "tour.step3";
}

const STEPS: Step[] = [
  { target: '[data-tour="location"]', textKey: "tour.step1" },
  { target: '[data-tour="sidebar"]', textKey: "tour.step2" },
  { target: '[data-tour="sidebar"]', textKey: "tour.step3" },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const calculatePosition = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step) return;
    const el = document.querySelector(step.target);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [currentStep]);

  useEffect(() => {
    if (dismissed) return;
    calculatePosition();

    const handleResize = () => calculatePosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, { capture: true } as EventListenerOptions);
    };
  }, [dismissed, calculatePosition]);

  const complete = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep >= STEPS.length - 1) {
      complete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, complete]);

  if (dismissed) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  // Spotlight positioning
  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 50,
        boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7)`,
        pointerEvents: "none",
      }
    : {
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0, 0, 0, 0.7)",
        pointerEvents: "none",
      };

  // Tooltip position: try below the target, fall back to above
  const tooltipStyle: React.CSSProperties = targetRect
    ? {
        position: "fixed",
        top: targetRect.top + targetRect.height + 12,
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 288)),
        zIndex: 51,
        maxWidth: 272,
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 51,
        maxWidth: 272,
      };

  // Cutout element placed over the target to create the spotlight hole
  const cutoutStyle: React.CSSProperties = targetRect
    ? {
        position: "fixed",
        top: targetRect.top - 4,
        left: targetRect.left - 4,
        width: targetRect.width + 8,
        height: targetRect.height + 8,
        borderRadius: 12,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
        zIndex: 50,
        pointerEvents: "none",
      }
    : undefined;

  return (
    <>
      {/* Overlay with spotlight cutout */}
      {targetRect ? <div style={cutoutStyle} /> : <div style={spotlightStyle} />}

      {/* Click blocker */}
      <div className="fixed inset-0 z-50" onClick={(e) => e.stopPropagation()} />

      {/* Tooltip card */}
      <div style={tooltipStyle} className="animate-fade-in-up">
        <div className="glass rounded-2xl p-4 shadow-2xl border border-slate-700/30">
          <p className="text-sm text-slate-200 leading-relaxed mb-4">{t(step.textKey)}</p>

          <div className="flex items-center justify-between">
            {/* Step indicators */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentStep ? "bg-indigo-400" : "bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={complete}
                className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors px-2 py-1"
              >
                {t("tour.skip")}
              </button>
              <button
                onClick={handleNext}
                className="text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-400 px-3.5 py-1.5 rounded-lg transition-colors active:scale-95"
              >
                {isLastStep ? t("tour.done") : t("tour.next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
