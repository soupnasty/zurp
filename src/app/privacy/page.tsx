import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — zurp",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-2">
            <strong className="text-[var(--text-primary)]">Zurp LLC</strong>
            <br />
            Effective Date: February 6, 2026
            <br />
            Last Updated: February 6, 2026
          </p>
        </header>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Overview
          </h2>
          <p>
            Zurp (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
            operates the zurp.io website and Zurp application (the
            &ldquo;Service&rdquo;). This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our
            Service.
          </p>
          <p>
            By using Zurp, you agree to the collection and use of information in
            accordance with this policy.
          </p>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Information We Collect
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            Account Information
          </h3>
          <p>
            When you create a Zurp account, we collect your email address for
            authentication purposes. We use email-based magic links to verify
            your identity — we do not collect or store passwords.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            Financial Data via Plaid
          </h3>
          <p>
            Zurp uses Plaid Inc. (&ldquo;Plaid&rdquo;) to connect to your
            financial accounts. When you link a credit card through Plaid, we
            access the following data:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              <strong className="text-[var(--text-primary)]">
                Transaction history
              </strong>{" "}
              — merchant name, date, amount, and category for transactions on
              your linked credit cards (up to 24 months)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Account metadata
              </strong>{" "}
              — card name, institution name, and last four digits of the account
              number
            </li>
          </ul>
          <p>
            We use this data solely to match your transactions against your
            credit card benefits and track benefit usage.
          </p>
          <p>
            We do <strong className="text-[var(--text-primary)]">not</strong>{" "}
            access or collect:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>Your bank login credentials (handled entirely by Plaid)</li>
            <li>Your full account numbers</li>
            <li>Your balance information</li>
            <li>
              Your identity or personal information from your financial
              institution
            </li>
            <li>
              Investment, loan, or other non-credit-card account data
            </li>
          </ul>
          <p>
            By using Plaid&apos;s services, you also agree to Plaid&apos;s End
            User Privacy Policy, available at{" "}
            <a
              href="https://plaid.com/legal/#end-user-privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-80"
            >
              plaid.com/legal
            </a>
            .
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            Usage Data
          </h3>
          <p>
            We may collect basic usage data such as pages visited, features
            used, and error logs to improve the Service. This data is not linked
            to your financial information.
          </p>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            How We Use Your Information
          </h2>
          <p>
            We use the information we collect for the following purposes:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              To provide and maintain the Service — specifically, to match your
              credit card transactions against known card benefits and display
              your benefit usage
            </li>
            <li>To authenticate your identity via email magic links</li>
            <li>
              To send you notifications about expiring benefits or unused
              credits (if you opt in)
            </li>
            <li>To improve and optimize the Service</li>
            <li>To respond to your support requests</li>
          </ul>
          <p>
            We do <strong className="text-[var(--text-primary)]">not</strong>{" "}
            use your data for:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>Advertising or marketing by third parties</li>
            <li>Selling or renting to any third party</li>
            <li>Credit decisions or underwriting</li>
            <li>
              Building consumer profiles for purposes unrelated to the Service
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            How We Share Your Information
          </h2>
          <p>
            We do not sell, rent, or trade your personal or financial
            information.
          </p>
          <p>
            We may share your information only in the following circumstances:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              <strong className="text-[var(--text-primary)]">With Plaid</strong>{" "}
              — to facilitate the connection to your financial accounts
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                With infrastructure providers
              </strong>{" "}
              — we use third-party services to host and operate Zurp (such as
              Vercel for hosting and Neon for database services). These providers
              process data on our behalf and are contractually obligated to
              protect it
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                As required by law
              </strong>{" "}
              — if compelled by a valid legal process, court order, or
              government request
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                To protect rights and safety
              </strong>{" "}
              — if necessary to protect the rights, property, or safety of Zurp,
              our users, or the public
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Data Storage and Security
          </h2>
          <p>
            Your data is stored on servers located in the United States. We
            implement industry-standard security measures to protect your
            information, including:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>AES-256 encryption for sensitive data at rest</li>
            <li>TLS encryption for all data in transit (HTTPS only)</li>
            <li>
              Environment-based secret management for API keys and credentials
            </li>
            <li>Secure, HttpOnly session cookies</li>
            <li>
              Access tokens from Plaid are encrypted before storage and are never
              exposed to the client
            </li>
          </ul>
          <p>
            While we strive to protect your information, no method of electronic
            transmission or storage is 100% secure. We cannot guarantee absolute
            security.
          </p>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Data Retention
          </h2>
          <p>
            We retain your financial data only for as long as your account is
            active and as needed to provide the Service. Specifically:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              <strong className="text-[var(--text-primary)]">
                Transaction data
              </strong>{" "}
              is retained for the duration of your account to enable benefit
              tracking across billing cycles
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Account information
              </strong>{" "}
              (email address) is retained for the duration of your account
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Plaid access tokens
              </strong>{" "}
              are retained for the duration of your account to maintain the
              connection to your financial institution
            </li>
          </ul>
          <p>
            When you delete your account, we will delete your personal data and
            financial data within 30 days. We will also revoke the Plaid access
            token, which disconnects Zurp from your financial accounts. You may
            also disconnect Zurp from your financial accounts at any time
            through Plaid Portal at{" "}
            <a
              href="https://my.plaid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-80"
            >
              my.plaid.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Your Rights
          </h2>
          <p>
            Depending on your location, you may have the following rights
            regarding your personal data:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              <strong className="text-[var(--text-primary)]">Access</strong> —
              request a copy of the data we hold about you
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Deletion</strong> —
              request that we delete your data
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Correction</strong>{" "}
              — request that we correct inaccurate data
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Portability
              </strong>{" "}
              — request your data in a portable format
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Opt out</strong> —
              opt out of non-essential communications
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Disconnect</strong>{" "}
              — disconnect your financial accounts at any time via your Zurp
              settings or through Plaid Portal
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:privacy@zurp.io"
              className="text-[var(--accent)] hover:opacity-80"
            >
              privacy@zurp.io
            </a>
            .
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            California Residents
          </h3>
          <p>
            If you are a California resident, you have additional rights under
            the California Consumer Privacy Act (CCPA), including the right to
            know what personal information we collect, the right to request
            deletion, and the right to opt out of the sale of personal
            information. We do not sell personal information.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            Virginia Residents
          </h3>
          <p>
            If you are a Virginia resident, you have rights under the Virginia
            Consumer Data Protection Act (VCDPA), including the right to access,
            correct, delete, and obtain a copy of your personal data, and the
            right to opt out of targeted advertising, sale of personal data, and
            profiling. We do not engage in any of these activities.
          </p>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Children&apos;s Privacy
          </h2>
          <p>
            Zurp is not intended for use by anyone under the age of 18. We do
            not knowingly collect personal information from children. If we
            become aware that we have collected data from a child under 18, we
            will take steps to delete that information promptly.
          </p>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Third-Party Links
          </h2>
          <p>
            The Service may contain links to third-party websites or services
            (such as Plaid Portal). We are not responsible for the privacy
            practices of these third parties. We encourage you to review their
            privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &ldquo;Last Updated&rdquo; date. For material
            changes, we will notify you via email.
          </p>
          <p>
            Your continued use of the Service after any changes constitutes your
            acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <p>
            <a
              href="mailto:support@zurp.io"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.io
            </a>
          </p>
        </section>

        <hr className="border-[var(--border-default)]" />

        <p className="text-[var(--text-caption)]">
          This privacy policy was last updated on February 6, 2026.
        </p>
      </article>
    </div>
  );
}
