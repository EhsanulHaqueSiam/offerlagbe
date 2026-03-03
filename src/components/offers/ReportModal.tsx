import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getVisitorId } from "@/lib/visitor";
import { toast } from "@/lib/toast";
import { useTranslation } from "@/lib/i18n";
import type { Id } from "../../../convex/_generated/dataModel";

type ReportReason = "spam" | "fake" | "expired" | "inappropriate";

interface ReportModalProps {
  offerId: Id<"offers">;
  onClose: () => void;
}

const REASONS: ReportReason[] = ["spam", "fake", "expired", "inappropriate"];

export function ReportModal({ offerId, onClose }: ReportModalProps) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const reportMutation = useMutation(api.reports.report);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);
    try {
      const result = await reportMutation({
        offerId,
        visitorId: getVisitorId(),
        reason: selectedReason,
      });
      if (result === "already_reported") {
        toast(t("report.alreadyReported"), "info");
      } else {
        toast(t("report.submitted"), "success");
      }
      onClose();
    } catch {
      toast("Error submitting report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="glass-strong rounded-2xl p-5 w-full max-w-sm relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-white mb-4">{t("report.title")}</h3>

        <div className="space-y-2 mb-5">
          {REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                selectedReason === reason
                  ? "bg-red-500/15 border border-red-500/30 text-red-300"
                  : "bg-slate-800/40 border border-slate-700/20 text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              {t(`report.${reason}` as "report.spam")}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800/60 text-slate-400 hover:bg-slate-700 transition-colors"
          >
            {t("comments.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || submitting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "..." : t("report.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
