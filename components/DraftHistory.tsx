"use client";

import { useState, useCallback, useRef } from "react";
import type { DraftEntry } from "@/lib/types";
import { CONTENT_TYPE_LABELS, LANGUAGE_LABELS } from "@/lib/types";
import { deleteDraft, clearDrafts } from "@/lib/storage";

interface DraftHistoryProps {
  drafts: DraftEntry[];
  onLoad: (draft: DraftEntry) => void;
  onRefresh: () => void;
}

export default function DraftHistory({ drafts, onLoad, onRefresh }: DraftHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteDraft(id);
      onRefresh();
    },
    [onRefresh]
  );

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      confirmTimeout.current = setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearDrafts();
    setConfirmClear(false);
    onRefresh();
  };

  if (drafts.length === 0) return null;

  return (
    <div className="card" style={{ overflow: "hidden", marginTop: "0" }}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
        id="btn-toggle-history"
        aria-expanded={expanded}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }} aria-hidden="true">
            <path d="M3 3h6l3 8h-2l-1 3H5l-1-3H3z" />
            <path d="M15 3h6l3 8h-2l-1 3h-4l-1-3h-2z" />
            <path d="M9 19h6" />
            <path d="M12 16v3" />
          </svg>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>
            Draft History
          </span>
          <span className="badge">{drafts.length}</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: "var(--muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {/* Drafts list */}
          <div style={{ maxHeight: "340px", overflowY: "auto" }}>
            {drafts.map((draft) => (
              <div
                key={draft.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                }
                onClick={() => onLoad(draft)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onLoad(draft)}
                aria-label={`Load draft: ${draft.request.productName}`}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {draft.request.productName}
                    </span>
                    <span className="badge" style={{ flexShrink: 0, fontSize: "0.7rem" }}>
                      {CONTENT_TYPE_LABELS[draft.request.contentType]}
                    </span>
                    <span className="badge" style={{ flexShrink: 0, fontSize: "0.7rem" }}>
                      {LANGUAGE_LABELS[draft.request.language]}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--muted)",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      marginBottom: "4px",
                    }}
                  >
                    {draft.content}
                  </p>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                    {new Date(draft.timestamp).toLocaleString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(draft.id, e)}
                  style={{
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: "4px",
                    borderRadius: "6px",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#dc2626")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--muted)")}
                  aria-label="Delete draft"
                  title="Delete this draft"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 20px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleClearAll}
              id="btn-clear-history"
              style={confirmClear ? { color: "#dc2626", borderColor: "#dc2626" } : {}}
            >
              {confirmClear ? "Confirm clear all?" : "Clear all"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
