import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { db } from "@/db";
import { eq, asc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardDefinition, getAllCardDefinitions } from "@/lib/cards";
import { getEarnConfig } from "@/lib/points/earn-configs";
import { classifyForPoints } from "@/lib/points/categories";
import { calculatePointsForTransaction } from "@/lib/points/calculator";
import { normalizeMerchantName, matchesMerchantPattern } from "./normalize";
import { getCurrentCycleBounds, isDateInCycle, daysRemainingInCycle } from "./cycle-utils";
import { runMatcher } from "./matcher";
import { computeBenefitsValue } from "@/lib/points/valuation";
import type { CapState } from "@/lib/points/types";
import type {
  BenefitCycle,
  BenefitDefinition,
  CardDefinition,
  MatcherTransaction,
} from "@/lib/types";

interface TxMatchInfo {
  benefitName: string;
  creditApplied: number;
  confidence: string;
}

interface TxPointsInfo {
  category: string;
  rate: number;
  points: number;
  capApplied: boolean;
}

interface UnmatchedCandidate {
  datetime: string;
  merchant: string;
  amount: number;
  benefitName: string;
  reason: string;
}

interface SummaryCards {
  pointsEarned: number;
  pointsValue: number;
  conservativeCpp: number;
  benefitsUsed: number;
  creditsAvailable: number;
  annualFee: number;
  netValue: number;
  expiringSoon: number;
}

/**
 * Write debug transaction reports to .debug/transactions-{cardType}.tsv
 * for ALL card types. Dev-only — no-op in production.
 */
