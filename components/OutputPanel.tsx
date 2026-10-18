"use client";

import { useState, useRef } from "react";
import Spinner from "./Spinner";

interface OutputPanelProps {
  content: string | null;
  isLoading: boolean;
  error: string | null;
  model?: string;
  onRegenerate: () => void;
  canRegenerate: boolean;
}

export default function OutputPanel({
  content,
  isLoading,
  error,
  model,
  onRegenerate,
  canRegenerate,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const displayContent = editMode ? editValue : content;

  const handleCopy = async () => {
    const text = editMode ? editValue : content;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const startEdit = () => {
    setEditValue(content ?? "");
    setEditMode(true);
    setTimeout(() => textAreaRef.current?.focus(), 50);
  };

  const saveEdit = () => {
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditValue("");
  };

  // --- Empty / loading state ---
  if (isLoading) {
    return (
      <div
        className="card-elevated"
        style={{
          padding: "32px 28px",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--accent-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent)",
          }}
        >
          <Spinner size={24} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "4px" }}>
            Generating your content…
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            This usually takes 5–20 seconds
          </p>
        </div>
        {/* Skeleton lines */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          {[100, 85, 92, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: "14px", width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="card"
        style={{
          padding: "24px",
          border: "1.5px solid #fca5a5",
          background: "#fff1f2",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div
            style={{
              flexShrink: 0,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: "#991b1b", marginBottom: "4px" }}>Generation Failed</p>
            <p style={{ fontSize: "0.875rem", color: "#7f1d1d" }}>{error}</p>
            {canRegenerate && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onRegenerate}
                style={{ marginTop: "12px" }}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div
        className="card"
        style={{
          padding: "40px 28px",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          border: "2px dashed var(--border)",
          background: "var(--surface-2)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--accent-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p style={{ fontWeight: 600, color: "var(--foreground)" }}>
          Your content will appear here
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", textAlign: "center", maxWidth: "280px" }}>
          Fill in your product details and click &ldquo;Generate Content&rdquo; to get started.
        </p>
      </div>
    );
  }

  // --- Output with content ---
  return (
    <div className="card-elevated animate-fade-in" style={{ overflow: "hidden" }}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--accent)",
            }}
          />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)" }}>
            Generated Content
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {editMode ? (
            <>
              <button type="button" className="btn-ghost" onClick={cancelEdit} id="btn-cancel-edit">
                Cancel
              </button>
              <button type="button" className="btn-secondary" onClick={saveEdit} id="btn-save-edit">
                Save
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-ghost"
                onClick={startEdit}
                disabled={isLoading}
                id="btn-edit"
                title="Edit the generated content"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={onRegenerate}
                disabled={isLoading || !canRegenerate}
                id="btn-regenerate"
                title="Regenerate with the same inputs"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                </svg>
                Regenerate
              </button>
              <button
                type="button"
                className={`btn-ghost ${copied ? "copied" : ""}`}
                onClick={handleCopy}
                id="btn-copy"
                title="Copy to clipboard"
                style={
                  copied
                    ? { color: "var(--accent)", borderColor: "var(--accent)", background: "var(--accent-subtle)" }
                    : {}
                }
              >
                {copied ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: "24px 24px 20px" }}>
        {editMode ? (
          <textarea
            ref={textAreaRef}
            className="input-base"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={10}
            style={{
              resize: "vertical",
              fontFamily: "inherit",
              fontSize: "0.9375rem",
              lineHeight: "1.7",
              minHeight: "160px",
            }}
            aria-label="Edit generated content"
          />
        ) : (
          <p
            style={{
              fontSize: "0.9375rem",
              lineHeight: "1.8",
              color: "var(--foreground)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {displayContent}
          </p>
        )}
      </div>

      {/* Footer disclaimer */}
      <div
        style={{
          padding: "10px 24px 14px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)", flexShrink: 0 }} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
          Powered by Google Gemini via hosted inference
          {model ? ` · ${model}` : ""}
          {" · "}Review before sending. AI may make mistakes.
        </span>
      </div>
    </div>
  );
}
