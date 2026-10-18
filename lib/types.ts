// Shared types for DukaanSathi AI

export const CONTENT_TYPES = ["whatsapp", "listing", "reply"] as const;
export const LANGUAGES = ["english", "hindi", "hinglish"] as const;
export const TONES = ["friendly", "professional", "festive"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type Language = (typeof LANGUAGES)[number];
export type Tone = (typeof TONES)[number];

export interface GenerateRequest {
  productName: string;
  description: string;
  price: string;
  offer?: string;
  targetAudience: string;
  contentType: ContentType;
  language: Language;
  tone: Tone;
}

export interface GenerateResponse {
  content: string;
  model?: string;
  finishReason?: string;
}

export interface GenerateErrorResponse {
  error: string;
}

export interface DraftEntry {
  id: string;
  timestamp: number;
  request: GenerateRequest;
  content: string;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  whatsapp: "WhatsApp Promotion",
  listing: "Product Listing",
  reply: "Customer Reply",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  english: "English",
  hindi: "हिंदी",
  hinglish: "Hinglish",
};

export const TONE_LABELS: Record<Tone, string> = {
  friendly: "Friendly",
  professional: "Professional",
  festive: "🎉 Festive",
};

// Field length limits (also enforced server-side)
export const FIELD_LIMITS = {
  productName: 80,
  description: 500,
  price: 40,
  offer: 120,
  targetAudience: 120,
} as const;

// Sample data for quick demo
export const SAMPLE_DATA: GenerateRequest = {
  productName: "Fresh Mango Pickle",
  description:
    "Homemade raw mango pickle made with mustard oil and traditional spices. No preservatives, grandmother's recipe.",
  price: "₹180 per 500g jar",
  offer: "Buy 2 get 10% off",
  targetAudience: "Families who love traditional home-style food",
  contentType: "whatsapp",
  language: "hinglish",
  tone: "friendly",
};