export async function writeDebugReport(
  plaidConnectionId: string
): Promise<void> {
  if (process.env.NODE_ENV !== "development") return;

  // ── Fetch shared context ──
  const connection = await db.query.plaidConnections.findFirst({
    where: eq(schema.plaidConnections.id, plaidConnectionId),
  });
  if (!connection) return;

  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.plaidConnectionId, plaidConnectionId),
  });
  if (!cardProfile) return;

  // Fetch ALL transactions with real match data (used for user's card report)
  const allTransactions = await db.query.transactions.findMany({
    where: eq(schema.transactions.plaidConnectionId, plaidConnectionId),
    orderBy: [asc(schema.transactions.datetime), asc(schema.transactions.date)],
    with: {
      matches: {
        with: {
          benefitUsage: {
            with: {
              benefit: true,
            },
          },
        },
      },
    },
  });

  if (allTransactions.length === 0) return;

  // Pre-classify all transactions (category assignment is card-independent)
  const classifications = new Map<
    string,
    ReturnType<typeof classifyForPoints>
  >();
  for (const tx of allTransactions) {
    classifications.set(
      tx.id,
      classifyForPoints(
        tx.merchantName,
        tx.plaidCategoryPrimary,
        tx.plaidCategoryDetailed
      )
    );
  }

  // Build MatcherTransaction[] for simulated cards
  const matcherTxns: MatcherTransaction[] = allTransactions
    .filter((tx) => tx.amount > 0 && !tx.pending)
    .map((tx) => ({
      id: tx.id,
      date: tx.date,
      merchantName: tx.merchantName,
      merchantNameRaw: tx.merchantNameRaw,
      amount: tx.amount,
      plaidCategoryPrimary: tx.plaidCategoryPrimary,
      plaidCategoryDetailed: tx.plaidCategoryDetailed,
      pending: false,
      matchedStatus: "unmatched" as const,
    }));

  // Fetch real benefit usage for user's card (unmatched candidate analysis)
  const usageRecords = await db.query.benefitUsage.findMany({
    where: eq(schema.benefitUsage.cardProfileId, cardProfile.id),
  });
  const usageLookup = new Map<string, (typeof usageRecords)[number]>();
  for (const u of usageRecords) {
    usageLookup.set(`${u.benefitId}:${u.periodKey}`, u);
  }

  // Ensure .debug/ dir exists
  const outDir = join(process.cwd(), ".debug");
  mkdirSync(outDir, { recursive: true });

  // ── Generate a report for every card type ──
  const allCardDefs = getAllCardDefinitions();

  for (const targetCardDef of allCardDefs) {
    const isUsersCard = targetCardDef.id === cardProfile.cardType;
    const targetEarnConfig = getEarnConfig(targetCardDef.id);

    // ── Points calculation (card-specific earn rates) ──
    const capState: CapState = {};
    const txPointsResults = new Map<string, TxPointsInfo>();

    if (targetEarnConfig) {
      for (const tx of allTransactions) {
        // Skip payment transactions (negative amounts) — they should not earn or lose points
        if (tx.amount <= 0) continue;

        const assignment = classifications.get(tx.id)!;
        const result = calculatePointsForTransaction(
          {
            id: tx.id,
            merchantName: tx.merchantName,
            amount: tx.amount,
            category: assignment.category,
            confidence: assignment.confidence,
            date: tx.date,
            datetime: tx.datetime,
          },
          targetEarnConfig,
          capState
        );
        txPointsResults.set(tx.id, {
          category: assignment.category,
          rate: result.earnRate,
          points: result.points,
          capApplied: result.capApplied,
        });
      }
    }

    // ── Match data ──
    const txMatchData = new Map<string, TxMatchInfo>();
    // Track simulated usage for unmatched candidate "benefit fully used" detection
    const simUsage = new Map<string, number>();

    if (isUsersCard) {
      // Real match data from DB
      for (const tx of allTransactions) {
        const match = tx.matches[0];
        if (match) {
          txMatchData.set(tx.id, {
            benefitName: match.benefitUsage?.benefit?.name ?? "—",
            creditApplied: match.creditApplied,
            confidence: match.matchConfidence,
          });
        }
      }
    } else {
      // Simulate matching with target card's benefits
      const simBenefits: BenefitDefinition[] = targetCardDef.benefits.map(
        (b) => ({ ...b, autoMatchable: true })
      );
      const simResult = runMatcher(matcherTxns, {
        benefits: simBenefits,
        usageMap: new Map(),
        anniversaryDate: cardProfile.anniversaryDate,
      });

      // Build benefit name lookup
      const benefitNames = new Map<string, string>();
      for (const b of targetCardDef.benefits) {
        benefitNames.set(b.id, b.name);
      }

      for (const match of simResult.matches) {
        txMatchData.set(match.transactionId, {
          benefitName: benefitNames.get(match.benefitId) ?? "—",
          creditApplied: match.creditApplied,
          confidence: match.matchConfidence,
        });
      }

      // Track per-benefit usage from simulation for unmatched analysis
      for (const match of simResult.matches) {
        const prev = simUsage.get(match.benefitId) ?? 0;
        simUsage.set(match.benefitId, prev + match.creditApplied);
      }
    }

    // ── Unmatched candidates ──
    const unmatchedCandidates: UnmatchedCandidate[] = [];
    const matchedTxIds = new Set(txMatchData.keys());

    for (const tx of allTransactions) {
      if (matchedTxIds.has(tx.id)) continue;

      const normalized = normalizeMerchantName(tx.merchantName);
      if (!normalized) continue;

      for (const benefit of targetCardDef.benefits) {
        if (benefit.merchantPatterns.length === 0) continue;
        if (!matchesMerchantPattern(normalized, benefit.merchantPatterns))
          continue;

        const reason = diagnoseUnmatched(
          tx,
          benefit,
          cardProfile.anniversaryDate,
          isUsersCard ? usageLookup : null,
          isUsersCard ? null : simUsage
        );

        const dt = tx.datetime ?? tx.date;
        unmatchedCandidates.push({
          datetime: formatDatetime(dt, !!tx.datetime),
          merchant: tx.merchantName ?? "",
          amount: tx.amount,
          benefitName: benefit.name,
          reason,
        });
      }
    }

    // ── Summary cards ──
    const summary = computeSummaryCards(
      targetCardDef,
      targetEarnConfig,
      txMatchData,
      txPointsResults,
      isUsersCard ? usageLookup : null,
      isUsersCard ? null : simUsage,
      cardProfile.anniversaryDate
    );

    // ── Build report ──
    const lines = buildReportLines({
      targetCardDef,
      cardProfile,
      allTransactions,
      txMatchData,
      txPointsResults,
      unmatchedCandidates,
      isUsersCard,
      summary,
    });

    const filename = `transactions-${targetCardDef.id}.tsv`;
    writeFileSync(join(outDir, filename), lines.join("\n"), "utf-8");
  }

  console.log(
    `[debug-report] Wrote ${allCardDefs.length} reports (${allTransactions.length} txns each)`
  );
}

