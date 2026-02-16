"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LifestylePicker } from "./LifestylePicker";

interface Props {
  userId: string;
  connectionId: string;
  cardType: string;
  benefitCount: number;
  totalCards: number;
}

type Phase = "processing" | "picker" | "transitioning";
type StepStatus = "pending" | "active" | "resolved";

const STEP_CONFIG = [
  { duration: 2000, progress: 25 },
  { duration: 2800, progress: 55 },
  { duration: 2000, progress: 80 },
  { duration: 1400, progress: 100 },
];

const STEP_TASKS = [
  "Reading your transactions...",
  "Simulating {totalCards} cards...",
  "Mapping your benefits...",
  "Calculating your results...",
];

const DEFAULT_RESULTS = [
  "Transactions synced",
  "Points, benefits, and fees calculated",
  "{benefitCount} benefits found on your card",
  "Done",
];

const STEP_GAP = 400;
const INITIAL_DELAY = 600;

// ── Processing Logo (A2 z-path fill) ──

function ProcessingLogo() {
  return (
    <svg
      width="64"
      height="48"
      viewBox="0 0 46 36"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="42"
        height="30"
        rx="5"
        fill="#0a0e17"
        stroke="#22d3ee"
        strokeWidth="1.5"
      />
      <clipPath id="pr-t">
        <rect x="8" y="9" width="30" height="6" rx="3" />
      </clipPath>
      <g clipPath="url(#pr-t)">
        <rect
          x="8"
          y="9"
          width="18"
          height="6"
          fill="#60a5fa"
          style={{ animation: "z-fill 2.4s ease-in-out infinite" }}
        />
        <rect
          x="26"
          y="9"
          width="6.5"
          height="6"
          fill="#a78bfa"
          style={{
            animation: "z-fill 2.4s ease-in-out infinite",
            animationDelay: "0.24s",
          }}
        />
        <rect
          x="32.5"
          y="9"
          width="5.5"
          height="6"
          fill="#f87171"
          style={{
            animation: "z-fill 2.4s ease-in-out infinite",
            animationDelay: "0.48s",
          }}
        />
      </g>
      <clipPath id="pr-b">
        <rect x="8" y="19" width="30" height="6" rx="3" />
      </clipPath>
      <g clipPath="url(#pr-b)">
        <rect
          x="8"
          y="19"
          width="5.5"
          height="6"
          fill="#f87171"
          opacity="0.5"
          style={{
            animation: "z-fill-dim 2.4s ease-in-out infinite",
            animationDelay: "0.72s",
          }}
        />
        <rect
          x="13.5"
          y="19"
          width="6.5"
          height="6"
          fill="#a78bfa"
          opacity="0.5"
          style={{
            animation: "z-fill-dim 2.4s ease-in-out infinite",
            animationDelay: "0.96s",
          }}
        />
        <rect
          x="20"
          y="19"
          width="18"
          height="6"
          fill="#60a5fa"
          opacity="0.5"
          style={{
            animation: "z-fill-dim 2.4s ease-in-out infinite",
            animationDelay: "1.2s",
          }}
        />
      </g>
    </svg>
  );
}

// ── Main Component ──

