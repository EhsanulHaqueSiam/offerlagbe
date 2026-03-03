import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { SubmitOfferForm } from "@/components/offers/SubmitOfferForm";
import { useTranslation } from "@/lib/i18n";

export const Route = createLazyFileRoute("/submit")({
  component: SubmitPage,
});

function SubmitPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-950 overflow-y-auto">
      <div className="glass-strong sticky top-0 z-50 border-b border-slate-700/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold text-white">{t("submit.title")}</h1>
        </div>
      </div>
      <SubmitOfferForm />
    </div>
  );
}