// ── Helpers ──

function computeSummaryCards(
  cardDef: CardDefinition,
  earnConfig: ReturnType<typeof getEarnConfig>,
  txMatchData: Map<string, TxMatchInfo>,
  txPointsResults: Map<string, TxPointsInfo>,
  realUsageLookup: Map<string, { amountUsed: number; isFullyUsed: boolean }> | null,
  simUsage: Map<string, number> | null,
  anniversaryDate: Date | null
): SummaryCards {
  // Points earned
  let pointsEarned = 0;
  for (const pts of txPointsResults.values()) {
    pointsEarned += pts.points;
  }
  const conservativeCpp = earnConfig?.valuation.conservativeCpp ?? 0;
  const pointsValue = Math.round(pointsEarned * conservativeCpp) / 100;

  // Benefits used (total credits matched)
  let benefitsUsed = 0;
  for (const m of txMatchData.values()) {
    benefitsUsed += m.creditApplied;
  }
  benefitsUsed = Math.round(benefitsUsed * 100) / 100;

  // Credits available (annualized catalog value)
  const creditsAvailable = computeBenefitsValue(cardDef.id);

  // Net value
  const annualFee = cardDef.annualFee;
  const netValue = Math.round((pointsValue + benefitsUsed - annualFee) * 100) / 100;

  // Expiring soon: benefits with ≤14 days remaining in current cycle
  const now = new Date();
  let expiringSoon = 0;

  for (const benefit of cardDef.benefits) {
    if (benefit.type === "subscription" || benefit.creditAmount <= 0) continue;
    if (benefit.activeMonths && !benefit.activeMonths.includes(now.getMonth())) continue;

    const days = daysRemainingInCycle(
      benefit.cycle as BenefitCycle,
      now,
      anniversaryDate
    );
    if (days > 14) continue;

    // Determine remaining credit for this benefit
    let used = 0;
    if (realUsageLookup) {
      const bounds = getCurrentCycleBounds(
        benefit.cycle as BenefitCycle,
        now,
        anniversaryDate
      );
      const usage = realUsageLookup.get(`${benefit.id}:${bounds.periodKey}`);
      used = usage?.amountUsed ?? 0;
    } else if (simUsage) {
      used = simUsage.get(benefit.id) ?? 0;
    }

    const remaining = Math.max(0, benefit.creditAmount - used);
    expiringSoon += remaining;
  }
  expiringSoon = Math.round(expiringSoon * 100) / 100;

  return {
    pointsEarned,
    pointsValue,
    conservativeCpp,
    benefitsUsed,
    creditsAvailable,
    annualFee,
    netValue,
    expiringSoon,
  };
}

function diagnoseUnmatched(
  tx: { date: Date },
  benefit: BenefitDefinition,
  anniversaryDate: Date | null,
  realUsageLookup: Map<string, { isFullyUsed: boolean }> | null,
  simUsage: Map<string, number> | null
): string {
  if (!benefit.autoMatchable) return "not auto-matchable";

  if (
    benefit.activeMonths &&
    !benefit.activeMonths.includes(tx.date.getMonth())
  ) {
    return "outside active months";
  }

  if (
    !isDateInCycle(
      tx.date,
      benefit.cycle as BenefitCycle,
      tx.date,
      anniversaryDate
    )
  ) {
    return "outside active cycle";
  }

  // Check if benefit was fully consumed
  if (realUsageLookup) {
    const bounds = getCurrentCycleBounds(
      benefit.cycle as BenefitCycle,
      tx.date,
      anniversaryDate
    );
    const usage = realUsageLookup.get(`${benefit.id}:${bounds.periodKey}`);
    if (usage && usage.isFullyUsed) return "benefit fully used for period";
  }

  if (simUsage) {
    const used = simUsage.get(benefit.id) ?? 0;
    if (used >= benefit.creditAmount) return "benefit fully used (simulated)";
  }

  return "no match produced by engine";
}

