"use client";

import { useState, useCallback } from "react";
import type {
  GenerateRequest,
  ContentType,
  Language,
  Tone,
} from "@/lib/types";
import {
  CONTENT_TYPE_LABELS,
  LANGUAGE_LABELS,
  TONE_LABELS,
  FIELD_LIMITS,
  SAMPLE_DATA,
} from "@/lib/types";
import { validateRequest } from "@/lib/validation";
import Spinner from "./Spinner";

interface ProductFormProps {
  onGenerate: (data: GenerateRequest) => void;
  isLoading: boolean;
}

type FormErrors = Partial<Record<keyof GenerateRequest, string>>;

const defaultForm: GenerateRequest = {
  productName: "",
  description: "",
  price: "",
  offer: "",
  targetAudience: "",
  contentType: "whatsapp",
  language: "hinglish",
  tone: "friendly",
};

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const pct = len / max;
  const color =
    pct > 0.9 ? "#dc2626" : pct > 0.75 ? "#d97706" : "var(--muted)";
  return (
    <span style={{ fontSize: "0.75rem", color, marginLeft: "auto" }}>
      {len}/{max}
    </span>
  );
}

export default function ProductForm({ onGenerate, isLoading }: ProductFormProps) {
  const [form, setForm] = useState<GenerateRequest>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = useCallback(
    <K extends keyof GenerateRequest>(key: K, value: GenerateRequest[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  const loadSample = () => {
    setForm(SAMPLE_DATA);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, errors: errs } = validateRequest(form);
    if (!valid) {
      setErrors(errs);
      // Scroll to first error
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }
    setErrors({});
    onGenerate(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Sample data helper */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          Product Details
        </h2>
        <button
          type="button"
          className="btn-ghost"
          onClick={loadSample}
          id="btn-load-sample"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Try a sample
        </button>
      </div>

      {/* Product Name */}
      <Field
        label="Product Name"
        id="field-productName"
        required
        error={errors.productName}
        hint={`Up to ${FIELD_LIMITS.productName} characters`}
        counter={<CharCount value={form.productName} max={FIELD_LIMITS.productName} />}
      >
        <input
          id="field-productName"
          className={`input-base ${errors.productName ? "input-error" : ""}`}
          type="text"
          placeholder="e.g. Handmade Coconut Oil"
          value={form.productName}
          onChange={(e) => set("productName", e.target.value)}
          maxLength={FIELD_LIMITS.productName}
          disabled={isLoading}
          autoComplete="off"
        />
      </Field>

      {/* Description */}
      <Field
        label="Product Description"
        id="field-description"
        required
        error={errors.description}
        counter={<CharCount value={form.description} max={FIELD_LIMITS.description} />}
      >
        <textarea
          id="field-description"
          className={`input-base ${errors.description ? "input-error" : ""}`}
          placeholder="What is special about this product? Ingredients, process, benefits…"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={FIELD_LIMITS.description}
          rows={4}
          disabled={isLoading}
          style={{ resize: "vertical", minHeight: "96px" }}
        />
      </Field>

      {/* Price */}
      <Field
        label="Price"
        id="field-price"
        required
        error={errors.price}
        hint="e.g. ₹299 per kg"
      >
        <input
          id="field-price"
          className={`input-base ${errors.price ? "input-error" : ""}`}
          type="text"
          placeholder="₹299 per kg"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          maxLength={FIELD_LIMITS.price}
          disabled={isLoading}
        />
      </Field>

      {/* Offer */}
      <Field
        label="Current Offer"
        id="field-offer"
        error={errors.offer}
        hint="Optional — e.g. Buy 2 get 1 free"
        counter={<CharCount value={form.offer ?? ""} max={FIELD_LIMITS.offer} />}
      >
        <input
          id="field-offer"
          className={`input-base ${errors.offer ? "input-error" : ""}`}
          type="text"
          placeholder="Buy 2 get 10% off (leave blank if none)"
          value={form.offer ?? ""}
          onChange={(e) => set("offer", e.target.value)}
          maxLength={FIELD_LIMITS.offer}
          disabled={isLoading}
        />
      </Field>

      {/* Target Audience */}
      <Field
        label="Target Audience"
        id="field-targetAudience"
        required
        error={errors.targetAudience}
        hint="Who is this for?"
        counter={<CharCount value={form.targetAudience} max={FIELD_LIMITS.targetAudience} />}
      >
        <input
          id="field-targetAudience"
          className={`input-base ${errors.targetAudience ? "input-error" : ""}`}
          type="text"
          placeholder="e.g. Mothers who prefer natural products"
          value={form.targetAudience}
          onChange={(e) => set("targetAudience", e.target.value)}
          maxLength={FIELD_LIMITS.targetAudience}
          disabled={isLoading}
        />
      </Field>

      {/* Segmented Controls Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
          marginTop: "8px",
        }}
      >
        <SegmentField
          label="Content Type"
          id="field-contentType"
          error={errors.contentType}
          options={Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]}
          value={form.contentType}
          onChange={(v) => set("contentType", v as ContentType)}
          disabled={isLoading}
        />
        <SegmentField
          label="Language"
          id="field-language"
          error={errors.language}
          options={Object.entries(LANGUAGE_LABELS) as [Language, string][]}
          value={form.language}
          onChange={(v) => set("language", v as Language)}
          disabled={isLoading}
        />
        <SegmentField
          label="Tone"
          id="field-tone"
          error={errors.tone}
          options={Object.entries(TONE_LABELS) as [Tone, string][]}
          value={form.tone}
          onChange={(v) => set("tone", v as Tone)}
          disabled={isLoading}
        />
      </div>

      {/* Submit */}
      <div style={{ marginTop: "28px" }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          id="btn-generate"
          style={{ width: "100%", padding: "14px 28px", fontSize: "1rem" }}
        >
          {isLoading ? (
            <>
              <Spinner size={18} />
              Generating…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Generate Content
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ---- helper sub-components ----

interface FieldProps {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  hint?: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, id, required, error, hint, counter, children }: FieldProps) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
        <label htmlFor={id} className="label" style={{ margin: 0 }}>
          {label}
          {required && (
            <span style={{ color: "#dc2626", marginLeft: "3px" }} aria-hidden="true">*</span>
          )}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p style={{ color: "#dc2626", fontSize: "0.8125rem", marginTop: "5px" }} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p style={{ color: "var(--muted)", fontSize: "0.8125rem", marginTop: "5px" }}>{hint}</p>
      ) : null}
    </div>
  );
}

interface SegmentFieldProps<T extends string> {
  label: string;
  id: string;
  error?: string;
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}

function SegmentField<T extends string>({
  label,
  id,
  error,
  options,
  value,
  onChange,
  disabled,
}: SegmentFieldProps<T>) {
  return (
    <div>
      <label className="label" id={`${id}-label`}>
        {label}
      </label>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {options.map(([val, display]) => (
          <label
            key={val}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: `1.5px solid ${value === val ? "var(--accent)" : "var(--border)"}`,
              background: value === val ? "var(--accent-subtle)" : "var(--surface)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
              transition: "border-color 0.15s, background 0.15s",
              fontSize: "0.875rem",
              fontWeight: value === val ? 600 : 400,
              color: value === val ? "var(--accent)" : "var(--foreground)",
            }}
          >
            <input
              type="radio"
              name={id}
              value={val}
              checked={value === val}
              onChange={() => onChange(val)}
              disabled={disabled}
              style={{ display: "none" }}
            />
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: `2px solid ${value === val ? "var(--accent)" : "var(--border)"}`,
                background: value === val ? "var(--accent)" : "transparent",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            />
            {display}
          </label>
        ))}
      </div>
      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.8125rem", marginTop: "5px" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
