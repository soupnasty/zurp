"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getRevealData } from "../../actions";
import type { RevealData, RevealLeaderboardRow } from "../../actions";

interface Props {
  userId: string;
  connectionId: string;
  cardName: string;
  cardAnnualFee: number;
  benefitCount: number;
  totalCards: number;
}

type Phase = "processing" | "transitioning" | "reveal";
type StepStatus = "pending" | "active" | "resolved";

const STEP_CONFIG = [
  { duration: 1200, progress: 25 },
  { duration: 1800, progress: 55 },
  { duration: 1200, progress: 80 },
  { duration: 800, progress: 100 },
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

const STEP_GAP = 200;
const INITIAL_DELAY = 400;

function formatDollars(n: number): string {
  const abs = Math.abs(Math.round(n));
  return (n < 0 ? "-" : "") + "$" + abs.toLocaleString("en-US");
}

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

// ── Mini Leaderboard ──

function MiniLeaderboard({
  rows,
  belowCount,
}: {
  rows: RevealLeaderboardRow[];
  belowCount: number;
}) {
  // Find the max absolute net value for proportional bar widths
  const maxNet = Math.max(...rows.map((r) => Math.abs(r.pointsValue + r.benefitsValue)));

  return (
    <div
      style={{
        width: 320,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 14,
        padding: 16,
      }}
    >
      {rows.map((row, i) => {
        const isTop = row.rank === 1;
        const isYou = row.isUsersCard;
        const isDim = !isTop && !isYou;

        // Proportional bar segments
        const ptsW = maxNet > 0 ? (row.pointsValue / maxNet) * 100 : 0;
        const benW = maxNet > 0 ? (row.benefitsValue / maxNet) * 100 : 0;
        const feeW = maxNet > 0 ? (row.annualFee / maxNet) * 100 : 0;

        return (
          <div
            key={row.rank}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: isYou ? "8px 8px" : "8px 0",
              borderTop: i > 0 && !isYou ? "1px solid var(--border-subtle)" : "none",
              background: isYou ? "rgba(34,211,238,0.04)" : "transparent",
              margin: isYou ? "0 -8px" : 0,
              borderRadius: isYou ? 8 : 0,
            }}
          >
            {/* Rank */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                width: 18,
                textAlign: "center",
                flexShrink: 0,
                color: isTop
                  ? "var(--color-success)"
                  : isYou
                    ? "var(--accent)"
                    : "var(--text-dim)",
                opacity: isDim ? 0.4 : 1,
              }}
            >
              {row.rank}
            </span>

            {/* Bar */}
            <div
              style={{
                flex: 1,
                height: 10,
                borderRadius: 3,
                overflow: "hidden",
                display: "flex",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div
                style={{
                  flex: ptsW,
                  background: "#60a5fa",
                  borderRadius: "3px 0 0 3px",
                  opacity: isDim ? 0.2 : 1,
                }}
              />
              {benW > 0 && (
                <div
                  style={{
                    flex: benW,
                    background: "#a78bfa",
                    opacity: isDim ? 0.2 : 1,
                  }}
                />
              )}
              {feeW > 0 && (
                <div
                  style={{
                    flex: feeW,
                    background: "#f87171",
                    borderRadius: "0 3px 3px 0",
                    opacity: isDim ? 0.2 : 1,
                  }}
                />
              )}
            </div>

            {/* Net label */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                width: 72,
                textAlign: "right",
                flexShrink: 0,
                whiteSpace: "nowrap",
                color: isTop
                  ? "var(--color-success)"
                  : isYou
                    ? "var(--accent)"
                    : "var(--text-dim)",
              }}
            >
              {formatDollars(row.netValue)}
              {isYou && " \u2190 you"}
            </span>
          </div>
        );
      })}

      {/* Footer */}
      {belowCount > 0 && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--text-dim)",
            textAlign: "center",
            paddingTop: 10,
            borderTop: "1px solid var(--border-subtle)",
            marginTop: 8,
          }}
        >
          {belowCount} more card{belowCount !== 1 ? "s" : ""} below yours
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