function buildReportLines(opts: {
  targetCardDef: CardDefinition;
  cardProfile: { id: string; anniversaryDate: Date | null; cardType: string };
  allTransactions: { id: string; date: Date; datetime: Date | null; merchantName: string | null; amount: number; matchedStatus: string; plaidCategoryPrimary: string | null; plaidCategoryDetailed: string | null; pending: boolean }[];
  txMatchData: Map<string, TxMatchInfo>;
  txPointsResults: Map<string, TxPointsInfo>;
  unmatchedCandidates: UnmatchedCandidate[];
  isUsersCard: boolean;
  summary: SummaryCards;
}): string[] {
  const {
    targetCardDef,
    cardProfile,
    allTransactions,
    txMatchData,
    txPointsResults,
    unmatchedCandidates,
    isUsersCard,
    summary,
  } = opts;

  const matchedCount = isUsersCard
    ? allTransactions.filter((t) => t.matchedStatus === "matched").length
    : txMatchData.size;
  let totalCredits = 0;
  let totalPoints = 0;

  const lines: string[] = [];

  // Header — compute actual card year from anniversary cycle bounds
  const cardYearBounds = getCurrentCycleBounds(
    "annual_anniversary",
    new Date(),
    cardProfile.anniversaryDate
  );
  const annStart = formatShortDate(cardYearBounds.cycleStart);
  const annEnd = formatShortDate(cardYearBounds.cycleEnd);

  const modeLabel = isUsersCard ? "ACTUAL" : "SIMULATED";
  lines.push(`TRANSACTION DEBUG REPORT [${modeLabel}]`);
  lines.push(
    `Card: ${targetCardDef.name}${isUsersCard ? ` | Profile: ${cardProfile.id.slice(0, 8)}` : " (simulated against your transactions)"}`
  );
  lines.push(`Card Year: ${annStart} – ${annEnd}`);
  lines.push(`Generated: ${new Date().toISOString()}`);

  // Summary cards
  const sign = summary.netValue >= 0 ? "+" : "-";
  lines.push("");
  lines.push("SUMMARY CARDS");
  lines.push(
    `Points Earned:   $${summary.pointsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  (${summary.pointsEarned.toLocaleString()} pts × ${summary.conservativeCpp}¢)`
  );
  lines.push(
    `Benefits Used:   $${summary.benefitsUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} of $${summary.creditsAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} available`
  );
  lines.push(
    `Net Value:       ${sign}$${Math.abs(summary.netValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  ($${summary.pointsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts + $${summary.benefitsUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} credits - $${summary.annualFee} fee)`
  );
  lines.push(
    `Expiring Soon:   $${summary.expiringSoon.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  (within 14 days)`
  );

  // Column definitions
  lines.push("");
  lines.push("COLUMN DEFINITIONS");
  lines.push("DATETIME       Transaction date/time (authorized_datetime > datetime > date fallback)");
  lines.push("MERCHANT       Raw merchant name from Plaid (merchant_name or tx name)");
  lines.push("NORMALIZED     Merchant name after normalization (lowercase, stripped IDs/order numbers) — what the matcher sees");
  lines.push("AMOUNT         Transaction amount in USD (positive = charge, negative = refund)");
  lines.push("PENDING        PEND if transaction is still pending (skipped by engine), — if settled");
  lines.push("PLAID_PRIMARY  Plaid personal_finance_category primary (e.g. FOOD_AND_DRINK, TRANSPORTATION)");
  lines.push("PLAID_DETAILED Plaid personal_finance_category detailed (e.g. FOOD_AND_DRINK_RESTAURANT)");
  lines.push("STATUS         Match status: matched/unmatched (ACTUAL reports use DB status, SIMULATED re-run matcher)");
  lines.push("BENEFIT        Name of the matched benefit (e.g. Dining Credit, Uber Cash)");
  lines.push("CREDIT         Dollar amount of credit applied from the benefit for this transaction");
  lines.push("CONF           Match confidence: high (merchant + amount), medium (merchant only), low (category fallback)");
  lines.push("PTS_CAT        Points earn category from classifyForPoints (26-category taxonomy, e.g. dining, groceries)");
  lines.push("RATE           Earn rate multiplier for this card (e.g. 3x, 1x) — may be reduced if cap hit");
  lines.push("POINTS         Points earned for this transaction (rate × dollar amount, rounded)");
  lines.push("CAP            CAP if a spending cap was applied (earn rate fell to base), — otherwise");

  // Transaction rows
  const txRows: string[] = [];
  const colHeader = [
    "DATETIME",
    "MERCHANT",
    "NORMALIZED",
    "AMOUNT",
    "PENDING",
    "PLAID_PRIMARY",
    "PLAID_DETAILED",
    "STATUS",
    "BENEFIT",
    "CREDIT",
    "CONF",
    "PTS_CAT",
    "RATE",
    "POINTS",
    "CAP",
  ].join("\t");

  for (const tx of allTransactions) {
    const dt = tx.datetime ?? tx.date;
    const datetimeStr = formatDatetime(dt, !!tx.datetime);
    const merchant = (tx.merchantName ?? "").padEnd(25).slice(0, 25);
    const normalized = (normalizeMerchantName(tx.merchantName) ?? "—").padEnd(25).slice(0, 25);
    const amount = tx.amount.toFixed(2).padStart(9);

    const matchInfo = txMatchData.get(tx.id);
    const status = isUsersCard
      ? tx.matchedStatus.padEnd(10)
      : (matchInfo ? "matched" : "unmatched").padEnd(10);

    let benefitName = "—";
    let credit = "—";
    let conf = "—";
    if (matchInfo) {
      benefitName = matchInfo.benefitName;
      credit = matchInfo.creditApplied.toFixed(2).padStart(8);
      conf = matchInfo.confidence;
      totalCredits += matchInfo.creditApplied;
    }

    const ptsData = txPointsResults.get(tx.id);
    let ptsCat = "—";
    let rate = "—";
    let points = "—";
    let cap = "—";
    if (ptsData) {
      ptsCat = ptsData.category.padEnd(16).slice(0, 16);
      rate = `${ptsData.rate}x`;
      points = String(ptsData.points).padStart(6);
      cap = ptsData.capApplied ? "CAP" : "—";
      totalPoints += ptsData.points;
    }

    txRows.push(
      [
        datetimeStr,
        merchant,
        normalized,
        amount,
        tx.pending ? "PEND" : "—",
        (tx.plaidCategoryPrimary ?? "—").padEnd(18).slice(0, 18),
        (tx.plaidCategoryDetailed ?? "—").padEnd(30).slice(0, 30),
        status,
        benefitName.padEnd(21).slice(0, 21),
        credit,
        conf,
        ptsCat,
        rate,
        points,
        cap,
      ].join("\t")
    );
  }

  // Summary line
  lines.push(
    `Transactions: ${allTransactions.length} | Matched: ${matchedCount} | Credits: $${totalCredits.toFixed(2)} | Points: ${totalPoints.toLocaleString()}`
  );
  lines.push("");
  lines.push(colHeader);
  lines.push(...txRows);

  // Unmatched candidates
  if (unmatchedCandidates.length > 0) {
    lines.push("");
    lines.push(
      "UNMATCHED CANDIDATES (transactions hitting benefit merchant patterns but not captured)"
    );
    lines.push(
      ["DATETIME", "MERCHANT", "AMOUNT", "BENEFIT", "REASON"].join("\t")
    );
    for (const c of unmatchedCandidates) {
      lines.push(
        [
          c.datetime,
          c.merchant.padEnd(25).slice(0, 25),
          c.amount.toFixed(2).padStart(9),
          c.benefitName.padEnd(21).slice(0, 21),
          c.reason,
        ].join("\t")
      );
    }
  }

  return lines;
}

function formatDatetime(d: Date, hasTime: boolean): string {
  if (hasTime) return d.toISOString();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00:00Z`;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
