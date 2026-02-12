/**
 * Inline SVG logo components for card issuers.
 * Each renders at viewBox="0 0 24 24" and inherits `currentColor`.
 * Used by CardChip at 15% opacity in the top-right corner.
 */

function ChaseLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 9.5h8V1.5h5v4.25L9.5 9.5H1.5zm13 0V1.5h-4.25L14.5 6.5V9.5zM14.5 1.5h0" fill="currentColor"/>
      <path fill="currentColor" d="M9.5 1.5h5v8h8v5h-4.25L14.5 9.5V1.5zM14.5 14.5h8v-4.25L18.5 14.5h-4zM22.5 9.5h0"/>
      <path fill="currentColor" d="M22.5 14.5h-8v8h-5v-4.25l4.75-3.75h8.25zM9.5 14.5v8h4.25L9.5 17.5v-3z"/>
      <path fill="currentColor" d="M14.5 22.5h-5v-8h-8v-5h4.25l3.75 4.75V22.5zM9.5 9.5h-8v4.25L5.5 9.5h4z"/>
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="5" width="22" height="14" rx="1.5" fill="currentColor"/>
      <path d="M3.8 15l2.7-5.2h1.8l2.7 5.2H9.3l-.5-1H6.2l-.5 1H3.8zM6.7 12.8h1.6L7.5 11l-.8 1.8z" fill="#0a0e17"/>
      <path d="M11.2 15V9.8h2.5l1.5 3.3 1.4-3.3h2.5V15h-1.6v-3.8L15.8 15h-1.4l-1.6-3.8V15h-1.6z" fill="#0a0e17"/>
    </svg>
  );
}

function CitiLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 18C4 10.3 8.5 4 13 4s7.5 4.5 9 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="7" cy="18" r="1.2" fill="currentColor"/>
    </svg>
  );
}

function CapitalOneLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 19C6 11 11 5 18 3" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M14.5 3H18V6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function RobinhoodLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 22L10 11c1.5-3.5 4.5-7 9-8-1 3-1.5 6-1.5 9-2.5.5-5 1.5-7 3.5l3-3c-2.5 2.5-5 5.5-8 9.5h-2z" fill="currentColor"/>
      <path d="M19 3c.5 0 1.5.3 2 .8S22 5 22 5.5c-1-.2-2-.3-3-.3" fill="currentColor"/>
    </svg>
  );
}

function BiltLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3h7c2.5 0 4.5 1.5 4.5 3.8 0 1.5-.8 2.6-2 3.2 1.6.5 2.8 2 2.8 3.8 0 2.8-2.2 4.5-5 4.5H3V3zm4.2 5.8H9c1 0 1.8-.6 1.8-1.5S10 5.8 9 5.8H7.2v3zm0 6.2h2.3c1.2 0 2.2-.7 2.2-1.8 0-1-.9-1.7-2.2-1.7H7.2V15z" fill="currentColor"/>
      <rect x="17" y="3" width="3.5" height="15.3" rx=".5" fill="currentColor"/>
    </svg>
  );
}

function WellsFargoLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 7l3.5 12h1.5L9 10.5 12 19h1.5L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M19 7v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 7h3v8c0 2.2-1.3 4-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function DiscoverLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.5" fill="currentColor"/>
      <path d="M8.5 12c0-2.5 1.5-4.5 3.5-4.5" stroke="#0a0e17" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.2"/>
    </svg>
  );
}

function USBankLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4h18v12c0 2.5-2 4.5-4.5 4.5H7.5C5 20.5 3 18.5 3 16V4z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <path d="M7.5 8v5c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M14 15c.8.8 1.8 1 2.8.8 1-.3 1.7-1 1.7-2s-.7-1.6-1.8-2c-1-.3-1.7-.8-1.7-1.6 0-.8.6-1.4 1.5-1.4.7 0 1.2.3 1.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function HiltonLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M7.5 6.5v11M7.5 12h9M16.5 6.5v11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function HyattLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M8 6.5v11M8 12h8M16 6.5v11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

function IHGLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 5v14" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M7.5 5v14M7.5 12h5M12.5 5v14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M17 8.5c1-1.5 2.5-2 4-1.8 1.5.3 2.5 1.5 2.5 3.3v4c0 1.8-1 3-2.5 3.3-1.5.2-3-.3-4-1.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M19 12h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function DeltaLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2l16 10L4 22V2z" fill="currentColor"/>
    </svg>
  );
}

function UnitedLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <ellipse cx="12" cy="12" rx="4.5" ry="10.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <line x1="1.5" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3 7.5h18M3 16.5h18" stroke="currentColor" strokeWidth=".8"/>
    </svg>
  );
}

function SouthwestLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" fill="currentColor"/>
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor"/>
    </svg>
  );
}

/** Lookup map: issuer key → logo component */
export const ISSUER_LOGOS: Record<string, () => React.JSX.Element> = {
  chase: ChaseLogo,
  amex: AmexLogo,
  citi: CitiLogo,
  capital_one: CapitalOneLogo,
  robinhood: RobinhoodLogo,
  bilt: BiltLogo,
  wells_fargo: WellsFargoLogo,
  discover: DiscoverLogo,
  us_bank: USBankLogo,
  hilton: HiltonLogo,
  hyatt: HyattLogo,
  ihg: IHGLogo,
  delta: DeltaLogo,
  united: UnitedLogo,
  southwest: SouthwestLogo,
  apple: AppleLogo,
};
