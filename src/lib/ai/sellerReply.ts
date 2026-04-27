export interface BuyerInquiry {
  buyerName: string;
  message: string;
  source: "inspection" | "message" | "whatsapp";
  propertyTitle: string;
  propertyType?: string;
  priceUsd?: number;
  sellerName?: string;
}

export interface SellerReplyDraft {
  replyEn: string;
  replyAr: string;
  toneLabel: string;
  toneLabelAr: string;
  complianceNotes: string[];
  complianceNotesAr: string[];
}

type ReplyIntent =
  | "price_inquiry"
  | "availability_inquiry"
  | "inspection_request"
  | "document_request"
  | "negotiation"
  | "general";

function detectIntent(message: string): ReplyIntent {
  const lower = message.toLowerCase();
  if (/price|cost|how much|كم|سعر|تكلفة/.test(lower)) return "price_inquiry";
  if (/available|still|sold|متاح|لا يزال|مباع/.test(lower)) return "availability_inquiry";
  if (/visit|inspect|see|tour|زيارة|معاينة|فحص/.test(lower)) return "inspection_request";
  if (/document|deed|paper|وثيقة|سند|طابو/.test(lower)) return "document_request";
  if (/offer|negotiate|less|discount|عرض|تفاوض|تخفيض/.test(lower)) return "negotiation";
  return "general";
}

function buildEnglishReply(inquiry: BuyerInquiry, intent: ReplyIntent): string {
  const greeting = `Dear ${inquiry.buyerName},\n\nThank you for your interest in "${inquiry.propertyTitle}". We appreciate you reaching out.`;
  const closing = `\n\nPlease feel free to ask any further questions. We are committed to full transparency and your peace of mind throughout this process.\n\nWarm regards,\n${inquiry.sellerName ?? "The Seller"}`;

  switch (intent) {
    case "price_inquiry":
      return `${greeting}\n\nThe listed price for this property is $${inquiry.priceUsd?.toLocaleString() ?? "[price]"}. This reflects the current market valuation and includes [mention any included items, e.g., fixtures, parking].\n\nIf you would like to discuss pricing further, I am happy to schedule a call or meeting at your convenience.${closing}`;

    case "availability_inquiry":
      return `${greeting}\n\nI am pleased to confirm that the property is currently available and actively listed. We have not received any accepted offers at this time.\n\nIf you are interested in securing it, I recommend scheduling a viewing as soon as possible. I can arrange a visit at a time that suits you.${closing}`;

    case "inspection_request":
      return `${greeting}\n\nAbsolutely — I welcome an in-person inspection and encourage it before any decision is made. I can arrange a site visit on [your available days]. The property will be accessible for a full walkthrough.\n\nPlease let me know your preferred dates and times, and I will confirm promptly.${closing}`;

    case "document_request":
      return `${greeting}\n\nWe are happy to share all relevant documentation. The property has [ownership deed / title certificate / tapu] available for review. I can provide copies via secure digital transfer or in person during a meeting with a certified notary if preferred.\n\nAll documents can be verified through the official Iraqi Land Registry. Please let me know how you would like to proceed.${closing}`;

    case "negotiation":
      return `${greeting}\n\nThank you for your offer and interest. I will review it carefully and respond as soon as possible — typically within 24 hours.\n\nTo ensure a fair and transparent process for both parties, any revised terms will be confirmed in writing. I look forward to reaching an agreement that works well for us both.${closing}`;

    default:
      return `${greeting}\n\nI am happy to assist with any questions you have about "${inquiry.propertyTitle}". Whether you would like to arrange a viewing, review documentation, or discuss pricing, please do not hesitate to reach out.\n\nI am committed to making this process as smooth and transparent as possible for you.${closing}`;
  }
}

