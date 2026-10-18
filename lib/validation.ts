import {
  CONTENT_TYPES,
  LANGUAGES,
  TONES,
  FIELD_LIMITS,
  type GenerateRequest,
} from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof GenerateRequest, string>>;
}

export function validateRequest(body: unknown): ValidationResult {
  const errors: Partial<Record<keyof GenerateRequest, string>> = {};

  if (!body || typeof body !== "object") {
    return { valid: false, errors: { productName: "Invalid request body." } };
  }

  const data = body as Record<string, unknown>;

  // productName
  if (!data.productName || typeof data.productName !== "string" || data.productName.trim().length === 0) {
    errors.productName = "Product name is required.";
  } else if (data.productName.trim().length > FIELD_LIMITS.productName) {
    errors.productName = `Product name must be ${FIELD_LIMITS.productName} characters or fewer.`;
  }

  // description
  if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
    errors.description = "Product description is required.";
  } else if (data.description.trim().length > FIELD_LIMITS.description) {
    errors.description = `Description must be ${FIELD_LIMITS.description} characters or fewer.`;
  }

  // price
  if (!data.price || typeof data.price !== "string" || data.price.trim().length === 0) {
    errors.price = "Price is required.";
  } else if (data.price.trim().length > FIELD_LIMITS.price) {
    errors.price = `Price must be ${FIELD_LIMITS.price} characters or fewer.`;
  }

  // offer (optional)
  if (data.offer !== undefined && data.offer !== null && data.offer !== "") {
    if (typeof data.offer !== "string" || data.offer.trim().length > FIELD_LIMITS.offer) {
      errors.offer = `Offer must be ${FIELD_LIMITS.offer} characters or fewer.`;
    }
  }

  // targetAudience
  if (!data.targetAudience || typeof data.targetAudience !== "string" || data.targetAudience.trim().length === 0) {
    errors.targetAudience = "Target audience is required.";
  } else if (data.targetAudience.trim().length > FIELD_LIMITS.targetAudience) {
    errors.targetAudience = `Target audience must be ${FIELD_LIMITS.targetAudience} characters or fewer.`;
  }

  // contentType
  if (!CONTENT_TYPES.includes(data.contentType as never)) {
    errors.contentType = "Invalid content type.";
  }

  // language
  if (!LANGUAGES.includes(data.language as never)) {
    errors.language = "Invalid language.";
  }

  // tone
  if (!TONES.includes(data.tone as never)) {
    errors.tone = "Invalid tone.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
