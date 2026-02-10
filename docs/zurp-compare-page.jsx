import { useState } from "react";

const SAMPLE_DATA = {
  analysisMonths: 12,
  totalSpend: 62400,
  userCard: "csr",
  cards: {
    csr: {
      id: "csr",
      name: "Chase Sapphire Reserve",
      shortName: "CSR",
      fee: 795,
      pointsValue: 565,
      benefitsTotal: 2060,
      benefitsCaptured: 1450,
      color: "#1a3c6e",
      accent: "#2d6bc4",
      cpp: 1.25,
    },
    gold: {
      id: "gold",
      name: "Amex Gold",
      shortName: "Gold",
      fee: 325,
      pointsValue: 520,
      benefitsTotal: 424,
      benefitsCaptured: null,
      color: "#8B6914",
      accent: "#C4972A",
      cpp: 1.0,
    },
    csp: {
      id: "csp",
      name: "Chase Sapphire Preferred",
      shortName: "CSP",
      fee: 95,
      pointsValue: 480,
      benefitsTotal: 290,
      benefitsCaptured: null,
      color: "#1a5276",
      accent: "#2e86c1",
      cpp: 1.25,
    },
  },
  categories: [
    {
      id: "dining",
      label: "Dining",
      icon: "🍽",
      spend: 8400,
      txns: 156,
      rates: { csr: 3, gold: 4, csp: 3 },
    },
    {
      id: "grocery",
      label: "Groceries",
      icon: "🛒",
      spend: 6200,
      txns: 104,
      rates: { csr: 1, gold: 4, csp: 1 },
      note: "Gold 4x capped at $25K/yr",
    },
    {
      id: "travel_flights",
      label: "Flights",
      icon: "✈️",
      spend: 3200,
      txns: 8,
      rates: { csr: 4, gold: 3, csp: 2 },
    },
    {
      id: "food_delivery",
      label: "Food Delivery",
      icon: "🥡",
      spend: 2800,
      txns: 86,
      rates: { csr: 3, gold: 4, csp: 3 },
    },
    {
      id: "streaming",
      label: "Streaming",
      icon: "📺",
      spend: 1440,
      txns: 48,
      rates: { csr: 1, gold: 1, csp: 3 },
    },
    {
      id: "rideshare",
      label: "Rideshare",
      icon: "🚗",
      spend: 1800,
      txns: 44,
      rates: { csr: 5, gold: 1, csp: 5 },
      note: "5x on Lyft only",
    },
    {
      id: "travel_hotels",
      label: "Hotels",
      icon: "🏨",
      spend: 2400,
      txns: 6,
      rates: { csr: 4, gold: 1, csp: 2 },
    },
    {
      id: "coffee",
      label: "Coffee",
      icon: "☕",
      spend: 960,
      txns: 72,
      rates: { csr: 3, gold: 4, csp: 3 },
    },
    {
      id: "gas",
      label: "Gas",
      icon: "⛽",
      spend: 2400,
      txns: 52,
      rates: { csr: 1, gold: 1, csp: 1 },
    },
    {
      id: "shopping_online",
      label: "Online Shopping",
      icon: "📦",
      spend: 8200,
      txns: 94,
      rates: { csr: 1, gold: 1, csp: 1 },
    },
    {
      id: "other",
      label: "Other",
      icon: "•",
      spend: 24400,
      txns: 377,
      rates: { csr: 1, gold: 1, csp: 1 },
    },
  ],
  perks: [
    {
      section: "Benefits",
      tracked: true,
      rows: [
        { label: "Travel", csr: "$300", gold: "—", csp: "$50" },
        { label: "Hotel", csr: "$750", gold: "—", csp: "—" },
        { label: "Dining", csr: "$300", gold: "$220", csp: "—" },
        { label: "DoorDash", csr: "$300", gold: "—", csp: "$120" },
        { label: "Events", csr: "$300", gold: "—", csp: "—" },
        { label: "Streaming", csr: "~$250", gold: "—", csp: "—" },
        { label: "Rideshare", csr: "$120", gold: "$120", csp: "—" },
        { label: "Fitness", csr: "$120", gold: "—", csp: "—" },
        { label: "Coffee", csr: "—", gold: "$84", csp: "—" },
      ],
    },
    {
      section: "Travel Perks",
      tracked: false,
      rows: [
        { label: "Airport lounge", csr: "Priority Pass + Sapphire", gold: "—", csp: "—" },
        { label: "Hotel status", csr: "IHG Platinum", gold: "—", csp: "—" },
        { label: "Global Entry/TSA", csr: "✓", gold: "—", csp: "—" },
        { label: "DashPass", csr: "✓", gold: "—", csp: "✓" },
        { label: "Travel concierge", csr: "Reserve Designer", gold: "—", csp: "—" },
      ],
    },
    {
      section: "Protections & Insurance",
      tracked: false,
      rows: [
        { label: "Auto rental CDW", csr: "Primary", gold: "Secondary", csp: "Primary" },
        { label: "Trip cancellation", csr: "✓", gold: "—", csp: "✓" },
        { label: "Trip delay", csr: "✓", gold: "—", csp: "✓" },
        { label: "Lost luggage", csr: "✓", gold: "—", csp: "✓" },
        { label: "Purchase protection", csr: "✓", gold: "✓", csp: "✓" },
        { label: "Extended warranty", csr: "✓", gold: "✓", csp: "✓" },
        { label: "Return protection", csr: "—", gold: "✓", csp: "—" },
        { label: "Roadside assistance", csr: "✓", gold: "✓", csp: "✓" },
      ],
    },
    {
      section: "Transfer Partners",
      tracked: false,
      rows: [
        { label: "Hotel partners", csr: "Hyatt, IHG, Marriott", gold: "Hilton, Choice", csp: "Hyatt, IHG, Marriott" },
        { label: "Airline partners", csr: "United, SW, BA", gold: "Delta, JB, ANA", csp: "United, SW, BA" },
      ],
    },
  ],
  cardLinks: {
    csr: {
      name: "Chase Sapphire Reserve",
      links: [
        { label: "Benefits overview", url: "https://www.chase.com/personal/credit-cards/sapphire/reserve" },
        { label: "Rewards & earn rates", url: "https://www.chase.com/personal/credit-cards/sapphire/reserve/earn-rewards" },
        { label: "Transfer partners", url: "https://ultimaterewardspoints.chase.com/transfer-partners" },
        { label: "Insurance & protections", url: "https://www.chase.com/personal/credit-cards/sapphire/reserve/card-benefits" },
      ],
    },
    gold: {
      name: "Amex Gold",
      links: [
        { label: "Benefits overview", url: "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card" },
        { label: "Rewards & earn rates", url: "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card/rewards" },
        { label: "Transfer partners", url: "https://global.americanexpress.com/rewards/transfer" },
        { label: "Insurance & protections", url: "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card/benefits" },
      ],
    },
    csp: {
      name: "Chase Sapphire Preferred",
      links: [
        { label: "Benefits overview", url: "https://www.chase.com/personal/credit-cards/sapphire/preferred" },
        { label: "Rewards & earn rates", url: "https://www.chase.com/personal/credit-cards/sapphire/preferred/earn-rewards" },
        { label: "Transfer partners", url: "https://ultimaterewardspoints.chase.com/transfer-partners" },
        { label: "Insurance & protections", url: "https://www.chase.com/personal/credit-cards/sapphire/preferred/card-benefits" },
      ],
    },
  },
};

