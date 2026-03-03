import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

export type Language = "en" | "bn";

const LANG_KEY = "offerlagbe_lang";

const en = {
  // Header
  "app.tagline": "Discover offers near you",
  "header.setLocation": "Set location",
  "header.addOffer": "Add Offer",

  // Sidebar
  "sidebar.trending": "Trending",
  "sidebar.newest": "Newest",
  "sidebar.nearest": "Nearest",
  "sidebar.bestDeals": "Best Deals",
  "sidebar.mostTrusted": "Most Trusted",
  "sidebar.nearMe": "Near Me",
  "sidebar.saved": "Saved",
  "sidebar.clear": "Clear",
  "sidebar.offers": "offer",
  "sidebar.offersPlural": "offers",
  "sidebar.noOffers": "No offers found",
  "sidebar.noOffersHint": "Try adjusting your search or filters",

  // OfferCard / Popup
  "offer.off": "OFF",
  "offer.flagged": "Flagged",
  "offer.endsToday": "Ends Today",
  "offer.expiringSoon": "Expiring Soon",
  "offer.share": "Share",
  "offer.views": "views",
  "offer.viewDetails": "View details",
  "offer.saved": "Offer saved!",
  "offer.bookmarkRemoved": "Bookmark removed",
  "offer.flaggedWarning": "This offer has been flagged by the community as potentially inaccurate.",
  "offer.locationOnMap": "See location on map",

  // Detail page
  "detail.backToOffers": "Back to offers",
  "detail.offerNotFound": "Offer not found",
  "detail.loading": "Loading offer...",

  // Submit form
  "submit.title": "Post an Offer",
  "submit.storeName": "Store / Brand",
  "submit.offerTitle": "Offer Title",
  "submit.discount": "Discount %",
  "submit.category": "Category",
  "submit.location": "Location",
  "submit.useCurrentLocation": "Use Current Location",
  "submit.detecting": "Detecting...",
  "submit.detectingLocation": "Detecting location...",
  "submit.moreDetails": "More Details",
  "submit.optional": "optional",
  "submit.description": "Description",
  "submit.originalPrice": "Original Price",
  "submit.offerPrice": "Offer Price",
  "submit.startDate": "Start Date",
  "submit.endDate": "End Date",
  "submit.photos": "Photos",
  "submit.photosHint": "Brochures, shop fronts, offer boards — anything helpful",
  "submit.postOffer": "Post Offer",
  "submit.posting": "Posting...",
  "submit.tapMap": "Tap the map to set location",
  "submit.tapMapHint": 'Tap the map to pin the offer location, or press "Use Current Location"',
  "submit.adjustPin": "Tap the map to adjust the pin",
  "submit.dateHint": "Start defaults to today. Leave end date empty if no expiry.",

  // Submit form placeholders
  "submit.storeNamePlaceholder": "e.g., Star Kabab, Daraz",
  "submit.titlePlaceholder": "e.g., 50% off on all burgers",
  "submit.customPercent": "Or type custom %",
  "submit.descriptionPlaceholder": "What's the offer about?",
  "submit.addressPlaceholder": "Address — e.g., Gulshan 2, Dhaka (optional)",
  "submit.addressHint": "Optional — add full address or landmarks for easier finding",
  "submit.googleMapsUrl": "Google Maps Link",
  "submit.googleMapsPlaceholder": "Paste Google Maps link here",
  "submit.googleMapsDetected": "Location detected from Google Maps link",
  "submit.googleMapsInvalid": "Could not extract location from this link",

  // Submit form errors
  "error.storeRequired": "Store name is required",
  "error.titleRequired": "Title is required",
  "error.discountRange": "Enter 1-100%",
  "error.categoryRequired": "Pick a category",
  "error.locationRequired": "Location is required — tap the map or allow GPS",
  "error.addressRequired": "Address is needed",
  "error.dateOrder": "End date must be after start date",

  // Duplicate detection
  "duplicate.title": "Similar offer found nearby",
  "duplicate.message": "We found similar offers within 200m of this location:",
  "duplicate.cancel": "Cancel",
  "duplicate.postAnyway": "Post Anyway",

  // Toast messages
  "toast.locationUpdated": "Location updated!",
  "toast.locationDenied": "Location permission denied — tap the map to pin manually",
  "toast.setLocationFirst": "Set your location first to use Near Me",
  "toast.offerPosted": "Offer posted!",
  "toast.photosOptimized": "Photos optimized!",
  "toast.linkCopied": "Link copied!",

  // Voting
  "vote.legit": "Marked as legit!",
  "vote.false": "Reported as false",
  "vote.removed": "Vote removed",
  "vote.error": "Could not vote. Try again.",

  // Location settings
  "location.title": "Your Location",

  // Search
  "search.placeholder": "Search offers...",

  // Map
  "map.tapToSetLocation": "Tap on the map to set location",

  // Loading
  "loading.offers": "Loading offers...",

  // Directions
  "offer.getDirections": "Get Directions",

  // Coupon
  "offer.couponCode": "Coupon Code",
  "offer.codeCopied": "Copied!",
  "offer.tapToCopy": "Tap to copy",
  "submit.couponCode": "Coupon / Promo Code",
  "submit.couponCodePlaceholder": "e.g., SAVE20",

  // Comments
  "comments.title": "Comments",
  "comments.placeholder": "Ask about this offer...",
  "comments.post": "Post",
  "comments.empty": "No comments yet.",
  "comments.beFirst": "Be the first to ask!",
  "comments.delete": "Delete",
  "comments.rateLimit": "Too many comments, please wait",

  // Time ago
  "time.justNow": "just now",
  "time.minutesAgo": "{n}m ago",
  "time.hoursAgo": "{n}h ago",
  "time.daysAgo": "{n}d ago",

  // Report Abuse
  "report.title": "Report this offer",
  "report.reason": "Reason",
  "report.spam": "Spam",
  "report.fake": "Fake / Inaccurate",
  "report.expired": "Already expired",
  "report.inappropriate": "Inappropriate",
  "report.submit": "Submit Report",
  "report.submitted": "Report submitted. Thank you!",
  "report.alreadyReported": "You've already reported this offer",

  // Comments Enhanced
  "comments.reply": "Reply",
  "comments.replyingTo": "Replying to #{id}",
  "comments.cancel": "Cancel",
  "comments.showReplies": "Show {n} replies",
  "comments.hideReplies": "Hide replies",
  "comments.upvote": "Helpful",
  "comments.sortByTop": "Top",
  "comments.sortByNew": "New",

  // Leaderboard
  "leaderboard.title": "Top Stores",
  "leaderboard.offerCount": "{n} offers",
  "leaderboard.bestDiscount": "up to {n}% OFF",
  "leaderboard.active": "active",
  "leaderboard.empty": "No stores yet",

  // Filters
  "filter.price": "Price",
  "filter.priceAll": "All",
  "filter.price0to500": "৳0-500",
  "filter.price500to2000": "৳500-2K",
  "filter.price2000to5000": "৳2K-5K",
  "filter.price5000plus": "৳5K+",
  "filter.date": "Date",
  "filter.dateAll": "All time",
  "filter.dateToday": "Today",
  "filter.dateWeek": "This week",
  "filter.dateMonth": "This month",

  // Best This Week
  "sidebar.bestThisWeek": "Best This Week",

  // Tags
  "submit.tags": "Tags",
  "submit.tagsHint": "Select all that apply",
  "tag.verified": "Verified",
  "tag.limited-stock": "Limited Stock",
  "tag.online-only": "Online Only",
  "tag.in-store-only": "In-Store Only",
  "tag.members-only": "Members Only",
  "tag.new-arrival": "New Arrival",

  // Store Page
  "store.allOffers": "All offers from {store}",
  "store.offerCount": "{n} offers",
  "store.noOffers": "No offers found for this store",

  // Nearby
  "nearby.title": "More offers nearby",
  "nearby.within": "Within 500m",
  "nearby.empty": "No other offers within 500m",

  // Countdown
  "countdown.endsIn": "Ends in",
  "countdown.expired": "Expired",
  "countdown.days": "d",
  "countdown.hours": "h",
  "countdown.minutes": "m",
  "countdown.seconds": "s",

  // Rich Text
  "submit.markdownHint": "Supports **bold**, [links](url), and - bullets",
  "submit.preview": "Preview",
  "submit.edit": "Edit",

  // Offline
  "offline.banner": "You're offline — showing cached offers",
  "offline.stale": "Data may be outdated",

  // Onboarding Tour
  "tour.step1": "Set your location to find offers nearby",
  "tour.step2": "Browse, search, and filter offers here",
  "tour.step3": "Vote on offers to help the community",
  "tour.skip": "Skip",
  "tour.next": "Next",
  "tour.done": "Got it!",

  // Verification Badge
  "badge.communityVerified": "Community Verified",
  "badge.verified": "Verified",

  // Deal of the Day
  "sidebar.dealOfDay": "Deal of the Day",

  // Photo Verification
  "verify.title": "Verification Photos",
  "verify.verifiedBy": "Verified by {n} people",
  "verify.beFirst": "Be the first to verify this deal!",
  "verify.button": "Verify this deal",
  "verify.submitted": "Verification photo submitted!",
  "verify.uploading": "Uploading...",

  // Heatmap
  "map.bubbles": "Bubbles",
  "map.heatmap": "Heatmap",

  // Push Notifications
  "notify.title": "Notification Preferences",
  "notify.enable": "Enable Notifications",
  "notify.disable": "Disable Notifications",
  "notify.update": "Update Preferences",
  "notify.categories": "Categories",
  "notify.radius": "Radius",
  "notify.unsupported": "Push notifications are not supported in this browser",

  // Swipe Actions
  "swipe.save": "Save",
  "swipe.dismiss": "Dismiss",

  // Scam Detection
  "toast.storeReputation": "This store has been flagged due to reputation issues",

  // Back to Map
  "fab.backToMap": "Back to map",

  // Language
  "lang.switch": "বাংলা",
} as const;

