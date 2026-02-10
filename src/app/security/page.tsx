import Link from "next/link";

export const metadata = {
  title: "Security — zurp",
};

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-[var(--space-3xl)]">
      <Link
        href="/"
        className="text-[var(--text-caption)] text-[var(--text-secondary)] hover:text-[var(--accent)]"
      >
        &larr; Back
      </Link>

      <article className="mt-[var(--space-lg)] space-y-[var(--space-lg)] text-[var(--text-secondary)]">
        <header>
          <h1 className="text-h1 font-semibold tracking-tight text-[var(--text-primary)]">
            Security Overview
          </h1>
          <p className="mt-2">
            <strong className="text-[var(--text-primary)]">Zurp, LLC</strong>
            <br />
            Last Updated: February 9, 2026
          </p>
        </header>

        {/* 1. Our Security Commitment */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            1. Our Security Commitment
          </h2>
          <p>
            Zurp is a credit card benefit optimization platform that processes
            sensitive financial data &mdash; your transaction history, account
            metadata, and spending patterns. We take this responsibility
            seriously. This document describes the security architecture,
            practices, and controls we implement to protect your data at every
            layer of the Service.
          </p>
          <p>
            Our guiding principle is{" "}
            <strong className="text-[var(--text-primary)]">
              minimal data, minimal access, maximal protection.
            </strong>{" "}
            We collect only the data required to generate benefit insights. We
            grant access only to the personnel and systems that need it. And we
            encrypt, monitor, and audit everything in between.
          </p>
        </section>

        {/* 2. Architecture Overview */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            2. Architecture Overview
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            2.1 Data Flow
          </h3>
          <p>
            Zurp&apos;s architecture is designed so that your most sensitive
            credentials never touch our systems:
          </p>
          <div className="overflow-x-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 font-mono text-sm">
            <pre>{`Your Bank        Plaid            Zurp
(credentials  <-> (auth broker  <-> (read-only
 stay here)       + data pipe)      analytics)`}</pre>
          </div>
          <ol className="ml-[var(--space-lg)] list-decimal space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                You authenticate with your bank through Plaid&apos;s interface.
              </strong>{" "}
              Your bank login credentials are submitted directly to
              Plaid&apos;s servers via their encrypted SDK. Zurp&apos;s
              frontend, backend, and infrastructure never receive, process,
              transmit, or store your bank username or password.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Plaid retrieves your financial data and transmits it to Zurp.
              </strong>{" "}
              Plaid returns a tokenized access credential and your authorized
              data (transactions, account metadata) to Zurp&apos;s backend
              over encrypted channels. The access token allows Zurp to request
              data refreshes from Plaid &mdash; it cannot be used to log in to
              your bank, initiate payments, or take any action on your
              accounts.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Zurp processes the data and generates insights.
              </strong>{" "}
              Transaction data is matched against benefit catalogs, competitor
              maps, and temporal rules to produce personalized insights. All
              processing happens server-side. Results are delivered to your
              browser over HTTPS.
            </li>
          </ol>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            2.2 Read-Only by Design
          </h3>
          <p>
            Zurp&apos;s integration with Plaid uses only read-only API
            products:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-primary)]">
                  <th className="pb-2 pr-4 font-semibold">Plaid Product</th>
                  <th className="pb-2 pr-4 font-semibold">What It Does</th>
                  <th className="pb-2 font-semibold">What Zurp Uses It For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border-default)]">
                  <td className="py-2 pr-4">Transactions</td>
                  <td className="py-2 pr-4">
                    Retrieves transaction history (up to 24 months)
                  </td>
                  <td className="py-2">
                    Insight engine: benefit tracking, competitor detection,
                    spending analysis
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Accounts</td>
                  <td className="py-2 pr-4">
                    Retrieves account metadata (name, type, institution, last
                    four digits)
                  </td>
                  <td className="py-2">Card identification and display</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong className="text-[var(--text-primary)]">
              Products we do NOT use:
            </strong>{" "}
            Auth (account/routing numbers), Balance, Transfer (money movement),
            Payment Initiation, Identity, Income, Liabilities, Investments, or
            any product that enables write access to your financial accounts.
            Zurp cannot move money, initiate payments, change account settings,
            or take any action on your behalf.
          </p>
        </section>

        {/* 3. Encryption */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            3. Encryption
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            3.1 In Transit
          </h3>
          <p>
            All data transmitted between any two components of the Zurp system
            is encrypted:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-primary)]">
                  <th className="pb-2 pr-4 font-semibold">Path</th>
                  <th className="pb-2 pr-4 font-semibold">Protocol</th>
                  <th className="pb-2 font-semibold">Minimum Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                <tr>
                  <td className="py-2 pr-4">Your browser &harr; Zurp servers</td>
                  <td className="py-2 pr-4">HTTPS (TLS)</td>
                  <td className="py-2">TLS 1.2+; TLS 1.3 preferred</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Your browser &harr; Plaid Link SDK
                  </td>
                  <td className="py-2 pr-4">HTTPS (TLS)</td>
                  <td className="py-2">TLS 1.2+ (Plaid-managed)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Zurp servers &harr; Plaid API</td>
                  <td className="py-2 pr-4">HTTPS (TLS)</td>
                  <td className="py-2">
                    TLS 1.2+ with certificate pinning
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Zurp servers &harr; Database</td>
                  <td className="py-2 pr-4">TLS</td>
                  <td className="py-2">TLS 1.2+ (provider-managed)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Zurp servers &harr; Cache layer</td>
                  <td className="py-2 pr-4">TLS</td>
                  <td className="py-2">TLS 1.2+</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We enforce HTTPS Strict Transport Security (HSTS) with a minimum
            max-age of one year, including subdomains. All HTTP requests are
            permanently redirected to HTTPS. We support only strong cipher
            suites and disable known-vulnerable protocols (SSLv3, TLS 1.0, TLS
            1.1).
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            3.2 At Rest
          </h3>
          <p>
            All stored data is encrypted using AES-256 (Advanced Encryption
            Standard with 256-bit keys):
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-primary)]">
                  <th className="pb-2 pr-4 font-semibold">Data Store</th>
                  <th className="pb-2 pr-4 font-semibold">
                    Encryption Method
                  </th>
                  <th className="pb-2 font-semibold">Key Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                <tr>
                  <td className="py-2 pr-4">Primary database</td>
                  <td className="py-2 pr-4">AES-256 at rest</td>
                  <td className="py-2">
                    Cloud provider-managed keys (Neon-managed encryption)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Backups</td>
                  <td className="py-2 pr-4">AES-256 at rest</td>
                  <td className="py-2">
                    Separate encryption keys, rotated quarterly
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Log storage</td>
                  <td className="py-2 pr-4">AES-256 at rest</td>
                  <td className="py-2">Cloud provider-managed keys</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Plaid access tokens</td>
                  <td className="py-2 pr-4">
                    AES-256 application-layer encryption
                  </td>
                  <td className="py-2">
                    Application-managed keys, stored in a secrets manager
                    separate from the database
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Plaid access tokens receive an additional layer of
            application-level encryption before being written to the database,
            ensuring that even if the database storage encryption were
            compromised, the tokens would remain protected.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            3.3 Key Management
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              Encryption keys are managed through environment-based secrets
              management with access restricted to production services.
            </li>
            <li>
              Database encryption keys are managed by the cloud
              provider&apos;s key management service and are never exposed to
              application code.
            </li>
            <li>
              Application-level encryption keys (e.g., for Plaid tokens) are
              stored as environment secrets, separate from the database, with
              access restricted to the specific services that require them.
            </li>
            <li>
              Keys are rotated on a regular schedule (at minimum quarterly)
              and can be rotated immediately in the event of a suspected
              compromise.
            </li>
          </ul>
        </section>

        {/* 4. Infrastructure Security */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            4. Infrastructure Security
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.1 Hosting Environment
          </h3>
          <p>
            Zurp&apos;s infrastructure is hosted on SOC 2 Type II-certified
            cloud providers with:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Physical security:
              </strong>{" "}
              Data centers with 24/7 security, biometric access controls,
              video surveillance, and multi-zone redundancy.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Network isolation:
              </strong>{" "}
              Application servers, databases, and internal services are
              deployed in private subnets with no direct public internet
              access. Only load balancers and CDN edge nodes are publicly
              reachable.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Firewall rules:
              </strong>{" "}
              Ingress and egress traffic is restricted by security groups and
              network ACLs following the principle of least privilege. Only
              required ports and protocols are open.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                DDoS protection:
              </strong>{" "}
              Automated DDoS detection and mitigation at the network edge,
              including rate limiting, traffic scrubbing, and geographic
              filtering when necessary.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.2 Environment Separation
          </h3>
          <p>We maintain strictly separated environments:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-primary)]">
                  <th className="pb-2 pr-4 font-semibold">Environment</th>
                  <th className="pb-2 pr-4 font-semibold">Purpose</th>
                  <th className="pb-2 font-semibold">
                    Access to Production Data?
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                <tr>
                  <td className="py-2 pr-4">Production</td>
                  <td className="py-2 pr-4">
                    Live Service serving real users
                  </td>
                  <td className="py-2">
                    Yes (the only environment with real data)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Staging</td>
                  <td className="py-2 pr-4">
                    Pre-deployment testing and QA
                  </td>
                  <td className="py-2">
                    No &mdash; uses synthetic/anonymized data only
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Development</td>
                  <td className="py-2 pr-4">
                    Feature development and debugging
                  </td>
                  <td className="py-2">
                    No &mdash; uses local mock data and Plaid sandbox
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Production credentials, secrets, and data are never used in
            non-production environments. Plaid&apos;s sandbox mode is used for
            all development and testing.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.3 Dependency Management
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              All third-party dependencies are pinned to specific versions and
              audited for known vulnerabilities using automated scanning
              tools.
            </li>
            <li>
              Critical and high-severity vulnerabilities are patched within 72
              hours of disclosure; medium-severity within 14 days.
            </li>
            <li>
              We maintain a software bill of materials (SBOM) for all deployed
              services.
            </li>
            <li>
              Container images (if applicable) are built from minimal base
              images, scanned for vulnerabilities before deployment, and
              signed to ensure integrity.
            </li>
          </ul>
        </section>

        {/* 5. Access Controls */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            5. Access Controls
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            5.1 Principle of Least Privilege
          </h3>
          <p>
            All access to Zurp&apos;s systems &mdash; by personnel, services,
            and automated processes &mdash; follows the principle of least
            privilege:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Personnel access:
              </strong>{" "}
              Team members receive access only to the systems and data
              necessary for their role. Access is reviewed quarterly and
              revoked immediately upon role change or departure.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Service-to-service access:
              </strong>{" "}
              Internal services authenticate to each other using short-lived
              tokens or mutual TLS, scoped to the minimum required
              permissions.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Database access:
              </strong>{" "}
              Direct database access is restricted to a small number of
              authorized personnel for emergency operations only. All queries
              are routed through application services under normal operation.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            5.2 Authentication
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-primary)]">
                  <th className="pb-2 pr-4 font-semibold">System</th>
                  <th className="pb-2 font-semibold">
                    Authentication Method
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                <tr>
                  <td className="py-2 pr-4">User accounts (Zurp app)</td>
                  <td className="py-2">
                    Email-based magic link authentication (passwordless); no
                    credentials stored
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Internal admin systems</td>
                  <td className="py-2">
                    SSO with mandatory multi-factor authentication (MFA)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Cloud infrastructure</td>
                  <td className="py-2">
                    IAM roles with MFA; no long-lived access keys
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">CI/CD pipeline</td>
                  <td className="py-2">
                    Service accounts with minimal permissions; secrets injected
                    at runtime, never stored in code
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Database</td>
                  <td className="py-2">
                    IAM-based authentication or short-lived credentials; no
                    shared passwords
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            5.3 Magic Link Security
          </h3>
          <p>
            Zurp uses passwordless authentication via email magic links:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Magic links are single-use, time-limited tokens that expire
              after a short window;
            </li>
            <li>
              Links are transmitted over encrypted email and validated
              server-side;
            </li>
            <li>
              Rate limiting is enforced on magic link requests to prevent
              abuse (see Section 7.2);
            </li>
            <li>
              No user passwords are stored, eliminating the risk of password
              database breaches.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            5.4 Multi-Factor Authentication
          </h3>
          <p>
            <strong className="text-[var(--text-primary)]">
              For personnel:
            </strong>{" "}
            MFA is mandatory for all internal systems, cloud infrastructure,
            and administrative tools. Hardware security keys are required for
            infrastructure access.
          </p>
        </section>

        {/* 6. Application Security */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            6. Application Security
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            6.1 Secure Development Lifecycle
          </h3>
          <p>
            Security is integrated into every stage of development:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Design review:
              </strong>{" "}
              New features that handle user data or modify the data flow
              undergo a security design review before development begins.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Code review:
              </strong>{" "}
              All code changes require peer review with a security-aware
              reviewer. Changes to authentication, authorization, data
              handling, or Plaid integration require review by a senior
              engineer or security lead.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Automated testing:
              </strong>{" "}
              Our CI/CD pipeline includes static application security testing
              (SAST), dependency vulnerability scanning, and linting for
              common security anti-patterns.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Pre-deployment checks:
              </strong>{" "}
              Security-critical changes are reviewed in staging before
              production deployment.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            6.2 OWASP Top 10 Protections
          </h3>
          <p>
            We implement controls against the OWASP Top 10 web application
            security risks:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-primary)]">
                  <th className="pb-2 pr-4 font-semibold">Risk</th>
                  <th className="pb-2 font-semibold">Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                <tr>
                  <td className="py-2 pr-4">Injection (SQL, NoSQL, command)</td>
                  <td className="py-2">
                    Parameterized queries; input validation; ORM usage; no raw
                    query construction
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Broken authentication</td>
                  <td className="py-2">
                    Passwordless magic link auth; rate limiting; session
                    management; short-lived tokens
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Sensitive data exposure</td>
                  <td className="py-2">
                    AES-256 encryption at rest; TLS in transit; no storage of
                    bank credentials
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    XML External Entities (XXE)
                  </td>
                  <td className="py-2">
                    Disabled XML external entity processing; JSON-only APIs
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Broken access control</td>
                  <td className="py-2">
                    Role-based access control; server-side authorization
                    checks on every request
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Security misconfiguration</td>
                  <td className="py-2">
                    Automated configuration scanning; hardened defaults; no
                    default credentials
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Cross-Site Scripting (XSS)</td>
                  <td className="py-2">
                    Content Security Policy (CSP) headers; output encoding;
                    React&apos;s built-in XSS protection
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Insecure deserialization</td>
                  <td className="py-2">
                    No deserialization of untrusted data; strict input schemas
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Vulnerable components</td>
                  <td className="py-2">
                    Automated dependency scanning; pinned versions; rapid
                    patching
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Insufficient logging</td>
                  <td className="py-2">
                    Comprehensive audit logging; centralized log management;
                    anomaly detection
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            6.3 API Security
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              All API endpoints require authentication (JWT or session
              tokens).
            </li>
            <li>
              API rate limiting is enforced per-user and per-IP to prevent
              abuse and brute-force attacks.
            </li>
            <li>
              Input validation is performed on all API parameters using strict
              schemas.
            </li>
            <li>
              CORS (Cross-Origin Resource Sharing) is configured to allow only
              authorized origins.
            </li>
            <li>
              API responses never include more data than the requesting user
              is authorized to see.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            6.4 Content Security Policy
          </h3>
          <p>We deploy a strict Content Security Policy (CSP) that:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Restricts script execution to our own domains (no inline
              scripts; nonces for necessary cases);
            </li>
            <li>
              Blocks loading of resources from unauthorized third-party
              domains;
            </li>
            <li>
              Prevents framing of the application (X-Frame-Options: DENY);
            </li>
            <li>
              Disables plugins and other potentially dangerous browser
              features.
            </li>
          </ul>
        </section>

        {/* 7. Monitoring, Logging, and Incident Response */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            7. Monitoring, Logging, and Incident Response
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.1 Monitoring
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Real-time monitoring:
              </strong>{" "}
              Application health, error rates, latency, and resource
              utilization are monitored continuously with automated alerting.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Security monitoring:
              </strong>{" "}
              Anomalous authentication patterns (e.g., brute-force attempts,
              login from unusual locations), unusual data access patterns, and
              infrastructure changes are monitored and flagged.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Uptime monitoring:
              </strong>{" "}
              External uptime checks run at regular intervals to detect and
              alert on service outages.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.2 Abuse Prevention
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Rate limiting:
              </strong>{" "}
              Magic link requests, API calls, and Plaid connection requests
              are rate-limited per user, per IP, and globally.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Bot detection:
              </strong>{" "}
              Automated traffic analysis to identify and block bot-driven
              abuse, credential stuffing, and scraping.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                IP reputation:
              </strong>{" "}
              Known malicious IPs and Tor exit nodes may be subject to
              additional verification or blocking when accessing sensitive
              endpoints.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.3 Audit Logging
          </h3>
          <p>
            We maintain detailed audit logs for security-relevant events,
            including:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              User authentication events (magic link requests, login, logout,
              session creation);
            </li>
            <li>Plaid account connections and disconnections;</li>
            <li>
              Data access events (transaction data retrieval, insight
              generation);
            </li>
            <li>
              Administrative actions (configuration changes, deployment
              events, access grants/revocations);
            </li>
            <li>Data deletion and export requests.</li>
          </ul>
          <p>Audit logs are:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Written to append-only storage to prevent tampering;
            </li>
            <li>Retained for a minimum of 12 months;</li>
            <li>
              Accessible only to authorized security and engineering
              personnel;
            </li>
            <li>
              Excluded from containing raw financial data (logs reference
              transaction IDs, not transaction details).
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.4 Incident Response Plan
          </h3>
          <p>
            Zurp maintains a documented incident response plan covering:
          </p>
          <ol className="ml-[var(--space-lg)] list-decimal space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Detection:
              </strong>{" "}
              Automated alerting on anomalous patterns; manual reporting
              channels for team members and users.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Triage:</strong>{" "}
              Classification of incident severity (Critical, High, Medium,
              Low) based on data exposure scope, number of affected users, and
              ongoing vs. contained status.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Containment:
              </strong>{" "}
              Immediate steps to stop ongoing data loss or unauthorized
              access, including credential rotation, access revocation, and
              service isolation if necessary.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Eradication:
              </strong>{" "}
              Identification and removal of the root cause (e.g., patching a
              vulnerability, revoking compromised credentials, rolling back a
              malicious deployment).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Recovery:
              </strong>{" "}
              Restoration of affected services and data from known-good
              backups; verification of system integrity before resuming normal
              operations.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Notification:
              </strong>{" "}
              Users affected by a confirmed data breach will be notified in
              accordance with applicable law (see Section 7.5). Relevant
              regulatory authorities will be notified as required.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Post-incident review:
              </strong>{" "}
              Every security incident is followed by a blameless post-mortem
              that documents what happened, why, and what changes will prevent
              recurrence.
            </li>
          </ol>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.5 Breach Notification
          </h3>
          <p>
            In the event of a confirmed security breach involving your
            personal information:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">Timing:</strong>{" "}
              We will notify affected users as soon as practicable and no
              later than required by applicable law (e.g., 72 hours under
              GDPR, &ldquo;expedient&rdquo; under most U.S. state laws,
              within the specific timeframes required under CCPA and other
              state breach notification statutes).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Content:</strong>{" "}
              Notification will include a description of the incident, the
              categories of data involved, the likely consequences, the
              measures taken to address the breach, and contact information
              for questions.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Method:</strong>{" "}
              Notification will be provided by email to the address associated
              with your account. If email is unavailable or insufficient under
              applicable law, we will use alternative methods such as
              prominent website notice or postal mail.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Authorities:
              </strong>{" "}
              We will notify relevant regulatory authorities (e.g., state
              attorneys general, CNIL, ICO) as required by applicable law.
            </li>
          </ul>
        </section>

        {/* 8. Plaid Security */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            8. Plaid Security
          </h2>
          <p>
            Because Plaid is a critical component of Zurp&apos;s data
            pipeline, its security posture directly affects yours. Here is a
            summary of Plaid&apos;s security practices:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-primary)]">
                  <th className="pb-2 pr-4 font-semibold">Control</th>
                  <th className="pb-2 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                <tr>
                  <td className="py-2 pr-4">Certification</td>
                  <td className="py-2">SOC 2 Type II audited</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Encryption in transit</td>
                  <td className="py-2">TLS 1.2+ for all connections</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Encryption at rest</td>
                  <td className="py-2">AES-256 for all stored data</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Credential handling</td>
                  <td className="py-2">
                    Bank credentials processed in Plaid&apos;s secure
                    environment; never exposed to Zurp
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Data minimization</td>
                  <td className="py-2">
                    Zurp receives only the data categories it requests
                    (transactions, accounts)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">User control</td>
                  <td className="py-2">
                    Users can view and manage all Plaid connections at
                    my.plaid.com
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Regulatory compliance</td>
                  <td className="py-2">
                    Compliant with applicable financial regulations; regulated
                    by relevant authorities
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Security audits</td>
                  <td className="py-2">
                    Regular independent third-party security audits and
                    penetration testing
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            For complete details on Plaid&apos;s security and privacy
            practices, visit:{" "}
            <a
              href="https://plaid.com/safety"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-80"
            >
              plaid.com/safety
            </a>{" "}
            and{" "}
            <a
              href="https://plaid.com/legal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-80"
            >
              plaid.com/legal
            </a>
            .
          </p>
          <p>
            If you disconnect your bank account from Zurp, we immediately
            invalidate the associated Plaid access token. You can also revoke
            Plaid&apos;s access to your bank directly through my.plaid.com or
            by contacting Plaid&apos;s support.
          </p>
        </section>

        {/* 9. Data Handling Practices */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            9. Data Handling Practices
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            9.1 Data Minimization
          </h3>
          <p>
            We collect and retain only the data necessary to provide the
            Service:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                We collect:
              </strong>{" "}
              Transaction data (merchant, amount, date, category) and account
              metadata (name, type, last four digits, institution).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                We do NOT collect:
              </strong>{" "}
              Full card numbers, CVVs, PINs, bank login credentials, Social
              Security numbers, tax identification numbers, or data from
              non-credit-card accounts unless explicitly connected by you.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                We do NOT store:
              </strong>{" "}
              Raw Plaid API responses beyond the specific fields we need.
              Extraneous data returned by Plaid is discarded at the
              application layer before persistence.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            9.2 Data Isolation
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              Each user&apos;s data is logically isolated.
              Application-layer access controls ensure that no user can access
              another user&apos;s transactions, insights, or account
              information.
            </li>
            <li>
              Internal services access user data only through authenticated,
              authorized API calls &mdash; never through direct database
              queries under normal operation.
            </li>
            <li>
              Analytical and aggregated data used for Service improvement is
              fully anonymized and cannot be traced back to individual users.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            9.3 Data Deletion
          </h3>
          <p>When you delete your account:</p>
          <ol className="ml-[var(--space-lg)] list-decimal space-y-1">
            <li>
              Your Plaid access token is immediately invalidated, stopping all
              data retrieval.
            </li>
            <li>
              Your personal data (account info, transaction history, insights,
              tracking data) is queued for deletion within 30 days.
            </li>
            <li>
              Encrypted backups containing your data are purged within 90
              days.
            </li>
            <li>
              Anonymized, aggregated data that cannot identify you may be
              retained indefinitely for statistical purposes.
            </li>
          </ol>
          <p>
            You may also request deletion of data that Plaid holds about you
            separately through my.plaid.com or by contacting Plaid directly.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            9.4 Backup and Recovery
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>Automated encrypted backups are performed daily.</li>
            <li>
              Backups are stored in a geographically separate region from the
              primary database for disaster recovery.
            </li>
            <li>
              Backup restoration is tested periodically to ensure
              recoverability.
            </li>
            <li>
              Backups are encrypted with keys separate from the primary
              database encryption keys.
            </li>
          </ul>
        </section>

        {/* 10. Vendor and Third-Party Security */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            10. Vendor and Third-Party Security
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            10.1 Vendor Assessment
          </h3>
          <p>
            Before engaging any third-party service provider that processes
            user data, we evaluate:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Their security certifications (SOC 2, ISO 27001, or
              equivalent);
            </li>
            <li>Their encryption practices (at rest and in transit);</li>
            <li>
              Their access control and authentication mechanisms;
            </li>
            <li>
              Their incident response and breach notification procedures;
            </li>
            <li>Their data retention and deletion capabilities;</li>
            <li>Applicable regulatory compliance.</li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            10.2 Contractual Protections
          </h3>
          <p>
            All service providers that process user data are bound by data
            processing agreements (DPAs) that require:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Processing data only for the specified purposes and on our
              instructions;
            </li>
            <li>
              Implementing appropriate technical and organizational security
              measures;
            </li>
            <li>
              Notifying Zurp promptly of any security incident or data
              breach;
            </li>
            <li>
              Returning or deleting data upon termination of the engagement;
            </li>
            <li>
              Cooperating with security audits and compliance assessments upon
              request.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            10.3 Ongoing Monitoring
          </h3>
          <p>
            Vendor security posture is reviewed at least annually, or more
            frequently if the vendor processes sensitive financial data or
            experiences a security incident.
          </p>
        </section>

        {/* 11. Compliance */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            11. Compliance
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            11.1 Regulatory Framework
          </h3>
          <p>
            Zurp&apos;s security and privacy practices are designed to comply
            with:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-primary)]">
                  <th className="pb-2 pr-4 font-semibold">Regulation</th>
                  <th className="pb-2 font-semibold">Applicability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                <tr>
                  <td className="py-2 pr-4">CCPA / CPRA (California)</td>
                  <td className="py-2">
                    California resident data; consumer rights, data handling
                    disclosures
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">GDPR (EU/EEA/UK)</td>
                  <td className="py-2">
                    EEA/UK user data; lawful basis, data subject rights,
                    cross-border transfers
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    State privacy laws (CO, CT, VA, TX, OR, MT, etc.)
                  </td>
                  <td className="py-2">
                    Residents of states with comprehensive privacy legislation
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">GLBA (Gramm-Leach-Bliley Act)</td>
                  <td className="py-2">
                    Financial data handling, if applicable to Zurp&apos;s
                    classification
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">PCI DSS awareness</td>
                  <td className="py-2">
                    Not directly applicable (Zurp does not process, store, or
                    transmit card numbers), but security practices are informed
                    by PCI DSS principles
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">SOC 2 principles</td>
                  <td className="py-2">
                    Trust Services Criteria (Security, Availability,
                    Confidentiality, Processing Integrity, Privacy) guide our
                    control framework
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            11.2 PCI DSS Scope
          </h3>
          <p>
            <strong className="text-[var(--text-primary)]">
              Zurp is not in scope for PCI DSS compliance
            </strong>{" "}
            because we do not process, store, or transmit cardholder data (full
            card numbers, CVVs, or PINs). Your card number is never entered
            into or handled by the Zurp application. Account connections are
            managed exclusively through Plaid, which handles all credential
            exchange with your financial institution. We receive only
            transaction-level data (merchant names, amounts, dates) and account
            metadata (last four digits, account type) &mdash; none of which
            constitute cardholder data under PCI DSS definitions.
          </p>
          <p>
            That said, our security controls are informed by PCI DSS principles
            and exceed the baseline requirements for our data classification
            level.
          </p>
        </section>

        {/* 12. User Security Recommendations */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            12. User Security Recommendations
          </h2>
          <p>
            To maximize the security of your Zurp account and connected
            financial data, we recommend:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Secure your email account
              </strong>{" "}
              &mdash; Zurp uses magic link authentication, so the security of
              your Zurp account depends on the security of your email. Use a
              strong password and enable MFA on your email provider.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Enable MFA on your bank accounts
              </strong>{" "}
              &mdash; this protects the Plaid connection at the source.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Review your Plaid connections
              </strong>{" "}
              periodically at my.plaid.com. Disconnect any apps you no longer
              use.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Keep your devices and browsers updated
              </strong>{" "}
              with the latest security patches.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Be cautious of phishing.
              </strong>{" "}
              Zurp will never ask for your bank credentials by email, text,
              phone, or within the Zurp app. If you receive a suspicious
              communication claiming to be from Zurp, contact us at{" "}
              <a
                href="mailto:support@zurp.com"
                className="text-[var(--accent)] hover:opacity-80"
              >
                support@zurp.com
              </a>
              .
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Report suspicious activity
              </strong>{" "}
              on your Zurp account immediately to{" "}
              <a
                href="mailto:support@zurp.com"
                className="text-[var(--accent)] hover:opacity-80"
              >
                support@zurp.com
              </a>
              .
            </li>
          </ul>
        </section>

        {/* 13. Responsible Disclosure */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            13. Responsible Disclosure
          </h2>
          <p>
            We welcome security researchers who help us keep the Service safe.
            If you discover a security vulnerability in Zurp:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              <strong className="text-[var(--text-primary)]">Email:</strong>{" "}
              <a
                href="mailto:security@zurp.com"
                className="text-[var(--accent)] hover:opacity-80"
              >
                security@zurp.com
              </a>
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Subject line:
              </strong>{" "}
              &ldquo;Security Vulnerability Report&rdquo;
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Please include:
              </strong>{" "}
              A description of the vulnerability, steps to reproduce,
              potential impact, and any supporting evidence (screenshots, logs,
              proof-of-concept).
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            Our Commitments
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              We will acknowledge receipt of your report within 48 hours.
            </li>
            <li>
              We will investigate and provide an initial assessment within 7
              business days.
            </li>
            <li>
              We will keep you informed of our progress toward a fix.
            </li>
            <li>
              We will not take legal action against researchers who act in
              good faith, follow responsible disclosure practices, and do not
              access or modify other users&apos; data.
            </li>
            <li>
              We will credit you (with your permission) when we publish a fix.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            Guidelines
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Do not access, modify, or delete data belonging to other users.
            </li>
            <li>
              Do not disrupt the availability of the Service (no
              denial-of-service testing).
            </li>
            <li>
              Do not publicly disclose the vulnerability until we have had a
              reasonable opportunity to address it (minimum 90 days from report
              or until a fix is deployed, whichever is sooner).
            </li>
            <li>
              Do not use automated vulnerability scanners against production
              systems without prior coordination.
            </li>
          </ul>
        </section>

        {/* 14. Contact */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            14. Contact
          </h2>
          <p>
            For security-related questions, concerns, or reports:
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">Zurp, LLC</strong>
            <br />
            Security &amp; Vulnerability Reports:{" "}
            <a
              href="mailto:security@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              security@zurp.com
            </a>
            <br />
            General Support:{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>
          </p>
        </section>

        <hr className="border-[var(--border-default)]" />

        <p className="text-[var(--text-caption)]">
          This security overview was last updated on February 9, 2026.
        </p>
      </article>
    </div>
  );
}