function calcNetValue(card) {
  const benefits = card.benefitsCaptured !== null ? card.benefitsCaptured : card.benefitsTotal;
  return card.pointsValue + benefits - card.fee;
}

function calcPointsForCategory(cat, cardId, cpp) {
  const pts = cat.spend * cat.rates[cardId];
  return { points: pts, value: (pts * cpp) / 100 };
}

function fmt(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtPts(n) {
  return n.toLocaleString("en-US");
}

export default function ZurpCompare() {
  const [expandedCats, setExpandedCats] = useState(true);
  const [showPerks, setShowPerks] = useState(true);
  const [activeTab, setActiveTab] = useState("value");

  const d = SAMPLE_DATA;
  const cardOrder = ["csr", "gold", "csp"];
  const cards = cardOrder.map((id) => ({ ...d.cards[id], netValue: calcNetValue(d.cards[id]) }));
  const best = cards.reduce((a, b) => (a.netValue > b.netValue ? a : b));
  const userCard = cards.find((c) => c.id === d.userCard);
  const secondBest = cards.filter((c) => c.id !== best.id).reduce((a, b) => (a.netValue > b.netValue ? a : b));
  const margin = best.netValue - secondBest.netValue;
  const maxNet = Math.max(...cards.map((c) => c.netValue));

  const interestingCats = d.categories.filter((cat) => {
    const rates = cardOrder.map((id) => cat.rates[id]);
    return new Set(rates).size > 1;
  });
  const boringCats = d.categories.filter((cat) => {
    const rates = cardOrder.map((id) => cat.rates[id]);
    return new Set(rates).size === 1;
  });
  const boringSpend = boringCats.reduce((s, c) => s + c.spend, 0);

  const CardLinks = () => (
    <div style={{
      marginTop: 20,
      padding: "20px 12px 0",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: "#6B7A8D",
        textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: 14,
      }}>
        Learn more from the source
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {cardOrder.map((id) => {
          const cl = d.cardLinks[id];
          return (
            <div key={id} style={{ flex: "1 1 200px", minWidth: 180 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#C5CED9", marginBottom: 6 }}>
                {cl.name}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {cl.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12,
                      color: "#5B9BD5",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {link.label} <span style={{ fontSize: 10, opacity: 0.6 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F14",
      color: "#E8ECF1",
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .mono { font-family: 'DM Mono', 'SF Mono', monospace; }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .card-bar { transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .hover-row:hover { background: rgba(255,255,255,0.03); }
        .tab-btn { transition: all 0.2s; cursor: pointer; }
        .tab-btn:hover { background: rgba(255,255,255,0.06); }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 64px" }}>

        {/* Header */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, #2d6bc4 0%, #7C3AED 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>Z</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#6B7A8D", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Zurp Compare
          </span>
        </div>

        {/* Section 1: Verdict */}
        <div className="fade-in" style={{
          padding: "28px 0 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 10, letterSpacing: "-0.02em" }}>
            {d.userCard === best.id ? (
              <>Your {userCard.shortName} earned you <span style={{ color: "#34D399" }}>{fmt(userCard.netValue)}</span> in net value</>
            ) : (
              <>The {best.shortName} would earn you <span style={{ color: "#34D399" }}>{fmt(margin)} more</span> per year</>
            )}
          </h1>
          <p style={{ fontSize: 15, color: "#7B8A9D", lineHeight: 1.5 }}>
            {d.userCard === best.id
              ? `That's ${fmt(margin)} more than the next best card for your spending pattern. Based on ${d.analysisMonths} months of transactions across ${fmt(d.totalSpend)} in total spend.`
              : `Based on your ${fmt(d.totalSpend)} in spending over ${d.analysisMonths} months, the ${best.name} would deliver more value than your current ${userCard.name}.`}
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: "flex", gap: 4, padding: "16px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {[
            { id: "value", label: "Total Value" },
            { id: "categories", label: "By Category" },
            { id: "perks", label: "Benefits & Perks" },
          ].map((tab) => (
            <button
              key={tab.id}
              className="tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: activeTab === tab.id ? "rgba(255,255,255,0.08)" : "transparent",
                color: activeTab === tab.id ? "#E8ECF1" : "#6B7A8D",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "inherit",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section 2: Total Value */}
        {activeTab === "value" && (
          <div className="fade-in" style={{ padding: "24px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cards.sort((a, b) => {
                if (a.id === d.userCard) return -1;
                if (b.id === d.userCard) return 1;
                return b.netValue - a.netValue;
              }).map((card, i) => {
                const isUser = card.id === d.userCard;
                const grossMax = Math.max(...cards.map((c) => c.pointsValue + c.benefitsTotal));
                const ptsW = (card.pointsValue / grossMax) * 100;
                const benW = ((card.benefitsCaptured ?? card.benefitsTotal) / grossMax) * 100;

                return (
                  <div
                    key={card.id}
                    style={{
                      background: isUser ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
                      borderRadius: 12,
                      padding: "20px 24px",
                      border: isUser ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 600 }}>{card.name}</span>
                          {isUser && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, color: "#34D399",
                              background: "rgba(52,211,153,0.1)", padding: "2px 8px",
                              borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase",
                            }}>Your card</span>
                          )}
                          {card.id === best.id && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, color: "#FBBF24",
                              background: "rgba(251,191,36,0.1)", padding: "2px 8px",
                              borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase",
                            }}>Best value</span>
                          )}
                        </div>
                        <span style={{ fontSize: 13, color: "#6B7A8D" }}>{fmt(card.fee)}/yr annual fee</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: card.netValue > 0 ? "#34D399" : "#F87171" }}>
                          {fmt(card.netValue)}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7A8D" }}>net value / yr</div>
                      </div>
                    </div>

                    {/* Stacked bar */}
                    <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", background: "rgba(0,0,0,0.3)", marginBottom: 12 }}>
                      <div
                        className="card-bar"
                        style={{
                          width: `${ptsW}%`,
                          background: card.accent,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 600, color: "#fff",
                          minWidth: ptsW > 8 ? "auto" : 0,
                        }}
                      >
                        {ptsW > 12 && `Points ${fmt(card.pointsValue)}`}
                      </div>
                      <div
                        className="card-bar"
                        style={{
                          width: `${benW}%`,
                          background: `${card.accent}88`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 600, color: "#fff",
                          minWidth: benW > 8 ? "auto" : 0,
                        }}
                      >
                        {benW > 12 && `Benefits ${fmt(card.benefitsCaptured ?? card.benefitsTotal)}`}
                      </div>
                    </div>

                    {/* Breakdown row */}
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#7B8A9D" }}>
                      <span>Points: <span className="mono" style={{ color: "#C5CED9" }}>{fmt(card.pointsValue)}</span></span>
                      <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
                      <span>Benefits: <span className="mono" style={{ color: "#C5CED9" }}>
                        {isUser
                          ? <>{fmt(card.benefitsCaptured)} <span style={{ color: "#6B7A8D" }}>of {fmt(card.benefitsTotal)}</span></>
                          : <>{fmt(card.benefitsTotal)} <span style={{ color: "#6B7A8D", fontSize: 11 }}>available</span></>}
                      </span></span>
                      <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
                      <span>Fee: <span className="mono" style={{ color: "#F87171" }}>−{fmt(card.fee)}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16, fontSize: 12, color: "#4B5C6E", lineHeight: 1.5 }}>
              Points valued at conservative rates (Chase UR: 1.25¢, Amex MR: 1.0¢). Transfer partner redemptions can yield higher value.
              {cards.find(c => c.id === d.userCard)?.benefitsCaptured !== null &&
                " Your card shows benefits actually captured; other cards show total available benefits."
              }
            </div>
            <CardLinks />
          </div>
        )}

        {/* Section 3: Category Breakdown */}
        {activeTab === "categories" && (
          <div className="fade-in" style={{ padding: "24px 0" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Header row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr repeat(3, 100px)",
                gap: 8,
                padding: "0 12px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 11,
                fontWeight: 600,
                color: "#6B7A8D",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                <div>Category</div>
                {cardOrder.map((id) => (
                  <div key={id} style={{ textAlign: "right" }}>{d.cards[id].shortName}</div>
                ))}
              </div>

              {/* Interesting categories (different earn rates) */}
              {interestingCats.sort((a, b) => b.spend - a.spend).map((cat) => {
                const values = cardOrder.map((id) => ({
                  id,
                  ...calcPointsForCategory(cat, id, d.cards[id].cpp),
                  rate: cat.rates[id],
                }));
                const maxVal = Math.max(...values.map((v) => v.value));
                const winner = values.find((v) => v.value === maxVal);

                return (
                  <div
                    key={cat.id}
                    className="hover-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr repeat(3, 100px)",
                      gap: 8,
                      padding: "14px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 15 }}>{cat.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{cat.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#4B5C6E", marginTop: 2, paddingLeft: 24 }}>
                        {fmt(cat.spend)} · {cat.txns} txns
                      </div>
                      {cat.note && (
                        <div style={{ fontSize: 11, color: "#6B7A8D", marginTop: 2, paddingLeft: 24, fontStyle: "italic" }}>
                          {cat.note}
                        </div>
                      )}
                    </div>
                    {values.map((v) => {
                      const isWinner = v.id === winner.id && values.filter((x) => x.value === maxVal).length === 1;
                      return (
                        <div key={v.id} style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                            <span className="mono" style={{
                              fontSize: 14, fontWeight: 600,
                              color: isWinner ? "#34D399" : "#C5CED9",
                            }}>
                              {fmt(v.value)}
                            </span>
                            {isWinner && <span style={{ fontSize: 11 }}>👑</span>}
                          </div>
                          <div className="mono" style={{ fontSize: 11, color: "#6B7A8D" }}>
                            {v.rate}x · {fmtPts(v.points)} pts
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Boring categories (same earn rate) */}
              <div
                className="hover-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr repeat(3, 100px)",
                  gap: 8,
                  padding: "14px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  alignItems: "center",
                  opacity: 0.5,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#6B7A8D" }}>
                    Other spending (all 1x)
                  </div>
                  <div style={{ fontSize: 12, color: "#4B5C6E", marginTop: 2 }}>
                    {fmt(boringSpend)} · gas, shopping, bills, etc.
                  </div>
                </div>
                {cardOrder.map((id) => {
                  const val = boringSpend * d.cards[id].cpp / 100;
                  return (
                    <div key={id} style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: "#6B7A8D" }}>
                        {fmt(val)}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: "#4B5C6E" }}>
                        1x · {fmtPts(boringSpend)} pts
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr repeat(3, 100px)",
                gap: 8,
                padding: "16px 12px 0",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                marginTop: 4,
                alignItems: "center",
              }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Total points value</div>
                {cardOrder.map((id) => {
                  const card = d.cards[id];
                  const totalPts = d.categories.reduce((s, cat) => s + cat.spend * cat.rates[id], 0);
                  const totalVal = (totalPts * card.cpp) / 100;
                  return (
                    <div key={id} style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "#E8ECF1" }}>
                        {fmt(totalVal)}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: "#6B7A8D" }}>
                        {fmtPts(totalPts)} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <CardLinks />
          </div>
        )}

        {/* Section 4: Benefits & Perks */}
        {activeTab === "perks" && (
          <div className="fade-in" style={{ padding: "24px 0" }}>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr repeat(3, 90px)",
              gap: 8,
              padding: "0 12px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div />
              {cardOrder.map((id) => (
                <div key={id} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#C5CED9" }}>{d.cards[id].shortName}</div>
                  <div style={{ fontSize: 11, color: "#4B5C6E" }}>{fmt(d.cards[id].fee)}/yr</div>
                </div>
              ))}
            </div>

            {d.perks.map((section) => (
              <div key={section.section}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "#6B7A8D",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "16px 12px 8px",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {section.section}
                  {section.tracked && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, color: "#2d6bc4",
                      background: "rgba(45,107,196,0.12)", padding: "1px 6px",
                      borderRadius: 3, letterSpacing: "0.04em",
                    }}>TRACKED BY ZURP</span>
                  )}
                  {section.section}
                </div>
                {section.rows.map((row) => {
                  const vals = [row.csr, row.gold, row.csp];
                  return (
                    <div
                      key={row.label}
                      className="hover-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr repeat(3, 90px)",
                        gap: 8,
                        padding: "10px 12px",
                        borderBottom: "1px solid rgba(255,255,255,0.02)",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontSize: 13, color: "#C5CED9" }}>{row.label}</div>
                      {vals.map((val, i) => (
                        <div key={i} style={{
                          textAlign: "center",
                          fontSize: 13,
                          fontWeight: val !== "—" ? 500 : 400,
                          color: val === "—" ? "#2D3A47" : val === "✓" ? "#34D399" : "#C5CED9",
                        }}>
                          {val}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Total benefits row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr repeat(3, 90px)",
              gap: 8,
              padding: "16px 12px 0",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              marginTop: 4,
              alignItems: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total benefits</div>
              {cardOrder.map((id) => (
                <div key={id} className="mono" style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: "#E8ECF1" }}>
                  {fmt(d.cards[id].benefitsTotal)}
                </div>
              ))}
            </div>

            <CardLinks />
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 32,
          padding: "20px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: 12,
          color: "#3D4D5E",
          lineHeight: 1.5,
        }}>
          Based on {d.analysisMonths} months of transaction data · {d.categories.reduce((s, c) => s + c.txns, 0).toLocaleString()} transactions · {fmt(d.totalSpend)} total spend
          <br />
          Zurp shows the math — you make the call. No affiliate links. No card recommendations.
        </div>
      </div>
    </div>
  );
}