const bn: Record<keyof typeof en, string> = {
  "app.tagline": "আপনার কাছের অফার খুঁজুন",
  "header.setLocation": "লোকেশন সেট করুন",
  "header.addOffer": "অফার যোগ করুন",

  "sidebar.trending": "ট্রেন্ডিং",
  "sidebar.newest": "নতুন",
  "sidebar.nearest": "কাছের",
  "sidebar.bestDeals": "সেরা ডিল",
  "sidebar.mostTrusted": "বিশ্বস্ত",
  "sidebar.nearMe": "আমার কাছে",
  "sidebar.saved": "সেভড",
  "sidebar.clear": "মুছুন",
  "sidebar.offers": "অফার",
  "sidebar.offersPlural": "অফার",
  "sidebar.noOffers": "কোনো অফার পাওয়া যায়নি",
  "sidebar.noOffersHint": "সার্চ বা ফিল্টার পরিবর্তন করুন",

  "offer.off": "ছাড়",
  "offer.flagged": "সন্দেহজনক",
  "offer.endsToday": "আজ শেষ",
  "offer.expiringSoon": "শীঘ্রই শেষ",
  "offer.share": "শেয়ার",
  "offer.views": "ভিউ",
  "offer.viewDetails": "বিস্তারিত দেখুন",
  "offer.saved": "অফার সেভ হয়েছে!",
  "offer.bookmarkRemoved": "বুকমার্ক মুছে ফেলা হয়েছে",
  "offer.flaggedWarning": "এই অফারটি সম্প্রদায় দ্বারা সন্দেহজনক হিসেবে চিহ্নিত হয়েছে।",
  "offer.locationOnMap": "ম্যাপে লোকেশন দেখুন",

  "detail.backToOffers": "অফারে ফিরুন",
  "detail.offerNotFound": "অফার পাওয়া যায়নি",
  "detail.loading": "অফার লোড হচ্ছে...",

  "submit.title": "অফার পোস্ট করুন",
  "submit.storeName": "দোকান / ব্র্যান্ড",
  "submit.offerTitle": "অফারের শিরোনাম",
  "submit.discount": "ছাড় %",
  "submit.category": "ক্যাটেগরি",
  "submit.location": "লোকেশন",
  "submit.useCurrentLocation": "বর্তমান লোকেশন ব্যবহার করুন",
  "submit.detecting": "খুঁজছে...",
  "submit.detectingLocation": "লোকেশন খুঁজছে...",
  "submit.moreDetails": "আরও তথ্য",
  "submit.optional": "ঐচ্ছিক",
  "submit.description": "বিবরণ",
  "submit.originalPrice": "আসল দাম",
  "submit.offerPrice": "অফার দাম",
  "submit.startDate": "শুরুর তারিখ",
  "submit.endDate": "শেষ তারিখ",
  "submit.photos": "ছবি",
  "submit.photosHint": "ব্রোশার, দোকানের ছবি — যেকোনো কিছু",
  "submit.postOffer": "অফার পোস্ট করুন",
  "submit.posting": "পোস্ট হচ্ছে...",
  "submit.tapMap": "ম্যাপে ট্যাপ করে লোকেশন সেট করুন",
  "submit.tapMapHint": 'ম্যাপে ট্যাপ করুন অথবা "বর্তমান লোকেশন" বাটন চাপুন',
  "submit.adjustPin": "পিন সরাতে ম্যাপে ট্যাপ করুন",
  "submit.dateHint": "শুরুর তারিখ আজ। শেষ তারিখ না থাকলে খালি রাখুন।",

  "submit.storeNamePlaceholder": "যেমন, স্টার কাবাব, দারাজ",
  "submit.titlePlaceholder": "যেমন, সব বার্গারে ৫০% ছাড়",
  "submit.customPercent": "অথবা কাস্টম % লিখুন",
  "submit.descriptionPlaceholder": "অফার সম্পর্কে বিস্তারিত",
  "submit.addressPlaceholder": "ঠিকানা — যেমন, গুলশান ২, ঢাকা (ঐচ্ছিক)",
  "submit.addressHint": "ঐচ্ছিক — সহজে খুঁজে পেতে পুরো ঠিকানা বা ল্যান্ডমার্ক দিন",
  "submit.googleMapsUrl": "গুগল ম্যাপস লিংক",
  "submit.googleMapsPlaceholder": "গুগল ম্যাপস লিংক পেস্ট করুন",
  "submit.googleMapsDetected": "গুগল ম্যাপস থেকে লোকেশন পাওয়া গেছে",
  "submit.googleMapsInvalid": "এই লিংক থেকে লোকেশন পাওয়া যায়নি",

  "error.storeRequired": "দোকানের নাম দিন",
  "error.titleRequired": "শিরোনাম দিন",
  "error.discountRange": "১-১০০% লিখুন",
  "error.categoryRequired": "ক্যাটেগরি বাছুন",
  "error.locationRequired": "লোকেশন দিন — ম্যাপে ট্যাপ করুন বা GPS দিন",
  "error.addressRequired": "ঠিকানা দিন",
  "error.dateOrder": "শেষ তারিখ শুরুর পরে হতে হবে",

  "duplicate.title": "কাছে একই রকম অফার আছে",
  "duplicate.message": "এই লোকেশনের ২০০ মিটারের মধ্যে একই রকম অফার পাওয়া গেছে:",
  "duplicate.cancel": "বাতিল",
  "duplicate.postAnyway": "তবুও পোস্ট করুন",

  "toast.locationUpdated": "লোকেশন আপডেট হয়েছে!",
  "toast.locationDenied": "লোকেশন অনুমতি দেওয়া হয়নি — ম্যাপে পিন করুন",
  "toast.setLocationFirst": "Near Me ব্যবহার করতে আগে লোকেশন সেট করুন",
  "toast.offerPosted": "অফার পোস্ট হয়েছে!",
  "toast.photosOptimized": "ছবি অপ্টিমাইজ হয়েছে!",
  "toast.linkCopied": "লিংক কপি হয়েছে!",

  "vote.legit": "সত্যি হিসেবে চিহ্নিত!",
  "vote.false": "ভুয়া হিসেবে রিপোর্ট করা হয়েছে",
  "vote.removed": "ভোট মুছে ফেলা হয়েছে",
  "vote.error": "ভোট দেওয়া যায়নি। আবার চেষ্টা করুন।",

  "location.title": "আপনার লোকেশন",

  "search.placeholder": "অফার খুঁজুন...",

  "map.tapToSetLocation": "ম্যাপে ট্যাপ করে লোকেশন সেট করুন",

  "loading.offers": "অফার লোড হচ্ছে...",

  // Directions
  "offer.getDirections": "দিকনির্দেশনা নিন",

  // Coupon
  "offer.couponCode": "কুপন কোড",
  "offer.codeCopied": "কপি হয়েছে!",
  "offer.tapToCopy": "কপি করতে ট্যাপ করুন",
  "submit.couponCode": "কুপন / প্রোমো কোড",
  "submit.couponCodePlaceholder": "যেমন, SAVE20",

  // Comments
  "comments.title": "মন্তব্য",
  "comments.placeholder": "এই অফার সম্পর্কে জিজ্ঞাসা করুন...",
  "comments.post": "পোস্ট",
  "comments.empty": "এখনও কোনো মন্তব্য নেই।",
  "comments.beFirst": "প্রথম জিজ্ঞাসা করুন!",
  "comments.delete": "মুছুন",
  "comments.rateLimit": "অনেক মন্তব্য, অনুগ্রহ করে অপেক্ষা করুন",

  // Time ago
  "time.justNow": "এইমাত্র",
  "time.minutesAgo": "{n} মিনিট আগে",
  "time.hoursAgo": "{n} ঘণ্টা আগে",
  "time.daysAgo": "{n} দিন আগে",

  // Report Abuse
  "report.title": "এই অফার রিপোর্ট করুন",
  "report.reason": "কারণ",
  "report.spam": "স্প্যাম",
  "report.fake": "ভুয়া / ভুল তথ্য",
  "report.expired": "মেয়াদ শেষ",
  "report.inappropriate": "অনুপযুক্ত",
  "report.submit": "রিপোর্ট পাঠান",
  "report.submitted": "রিপোর্ট পাঠানো হয়েছে। ধন্যবাদ!",
  "report.alreadyReported": "আপনি আগেই এই অফার রিপোর্ট করেছেন",

  // Comments Enhanced
  "comments.reply": "উত্তর দিন",
  "comments.replyingTo": "#{id} কে উত্তর দিচ্ছেন",
  "comments.cancel": "বাতিল",
  "comments.showReplies": "{n}টি উত্তর দেখুন",
  "comments.hideReplies": "উত্তর লুকান",
  "comments.upvote": "সহায়ক",
  "comments.sortByTop": "সেরা",
  "comments.sortByNew": "নতুন",

  // Leaderboard
  "leaderboard.title": "সেরা দোকান",
  "leaderboard.offerCount": "{n}টি অফার",
  "leaderboard.bestDiscount": "{n}% পর্যন্ত ছাড়",
  "leaderboard.active": "সক্রিয়",
  "leaderboard.empty": "এখনও কোনো দোকান নেই",

  // Filters
  "filter.price": "দাম",
  "filter.priceAll": "সব",
  "filter.price0to500": "৳০-৫০০",
  "filter.price500to2000": "৳৫০০-২K",
  "filter.price2000to5000": "৳২K-৫K",
  "filter.price5000plus": "৳৫K+",
  "filter.date": "তারিখ",
  "filter.dateAll": "সব সময়",
  "filter.dateToday": "আজ",
  "filter.dateWeek": "এই সপ্তাহ",
  "filter.dateMonth": "এই মাস",

  // Best This Week
  "sidebar.bestThisWeek": "এই সপ্তাহের সেরা",

  // Tags
  "submit.tags": "ট্যাগ",
  "submit.tagsHint": "প্রযোজ্য সব বাছুন",
  "tag.verified": "যাচাই করা",
  "tag.limited-stock": "সীমিত স্টক",
  "tag.online-only": "শুধু অনলাইন",
  "tag.in-store-only": "শুধু দোকানে",
  "tag.members-only": "শুধু সদস্যদের",
  "tag.new-arrival": "নতুন আগমন",

  // Store Page
  "store.allOffers": "{store} এর সব অফার",
  "store.offerCount": "{n}টি অফার",
  "store.noOffers": "এই দোকানের কোনো অফার নেই",

  // Nearby
  "nearby.title": "কাছের আরও অফার",
  "nearby.within": "৫০০ মিটারের মধ্যে",
  "nearby.empty": "৫০০ মিটারের মধ্যে অন্য কোনো অফার নেই",

  // Countdown
  "countdown.endsIn": "শেষ হবে",
  "countdown.expired": "মেয়াদ শেষ",
  "countdown.days": "দ",
  "countdown.hours": "ঘ",
  "countdown.minutes": "মি",
  "countdown.seconds": "সে",

  // Rich Text
  "submit.markdownHint": "**বোল্ড**, [লিংক](url), এবং - বুলেট সাপোর্ট করে",
  "submit.preview": "প্রিভিউ",
  "submit.edit": "এডিট",

  // Offline
  "offline.banner": "আপনি অফলাইনে আছেন — ক্যাশ করা অফার দেখাচ্ছে",
  "offline.stale": "তথ্য পুরনো হতে পারে",

  // Onboarding Tour
  "tour.step1": "কাছের অফার খুঁজতে আপনার লোকেশন সেট করুন",
  "tour.step2": "এখানে অফার ব্রাউজ, সার্চ এবং ফিল্টার করুন",
  "tour.step3": "কমিউনিটিকে সাহায্য করতে অফারে ভোট দিন",
  "tour.skip": "স্কিপ",
  "tour.next": "পরবর্তী",
  "tour.done": "বুঝেছি!",

  "badge.communityVerified": "কমিউনিটি যাচাইকৃত",
  "badge.verified": "যাচাইকৃত",

  "sidebar.dealOfDay": "আজকের সেরা ডিল",

  "verify.title": "যাচাই ফটো",
  "verify.verifiedBy": "{n} জন যাচাই করেছে",
  "verify.beFirst": "এই ডিলটি প্রথম যাচাই করুন!",
  "verify.button": "এই ডিল যাচাই করুন",
  "verify.submitted": "যাচাই ফটো জমা দেওয়া হয়েছে!",
  "verify.uploading": "আপলোড হচ্ছে...",

  "map.bubbles": "বাবল",
  "map.heatmap": "হিটম্যাপ",

  "notify.title": "নোটিফিকেশন পছন্দ",
  "notify.enable": "নোটিফিকেশন চালু করুন",
  "notify.disable": "নোটিফিকেশন বন্ধ করুন",
  "notify.update": "পছন্দ আপডেট করুন",
  "notify.categories": "ক্যাটেগরি",
  "notify.radius": "ব্যাসার্ধ",
  "notify.unsupported": "এই ব্রাউজারে পুশ নোটিফিকেশন সাপোর্ট করে না",

  "swipe.save": "সেভ",
  "swipe.dismiss": "বাতিল",

  "toast.storeReputation": "এই দোকানটি খ্যাতির কারণে ফ্ল্যাগ করা হয়েছে",

  "fab.backToMap": "ম্যাপে ফিরুন",

  "lang.switch": "English",
};

type TranslationKey = keyof typeof en;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getSavedLang(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "bn") return "bn";
  } catch {
    /* localStorage unavailable */
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getSavedLang);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const translations = lang === "bn" ? bn : en;
      return translations[key] ?? en[key] ?? key;
    },
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
