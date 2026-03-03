import { useTranslation } from "@/lib/i18n";

interface BackToMapFABProps {
  onClick: () => void;
}

export function BackToMapFAB({ onClick }: BackToMapFABProps) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-35 md:hidden glass rounded-full w-12 h-12 flex items-center justify-center shadow-xl hover:bg-glass-hover active:scale-95 transition-all animate-fade-in"
      aria-label={t("fab.backToMap")}
    >
      <svg
        className="w-[18px] h-[18px] text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
}