export function ProcessingReveal({
  connectionId,
  benefitCount,
  totalCards,
}: Props) {
  // Flow: processing → picker → redirect to compare
  const [phase, setPhase] = useState<Phase>("processing");
  const [stepStates, setStepStates] = useState<StepStatus[]>([
    "pending",
    "pending",
    "pending",
    "pending",
  ]);
  const [stepResults, setStepResults] = useState<string[]>(
    DEFAULT_RESULTS.map((r) =>
      r
        .replace("{benefitCount}", String(benefitCount))
        .replace("{totalCards}", String(totalCards))
    )
  );
  const [showResult, setShowResult] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [progress, setProgress] = useState(0);

  const syncCompleteRef = useRef(false);
  const syncResultRef = useRef<{ added: number } | null>(null);
  const animationsDoneRef = useRef(false);
  const hasStartedRef = useRef(false);

  // Interpolate step task text
  const stepTasks = STEP_TASKS.map((t) =>
    t.replace("{totalCards}", String(totalCards))
  );

  // Transition from processing → picker once animation + sync are done
  const transitionToPicker = useCallback(
    (syncData: { added: number } | null) => {
      // Update step 1 result with real transaction count if available
      if (syncData && syncData.added > 0) {
        setStepResults((prev) => {
          const next = [...prev];
          next[0] = `${syncData.added} transaction${
            syncData.added !== 1 ? "s" : ""
          } synced`;
          return next;
        });
      }

      // Fade to picker
      setPhase("transitioning");
      setTimeout(() => setPhase("picker"), 400);
    },
    []
  );

  // After picker is submitted, save selections + redirect to compare page
  const handlePickerComplete = useCallback(
    async (selectedKeys: string[]) => {
      setPhase("transitioning");

      try {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lifestyleKeys: selectedKeys }),
        });
      } catch {
        // Fail silently — selections can be changed later on compare page
      }

      window.location.href = "/dashboard/compare";
    },
    []
  );

  const checkAllDone = useCallback(() => {
    if (syncCompleteRef.current && animationsDoneRef.current) {
      transitionToPicker(syncResultRef.current);
    }
  }, [transitionToPicker]);

  // Fire sync + start processing animation immediately on mount
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Start sync in background
    fetch("/api/plaid/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        syncResultRef.current = data;
        syncCompleteRef.current = true;
        checkAllDone();
      })
      .catch(() => {
        syncCompleteRef.current = true;
        checkAllDone();
      });

    // Start processing animation
    let delay = INITIAL_DELAY;
    STEP_CONFIG.forEach((step, i) => {
      setTimeout(() => {
        setStepStates((prev) => { const n = [...prev]; n[i] = "active"; return n; });
      }, delay);
      setTimeout(() => {
        setShowResult((prev) => { const n = [...prev]; n[i] = true; return n; });
        setProgress(step.progress);
      }, delay + step.duration * 0.6);
      setTimeout(() => {
        setStepStates((prev) => { const n = [...prev]; n[i] = "resolved"; return n; });
      }, delay + step.duration);
      delay += step.duration + STEP_GAP;
    });
    setTimeout(() => {
      animationsDoneRef.current = true;
      checkAllDone();
    }, delay);
  }, [connectionId, checkAllDone]);

  // ── Render ──

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 500,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse, rgba(34,211,238,0.03) 0%, transparent 70%)",
        }}
      />

      {/* ── PHASE 0: Processing ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          transition: "opacity 0.4s ease",
          opacity: phase === "processing" ? 1 : 0,
          pointerEvents: phase === "processing" ? "auto" : "none",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <ProcessingLogo />
        </div>

        {/* Status lines */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            minHeight: 160,
            width: 400,
            maxWidth: "90vw",
          }}
        >
          {stepTasks.map((task, i) => {
            const status = stepStates[i];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: status === "resolved" ? 12 : 20,
                  opacity:
                    status === "pending" ? 0 : status === "resolved" ? 0.3 : 1,
                  transform:
                    status === "pending"
                      ? "translateY(8px)"
                      : status === "resolved"
                      ? "translateY(-4px)"
                      : "translateY(0)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                {/* Task text with spinner/check */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {status === "resolved" ? (
                    <span
                      style={{ color: "var(--color-success)", fontSize: 14 }}
                    >
                      ✓
                    </span>
                  ) : status === "active" ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        border: "2px solid var(--border-subtle)",
                        borderTopColor: "var(--accent)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : null}
                  {task}
                </div>

                {/* Result text */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent)",
                    opacity: showResult[i] ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  {stepResults[i]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: 200,
            height: 2,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 1,
            marginTop: 32,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 1,
              background: "var(--accent)",
              width: `${progress}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* ── PHASE 1: Lifestyle Picker ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
          transition: "opacity 0.4s ease",
          opacity: phase === "picker" ? 1 : 0,
          pointerEvents: phase === "picker" ? "auto" : "none",
          overflowY: "auto",
          padding: "48px 0 64px",
        }}
      >
        <LifestylePicker onComplete={handlePickerComplete} />
      </div>
    </div>
  );
}
