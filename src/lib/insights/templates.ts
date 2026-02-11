// ── Insight copy templates ──

interface Template {
  title: string;
  body: string;
}

const TEMPLATES: Record<string, Template> = {
  // ── A1: Competitor Redirect ──
  a1_standard: {
    title: "You spent $${amount} on ${merchant}",
    body: "Your ${benefit} has $${remaining} left — ${action}.",
  },
  a1_with_count: {
    title: "${count} purchases at ${merchant} totaling $${amount}",
    body: "Your $${remaining} ${benefit} credit could cover that.",
  },
  a1_activated: {
    title: "You spent $${amount} on ${merchant} this month",
    body: "Switch to ${partner} to use your $${remaining} credit.",
  },

  // ── A2: Subscription Swap ──
  a2_free: {
    title: "You're paying $${amount}/mo for ${service}",
    body: "Your card includes free ${partner} — that's $${annual}/yr.",
  },
  a2_existing: {
    title: "${service} charge of $${amount}",
    body: "You have complimentary ${partner} — consider using both or switching.",
  },
  a2_swap: {
    title: "${service} isn't covered by your ${credit_name}",
    body: "But ${partner} is — up to $${credit}/mo. Consider switching to save $${annual}/yr.",
  },
  a2_swap_alt: {
    title: "You're paying $${amount}/mo for ${service}",
    body: "${partner} is covered by your $${credit}/mo ${credit_name}. Switching could save you $${annual}/yr.",
  },

  // ── B1: Unused Credit (Time Pressure) ──
  b1_standard: {
    title: "Your ${benefit} resets ${date}",
    body: "You have $${remaining} unused with ${time_left} left.",
  },
  b1_urgent: {
    title: "$${remaining} in ${benefit} credit expires soon",
    body: "Only ${days} days left to use it. Book now.",
  },
  b1_very_late: {
    title: "Last chance: $${remaining} in ${benefit} credit",
    body: "Expires ${date}. Act now or lose it.",
  },
  b1_unactivated_subscription: {
    title: "Activate your free ${benefit}",
    body: "Worth $${monthly}/mo ($${annual}/yr). Activate through your card's benefits portal.",
  },

  // ── B2: Nearly Maxed Credit ──
  b2_standard: {
    title: "You've used $${used} of your $${max} ${benefit} credit",
    body: "$${remaining} left — one more ${action_type} and you've maxed it.",
  },
  b2_close: {
    title: "So close — $${remaining} left on ${benefit}",
    body: "You've already captured $${used} this ${period}.",
  },

  // ── B3: Underused Credit ──
  b3_standard: {
    title: "$${remaining} left on your ${benefit}",
    body: "You've used $${used} of $${max} this ${period}.",
  },
  b3_specific: {
    title: "$${remaining} left on your ${benefit}",
    body: "${hint}",
  },

  // ── C0: Value Snapshot ──
  c0_standard: {
    title: "You've already captured $${total} in benefits",
    body: "That's ${pct_of_fee}% of your annual fee — let's get the rest.",
  },
  c0_strong: {
    title: "Your card is already ${pct_of_fee}% paid off",
    body: "You've captured $${total} in benefits so far. Let's get the rest.",
  },
  c0_low_history: {
    title: "$${total} in benefits captured recently",
    body: "In the last ${months} months — let's make sure you're getting everything.",
  },

  // ── C1: Benefit Maxed ──
  c1_standard: {
    title: "Nice — you maxed your ${benefit}",
    body: "$${value} captured this ${period}.",
  },
  c1_first_time: {
    title: "First time maxing your ${benefit}!",
    body: "$${value} saved.",
  },

  // ── C2: ROI Milestone ──
  c2_break_even: {
    title: "Your card just paid for itself",
    body: "$${total} in benefits captured against your $${fee} annual fee.",
  },
  c2_profitable: {
    title: "You've captured $${total} in benefits",
    body: "That's $${surplus} beyond your annual fee.",
  },
  c2_milestone: {
    title: "$${total} in benefits used this year",
    body: "That's ${multiplier}x your annual fee.",
  },
};

/**
 * Render a template by replacing ${var} placeholders with values.
 */
export function renderTemplate(
  templateKey: string,
  vars: Record<string, string | number>
): { title: string; body: string } {
  const template = TEMPLATES[templateKey];
  if (!template) {
    return { title: "Insight", body: "" };
  }

  const interpolate = (text: string): string =>
    text.replace(/\$\{(\w+)\}/g, (_, key) => {
      const val = vars[key];
      return val !== undefined ? String(val) : `\${${key}}`;
    });

  return {
    title: interpolate(template.title),
    body: interpolate(template.body),
  };
}

/** Get all known template keys. */
export function getTemplateKeys(): string[] {
  return Object.keys(TEMPLATES);
}