function buildArabicReply(inquiry: BuyerInquiry, intent: ReplyIntent): string {
  const greeting = `عزيزي ${inquiry.buyerName}،\n\nشكراً جزيلاً على اهتمامك بعقار "${inquiry.propertyTitle}". نقدّر تواصلك معنا.`;
  const closing = `\n\nلا تتردد في طرح أي أسئلة إضافية. نحن ملتزمون بالشفافية التامة وراحة بالك طوال هذه العملية.\n\nمع خالص التقدير،\n${inquiry.sellerName ?? "البائع"}`;

  switch (intent) {
    case "price_inquiry":
      return `${greeting}\n\nالسعر المطلوب لهذا العقار هو $${inquiry.priceUsd?.toLocaleString() ?? "[السعر]"}، وهو يعكس تقييم السوق الحالي ويشمل [اذكر أي عناصر مدرجة، مثل: التجهيزات، الموقف].\n\nإذا كنت ترغب في مناقشة التسعير بشكل أكبر، يسعدني ترتيب مكالمة أو اجتماع في الوقت المناسب لك.${closing}`;

    case "availability_inquiry":
      return `${greeting}\n\nيسعدني تأكيد أن العقار متاح حالياً وقيد الإدراج الفعّال. لم نتلقَّ أي عروض مقبولة حتى الآن.\n\nإذا كنت مهتماً بتأمينه، أنصح بجدولة معاينة في أقرب وقت ممكن. يمكنني ترتيب زيارة في الوقت الذي يناسبك.${closing}`;

    case "inspection_request":
      return `${greeting}\n\nبالتأكيد — نرحّب بالمعاينة الشخصية ونشجع عليها قبل اتخاذ أي قرار. يمكنني ترتيب زيارة ميدانية في [أيامك المتاحة]. سيكون العقار متاحاً لجولة كاملة.\n\nيرجى إخباري بتواريخ وأوقاتك المفضّلة وسأؤكد بسرعة.${closing}`;

    case "document_request":
      return `${greeting}\n\nيسعدنا مشاركة جميع الوثائق ذات الصلة. العقار لديه [سند الملكية / شهادة الطابو / الكوشان] متاح للمراجعة. يمكنني تزويدك بنسخ عبر النقل الرقمي الآمن أو شخصياً خلال اجتماع مع كاتب عدل معتمد إذا كنت تفضّل ذلك.\n\nيمكن التحقق من جميع الوثائق من خلال دائرة التسجيل العقاري العراقية الرسمية. يرجى إخباري بكيفية رغبتك في المتابعة.${closing}`;

    case "negotiation":
      return `${greeting}\n\nشكراً على عرضك واهتمامك. سأراجعه بعناية وأردّ في أقرب وقت — عادةً خلال 24 ساعة.\n\nلضمان عملية عادلة وشفافة لكلا الطرفين، سيتم تأكيد أي شروط معدّلة كتابياً. أتطلع إلى الوصول إلى اتفاق يناسب الطرفين.${closing}`;

    default:
      return `${greeting}\n\nيسعدني مساعدتك في أي أسئلة لديك حول "${inquiry.propertyTitle}". سواء كنت تريد ترتيب معاينة أو مراجعة الوثائق أو مناقشة التسعير، لا تتردد في التواصل.\n\nأنا ملتزم بجعل هذه العملية سلسة وشفافة قدر الإمكان لك.${closing}`;
  }
}

export function generateSellerReply(inquiry: BuyerInquiry): SellerReplyDraft {
  const intent = detectIntent(inquiry.message);

  const tonesByIntent: Record<ReplyIntent, { en: string; ar: string }> = {
    price_inquiry:        { en: "Transparent & Informative",  ar: "شفاف وإعلامي" },
    availability_inquiry: { en: "Reassuring & Prompt",        ar: "مطمئن وسريع" },
    inspection_request:   { en: "Welcoming & Open",           ar: "ترحيبي ومنفتح" },
    document_request:     { en: "Professional & Compliant",   ar: "احترافي وملتزم" },
    negotiation:          { en: "Respectful & Fair",          ar: "محترم وعادل" },
    general:              { en: "Friendly & Helpful",         ar: "ودّي ومفيد" },
  };

  const complianceNotes = [
    "Do not promise specific returns or investment gains in writing",
    "Avoid any language that pressures the buyer to decide quickly",
    "Confirm all agreed terms in a written document before proceeding",
    "Only share documents through secure, traceable channels",
  ];

  const complianceNotesAr = [
    "لا تعِد بعوائد أو مكاسب استثمارية محددة كتابياً",
    "تجنّب أي لغة تضغط على المشتري للقرار السريع",
    "أكّد جميع الشروط المتفق عليها في وثيقة مكتوبة قبل المتابعة",
    "شارك الوثائق فقط عبر قنوات آمنة وقابلة للتتبع",
  ];

  return {
    replyEn: buildEnglishReply(inquiry, intent),
    replyAr: buildArabicReply(inquiry, intent),
    toneLabel: tonesByIntent[intent].en,
    toneLabelAr: tonesByIntent[intent].ar,
    complianceNotes,
    complianceNotesAr,
  };
}