export function ProcessingReveal({
  userId,
  connectionId,
  cardName,
  cardAnnualFee,
  benefitCount,
  totalCards,
}: Props) {
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
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [revealStage, setRevealStage] = useState(0);

  const syncCompleteRef = useRef(false);
  const syncResultRef = useRef<{ added: number } | null>(null);
  const animationsDoneRef = useRef(false);
  const hasStartedRef = useRef(false);

  // Interpolate step task text
  const stepTasks = STEP_TASKS.map((t) =>
    t.replace("{totalCards}", String(totalCards))
  );

  // Update a specific step's result text, showing "Earn rates tracked" for 0 benefits
  const getStep3Result = useCallback(() => {
    return benefitCount > 0
      ? `${benefitCount} benefit${benefitCount !== 1 ? "s" : ""} found on your card`
      : "Earn rates tracked";
  }, [benefitCount]);

  const transitionToReveal = useCallback(
    async (syncData: { added: number } | null) => {
      // Update step 1 result with real transaction count if available
      if (syncData && syncData.added > 0) {
        setStepResults((prev) => {
          const next = [...prev];
          next[0] = `${syncData.added} transaction${syncData.added !== 1 ? "s" : ""} synced`;
          return next;
        });
      }

      // Fetch reveal data
      let data: RevealData | null = null;
      try {
        data = await getRevealData(userId);
      } catch {
        // Fallback: no comparison data
      }
      setRevealData(data);

      // Fade out processing screen
      setPhase("transitioning");

      // After fade out, show reveal
      setTimeout(() => {
        setPhase("reveal");

        // Stagger reveal elements
        setTimeout(() => setRevealStage(1), 0);
        setTimeout(() => setRevealStage(2), 400);
        setTimeout(() => setRevealStage(3), 800);
        setTimeout(() => setRevealStage(4), 1200);
        setTimeout(() => setRevealStage(5), 1600);
      }, 400);
    },
    [userId]
  );

  const checkBothDone = useCallback(() => {
    if (syncCompleteRef.current && animationsDoneRef.current) {
      transitionToReveal(syncResultRef.current);
    }
  }, [transitionToReveal]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // 1. Fire sync in background
    fetch("/api/plaid/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        syncResultRef.current = data;
        syncCompleteRef.current = true;
        checkBothDone();
      })
      .catch(() => {
        syncCompleteRef.current = true;
        checkBothDone();
      });

    // 2. Run step animation sequence
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let delay = INITIAL_DELAY;

    STEP_CONFIG.forEach((step, i) => {
      // Activate step
      timeouts.push(
        setTimeout(() => {
          setStepStates((prev) => {
            const next = [...prev];
            next[i] = "active";
            return next;
          });
        }, delay)
      );

      // Show result mid-step
      timeouts.push(
        setTimeout(() => {
          setShowResult((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          setProgress(step.progress);
        }, delay + step.duration * 0.6)
      );

      // Resolve step
      timeouts.push(
        setTimeout(() => {
          setStepStates((prev) => {
            const next = [...prev];
            next[i] = "resolved";
            return next;
          });
        }, delay + step.duration)
      );

      delay += step.duration + STEP_GAP;
    });

    // Animations done
    timeouts.push(
      setTimeout(() => {
        animationsDoneRef.current = true;
        checkBothDone();
      }, delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [connectionId, checkBothDone, getStep3Result]);

  // ── Render ──

  const isWin = revealData?.headline.type === "win";

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
          transition: "all 1s ease",
          background:
            phase === "reveal"
              ? "radial-gradient(ellipse, rgba(96,165,250,0.05) 0%, rgba(34,211,238,0.02) 40%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(34,211,238,0.03) 0%, transparent 70%)",
        }}
      />

      {/* ── PHASE 1: Processing ── */}
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
                  opacity: status === "pending" ? 0 : status === "resolved" ? 0.3 : 1,
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
                    <span style={{ color: "var(--color-success)", fontSize: 14 }}>
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

      {/* ── PHASE 2: Reveal ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          opacity: phase === "reveal" ? 1 : 0,
          pointerEvents: phase === "reveal" ? "auto" : "none",
          transition: "opacity 0.6s ease",
          overflowY: "auto",
          padding: "40px 16px",
        }}
      >
        {revealData ? (
          <>
            {/* Card outline */}
            <div
              style={{
                width: 280,
                height: 170,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                position: "relative",
                overflow: "hidden",
                marginBottom: 36,
                opacity: revealStage >= 1 ? 1 : 0,
                transform:
                  revealStage >= 1
                    ? "scale(1) translateY(0)"
                    : "scale(0.95) translateY(12px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              {/* Top edge glow */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(34,211,238,0.2), transparent)",
                }}
              />

              {/* Card name */}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  textAlign: "center",
                  padding: "0 20px",
                }}
              >
                {revealData.cardName}
              </div>

              {/* Fee */}
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-dim)",
                }}
              >
                {cardAnnualFee > 0
                  ? `$${cardAnnualFee}/yr annual fee`
                  : "No annual fee"}
              </div>

              {/* Rank badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderBottom: "none",
                  borderRadius: "12px 12px 0 0",
                  padding: "6px 20px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                  opacity: revealStage >= 1 ? 1 : 0,
                  transition: "opacity 0.5s ease 0.3s",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                  }}
                >
                  #
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {revealData.rank}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                  }}
                >
                  of {revealData.totalCards}
                </span>
              </div>
            </div>

            {/* Headline */}
            <div
              style={{
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "-0.5px",
                marginBottom: 8,
                opacity: revealStage >= 2 ? 1 : 0,
                transform:
                  revealStage >= 2 ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              {isWin
                ? `Your card is #1 out of ${revealData.totalCards}`
                : `Your card ranks #${revealData.rank} out of ${revealData.totalCards}`}
            </div>

            {/* Gap / value section */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 40,
                opacity: revealStage >= 3 ? 1 : 0,
                transform:
                  revealStage >= 3 ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              {isWin ? (
                <>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "clamp(40px, 6vw, 56px)",
                      fontWeight: 700,
                      color: "var(--color-success)",
                      letterSpacing: "-2px",
                      lineHeight: 1.1,
                    }}
                  >
                    {formatDollars(revealData.netValue)}
                    <span style={{ fontSize: "0.5em", letterSpacing: 0 }}>
                      /yr
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "var(--text-secondary)",
                      marginTop: 6,
                    }}
                  >
                    You have the best card for your spending
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "clamp(40px, 6vw, 56px)",
                      fontWeight: 700,
                      color: "var(--color-success)",
                      letterSpacing: "-2px",
                      lineHeight: 1.1,
                    }}
                  >
                    +{formatDollars(revealData.headline.margin)}
                    <span style={{ fontSize: "0.5em", letterSpacing: 0 }}>
                      /yr
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "var(--text-secondary)",
                      marginTop: 6,
                    }}
                  >
                    more value available on the #1 card
                  </div>
                </>
              )}
            </div>

            {/* Mini leaderboard */}
            <div
              style={{
                marginBottom: 36,
                opacity: revealStage >= 4 ? 1 : 0,
                transform:
                  revealStage >= 4 ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              <MiniLeaderboard
                rows={revealData.leaderboard}
                belowCount={revealData.belowCount}
              />
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                window.location.href = "/benefits";
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 36px",
                background: "var(--accent)",
                color: "var(--bg-primary)",
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                border: "none",
                borderRadius: 12,
                letterSpacing: "-0.2px",
                opacity: revealStage >= 5 ? 1 : 0,
                transform:
                  revealStage >= 5 ? "translateY(0)" : "translateY(12px)",
                transition:
                  "opacity 0.5s ease, transform 0.5s ease, background 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#06b6d4";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(34,211,238,0.2), 0 2px 8px rgba(34,211,238,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              See your full results
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </>
        ) : (
          /* ── Fallback: No comparison data ── */
          <>
            {/* Card outline (no rank badge) */}
            <div
              style={{
                width: 280,
                height: 170,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                position: "relative",
                overflow: "hidden",
                marginBottom: 36,
                opacity: revealStage >= 1 ? 1 : 0,
                transform:
                  revealStage >= 1
                    ? "scale(1) translateY(0)"
                    : "scale(0.95) translateY(12px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(34,211,238,0.2), transparent)",
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  textAlign: "center",
                  padding: "0 20px",
                }}
              >
                {cardName}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                {cardAnnualFee > 0
                  ? `$${cardAnnualFee}/yr annual fee`
                  : "No annual fee"}
              </div>
            </div>

            {/* Headline */}
            <div
              style={{
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "-0.5px",
                marginBottom: 8,
                opacity: revealStage >= 2 ? 1 : 0,
                transform:
                  revealStage >= 2 ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              Your card is connected
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                textAlign: "center",
                marginBottom: 40,
                maxWidth: 360,
                opacity: revealStage >= 3 ? 1 : 0,
                transform:
                  revealStage >= 3 ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              We&apos;re tracking your benefits. Check back as transactions
              come in.
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                window.location.href = "/benefits";
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 36px",
                background: "var(--accent)",
                color: "var(--bg-primary)",
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                border: "none",
                borderRadius: 12,
                letterSpacing: "-0.2px",
                opacity: revealStage >= 4 ? 1 : 0,
                transform:
                  revealStage >= 4 ? "translateY(0)" : "translateY(12px)",
                transition:
                  "opacity 0.5s ease, transform 0.5s ease, background 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#06b6d4";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(34,211,238,0.2), 0 2px 8px rgba(34,211,238,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Go to your dashboard
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
