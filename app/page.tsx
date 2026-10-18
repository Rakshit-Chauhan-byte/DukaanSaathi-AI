"use client";

import { useState, useCallback, useEffect } from "react";
import type { GenerateRequest, DraftEntry } from "@/lib/types";
import { saveDraft, getDrafts } from "@/lib/storage";
import ProductForm from "@/components/ProductForm";
import OutputPanel from "@/components/OutputPanel";
import DraftHistory from "@/components/DraftHistory";

interface GenerationState {
  content: string | null;
  isLoading: boolean;
  error: string | null;
  model?: string;
}

const initial: GenerationState = {
  content: null,
  isLoading: false,
  error: null,
};

export default function HomePage() {
  const [state, setState] = useState<GenerationState>(initial);
  const [lastRequest, setLastRequest] = useState<GenerateRequest | null>(null);
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);

  // Load drafts on mount (client-only)
  useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  const refreshDrafts = useCallback(() => {
    setDrafts(getDrafts());
  }, []);

  const generate = useCallback(async (data: GenerateRequest) => {
    setLastRequest(data);
    setState({ content: null, isLoading: true, error: null });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setState({
          content: null,
          isLoading: false,
          error: json.error ?? `Request failed (HTTP ${res.status}).`,
        });
        return;
      }

      const content: string = json.content;
      setState({ content, isLoading: false, error: null, model: json.model });

      // Persist to localStorage
      saveDraft(data, content);
      setDrafts(getDrafts());
    } catch (err: unknown) {
      let message = "Network error. Please check your connection and try again.";
      if (err instanceof Error && err.message) {
        if (err.message.includes("Failed to fetch")) {
          message = "Could not reach the server. Please check your internet connection.";
        }
      }
      setState({ content: null, isLoading: false, error: message });
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (lastRequest) generate(lastRequest);
  }, [lastRequest, generate]);

  const handleLoadDraft = useCallback((draft: DraftEntry) => {
    setState({ content: draft.content, isLoading: false, error: null });
    setLastRequest(draft.request);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── Header ─── */}
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}>
                DukaanSathi
              </span>
              <span
                style={{
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  marginLeft: "6px",
                  verticalAlign: "middle",
                }}
              >
                AI
              </span>
            </div>
          </div>
          <span
            className="badge"
            style={{ fontSize: "0.72rem" }}
          >
            Free Preview
          </span>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, #f0faf4 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "40px 24px 36px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: "99px",
              marginBottom: "16px",
              border: "1px solid rgba(45,106,79,0.2)",
            }}
          >
            <span>🇮🇳</span>
            <span>Made for Indian small businesses</span>
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
              marginBottom: "14px",
            }}
          >
            Write better marketing content
            <br />
            <span style={{ color: "var(--accent)" }}>in seconds</span>
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--muted)",
              lineHeight: 1.6,
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            Generate WhatsApp promos, product listings, and customer replies —
            in English, Hindi, or Hinglish — powered by open-source AI.
          </p>
        </div>
      </section>

      {/* ─── Main content ─── */}
      <main
        style={{
          flex: 1,
          padding: "32px 24px 60px",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "28px",
            alignItems: "start",
          }}
          className="main-grid"
        >
          {/* Left — Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card-elevated" style={{ padding: "28px" }}>
              <ProductForm onGenerate={generate} isLoading={state.isLoading} />
            </div>
            <DraftHistory
              drafts={drafts}
              onLoad={handleLoadDraft}
              onRefresh={refreshDrafts}
            />
          </div>

          {/* Right — Output */}
          <div style={{ position: "sticky", top: "80px" }}>
            <OutputPanel
              content={state.content}
              isLoading={state.isLoading}
              error={state.error}
              model={state.model}
              onRegenerate={handleRegenerate}
              canRegenerate={lastRequest !== null && !state.isLoading}
            />
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "20px 24px",
          background: "var(--surface)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
          DukaanSathi AI — an open-source Hacktoberfest side project &nbsp;·&nbsp;
          Powered by Google Gemini &nbsp;·&nbsp;
          Content is AI-generated; always review before publishing &nbsp;·&nbsp;
          Your data is sent to Google servers for inference
        </p>
      </footer>

      {/* Responsive grid style */}
      <style>{`
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
          .main-grid > div:last-child {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
