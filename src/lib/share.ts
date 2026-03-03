import { toast } from "@/lib/toast";

interface ShareData {
  title: string;
  storeName: string;
  discountPercent: number;
  offerId: string;
}

function getOfferUrl(offerId: string): string {
  return `${window.location.origin}/offer/${offerId}`;
}

function getShareText(data: ShareData): string {
  return `${data.discountPercent}% OFF at ${data.storeName} — ${data.title}`;
}

export async function shareOffer(data: ShareData): Promise<void> {
  const url = getOfferUrl(data.offerId);
  const text = getShareText(data);

  if (navigator.share) {
    try {
      await navigator.share({ title: data.title, text, url });
      return;
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast("Link copied!", "success");
  } catch {
    toast("Could not copy link", "error");
  }
}

export function getWhatsAppShareUrl(data: ShareData): string {
  const url = getOfferUrl(data.offerId);
  const text = encodeURIComponent(
    `🏷️ *${data.discountPercent}% OFF* at *${data.storeName}*\n${data.title}\n\n👉 ${url}`,
  );
  return `https://wa.me/?text=${text}`;
}
